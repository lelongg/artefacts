#!/usr/bin/env bash
# Recopie un bundle fraîchement construit dans le dépôt en le nommant
# d'après son empreinte, puis met à jour index.html et sw.js.
set -euo pipefail
dossier="$1"
source_js="$2"
cd "$(dirname "$0")"
rm -f "$dossier"/app-*.js
h=$(md5sum "$source_js" | cut -c1-10)
nom="app-$h.js"
cp "$source_js" "$dossier/$nom"
sed -i -E "s|\./app(-[0-9a-f]+)?\.js|./$nom|g" "$dossier/index.html" "$dossier/sw.js"
sed -i -E "s/(const VERSION = \"[a-z-]+-v)([0-9]+)\";/echo \"\1\$((\2+1))\\\";\"/e" "$dossier/sw.js"
grep -n "const VERSION" "$dossier/sw.js"
echo "$dossier → $nom"
