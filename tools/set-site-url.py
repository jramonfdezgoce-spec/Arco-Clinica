#!/usr/bin/env python3
"""Cambia la dirección de la web en todos los archivos que la usan.

Uso:  python3 tools/set-site-url.py https://www.tuclinica.es/
"""
import pathlib
import sys

OLD = "https://jramonfdezgoce-spec.github.io/Arco-Clinica/"
FILES = ["index.html", "sitemap.xml", "robots.txt", "404.html"]

if len(sys.argv) != 2 or not sys.argv[1].startswith("https://"):
    sys.exit("Indica la nueva dirección completa, con https:// y barra final. Ejemplo: https://www.tuclinica.es/")

new = sys.argv[1] if sys.argv[1].endswith("/") else sys.argv[1] + "/"
root = pathlib.Path(__file__).resolve().parent.parent
for name in FILES:
    path = root / name
    text = path.read_text(encoding="utf-8")
    count = text.count(OLD)
    path.write_text(text.replace(OLD, new), encoding="utf-8")
    print(f"{name}: {count} cambios")
print("Listo. Si la dirección anterior era otra, edítala en OLD dentro de este script.")
