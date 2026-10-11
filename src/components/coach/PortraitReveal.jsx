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

    const frame = (now) => {
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
        octx.setTransform(dpr, 0, 0, dpr, 0, 0)
        octx.clearRect(0, 0, w, h)
        if (srcReveal && okB) drawCover(octx, imgB)
        else placeholder(octx, 'reveal')
        const px = reveal.x * w, py = reveal.y * h, R = reveal.r * Math.min(w, h)
        octx.globalCompositeOperation = 'destination-in'
        const mg = octx.createRadialGradient(px, py, R * 0.1, px, py, R)
        mg.addColorStop(0, 'rgba(0,0,0,1)'); mg.addColorStop(0.72, 'rgba(0,0,0,1)'); mg.addColorStop(1, 'rgba(0,0,0,0)')
        octx.fillStyle = mg
        octx.beginPath(); octx.arc(px, py, R, 0, Math.PI * 2); octx.fill()
        octx.globalCompositeOperation = 'source-over'
        ctx.drawImage(off, 0, 0, w, h)
        // anneau « lentille d'eau »
        ctx.strokeStyle = 'rgba(45,212,238,0.5)'; ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(px, py, R * 0.9, 0, Math.PI * 2); ctx.stroke()
        ctx.strokeStyle = 'rgba(45,212,238,0.18)'; ctx.lineWidth = 6
        ctx.beginPath(); ctx.arc(px, py, R * 0.9, 0, Math.PI * 2); ctx.stroke()
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
