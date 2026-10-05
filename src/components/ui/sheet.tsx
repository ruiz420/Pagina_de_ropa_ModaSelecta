"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Panel modal: hoja inferior en celular y ventana centrada en escritorio.
 * Maneja el fondo, la tecla Escape y el bloqueo del scroll de la pagina.
 */
export function Sheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[110]">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 animate-in bg-foreground/40 backdrop-blur-[2px] duration-200 fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="absolute inset-x-0 bottom-0 max-h-[90dvh] animate-in overflow-y-auto rounded-t-3xl bg-background p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-lift duration-300 slide-in-from-bottom sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[440px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:pb-5 sm:zoom-in-95 sm:slide-in-from-bottom-0"
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
