"""Write the two Newsreader faces the social image uses as TrueType.

next/og (Satori) reads ttf, otf and woff, not woff2, so the card's display
cuts (regular and italic, the core files the pages already ship) are unpacked
to src/app/fonts/newsreader/og-*.ttf. Run it after rebuilding the faces with
newsreader.py, then commit the output:

    .venv/bin/python scripts/fonts/og-faces.py
"""

from pathlib import Path

from fontTools.ttLib import TTFont

FONTS = Path(__file__).resolve().parents[2] / "src/app/fonts/newsreader"

for name in ("display-400", "display-400-italic"):
    font = TTFont(FONTS / f"{name}.woff2")
    font.flavor = None
    out = FONTS / f"og-{name}.ttf"
    font.save(out)
    print(f"{out.name}: {out.stat().st_size} bytes")
