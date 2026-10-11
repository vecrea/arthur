// Jeu d'icônes partagé (SVG inline, trait 2px arrondi — cohérent dans toute l'app).
const PATHS = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></>,
  trophy: <><path d="M8 3h8v5a4 4 0 0 1-8 0z" /><path d="M8 5H5a2 2 0 0 0 2 3" /><path d="M16 5h3a2 2 0 0 1-2 3" /><path d="M12 12v4" /><path d="M9 21h6" /><path d="M10 16h4l.5 5h-5z" /></>,
  star: <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.4 6.2 20.9l1.1-6.5-4.7-4.6 6.5-.95z" />,
  compare: <><rect x="4" y="4" width="7" height="16" rx="1.5" /><rect x="13" y="4" width="7" height="11" rx="1.5" /></>,
  wallet: <><rect x="3" y="6" width="18" height="14" rx="2.5" /><path d="M3 10h18" /><circle cx="16.5" cy="14.5" r="1.3" fill="currentColor" stroke="none" /></>,
  doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></>,
  cap: <><path d="M3 9.5 12 5l9 4.5-9 4.5z" /><path d="M7 11.5V16c0 1 2.2 2.2 5 2.2s5-1.2 5-2.2v-4.5" /><path d="M21 9.5V15" /></>,
  gauge: <><path d="M12 13 16 9" /><path d="M4.5 18a9 9 0 1 1 15 0" /><circle cx="12" cy="13" r="1.4" fill="currentColor" stroke="none" /></>,
  watch: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 1.5" /><path d="M9 2h6" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  steps: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="m4 5 1.2 1.2L7.5 4" /><path d="m4 11 1.2 1.2L7.5 10" /><path d="m4 17 1.2 1.2L7.5 16" /></>,
  sparkles: <><path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z" /><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M5 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1" /></>,
  award: <><circle cx="12" cy="8" r="5" /><path d="M8.5 12.5 7 22l5-3 5 3-1.5-9.5" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
  flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1z" /><path d="M4 22V4" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  menu: <><path d="M3 6h18M3 12h18M3 18h18" /></>,
  close: <><path d="M6 6l12 12M18 6 6 18" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 6 10 7L22 6" /></>,
  inbox: <><path d="M22 12h-5l-2 3h-6l-2-3H2" /><path d="M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" /></>,
  reply: <><path d="M9 17 4 12l5-5" /><path d="M4 12h11a4 4 0 0 1 4 4v3" /></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
}

export default function Icon({ name, className = 'h-5 w-5' }) {
  const solid = name === 'star'
  return (
    <svg viewBox="0 0 24 24" className={className} fill={solid ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name] || null}
    </svg>
  )
}

// Monogramme « vagues » (natation).
export function Wave({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8c1.6-1.7 3.2-1.7 4.8 0S11 9.7 12.6 8s3.2-1.7 4.8 0S20.6 9.7 22.2 8" />
      <path d="M3 13c1.6-1.7 3.2-1.7 4.8 0S11 14.7 12.6 13s3.2-1.7 4.8 0S20.6 14.7 22.2 13" />
      <path d="M3 18c1.6-1.7 3.2-1.7 4.8 0S11 19.7 12.6 18s3.2-1.7 4.8 0S20.6 19.7 22.2 18" />
    </svg>
  )
}
