"use client";

import { ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/cart/store/cart-store";

const reminders = [
  "Vuelve, tus favoritos te esperan.",
  "No has terminado tu pedido.",
  "Ese look todavia puede ser tuyo.",
  "Tus productos siguen listos para ti.",
];

export function ReturnReminder() {
  const hasItems = useCartStore((state) => state.items.length > 0);
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Solo tiene sentido recordar un pedido cuando la bolsa realmente tiene algo.
  useEffect(() => {
    if (!hasItems) {
      return;
    }

    const showTimer = window.setTimeout(() => setIsVisible(true), 5000);
    const rotateTimer = window.setInterval(
      () => setIndex((current) => (current + 1) % reminders.length),
      5000,
    );

    return () => {
      window.clearTimeout(showTimer);
      window.clearInterval(rotateTimer);
    };
  }, [hasItems]);

  useEffect(() => {
    if (!hasItems) {
      return;
    }

    const originalTitle = document.title;

    function updateTitle() {
      document.title = document.hidden ? reminders[index] : originalTitle;
    }

    updateTitle();
    document.addEventListener("visibilitychange", updateTitle);

    return () => {
      document.removeEventListener("visibilitychange", updateTitle);
      document.title = originalTitle;
    };
  }, [index, hasItems]);

  if (!isVisible || !hasItems) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 z-50 max-w-[calc(100vw-6.5rem)] rounded-2xl border bg-background/95 p-3 text-sm shadow-lift backdrop-blur md:bottom-6 md:left-6 md:max-w-sm">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <ShoppingBag className="h-4 w-4" />
        </span>
        <p className="font-medium">{reminders[index]}</p>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          aria-label="Cerrar aviso"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
