// Nombre de color (sin tildes, en minusculas) -> color para la muestra visual.
const SWATCHES: Record<string, string> = {
  negro: "#1f1a17",
  blanco: "#ffffff",
  arena: "#d9c3a0",
  beige: "#d8c7ab",
  crema: "#f1e7d3",
  nude: "#e0b9a0",
  cafe: "#6f4a32",
  marron: "#6f4a32",
  camel: "#b98a56",
  gris: "#9ca3af",
  plateado: "#c4c7cc",
  dorado: "#c9a24b",
  rojo: "#c62828",
  vino: "#6d1a36",
  guinda: "#6d1a36",
  rosa: "#f08ab4",
  rosado: "#f08ab4",
  fucsia: "#d4237c",
  coral: "#f2765f",
  naranja: "#f08a24",
  amarillo: "#f2cf4a",
  verde: "#2f7d57",
  oliva: "#6b7a3a",
  menta: "#a6dcc5",
  azul: "#2f5fa8",
  celeste: "#8cc3ea",
  turquesa: "#2aa7a1",
  morado: "#7a4bb0",
  lila: "#c0a2e0",
  lavanda: "#c0a2e0",
};

function normalize(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/** Devuelve el color de la muestra o null si no se reconoce el nombre. */
export function getSwatchColor(name: string): string | null {
  return SWATCHES[normalize(name)] ?? null;
}
