// Silhouette de supercar en SVG (aucune image externe requise).
// IDs de dégradés fixes : tous les exemplaires sont identiques -> pas de conflit visuel
// et pas de mismatch d'hydratation.
export function CarSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className={className}>
      <defs>
        <linearGradient id="apex-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2e35" />
          <stop offset=".5" stopColor="#15171c" />
          <stop offset="1" stopColor="#0a0b0d" />
        </linearGradient>
        <linearGradient id="apex-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff5a00" />
          <stop offset="1" stopColor="#ff8a3d" />
        </linearGradient>
        <radialGradient id="apex-wheel" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#1a1c21" />
          <stop offset=".7" stopColor="#0a0b0d" />
          <stop offset=".85" stopColor="#3a3d44" />
          <stop offset="1" stopColor="#0a0b0d" />
        </radialGradient>
      </defs>
      <path d="M40 210 C70 205 110 200 150 196 C180 150 250 118 340 112 C430 106 520 108 600 120 C660 128 720 150 770 176 L840 190 C862 194 868 202 858 212 L820 214 C812 236 788 250 762 250 C736 250 714 236 706 214 L280 214 C272 236 248 250 222 250 C196 250 174 236 166 214 L60 214 C44 214 34 212 40 210 Z" fill="url(#apex-body)" stroke="#000" strokeWidth="1" />
      <path d="M250 128 C300 108 360 104 430 106 C500 108 560 116 604 128 C560 150 520 156 470 158 L300 158 C278 150 262 140 250 128 Z" fill="#0c0f16" stroke="#22262e" strokeWidth="1.5" />
      <path d="M170 200 L700 200" stroke="url(#apex-edge)" strokeWidth="2.5" opacity=".9" />
      <path d="M760 206 L858 206" stroke="url(#apex-edge)" strokeWidth="3" />
      <circle cx="222" cy="214" r="46" fill="url(#apex-wheel)" />
      <circle cx="222" cy="214" r="20" fill="#0a0b0d" stroke="#3a3d44" strokeWidth="2" />
      <circle cx="762" cy="214" r="46" fill="url(#apex-wheel)" />
      <circle cx="762" cy="214" r="20" fill="#0a0b0d" stroke="#3a3d44" strokeWidth="2" />
      <path d="M828 186 L852 190 C858 192 858 198 852 198 L828 196 Z" fill="#ff8a3d" />
    </svg>
  );
}
