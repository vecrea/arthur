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
    const mask = document.createElement('canvas')   // masque = chemin du curseur
    const mctx = mask.getContext('2d')
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
      for (const c of [canvas, off, mask]) { c.width = Math.max(1, Math.floor(w * dpr)); c.height = Math.max(1, Math.floor(h * dpr)) }
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      octx.setTransform(dpr, 0, 0, dpr, 0, 0)
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0)
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

    // Traînée liquide : on mémorise le chemin récent du curseur et on révèle la
    // version bonnet/lunettes le long de ce chemin. Chaque point vieillit puis
    // s'évapore → un filet d'eau qui suit le geste, pas une forme posée.
    let trail = []        // { x, y, t } en coordonnées normalisées (0..1)
    const LIFE = 600      // ms avant évaporation complète d'un point

    // Dépose un disque doux (dégradé radial) servant à composer le masque / la lueur.
    const blob = (c, x, y, rad, a, col = '0,0,0') => {
      const g = c.createRadialGradient(x, y, 0, x, y, rad)
      g.addColorStop(0, `rgba(${col},${a})`)
      g.addColorStop(0.5, `rgba(${col},${a})`)
      g.addColorStop(1, `rgba(${col},0)`)
      c.fillStyle = g
      c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill()
    }

    const frame = (now) => {
      const tt = reduce ? 0 : now / 1000
      // Démo automatique au début (trace un chemin, utile sur mobile sans survol).
      if (!interacted && !reduce) {
        const el = (now - t0) / 1000
        if (el > 1.0 && el < 7.5) {
          reveal.tr = 0.17
          mouse.x = 0.5 + Math.cos(el * 1.3) * 0.2
          mouse.y = 0.42 + Math.sin(el * 2.1) * 0.17
        } else if (el >= 7.5) {
          reveal.tr = 0
        }
      }
      reveal.r = lerp(reveal.r, reveal.tr, 0.16)

      ctx.clearRect(0, 0, w, h)
      if (srcBase && okA) drawCover(ctx, imgA)
      else placeholder(ctx, 'base')

      // Alimente la traînée : points interpolés entre l'ancienne et la nouvelle
      // position → filet continu même quand le curseur va vite.
      if (reveal.r > 0.003) {
        const last = trail[trail.length - 1]
        if (!last) {
          trail.push({ x: mouse.x, y: mouse.y, t: now })
        } else {
          const d = Math.hypot(mouse.x - last.x, mouse.y - last.y)
          if (d > 0.0015) {
            const steps = Math.min(12, Math.max(1, Math.ceil(d / 0.008)))
            for (let i = 1; i <= steps; i++) {
              const k = i / steps
              trail.push({ x: last.x + (mouse.x - last.x) * k, y: last.y + (mouse.y - last.y) * k, t: now })
            }
          }
        }
      }
      trail = trail.filter((p) => now - p.t < LIFE)
      if (trail.length > 120) trail = trail.slice(trail.length - 120)

      if (reveal.r > 0.003) {
        const Rh = reveal.r * Math.min(w, h)   // rayon de la « tête » (au curseur)

        // 1) Masque = union des gouttes le long du chemin + tête au curseur.
        //    Les points anciens rétrécissent et pâlissent (évaporation).
        mctx.clearRect(0, 0, w, h)
        for (const p of trail) {
          const fresh = Math.max(0, 1 - (now - p.t) / LIFE)
          // Bord qui ondule (2 fréquences) + léger déplacement → clapot réaliste.
          const ph = p.x * 50 + p.y * 37
          const wob = 1 + 0.2 * Math.sin(ph + tt * 3) + 0.1 * Math.sin(ph * 1.7 - tt * 4.3)
          const ox = Math.sin(ph * 0.9 + tt * 2.2) * Rh * 0.1
          const oy = Math.cos(ph * 1.1 - tt * 2.6) * Rh * 0.1
          blob(mctx, p.x * w + ox, p.y * h + oy, Rh * (0.26 + 0.6 * fresh) * wob, 0.35 + 0.65 * fresh)
        }
        // tête : petit amas de gouttes au curseur, au bord organique qui ondule
        // (et qui ne disparaît pas au repos).
        const hx0 = mouse.x * w, hy0 = mouse.y * h
        blob(mctx, hx0, hy0, Rh * (0.8 + 0.06 * Math.sin(tt * 5)), 1)
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI * 2 + tt * 0.8
          const rr = Rh * (0.42 + 0.14 * Math.sin(tt * 3 + k))
          blob(mctx, hx0 + Math.cos(a) * Rh * 0.42, hy0 + Math.sin(a) * Rh * 0.42, rr, 1)
        }

        // 2) Applique le masque à la version révélée.
        octx.setTransform(dpr, 0, 0, dpr, 0, 0)
        octx.clearRect(0, 0, w, h)
        if (srcReveal && okB) drawCover(octx, imgB)
        else placeholder(octx, 'reveal')
        octx.save()
        octx.globalCompositeOperation = 'destination-in'
        octx.drawImage(mask, 0, 0, w, h)
        octx.restore()

        // Caustiques : bandes de lumière ondulantes qui bougent, visibles
        // uniquement dans le liquide (source-atop) → surface d'eau réaliste.
        if (!reduce) {
          octx.save()
          octx.globalCompositeOperation = 'source-atop'
          octx.lineWidth = Math.max(1, Rh * 0.05)
          for (let i = 0; i < 7; i++) {
            const prog = (i + 0.5) / 7
            octx.beginPath()
            for (let x = 0; x <= w; x += 9) {
              const y = h * prog
                + Math.sin(x * 0.03 + tt * 1.6 + i * 1.3) * (h * 0.028)
                + Math.sin(x * 0.013 - tt * 2.2 + i) * (h * 0.02)
              x === 0 ? octx.moveTo(x, y) : octx.lineTo(x, y)
            }
            octx.strokeStyle = `rgba(200,248,255,${0.07 + 0.035 * Math.sin(tt * 2 + i)})`
            octx.stroke()
          }
          octx.restore()
        }
        ctx.drawImage(off, 0, 0, w, h)

        // 3) Lueur cyan le long du filet (un point sur trois) + reflet mouillé
        //    sur la tête, en additif.
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        for (let i = 0; i < trail.length; i += 3) {
          const p = trail[i]
          const fresh = Math.max(0, 1 - (now - p.t) / LIFE)
          blob(ctx, p.x * w, p.y * h, Rh * (0.26 + 0.6 * fresh) * 1.1, 0.09 * fresh, '120,230,255')
        }
        const hx = mouse.x * w, hy = mouse.y * h
        const gh = ctx.createRadialGradient(hx, hy, 0, hx, hy, Rh * 1.05)
        gh.addColorStop(0, 'rgba(185,245,255,0.45)')
        gh.addColorStop(0.5, 'rgba(90,210,240,0.12)')
        gh.addColorStop(1, 'rgba(90,210,240,0)')
        ctx.fillStyle = gh
        ctx.beginPath(); ctx.arc(hx, hy, Rh * 1.05, 0, Math.PI * 2); ctx.fill()
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
    const onMove = (e) => { interacted = true; pos(e.clientX, e.clientY); reveal.tr = 0.17 }
    const onLeave = () => { reveal.tr = 0 }
    const onTouch = (e) => { interacted = true; const tt = e.touches[0]; if (tt) { pos(tt.clientX, tt.clientY); reveal.tr = 0.17 } }
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
