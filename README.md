# 🛒 Actividad 15 – Simulación de Carrito de Compras (Front-End)

Proyecto copy-paste para cumplir la **ACTIVIDAD 15**: login/registro con LocalStorage, catálogo de productos, carrito con agregar/eliminar/cantidades, cupones de descuento y finalización de compra con ticket. No requiere backend.

## Estructura
- `index.html` – interfaz, panel de acceso, catálogo y carrito.
- `styles.css` – estilo oscuro moderno.
- `app.js` – lógica de usuarios, productos, carrito y cupones.

## Requisitos previos
Ninguno. Abrí `index.html` en tu navegador (recomendado: usar la extensión **Live Server** de VSCode para evitar problemas de rutas).

## Uso
1. Crear cuenta o iniciar sesión.
2. Buscar/ordenar en el catálogo y **Agregar** productos (define cantidad antes de agregar).
3. Abrir **Carrito** para ajustar cantidades, quitar ítems o aplicar cupones (`DIS_10`, `DIS_15`, `DIS_25`).
4. Presionar **Finalizar compra** para generar un **ticket** y vaciar el carrito.

## Notas técnicas
- Persistencia en `localStorage` para: `users`, `user`, `cart`.
- Totales con formato **ARS**.
- Cupón aplica descuento porcentual al subtotal.

## Personalización
- Editá el arreglo `PRODUCTS` en `app.js` (precios, stock, imágenes).
- Cambiá colores en `:root` de `styles.css`.
- Sustituí las imágenes por locales si lo preferís.

## Licencia
Uso educativo.
