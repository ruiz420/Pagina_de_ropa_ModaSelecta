"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORE } from "@/config/store";
import { BundleSuggestions } from "@/features/cart/components/bundle-suggestions";
import { priceCart } from "@/features/cart/lib/pricing";
import { useCartStore } from "@/features/cart/store/cart-store";
import type { CatalogProduct } from "@/features/catalog/data/mock-catalog";
import { track } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import { useHydrated } from "@/lib/use-hydrated";
import { buildWhatsappMessage, buildWhatsappUrl } from "@/lib/whatsapp";

/** `addOns`: accesorios y belleza disponibles, para ofrecerlos con descuento junto a una prenda. */
export function CartDrawer({ addOns = [] }: { addOns?: CatalogProduct[] }) {
  const { items, isOpen, openCart, closeCart, removeItem, updateQuantity } =
    useCartStore();
  const hydrated = useHydrated();
  // La bolsa vive en localStorage: hasta hidratar mostramos 0 para no desajustar el HTML.
  const totalItems = hydrated
    ? items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;
  const { lines, subtotal, savings, total } = priceCart(items);
  const whatsappUrl = buildWhatsappUrl(buildWhatsappMessage(items));

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Abrir carrito"
        className="relative"
        onClick={openCart}
      >
        <ShoppingBag className="h-5 w-5" />
        {totalItems ? (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">
            {totalItems}
          </span>
        ) : null}
      </Button>

      {isOpen
        ? createPortal(
            <div className="fixed inset-0 z-[100]">
              <button
                type="button"
                aria-label="Cerrar carrito"
                className="absolute inset-0 animate-in bg-foreground/40 backdrop-blur-[2px] duration-200 fade-in"
                onClick={closeCart}
              />
              <aside className="fixed bottom-0 right-0 top-0 flex h-dvh w-[min(92vw,460px)] animate-in flex-col bg-background shadow-lift duration-300 slide-in-from-right sm:m-3 sm:h-[calc(100dvh-1.5rem)] sm:rounded-2xl sm:border">
                <div className="flex items-center justify-between border-b bg-card px-5 py-4 sm:rounded-t-2xl">
                  <div>
                    <p className="text-lg font-semibold">Tu bolsa</p>
                    <p className="text-sm text-muted-foreground">
                      {totalItems
                        ? `${totalItems} ${totalItems === 1 ? "producto agregado" : "productos agregados"}`
                        : "Tu bolsa esta vacia"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Cerrar carrito"
                    onClick={closeCart}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {items.length ? (
                    <>
                      <div className="space-y-4">
                        {lines.map(({ item, unitPrice, originalUnitPrice, discounted, lineTotal }) => (
                          <div
                            key={`${item.productId}-${item.color}-${item.size}`}
                            className="grid grid-cols-[76px_1fr] gap-3 rounded-xl border bg-card p-3"
                          >
                            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  sizes="72px"
                                  className="object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium">{item.name}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Ref {item.reference}
                                    {item.color ? ` / ${item.color}` : ""}
                                    {item.size ? ` / Talla ${item.size}` : ""}
                                  </p>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label="Eliminar producto"
                                  onClick={() =>
                                    removeItem(item.productId, item.color, item.size)
                                  }
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              {discounted ? (
                                <p className="mt-1 text-xs font-medium text-brand-strong">
                                  {STORE.bundleOffer.percent}% por combinar con tu prenda
                                </p>
                              ) : null}
                              <div className="mt-3 flex items-center justify-between gap-3">
                                <div className="flex items-center rounded-md border">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    aria-label="Reducir cantidad"
                                    onClick={() =>
                                      updateQuantity(
                                        item.productId,
                                        item.quantity - 1,
                                        item.color,
                                        item.size,
                                      )
                                    }
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    aria-label="Aumentar cantidad"
                                    onClick={() =>
                                      updateQuantity(
                                        item.productId,
                                        item.quantity + 1,
                                        item.color,
                                        item.size,
                                      )
                                    }
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-right text-sm font-semibold tabular-nums">
                                  {discounted ? (
                                    <span className="mr-2 text-xs font-normal text-muted-foreground line-through">
                                      {formatCurrency(originalUnitPrice * item.quantity)}
                                    </span>
                                  ) : null}
                                  <span className={discounted ? "text-discount" : undefined}>
                                    {formatCurrency(lineTotal)}
                                  </span>
                                </p>
                              </div>
                              {discounted ? (
                                <p className="sr-only">
                                  Precio con descuento por unidad: {formatCurrency(unitPrice)}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                      <BundleSuggestions addOns={addOns} onNavigate={closeCart} />
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                      <p className="mt-3 font-medium">Tu bolsa esta vacia</p>
                      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                        Toca el + en cualquier producto para elegir talla y color.
                      </p>
                      <Button
                        asChild
                        variant="cta"
                        className="mt-5"
                        onClick={closeCart}
                      >
                        <Link href="/catalogo">Descubrir la coleccion</Link>
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t px-5 py-4">
                  {savings > 0 ? (
                    <dl className="mb-2 space-y-1 text-sm">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <dt>Productos</dt>
                        <dd className="tabular-nums">{formatCurrency(subtotal)}</dd>
                      </div>
                      <div className="flex items-center justify-between font-medium text-discount">
                        <dt>Descuento por combinar</dt>
                        <dd className="tabular-nums">-{formatCurrency(savings)}</dd>
                      </div>
                    </dl>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total de productos
                    </span>
                    <span className="text-lg font-semibold tabular-nums">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    El envío no está incluido: te confirmamos su costo por WhatsApp
                    antes de que pagues.
                  </p>
                  {items.length ? (
                    <>
                      <Button asChild variant="cta" size="lg" className="mt-4 w-full">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() =>
                            track("send_order_whatsapp", {
                              items: totalItems,
                              total,
                              savings,
                            })
                          }
                        >
                          <MessageCircle className="h-5 w-5" />
                          Enviar pedido por WhatsApp
                        </a>
                      </Button>
                      <ol className="mt-3 space-y-1 text-xs text-muted-foreground [@media(max-height:700px)]:hidden">
                        <li>1. Se abre WhatsApp con tu pedido ya escrito.</li>
                        <li>2. Confirmamos talla, disponibilidad y envío.</li>
                        <li>
                          3. Acordamos el pago
                          {STORE.paymentInfo ? ` (${STORE.paymentInfo})` : ""}.
                        </li>
                      </ol>
                    </>
                  ) : (
                    <Button size="lg" className="mt-4 w-full rounded-full" disabled>
                      Enviar pedido por WhatsApp
                    </Button>
                  )}
                </div>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
