# ARCO — plantilla web para clínica dental

Sitio de una sola página con efecto parallax (GSAP + ScrollTrigger), formulario de cita, botones de llamada/WhatsApp, mapa y menú móvil. Pensado para subirlo tal cual a cualquier hosting estático y luego personalizarlo.

## Publicarlo (elige una opción)

- **Netlify**: arrastra esta carpeta entera a [app.netlify.com/drop](https://app.netlify.com/drop). Listo en segundos, con HTTPS.
- **Vercel**: `npx vercel` dentro de esta carpeta (pide cuenta gratuita).
- **GitHub Pages**: sube esta carpeta a un repositorio y activa Pages en la configuración del repo.
- **Hosting compartido de toda la vida**: sube `index.html` y la carpeta `images/` por FTP/SFTP a la raíz del dominio.

En todos los casos, cuando tengas dominio propio, añade estas dos etiquetas dentro de `<head>` en `index.html` (sustituye la URL):

```html
<link rel="canonical" href="https://www.tudominio.es/">
<meta property="og:image" content="https://www.tudominio.es/images/hero.jpg">
```

## Antes de publicarla, sustituye

- [ ] **Teléfono**: busca `600000000` y `600 000 000` en `index.html` y cámbialos por el real (aparece en los enlaces de llamar, WhatsApp y en el formulario).
- [ ] **Email**: busca `citas@arco-dental.example` y ponlo el real de la clínica.
- [ ] **Dirección**: busca `Avenida del Arco, 24` (aparece dos veces: en el texto y en el enlace de Google Maps) y ponla la real.
- [ ] **Horario, servicios y precios**: son de ejemplo, revísalos con el equipo de la clínica.
- [ ] **Fotografías**: las 4 imágenes en `images/` son de banco de imágenes libre de uso comercial (Pexels), pensadas solo para la demo. Sustitúyelas por fotos reales de la consulta con el mismo nombre de archivo (o cambia el `src` en `index.html`) para que el efecto de scroll funcione igual con las imágenes definitivas.
- [ ] **Meta descripción**: en `<head>`, la etiqueta `<meta name="description">` tiene `[ciudad]` entre corchetes — complétala.
- [ ] **Aviso legal y política de privacidad**: al final de la página hay dos ventanas emergentes ("Aviso legal" y "Política de privacidad") con un texto plantilla y datos entre corchetes (NIF, dirección fiscal, número de colegiado del dentista responsable, etc.). **Haz que las revise un asesor legal o el colegio profesional antes de publicar la web** — no son un documento legal certificado, son un punto de partida. Como se trata de un servicio sanitario, el tipo de tratamiento que pide cada paciente puede considerarse un dato de categoría especial (art. 9 RGPD): coméntalo con quien lleve la protección de datos de la clínica.

## Cómo funciona el formulario de cita (y su límite)

Al enviarlo, se abre el programa de correo del visitante con la solicitud ya redactada, y debajo aparece un botón para copiar el mismo mensaje por si prefiere pegarlo en WhatsApp o si su ordenador no tiene un cliente de correo configurado (pasa a menudo en móvil). No hay ningún servidor de por medio: nadie guarda la solicitud en ningún sitio hasta que el propio visitante la envía.

Es una solución que funciona hoy mismo sin cuentas ni configuración, pero tiene un límite real: si el visitante no completa ese paso (no le sale el correo y no copia el mensaje), la clínica nunca se entera de esa solicitud. Si más adelante quieres un formulario que llegue solo, sin depender de que el visitante confirme el envío, las opciones más sencillas son:

- Un servicio de formularios como [Formspree](https://formspree.io) o [Web3Forms](https://web3forms.com): te dan una URL o una clave gratuitas, y solo hay que apuntar el `<form>` a esa URL.
- Un sistema de citas online ya hecho para clínicas (Doctoralia, Cita Previa, etc.), sustituyendo esta sección por su widget.

No lo he conectado yo porque ambas opciones piden crear una cuenta a nombre de la clínica — es mejor que lo haga quien vaya a gestionar las citas.

## Lo que ya funciona de verdad

- Formulario de cita con validación (nombre, teléfono y consentimiento obligatorios).
- Botones de llamar, WhatsApp y "Cómo llegar" (Google Maps) con los datos de ejemplo.
- Menú de navegación en móvil (antes no existía).
- Ventanas de Aviso legal y Política de privacidad enlazadas desde el pie y desde el formulario.
- Cabecera con metadatos para redes sociales y buscadores, y favicon.
- Imágenes como archivos sueltos y optimizados (antes iban incrustadas en el HTML).
