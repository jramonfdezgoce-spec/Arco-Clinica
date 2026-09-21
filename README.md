# Arco: web para clínica dental

Web de una sola página, sin servidor y sin dependencias externas. Las fotos se abren desde un arco hasta ocupar toda la pantalla al hacer scroll, y el efecto es el mismo en móvil, tablet y ordenador. Incluye formulario de cita, botones de llamada, WhatsApp y mapa, textos legales de plantilla, y todo lo necesario para que Google la encuentre.

Ahora mismo está publicada en GitHub Pages: https://jramonfdezgoce-spec.github.io/Arco-Clinica/

## Estructura

```
index.html                 la página
assets/css/styles.css      estilos
assets/js/app.js           menú, formulario y animaciones (aquí están el correo y el WhatsApp)
assets/js/vendor/          GSAP y ScrollTrigger, alojados aquí (no se llama a ningún tercero)
assets/fonts/              tipografías alojadas aquí
images/                    fotos (hero, showcase, historia, visitanos, og-image)
icons/                     favicon, icono de la pantalla de inicio y logotipo
manifest.webmanifest       instalación como app en el móvil
sitemap.xml, robots.txt    para buscadores
404.html                   página de error
_headers                   cabeceras de seguridad (solo Netlify y Cloudflare Pages)
tools/set-site-url.py      cambia la dirección web en todos los archivos
```

## Antes de entregarla a una clínica

Sustituye los datos de ejemplo. Busca cada texto en el proyecto:

- [ ] Teléfono: `600000000` y `600 000 000` (`index.html`).
- [ ] Correo de citas y WhatsApp: `CLINIC_EMAIL` y `CLINIC_WHATSAPP` al principio de `assets/js/app.js`.
- [ ] Dirección: `Avenida del Arco, 24, 1º B` y la búsqueda de Google Maps (`index.html`).
- [ ] Ciudad y código postal: `[Ciudad]`, `[Código postal]` y `[ciudad]` en el bloque de datos estructurados y en la meta descripción.
- [ ] Nombre de la clínica: «Arco» en textos, títulos, `manifest.webmanifest` y logotipo (`icons/favicon.svg`).
- [ ] Horarios, tratamientos y precios: son de ejemplo.
- [ ] Opiniones: son inventadas. Pon opiniones reales con permiso del paciente o quítalas.
- [ ] Fotografías de `images/`: son de banco libre (Pexels). Cámbialas por fotos reales conservando los nombres, con el mismo formato vertical en `hero.jpg` y `showcase.jpg`. Genera también las versiones `-900.jpg` y `og-image.jpg` (1200×630).
- [ ] Aviso legal y política de privacidad (al final de `index.html`): son plantillas con datos entre corchetes. Que las revise un asesor legal antes de publicar. Al ser un servicio sanitario, el tratamiento que pide cada paciente puede ser un dato de categoría especial (art. 9 del RGPD).

## Cambiar la dirección web (dominio propio)

Con dominio propio, ejecuta una sola vez:

```bash
python3 tools/set-site-url.py https://www.tuclinica.es/
```

Actualiza la dirección canónica, las etiquetas para redes sociales, los datos estructurados, el mapa del sitio y `robots.txt`.

## Publicarla

- **GitHub Pages** (gratis): Settings, Pages, rama `main`, carpeta `/ (root)`. Es la opción que ya está activa.
- **Netlify o Cloudflare Pages** (gratis): arrastra la carpeta entera. Aplican las cabeceras de `_headers` (seguridad y caché).
- **Hosting de siempre**: sube todo por FTP a la raíz del dominio.

Los subdominios de `github.io` funcionan, pero para una clínica real conviene dominio propio (por ejemplo `tuclinica.es`): da confianza, y GitHub Pages, Netlify y Cloudflare permiten añadirlo gratis con HTTPS.

## Salir en Google

Publicar la web no basta: hay que decirle a Google que existe. Es gratis y lleva unos 15 minutos.

1. **Google Search Console** ([search.google.com/search-console](https://search.google.com/search-console)): añade la web como «Prefijo de URL» con la dirección final, y verifícala con la etiqueta HTML. Pega esa etiqueta `<meta name="google-site-verification" ...>` en el `<head>` de `index.html`, donde está el comentario.
2. En **Sitemaps**, envía `sitemap.xml`.
3. En **Inspección de URLs**, pega la dirección de la portada y pulsa «Solicitar indexación».
4. **Perfil de Empresa de Google** ([business.google.com](https://business.google.com)): es lo que hace que la clínica aparezca en Google Maps y en el recuadro de «dentista cerca de mí». Da de alta la clínica con la misma dirección, teléfono y horario que la web, y pon la dirección de la web en el perfil. Para una clínica local, es más importante que la propia web.
5. Comprueba la web con [PageSpeed Insights](https://pagespeed.web.dev), la [Prueba de resultados enriquecidos](https://search.google.com/test/rich-results) (debe reconocer «Dentist») y el informe de usabilidad móvil de Search Console.

Google tarda entre unos días y unas semanas en mostrar una web nueva. Con el Perfil de Empresa y una web rápida y clara, una clínica pequeña puede salir en su barrio bastante antes.

## Cómo funciona el formulario

Al pulsar «Enviar por correo» se abre el correo del visitante con la solicitud escrita, y debajo aparece un botón para copiar el mensaje por si prefiere pegarlo en WhatsApp o no tiene correo configurado. No hay servidor: la clínica solo recibe la solicitud si el visitante termina de enviar ese correo.

Para que las solicitudes lleguen solas, conecta el `<form>` a un servicio de formularios (Formspree, Web3Forms) o sustituye la sección por el widget de un sistema de citas (Doctoralia, etc.). Ambas opciones requieren una cuenta a nombre de la clínica.

## Privacidad y cookies

La web no usa cookies, no tiene analíticas y no carga nada de terceros: las tipografías y GSAP se sirven desde el mismo dominio. Por eso no necesita banner de cookies. Si se añaden Google Analytics, un widget de citas o cualquier otro servicio externo, habrá que añadir el banner y actualizar la política de privacidad.

La etiqueta `Content-Security-Policy` del `<head>` bloquea cualquier script o recurso externo. Si se añade un servicio externo, hay que permitirlo ahí.

## Móvil y accesibilidad

- El efecto de scroll se adapta al tamaño: en móvil el texto va arriba y el arco abajo, y en ordenador van lado a lado. Con «reducir movimiento» activado en el sistema, la página no anima nada y muestra las fotos ya recortadas en arco.
- Diseñada para pantallas desde 320 px, con márgenes de seguridad para el notch, altura de pantalla correcta en móviles (`svh`/`dvh`), campos que no hacen zoom en iOS y zonas táctiles de al menos 44 px.
- Contraste de texto por encima de 4,5:1, foco visible, enlace para saltar al contenido, etiquetas visibles en todos los campos y errores del formulario junto a cada campo.
- Las animaciones de botones, menú y ventanas duran menos de 300 ms y responden al pulsar; los efectos al pasar el ratón solo se activan en dispositivos que tienen ratón.

## Créditos

Fotografías de muestra de [Pexels](https://www.pexels.com) (licencia libre de uso comercial). Tipografías Young Serif y Atkinson Hyperlegible Next (SIL Open Font License). Animación con [GSAP](https://gsap.com) y ScrollTrigger.
