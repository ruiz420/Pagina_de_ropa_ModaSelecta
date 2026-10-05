"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false en el servidor y en el primer render del cliente, true despues.
 * Sirve para mostrar datos guardados en localStorage (favoritos, bolsa,
 * vistos) sin desajustes de hidratacion.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
