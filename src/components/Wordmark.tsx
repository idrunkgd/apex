// Signature de marque ZENITH — texte argenté, reprend l'esprit du logo, net sur fond sombre.
export function Wordmark({
  className = "",
  size = "md",
  tagline = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  tagline?: boolean;
}) {
  const sizes: Record<string, string> = { sm: "text-xl", md: "text-2xl", lg: "text-3xl" };
  return (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span
        className={`font-display tracking-[5px] bg-gradient-to-b from-white via-[#c7ccd4] to-[#8a8f99] bg-clip-text text-transparent ${sizes[size]}`}
      >
        ZENITH
      </span>
      {tagline && (
        <span className="font-cond text-[8px] tracking-[4px] text-gris uppercase mt-0.5">Luxury Experience</span>
      )}
    </span>
  );
}
