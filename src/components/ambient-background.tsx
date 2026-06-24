/* Place this <AmbientBackground /> as the first child inside <body>,
   before any content. Content uses position: relative; z-index: 1 to sit above it. */

export default function AmbientBackground() {
  return (
    <div className="bg-ambient" aria-hidden="true">
      {/* 1 — Syringe (teal) */}
      <svg className="f-a p-s d-1" style={{ top: "8%", left: "6%", width: 48, height: 48, color: "var(--c-3)", strokeWidth: 1.5 }} viewBox="0 0 24 24">
        <line x1="20" y1="2" x2="2" y2="20" />
        <rect x="10" y="6" width="8" height="5" rx="1" />
        <line x1="14" y1="6" x2="14" y2="3" />
        <line x1="10" y1="11" x2="18" y2="11" />
        <circle cx="18" cy="10" r="1.2" />
      </svg>

      {/* 2 — Pill capsule (rose) */}
      <svg className="f-b p-w d-3" style={{ top: "14%", right: "10%", width: 52, height: 26, color: "var(--c-5)", strokeWidth: 1.5 }} viewBox="0 0 24 12">
        <rect x="1" y="1" width="22" height="10" rx="5" />
        <line x1="12" y1="1" x2="12" y2="11" />
      </svg>

      {/* 3 — Round pill (amber) */}
      <svg className="f-c p-s d-5" style={{ bottom: "22%", left: "12%", width: 40, height: 40, color: "var(--c-4)", strokeWidth: 1.5 }} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>

      {/* 4 — Medical cross (coral) */}
      <svg className="f-d p-w d-7 hide-mobile" style={{ top: "5%", left: "42%", width: 44, height: 44, color: "var(--c-1)", strokeWidth: 2.2 }} viewBox="0 0 24 24">
        <line x1="12" y1="4" x2="12" y2="20" />
        <line x1="4" y1="12" x2="20" y2="12" />
      </svg>

      {/* 5 — Stethoscope (sky blue) */}
      <svg className="f-e p-s d-2" style={{ bottom: "12%", right: "8%", width: 50, height: 50, color: "var(--c-6)", strokeWidth: 1.4 }} viewBox="0 0 24 24">
        <path d="M6 18c0 2.2 1.8 4 4 4s4-1.8 4-4v-3" />
        <path d="M14 12c0-2.2 1.8-4 4-4" />
        <circle cx="18" cy="8" r="3.5" />
        <line x1="10" y1="22" x2="12" y2="15" />
      </svg>

      {/* 6 — Heartbeat / EKG (lavender) */}
      <svg className="f-a p-w d-4" style={{ top: "36%", left: "3%", width: 68, height: 34, color: "var(--c-2)", strokeWidth: 1.3 }} viewBox="0 0 24 12">
        <polyline points="1,7 5,7 7,2 9,11 11,7 15,7 17,2 19,11 21,7 23,7" />
      </svg>

      {/* 7 — Thermometer (amber) */}
      <svg className="f-c p-s d-6 hide-mobile" style={{ top: "60%", right: "4%", width: 32, height: 48, color: "var(--c-4)", strokeWidth: 1.5 }} viewBox="0 0 12 20">
        <rect x="4" y="1" width="4" height="12" rx="2" />
        <circle cx="6" cy="15" r="4" />
        <line x1="6" y1="6" x2="6" y2="9" />
        <line x1="6" y1="12" x2="6" y2="13" />
      </svg>

      {/* 8 — DNA helix (teal) */}
      <svg className="f-b p-s d-8 hide-mobile" style={{ bottom: "30%", left: "50%", width: 40, height: 56, color: "var(--c-3)", strokeWidth: 1.3 }} viewBox="0 0 14 20">
        <path d="M3 1c0 0 4 3 4 9s-4 9-4 9" />
        <path d="M11 1c0 0-4 3-4 9s4 9 4 9" />
        <line x1="3" y1="6" x2="11" y2="6" />
        <line x1="3" y1="14" x2="11" y2="14" />
      </svg>

      {/* 9 — Droplet / blood drop (coral) */}
      <svg className="f-d p-w d-9" style={{ bottom: "8%", left: "28%", width: 34, height: 44, color: "var(--c-1)", strokeWidth: 1.5 }} viewBox="0 0 16 22">
        <path d="M8 1c0 0-7 10-7 14a7 7 0 0 0 14 0c0-4-7-14-7-14z" />
      </svg>

      {/* 10 — Medical cross / plus (rose, smaller, extra desync) */}
      <svg className="f-e p-s d-10" style={{ top: "72%", left: "80%", width: 32, height: 32, color: "var(--c-5)", strokeWidth: 1.8 }} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="7" x2="12" y2="17" />
        <line x1="7" y1="12" x2="17" y2="12" />
      </svg>
    </div>
  );
}
