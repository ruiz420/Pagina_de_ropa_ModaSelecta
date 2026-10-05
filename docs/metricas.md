# Medición de la tienda

Cada mejora de la tienda tiene una métrica de éxito. Esta tabla conecta las
métricas del plan (atracción, exploración, confianza, conversión, fidelización)
con los eventos que la tienda ya emite.

## Cómo funciona

Los componentes llaman a `track(evento, datos)` de `src/lib/analytics.ts`.
Hoy no se envía nada a ningún servicio: se emite un evento del navegador
(`moda:track`) y, si en la página existe Google Analytics (`gtag`) o Plausible,
se reenvía automáticamente. Para empezar a medir basta con instalar uno de los
dos scripts en `src/app/layout.tsx`. No se recogen datos personales.

En desarrollo, los eventos aparecen en la consola del navegador como `[track]`.

## Métricas y eventos

| Etapa | Métrica | Evento / fuente |
|---|---|---|
| Atracción | visitas, origen del tráfico, permanencia | la herramienta de analítica (páginas vistas) |
| Exploración | productos vistos | `view_product` |
| Exploración | búsquedas y clics en resultados | `search`, `search_result_click` |
| Exploración | uso de filtros | `apply_filters` (qué filtros se usan) |
| Exploración | favoritos | `toggle_favorite` (`saved` = true / false) |
| Confianza | uso de guía de tallas, preguntas | `open_size_guide`, `ask_whatsapp` (`topic`) |
| Conversión | intención de compra | `open_quick_add`, `add_to_cart` |
| Conversión | pedidos enviados | `send_order_whatsapp` (`items`, `total`, `savings`) |
| Conversión | descuento por combinar | `bundle_offer_shown` (se mostró), `bundle_offer_add` (se agregó un complemento) |
| Fidelización | uso del control de datos | `clear_personalization` |

## Lo que todavía no se puede medir

- **Pedidos concretados y recompra:** el cierre ocurre en WhatsApp. Para saber
  cuántos `send_order_whatsapp` terminan en venta hay que anotarlo a mano o
  registrar el pedido en el panel (ya existe `/api/orders`, aún sin conectar al
  carrito).
- **Abandono:** se aproxima con `add_to_cart` frente a `send_order_whatsapp`.
- **Reseñas y reputación:** no existen datos reales todavía; no se muestran.

## Qué completar en `src/config/store.ts`

`shippingInfo`, `returnsInfo`, `paymentInfo`, `about`, `sizeGuide`, redes y foto
del hero. Todo lo que quede vacío simplemente no se muestra: no se publican
promesas que el negocio no ha definido.

## Colecciones

Las colecciones (Tendencia, Lo nuevo, Básicos, Oficina, Casual, Vintage, Lujo,
Segunda mano) se activan solas cuando hay productos con la etiqueta
correspondiente (campo de etiquetas del producto en el panel). El estado
(Nuevo, Como nuevo, Vintage, Segunda mano) también sale de esas etiquetas. Se
editan en `src/config/collections.ts`.

## Descuento por combinar

Accesorios y belleza con 10% menos cuando el pedido incluye una prenda
(`bundleOffer` en `src/config/store.ts`; `enabled: false` lo apaga).

Reglas que lo mantienen honesto:

- La condición es visible: en la bolsa y en la ficha del producto.
- El precio normal siempre se ve tachado junto al precio con descuento.
- Si la prenda sale de la bolsa, el descuento desaparece y la bolsa lo muestra.
- El mensaje de WhatsApp incluye la línea del descuento y el total, para que se
  respete al cerrar el pedido.
- Sin temporizadores, sin "últimas horas" y sin presión.

Cómo saber si funciona: comparar el total promedio por pedido
(`send_order_whatsapp.total`) y la proporción de pedidos con complemento
(`savings` > 0) antes y después. Revisar también el margen: el 10% sale de tu
ganancia en esos productos.

Pendiente técnico: el cálculo vive en el navegador y el pedido se cierra por
WhatsApp, por lo que no hay riesgo de cobro automático. Si algún día el carrito
se conecta a `/api/orders`, el servidor debe recalcular precios y descuento
(hoy `/api/orders` confía en el precio que envía el cliente).
