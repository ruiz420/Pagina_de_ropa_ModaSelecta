# Moda Selecta

Tienda de ropa con compra rapida, carrito lateral, catalogo filtrable y panel administrativo protegido.

## Desarrollo

```bash
npm run dev
```

Abrir `http://localhost:3000`.

## Recordatorio movil

Cuando se quiera escalar la pagina para celular, recordar que lo mas facil al inicio es usar un acceso directo desde el navegador del celular. Asi el cliente puede abrir la tienda como si fuera una app sin desarrollar una app nativa todavia.

## Produccion

Antes de subir a web, configurar:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Las imagenes de productos deben ser URLs publicas HTTPS.
