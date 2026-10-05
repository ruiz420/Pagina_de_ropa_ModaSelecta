const LETTER_ORDER = ["xxs", "xs", "s", "m", "l", "xl", "xxl", "xxxl"];

function rank(size: string) {
  const normalized = size.trim().toLowerCase();
  const letterIndex = LETTER_ORDER.indexOf(normalized);

  if (letterIndex >= 0) {
    return { group: 0, value: letterIndex };
  }

  const numeric = Number(normalized.replace(",", "."));

  if (Number.isFinite(numeric)) {
    return { group: 1, value: numeric };
  }

  // "Unica" y otros nombres van al final.
  return { group: 2, value: 0 };
}

/** Ordena tallas como se esperan en una tienda: XS a XXL, luego numericas, luego el resto. */
export function sortSizes(sizes: string[]) {
  return [...sizes].sort((a, b) => {
    const rankA = rank(a);
    const rankB = rank(b);

    return (
      rankA.group - rankB.group ||
      rankA.value - rankB.value ||
      a.localeCompare(b)
    );
  });
}
