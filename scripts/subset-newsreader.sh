#!/bin/sh
# Rebuilds src/app/fonts/newsreader/newsreader-var-latin.woff2, the heading face (#539, F-13).
#
# Google's Newsreader latin file (variable weight 200-800 and optical size 6-72, 132 KB) is instanced to the weights the
# site sets (300-650) and cut to the characters it sets, keeping both axes, so a heading is drawn exactly as before from
# a file about 40% smaller. Run it with the OFL source file, then commit the result:
#
#   python3 -m venv /tmp/fonttools && /tmp/fonttools/bin/pip install fonttools brotli
#   curl -o /tmp/newsreader-latin.woff2 https://fonts.gstatic.com/s/newsreader/v26/cY9AfjOCX1hbuyalUrK4397yjIJFJpc.woff2
#   PATH=/tmp/fonttools/bin:$PATH sh scripts/subset-newsreader.sh /tmp/newsreader-latin.woff2
#
# The characters are Basic Latin plus those src/ sets from Newsreader that the Google latin file also had (é ü ä í · × ÷ £ ½ ² ±
# ° – — ‘ ’ “ ” • … − ≤ ≥). A character outside the set falls back to Georgia for that glyph; add it here and rebuild.
set -eu
source_font="${1:?usage: subset-newsreader.sh <newsreader-latin.woff2>}"
out="$(dirname "$0")/../src/app/fonts/newsreader/newsreader-var-latin.woff2"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

fonttools varLib.instancer "$source_font" wght=300:650 -o "$tmp/instance.ttf"
pyftsubset "$tmp/instance.ttf" \
  --unicodes="U+0020-007E,U+00A0,U+00A3,U+00B0,U+00B1,U+00B2,U+00B7,U+00BD,U+00D7,U+00E4,U+00E9,U+00ED,U+00F7,U+00FC,U+2013-2014,U+2018-201D,U+2022,U+2026,U+2212,U+2264-2265" \
  --layout-features="kern,liga,tnum,rvrn" \
  --flavor=woff2 --no-hinting --desubroutinize \
  --output-file="$out"
ls -l "$out"
