import { useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// Portrait à révélation « liquide » (effet Lando Norris) — WebGL.
// On voit le visage ; là où le curseur passe, un filet d'eau suit le geste et
// révèle la version bonnet + lunettes, avec distorsion de réfraction, frange
// chromatique et caustiques. Le filet s'évapore derrière le curseur.
//   srcBase   = photo du visage (sans bonnet/lunettes)
//   srcReveal = MÊME cadrage, avec bonnet + lunettes de piscine
// Sans photos : un placeholder stylisé montre le mécanisme.
// Repli : si WebGL indisponible, on dessine simplement le portrait de base.
// ---------------------------------------------------------------------------

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }
`

// Met à jour le tampon de « mouillé » : décroît (évaporation) et ajoute un
// trait capsule entre l'ancienne et la nouvelle position (filet continu).
const FRAG_TRAIL = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPrev;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform vec2 uAspect;
uniform float uBrush;
uniform float uDecay;
uniform float uDown;
void main(){
  float prev = texture2D(uPrev, vUv).r * uDecay;
  vec2 p = vUv * uAspect;
  vec2 a = uPrevMouse * uAspect;
  vec2 b = uMouse * uAspect;
  vec2 pa = p - a, ba = b - a;
  float t = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  float dist = length(pa - ba * t);
  float add = uDown * smoothstep(uBrush, uBrush * 0.2, dist);
  gl_FragColor = vec4(max(prev, add), 0.0, 0.0, 1.0);
}
`

// Rend l'image : réfraction (gradient du mouillé) + ondulation + frange
// chromatique + reflets spéculaires + caustiques, mélange base/reveal.
const FRAG_RENDER = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uBase;
uniform sampler2D uReveal;
uniform sampler2D uTrail;
uniform vec2 uTexel;
uniform vec2 uAspect;
uniform float uTime;
void main(){
  float wet = texture2D(uTrail, vUv).r;
  vec2 d = uTexel * 1.6;
  float wx = texture2D(uTrail, vUv + vec2(d.x, 0.0)).r - texture2D(uTrail, vUv - vec2(d.x, 0.0)).r;
  float wy = texture2D(uTrail, vUv + vec2(0.0, d.y)).r - texture2D(uTrail, vUv - vec2(0.0, d.y)).r;
  vec2 grad = vec2(wx, wy);

  // Clapot : petite ondulation animée à l'intérieur du liquide.
  float rip = sin(vUv.x * uAspect.x * 44.0 + uTime * 3.0) + sin(vUv.y * uAspect.y * 50.0 - uTime * 3.7);
  vec2 disp = grad * 0.24 + vec2(rip) * 0.0013 * wet;
  vec2 uvD = vUv - disp;

  float m = smoothstep(0.05, 0.34, wet);
  vec2 ca = vec2(0.0024, 0.0) * (wet + length(grad) * 2.0);
  vec3 col = vec3(
    mix(texture2D(uBase, uvD + ca).r, texture2D(uReveal, uvD + ca).r, m),
    mix(texture2D(uBase, uvD).g,       texture2D(uReveal, uvD).g,       m),
    mix(texture2D(uBase, uvD - ca).b, texture2D(uReveal, uvD - ca).b, m));
  float imgA = max(texture2D(uBase, vUv).a, texture2D(uReveal, vUv).a * m);

  // Reflet spéculaire sur les crêtes + caustiques dans le liquide.
  float spec = pow(clamp(length(grad) * 7.0, 0.0, 1.0), 1.5);
  col += vec3(0.55, 0.86, 1.0) * spec * 0.7;
  col += vec3(0.5, 0.9, 1.0) * wet * 0.07 * (0.5 + 0.5 * sin(vUv.y * 130.0 + uTime * 4.0));

  float a = max(imgA, wet * 0.3);
  gl_FragColor = vec4(col, a);
}
`

export default function PortraitReveal({ srcBase, srcReveal, className = '', style }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0, h = 0, dpr = 1, raf
    const mouse = { x: 0.5, y: 0.58, px: 0.5, py: 0.58 } // uv, y depuis le bas
    let down = 0, downPrev = 0, interacted = false
    const t0 = performance.now()

    // --- Images (optionnelles) -------------------------------------------
    const imgA = new Image(), imgB = new Image()
    let okA = false, okB = false
    imgA.crossOrigin = 'anonymous'; imgB.crossOrigin = 'anonymous'

    // --- Dessin du placeholder / cover (en pixels CSS) -------------------
    const drawCover = (c, img) => {
      const ir = img.width / img.height, cr = w / h
      let dw, dh, dx, dy
      if (ir > cr) { dh = h; dw = h * ir; dx = (w - dw) / 2; dy = 0 } else { dw = w; dh = w / ir; dx = 0; dy = (h - dh) / 2 }
      c.drawImage(img, dx, dy, dw, dh)
    }
    const placeholder = (c, variant) => {
      const cy = h * 0.4, r = Math.min(w, h * 0.82) * 0.25, cx = w / 2
      const halo = c.createRadialGradient(cx, cy, 0, cx, cy, r * 3.2)
      halo.addColorStop(0, 'rgba(45,212,238,0.13)'); halo.addColorStop(1, 'rgba(45,212,238,0)')
      c.fillStyle = halo; c.fillRect(0, 0, w, h)
      const bg = c.createLinearGradient(cx - r, cy - r, cx + r, cy + r * 3)
      bg.addColorStop(0, '#26506f'); bg.addColorStop(0.6, '#13293f'); bg.addColorStop(1, '#0a1829')
      c.fillStyle = bg
      c.beginPath()
      c.moveTo(cx - r * 2.0, h)
      c.bezierCurveTo(cx - r * 1.95, cy + r * 2.1, cx - r * 1.08, cy + r * 1.5, cx, cy + r * 1.45)
      c.bezierCurveTo(cx + r * 1.08, cy + r * 1.5, cx + r * 1.95, cy + r * 2.1, cx + r * 2.0, h)
      c.closePath(); c.fill()
      c.fillRect(cx - r * 0.42, cy + r * 0.55, r * 0.84, r * 1.1)
      c.beginPath(); c.ellipse(cx, cy, r * 0.92, r * 1.08, 0, 0, Math.PI * 2); c.fill()
      c.save()
      c.beginPath(); c.ellipse(cx, cy, r * 0.92, r * 1.08, 0, 0, Math.PI * 2); c.clip()
      const rim = c.createLinearGradient(cx, 0, cx + r, 0)
      rim.addColorStop(0, 'rgba(45,212,238,0)'); rim.addColorStop(1, 'rgba(45,212,238,0.5)')
      c.fillStyle = rim
      c.beginPath(); c.ellipse(cx + r * 0.32, cy, r * 0.92, r * 1.08, 0, 0, Math.PI * 2); c.fill()
      c.restore()
      if (variant === 'reveal') {
        c.save()
        c.beginPath(); c.ellipse(cx, cy, r * 0.95, r * 1.1, 0, 0, Math.PI * 2); c.clip()
        const cap = c.createLinearGradient(cx - r, cy - r, cx + r * 0.6, cy + r * 0.4)
        cap.addColorStop(0, '#5ee7ff'); cap.addColorStop(0.5, '#1ba7d6'); cap.addColorStop(1, '#0a6bb0')
        c.fillStyle = cap
        c.beginPath(); c.ellipse(cx, cy - r * 0.2, r * 0.98, r * 0.98, 0, 0, Math.PI * 2); c.fill()
        c.fillStyle = 'rgba(255,255,255,0.4)'
        c.beginPath(); c.ellipse(cx - r * 0.36, cy - r * 0.52, r * 0.3, r * 0.14, -0.5, 0, Math.PI * 2); c.fill()
        c.restore()
        const gy = cy + r * 0.16
        for (const sx of [-0.42, 0.42]) {
          const gx = cx + r * sx
          c.fillStyle = 'rgba(6,14,24,0.92)'
          c.beginPath(); c.ellipse(gx, gy, r * 0.33, r * 0.27, 0, 0, Math.PI * 2); c.fill()
          c.strokeStyle = '#2dd4ee'; c.lineWidth = Math.max(2, r * 0.06)
          c.beginPath(); c.ellipse(gx, gy, r * 0.33, r * 0.27, 0, 0, Math.PI * 2); c.stroke()
          c.fillStyle = 'rgba(130,235,255,0.45)'
          c.beginPath(); c.ellipse(gx - r * 0.1, gy - r * 0.09, r * 0.09, r * 0.05, -0.5, 0, Math.PI * 2); c.fill()
        }
        c.strokeStyle = '#2dd4ee'; c.lineWidth = Math.max(2, r * 0.055)
        c.beginPath(); c.moveTo(cx - r * 0.13, gy); c.lineTo(cx + r * 0.13, gy); c.stroke()
      }
    }
    const makeSource = (variant) => {
      const cv = document.createElement('canvas')
      cv.width = Math.max(1, Math.floor(w * dpr)); cv.height = Math.max(1, Math.floor(h * dpr))
      const c = cv.getContext('2d')
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
      const img = variant === 'reveal' ? imgB : imgA
      const ok = variant === 'reveal' ? okB : okA
      if (img && ok) drawCover(c, img); else placeholder(c, variant)
      return cv
    }

    // --- Tentative WebGL --------------------------------------------------
    const opts = { alpha: true, premultipliedAlpha: false, antialias: true, depth: false }
    const gl = canvas.getContext('webgl2', opts) || canvas.getContext('webgl', opts)

    // ====================================================================
    // REPLI 2D : pas de WebGL → on affiche juste le portrait de base.
    // ====================================================================
    if (!gl) {
      const c = canvas.getContext('2d')
      const render2d = () => {
        dpr = Math.min(2, window.devicePixelRatio || 1)
        w = wrap.clientWidth; h = wrap.clientHeight
        canvas.width = Math.max(1, Math.floor(w * dpr)); canvas.height = Math.max(1, Math.floor(h * dpr))
        canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
        c.setTransform(dpr, 0, 0, dpr, 0, 0)
        c.clearRect(0, 0, w, h)
        if (srcBase && okA) drawCover(c, imgA); else placeholder(c, 'base')
      }
      imgA.onload = () => { okA = true; render2d() }
      if (srcBase) imgA.src = srcBase
      render2d()
      const ro2 = new ResizeObserver(render2d); ro2.observe(wrap)
      return () => ro2.disconnect()
    }

    // --- Programmes & géométrie ------------------------------------------
    const compile = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('shader', gl.getShaderInfoLog(s))
      return s
    }
    const makeProgram = (vs, fs) => {
      const p = gl.createProgram()
      gl.attachShader(p, compile(gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs))
      gl.linkProgram(p)
      return p
    }
    const progTrail = makeProgram(VERT, FRAG_TRAIL)
    const progRender = makeProgram(VERT, FRAG_RENDER)

    const quad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const bindQuad = (prog) => {
      const loc = gl.getAttribLocation(prog, 'aPos')
      gl.bindBuffer(gl.ARRAY_BUFFER, quad)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    }

    // --- Textures image ---------------------------------------------------
    const makeTex = () => {
      const t = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      return t
    }
    const texBase = makeTex(), texReveal = makeTex()
    const uploadImageTex = (tex, src) => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    }
    const buildTextures = () => {
      if (!w || !h) return
      uploadImageTex(texBase, makeSource('base'))
      uploadImageTex(texReveal, makeSource('reveal'))
    }
    imgA.onload = () => { okA = true; buildTextures() }
    imgB.onload = () => { okB = true; buildTextures() }
    if (srcBase) imgA.src = srcBase
    if (srcReveal) imgB.src = srcReveal

    // --- FBO ping-pong pour le tampon « mouillé » (demi-résolution) ------
    let fw = 1, fh = 1
    const fbos = [null, null]
    let cur = 0
    const makeFBO = () => {
      const tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fw, fh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      const fb = gl.createFramebuffer()
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      return { tex, fb }
    }

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = wrap.clientWidth; h = wrap.clientHeight
      canvas.width = Math.max(1, Math.floor(w * dpr)); canvas.height = Math.max(1, Math.floor(h * dpr))
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
      fw = Math.max(2, Math.floor(w * dpr)); fh = Math.max(2, Math.floor(h * dpr))
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.clearColor(0, 0, 0, 0)
      for (let i = 0; i < 2; i++) {
        if (fbos[i]) { gl.deleteTexture(fbos[i].tex); gl.deleteFramebuffer(fbos[i].fb) }
        fbos[i] = makeFBO()
      }
      buildTextures()
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(wrap)

    const aspect = () => { const m = Math.min(w, h); return [w / m, h / m] }

    const frame = (now) => {
      const tt = reduce ? 0 : (now - t0) / 1000

      // Démo automatique : trace un chemin au début (utile sur mobile).
      if (!interacted && !reduce) {
        const el = (now - t0) / 1000
        if (el > 1.0 && el < 7.5) {
          down = 1
          mouse.x = 0.5 + Math.cos(el * 1.3) * 0.2
          mouse.y = 0.58 + Math.sin(el * 2.1) * 0.17
        } else if (el >= 7.5) { down = 0 }
      }
      // Évite un trait géant lors d'un saut / d'une (ré)entrée du curseur.
      if (!downPrev && down) { mouse.px = mouse.x; mouse.py = mouse.y }
      if (Math.hypot(mouse.x - mouse.px, mouse.y - mouse.py) > 0.12) { mouse.px = mouse.x; mouse.py = mouse.y }
      downPrev = down

      const [ax, ay] = aspect()

      // 1) Mise à jour du tampon « mouillé ».
      gl.useProgram(progTrail)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[1 - cur].fb)
      gl.viewport(0, 0, fw, fh)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, fbos[cur].tex)
      gl.uniform1i(gl.getUniformLocation(progTrail, 'uPrev'), 0)
      gl.uniform2f(gl.getUniformLocation(progTrail, 'uMouse'), mouse.x, mouse.y)
      gl.uniform2f(gl.getUniformLocation(progTrail, 'uPrevMouse'), mouse.px, mouse.py)
      gl.uniform2f(gl.getUniformLocation(progTrail, 'uAspect'), ax, ay)
      gl.uniform1f(gl.getUniformLocation(progTrail, 'uBrush'), 0.18)
      gl.uniform1f(gl.getUniformLocation(progTrail, 'uDecay'), reduce ? 1.0 : 0.94)
      gl.uniform1f(gl.getUniformLocation(progTrail, 'uDown'), down)
      bindQuad(progTrail)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      cur = 1 - cur
      mouse.px = mouse.x; mouse.py = mouse.y

      // 2) Rendu à l'écran.
      gl.useProgram(progRender)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texBase)
      gl.uniform1i(gl.getUniformLocation(progRender, 'uBase'), 0)
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texReveal)
      gl.uniform1i(gl.getUniformLocation(progRender, 'uReveal'), 1)
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, fbos[cur].tex)
      gl.uniform1i(gl.getUniformLocation(progRender, 'uTrail'), 2)
      gl.uniform2f(gl.getUniformLocation(progRender, 'uTexel'), 1 / fw, 1 / fh)
      gl.uniform2f(gl.getUniformLocation(progRender, 'uAspect'), ax, ay)
      gl.uniform1f(gl.getUniformLocation(progRender, 'uTime'), tt)
      bindQuad(progRender)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    // --- Interactions -----------------------------------------------------
    const pos = (cx, cy) => {
      const rect = wrap.getBoundingClientRect()
      mouse.x = (cx - rect.left) / rect.width
      mouse.y = 1 - (cy - rect.top) / rect.height // uv : y depuis le bas
    }
    const onMove = (e) => { interacted = true; down = 1; pos(e.clientX, e.clientY) }
    const onLeave = () => { down = 0 }
    const onTouch = (e) => { interacted = true; down = 1; const t = e.touches[0]; if (t) pos(t.clientX, t.clientY) }
    const onTouchEnd = () => { down = 0 }
    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseenter', onMove)
    wrap.addEventListener('mouseleave', onLeave)
    wrap.addEventListener('touchstart', onTouch, { passive: true })
    wrap.addEventListener('touchmove', onTouch, { passive: true })
    wrap.addEventListener('touchend', onTouchEnd)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      wrap.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseenter', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
      wrap.removeEventListener('touchstart', onTouch)
      wrap.removeEventListener('touchmove', onTouch)
      wrap.removeEventListener('touchend', onTouchEnd)
    }
  }, [srcBase, srcReveal])

  return (
    <div ref={wrapRef} className={className} style={{ position: 'relative', cursor: 'crosshair', ...style }}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
