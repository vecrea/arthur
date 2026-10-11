import { useEffect, useRef, useState } from 'react'

// Révélation au scroll (fade + montée) via IntersectionObserver.
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div', style, ...rest }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setInView(true); io.unobserve(e.target) } }),
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag ref={ref} className={'cine-reveal ' + (inView ? 'is-in ' : '') + className} style={{ '--cine-delay': `${delay}s`, ...style }} {...rest}>
      {children}
    </Tag>
  )
}

// Compteur animé (compte de 0 → value quand visible).
export function Counter({ value, duration = 1500, decimals = 0, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null)
  const [disp, setDisp] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const to = Number(value) || 0
    if (reduce) { setDisp(to); return }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const tick = (now) => {
            const p = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - p, 3)
            setDisp(to * eased)
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          io.unobserve(e.target)
        }
      }),
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [value, duration])
  return <span ref={ref} className={className}>{prefix}{disp.toFixed(decimals)}{suffix}</span>
}

// Bandeau défilant en boucle.
export function Marquee({ items, duration = 28, className = '', sep = '✦' }) {
  const seq = [...items, ...items]
  return (
    <div className={'cine-marquee ' + className} style={{ '--cine-marquee-dur': `${duration}s` }}>
      <div className="cine-marquee__track">
        {seq.map((it, i) => (
          <span key={i} className="mx-5 inline-flex items-center gap-5">
            <span>{it}</span>
            <span className="opacity-40">{sep}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// Fond animé « eau » (canvas 2D) : dégradé sombre + vagues néon + bulles qui montent.
export function PoolCanvas({ className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf, w = 0, h = 0, dpr = 1
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let particles = []

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = canvas.clientWidth || canvas.offsetWidth || window.innerWidth
      h = canvas.clientHeight || canvas.offsetHeight || window.innerHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const N = Math.max(18, Math.min(80, Math.round((w * h) / 20000)))
      particles = Array.from({ length: N }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.1 + 0.4,
        s: Math.random() * 0.45 + 0.12,
        o: Math.random() * 0.45 + 0.12,
      }))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const waves = [
      { amp: 24, len: 0.0085, sp: 0.55, y: 0.33, col: 'rgba(45,212,238,0.11)', lw: 2 },
      { amp: 18, len: 0.012, sp: -0.85, y: 0.5, col: 'rgba(56,189,248,0.08)', lw: 1.5 },
      { amp: 34, len: 0.006, sp: 0.38, y: 0.7, col: 'rgba(45,212,238,0.06)', lw: 2.5 },
    ]
    let t = 0

    const frame = () => {
      t += 0.016
      ctx.clearRect(0, 0, w, h)
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#071020')
      g.addColorStop(0.5, '#05080f')
      g.addColorStop(1, '#03040a')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      const rg = ctx.createRadialGradient(w * 0.28, h * 0.18, 0, w * 0.28, h * 0.18, Math.max(w, h) * 0.75)
      rg.addColorStop(0, 'rgba(45,212,238,0.12)')
      rg.addColorStop(1, 'rgba(45,212,238,0)')
      ctx.fillStyle = rg
      ctx.fillRect(0, 0, w, h)
      for (const wv of waves) {
        ctx.beginPath()
        for (let x = 0; x <= w; x += 6) {
          const y = h * wv.y + Math.sin(x * wv.len + t * wv.sp) * wv.amp + Math.sin(x * wv.len * 2.3 + t * wv.sp * 1.7) * wv.amp * 0.3
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = wv.col
        ctx.lineWidth = wv.lw
        ctx.stroke()
      }
      for (const p of particles) {
        p.y -= p.s
        p.x += Math.sin((p.y + p.x) * 0.01) * 0.18
        if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(160,235,255,${p.o})`
        ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }

    if (reduce) { frame(); cancelAnimationFrame(raf) } else frame()
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])
  return <canvas ref={ref} className={className} aria-hidden="true" />
}
