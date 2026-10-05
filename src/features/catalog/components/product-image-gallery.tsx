"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Galeria: en celular se desliza con el dedo (con puntos indicadores); en
 * escritorio hay miniaturas verticales y zoom al pasar el cursor.
 */
export function ProductImageGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const safeImages = images.length ? images : ["/window.svg"];
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll() {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    setActiveIndex(Math.round(scroller.scrollLeft / scroller.clientWidth));
  }

  function goTo(index: number) {
    const scroller = scrollerRef.current;

    scroller?.scrollTo({ left: index * scroller.clientWidth, behavior: "smooth" });
  }

  function handleZoomMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const image = event.currentTarget.firstElementChild as HTMLElement | null;

    if (image) {
      image.style.transformOrigin = `${x}% ${y}%`;
    }
  }

  return (
    <div className="lg:grid lg:grid-cols-[76px_1fr] lg:gap-4">
      {safeImages.length > 1 ? (
        <div className="hidden flex-col gap-3 lg:flex">
          {safeImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-label={`Ver imagen ${index + 1}`}
              aria-current={index === activeIndex}
              onClick={() => goTo(index)}
              className={cn(
                "relative aspect-[4/5] overflow-hidden rounded-xl bg-muted ring-offset-2 ring-offset-background transition-all",
                index === activeIndex
                  ? "ring-2 ring-foreground"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="76px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto rounded-2xl bg-muted lg:rounded-3xl"
        >
          {safeImages.map((image, index) => (
            <div
              key={`${image}-${index}`}
              onMouseMove={handleZoomMove}
              className="group relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden lg:cursor-zoom-in"
            >
              <Image
                src={image}
                alt={index === 0 ? name : `${name} - imagen ${index + 1}`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority={index === 0}
                className="object-cover transition-transform duration-300 ease-out lg:group-hover:scale-[1.8]"
              />
            </div>
          ))}
        </div>

        {safeImages.length > 1 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5 lg:hidden">
            {safeImages.map((image, index) => (
              <span
                key={`${image}-dot-${index}`}
                className={cn(
                  "h-1.5 rounded-full bg-white shadow transition-all",
                  index === activeIndex ? "w-5" : "w-1.5 opacity-60",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
