/** Franja de palabras en movimiento (solo nombres de categorias y del servicio, nada que prometer). */
export function MarqueeStrip({ words }: { words: string[] }) {
  const track = [...words, ...words];

  return (
    <div
      aria-hidden
      className="overflow-hidden bg-primary py-3.5 text-primary-foreground"
    >
      <div className="animate-marquee flex w-max items-center">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {track.map((word, index) => (
              <span
                key={`${copy}-${index}`}
                className="flex items-center gap-8 pr-8 font-display text-2xl font-medium italic md:text-3xl"
              >
                {word}
                <span className="text-champagne">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
