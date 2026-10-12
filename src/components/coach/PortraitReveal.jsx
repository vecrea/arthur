import { useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// Portrait à révélation (effet « Lando Norris ») : on voit le visage, et au
// survol (ou au doigt) une lentille d'eau révèle la version bonnet + lunettes.
// srcBase   = photo du visage (sans bonnet/lunettes)
// srcReveal = MÊME cadrage, avec bonnet + lunettes de piscine
// Sans photos : un placeholder stylisé montre le mécanisme.
// ---------------------------------------------------------------------------
export default function PortraitReveal({ srcBase, srcReveal, className = '', style }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const off = document.createElement('canvas')
    const octx = off.getContext('2d')
    let w = 0, h = 0, dpr = 1, raf
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const imgA = new Image()
    const imgB = new Image()
    let okA = false, okB = false
    imgA.onload = () => { okA = true }
    imgB.onload = () => { okB = true }
    if (srcBase) imgA.src = srcBase
    if (srcReveal) imgB.src = srcReveal

    const mouse = { x: 0.5, y: 0.42 }
    const reveal = { x: 0.5, y: 0.42, r: 0, tr: 0 }
    let interacted = false
    let t0 = performance.now()

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = wrap.clientWidth
      h = wrap.clientHeight
      for (const c of [canvas, off]) { c.width = Math.max(1, Math.floor(w * dpr)); c.height = Math.max(1, Math.floor(h * dpr)) }
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      octx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const drawCover = (c, img) => {
      const ir = img.width / img.height
      const cr = w / h
      let dw, dh, dx, dy
      if (ir > cr) { dh = h; dw = h * ir; dx = (w - dw) / 2; dy = 0 } else { dw = w; dh = w / ir; dx = 0; dy = (h - dh) / 2 }
      c.drawImage(img, dx, dy, dw, dh)
    }

    // Avatar fictif stylisé (buste duotone + lumière de contour) ; la version
    // « reveal » ajoute un bonnet glossy + lunettes de piscine. Fond transparent
    // → le portrait flotte sur le hero. (Remplacé par les vraies photos plus tard.)
    const placeholder = (c, variant) => {
      const cy = h * 0.4
      const r = Math.min(w, h * 0.82) * 0.25
      const cx = w / 2
      // halo arrière
      const halo = c.createRadialGradient(cx, cy, 0, cx, cy, r * 3.2)
      halo.addColorStop(0, 'rgba(45,212,238,0.13)')
      halo.addColorStop(1, 'rgba(45,212,238,0)')
      c.fillStyle = halo
      c.fillRect(0, 0, w, h)
      // buste
      const bg = c.createLinearGradient(cx - r, cy - r, cx + r, cy + r * 3)
      bg.addColorStop(0, '#26506f')
      bg.addColorStop(0.6, '#13293f')
      bg.addColorStop(1, '#0a1829')
      c.fillStyle = bg
      c.beginPath()
      c.moveTo(cx - r * 2.0, h)
      c.bezierCurveTo(cx - r * 1.95, cy + r * 2.1, cx - r * 1.08, cy + r * 1.5, cx, cy + r * 1.45)
      c.bezierCurveTo(cx + r * 1.08, cy + r * 1.5, cx + r * 1.95, cy + r * 2.1, cx + r * 2.0, h)
      c.closePath()
      c.fill()
      c.fillRect(cx - r * 0.42, cy + r * 0.55, r * 0.84, r * 1.1) // cou
      c.beginPath(); c.ellipse(cx, cy, r * 0.92, r * 1.08, 0, 0, Math.PI * 2); c.fill() // tête
      // lumière de contour
      c.save()
      c.beginPath(); c.ellipse(cx, cy, r * 0.92, r * 1.08, 0, 0, Math.PI * 2); c.clip()
      const rim = c.createLinearGradient(cx, 0, cx + r, 0)
      rim.addColorStop(0, 'rgba(45,212,238,0)')
      rim.addColorStop(1, 'rgba(45,212,238,0.5)')
      c.fillStyle = rim
      c.beginPath(); c.ellipse(cx + r * 0.32, cy, r * 0.92, r * 1.08, 0, 0, Math.PI * 2); c.fill()
      c.restore()

      if (variant === 'reveal') {
        c.save()
        c.beginPath(); c.ellipse(cx, cy, r * 0.95, r * 1.1, 0, 0, Math.PI * 2); c.clip()
        const cap = c.createLinearGradient(cx - r, cy - r, cx + r * 0.6, cy + r * 0.4)
        cap.addColorStop(0, '#5ee7ff')
        cap.addColorStop(0.5, '#1ba7d6')
        cap.addColorStop(1, '#0a6bb0')
        c.fillStyle = cap
        c.beginPath(); c.ellipse(cx, cy - r * 0.2, r * 0.98, r * 0.98, 0, 0, Math.PI * 2); c.fill()
        c.fillStyle = 'rgba(255,255,255,0.4)' // reflet bonnet
        c.beginPath(); c.ellipse(cx - r * 0.36, cy - r * 0.52, r * 0.3, r * 0.14, -0.5, 0, Math.PI * 2); c.fill()
        c.restore()
        // lunettes
        const gy = cy + r * 0.16
        for (const sx of [-0.42, 0.42]) {
          const gx = cx + r * sx
          c.fillStyle = 'rgba(6,14,24,0.92)'
          c.beginPath(); c.ellipse(gx, gy, r * 0.33, r * 0.27, 0, 0, Math.PI * 2); c.fill()
          c.strokeStyle = '#2dd4ee'; c.lineWidth = Math.max(2, r * 0.06)
          c.beginPath(); c.ellipse(gx, gy, r * 0.33, r * 0.27, 0, 0, Math.PI * 2); c.stroke()
          c.fillStyle = 'rgba(130,235,255,0.45)' // reflet verre
          c.beginPath(); c.ellipse(gx - r * 0.1, gy - r * 0.09, r * 0.09, r * 0.05, -0.5, 0, Math.PI * 2); c.fill()
        }
        c.strokeStyle = '#2dd4ee'; c.lineWidth = Math.max(2, r * 0.055)
        c.beginPath(); c.moveTo(cx - r * 0.13, gy); c.lineTo(cx + r * 0.13, gy); c.stroke() // pont
      }
    }

    const lerp = (a, b, k) => a + (b - a) * k

    // Rayon « ondulé » : une somme de sinus (angle + temps) déforme le cercle en
    // continu → un contour liquide qui ondule, au lieu d'une boule figée.
    const wavyRadius = (a, t, amp) =>
      1 + amp * (0.10 * Math.sin(a * 3 + t * 1.3)
        + 0.06 * Math.sin(a * 5 - t * 2.0 + 1.1)
        + 0.035 * Math.sin(a * 7 + t * 0.8 + 2.3)
        + 0.02 * Math.sin(a * 11 - t * 1.4))

    const wavyPath = (c, cx, cy, R, t, amp) => {
      const N = 84
      c.beginPath()
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * Math.PI * 2
        const rr = R * wavyRadius(a, t, amp)
        const x = cx + Math.cos(a) * rr
        const y = cy + Math.sin(a) * rr
        i === 0 ? c.moveTo(x, y) : c.lineTo(x, y)
      }
      c.closePath()
    }

    let ripples = []     // vaguelettes concentriques qui s'éloignent du centre
    let lastSpawn = 0

    const frame = (now) => {
      const tt = reduce ? 0 : now / 1000
      // Démo automatique au début (pour le mobile sans survol).
      if (!interacted && !reduce) {
        const el = (now - t0) / 1000
        if (el > 1.2 && el < 7) {
          reveal.tr = 0.4
          mouse.x = 0.5 + Math.cos(el * 1.1) * 0.22
          mouse.y = 0.44 + Math.sin(el * 1.7) * 0.14
        } else if (el >= 7) {
          reveal.tr = 0
        }
      }
      reveal.r = lerp(reveal.r, reveal.tr, 0.1)
      reveal.x = lerp(reveal.x, mouse.x, 0.16)
      reveal.y = lerp(reveal.y, mouse.y, 0.16)

      ctx.clearRect(0, 0, w, h)
      if (srcBase && okA) drawCover(ctx, imgA)
      else placeholder(ctx, 'base')

      if (reveal.r > 0.004) {
        const px = reveal.x * w, py = reveal.y * h, R = reveal.r * Math.min(w, h)

        // 1) Masque liquide : la version bonnet/lunettes est révélée sous une
        //    forme ondulée au bord adouci (flou), jamais un disque net.
        octx.setTransform(dpr, 0, 0, dpr, 0, 0)
        octx.clearRect(0, 0, w, h)
        if (srcReveal && okB) drawCover(octx, imgB)
        else placeholder(octx, 'reveal')
        octx.save()
        octx.globalCompositeOperation = 'destination-in'
        octx.filter = `blur(${Math.max(1, R * 0.045)}px)`
        octx.fillStyle = '#000'
        wavyPath(octx, px, py, R * 0.9, tt, 1)
        octx.fill()
        octx.restore()
        ctx.drawImage(off, 0, 0, w, h)

        // 2) Liseré « eau » épousant le bord ondulé + vaguelettes qui s'éloignent.
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        wavyPath(ctx, px, py, R * 0.9, tt, 1)
        ctx.strokeStyle = 'rgba(45,212,238,0.14)'; ctx.lineWidth = 7; ctx.stroke()
        ctx.strokeStyle = 'rgba(120,235,255,0.5)'; ctx.lineWidth = 2; ctx.stroke()
        if (!reduce) {
          if (now - lastSpawn > 780) { ripples.push(now); lastSpawn = now }
          ripples = ripples.filter((ts) => now - ts < 1700)
          for (const ts of ripples) {
            const age = (now - ts) / 1700
            ctx.strokeStyle = `rgba(90,231,255,${(1 - age) * 0.3})`
            ctx.lineWidth = 1.5
            wavyPath(ctx, px, py, R * (0.5 + age * 1.0), tt, 0.5)
            ctx.stroke()
          }
        }
        ctx.restore()
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const pos = (cx, cy) => {
      const rect = wrap.getBoundingClientRect()
      mouse.x = (cx - rect.left) / rect.width
      mouse.y = (cy - rect.top) / rect.height
    }
    const onMove = (e) => { interacted = true; pos(e.clientX, e.clientY); reveal.tr = 0.42 }
    const onLeave = () => { reveal.tr = 0 }
    const onTouch = (e) => { interacted = true; const tt = e.touches[0]; if (tt) { pos(tt.clientX, tt.clientY); reveal.tr = 0.42 } }
    const onTouchEnd = () => { reveal.tr = 0 }
    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseleave', onLeave)
    wrap.addEventListener('touchstart', onTouch, { passive: true })
    wrap.addEventListener('touchmove', onTouch, { passive: true })
    wrap.addEventListener('touchend', onTouchEnd)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      wrap.removeEventListener('mousemove', onMove)
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
