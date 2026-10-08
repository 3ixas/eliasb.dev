"""Build the self-hosted Newsreader files in src/app/fonts/newsreader.

Newsreader ships as two fixed optical sizes (a display cut at opsz 72 and a
text cut at opsz 20), each face split in two with unicode-range, as Google
Fonts does: a core file (Basic Latin and the punctuation the copy uses) that
every page needs and that is preloaded, and an accents file (the rest of the
Latin subset) that a browser fetches only for a page containing those
characters, such as a book title or a Wikipedia story with an accented name.

Run it only to change the faces or the ranges, then commit the output:

    python3 -m venv .venv && .venv/bin/pip install fonttools==4.66.1 brotli==1.2.0
    .venv/bin/python scripts/fonts/newsreader.py

It downloads each face from the Google Fonts CSS API (Latin subset, the same
files the site used before), so a rebuild picks up whatever Google serves that
day; the committed files are the source of truth. It also writes the two
unicode-range literals into src/app/layout.tsx, which next/font needs written
out. Splitting a face means the browser can't kern a core letter against an
accented one, as with Google's own split, and combining marks only position
correctly on precomposed (NFC) text.
The social image reads TrueType copies of two display faces; after a rebuild,
run scripts/fonts/og-faces.py to refresh them.
Newsreader is under the SIL Open Font License (src/app/fonts/newsreader/OFL.txt).
"""

import io
import re
import urllib.request
from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "src/app/fonts/newsreader"
LAYOUT = ROOT / "src/app/layout.tsx"
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"

# name: (italic, optical size, weight)
FACES = {
    "display-400": (0, 72, 400),
    "display-400-italic": (1, 72, 400),
    "display-500": (0, 72, 500),
    "display-600": (0, 72, 600),
    "text-400": (0, 20, 400),
    "text-400-italic": (1, 20, 400),
    "text-500": (0, 20, 500),
    "text-600": (0, 20, 600),
}

# Basic Latin, no-break space, middle dot, ordinal º, ×, General Punctuation
# (curly quotes, dashes, ellipsis), €, ™ and the minus sign.
CORE = [(0x20, 0x7E), (0xA0, 0xA0), (0xB7, 0xB7), (0xBA, 0xBA), (0xD7, 0xD7), (0x2000, 0x206F), (0x20AC, 0x20AC), (0x2122, 0x2122), (0x2212, 0x2212)]

LAYOUT_FEATURES = ["kern", "liga", "mark", "mkmk", "pnum", "tnum"]


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request) as response:
        return response.read()


def latin_face(italic: int, opsz: int, weight: int) -> bytes:
    css = fetch(f"https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@{italic},{opsz},{weight}&display=swap").decode()
    block = css[css.index("/* latin */"):]
    return fetch(re.search(r"url\((https://[^)]+)\)", block).group(1))


def in_core(code: int) -> bool:
    return any(start <= code <= end for start, end in CORE)


def as_range(codes: list[int]) -> str:
    runs, start = [], None
    for index, code in enumerate(codes):
        start = code if start is None else start
        if index + 1 == len(codes) or codes[index + 1] != code + 1:
            runs.append(f"U+{start:04X}" + (f"-{code:04X}" if code != start else ""))
            start = None
    return ", ".join(runs)


def subset(font_bytes: bytes, codes: list[int], path: Path) -> None:
    options = Options()
    options.flavor = "woff2"
    options.layout_features = LAYOUT_FEATURES
    # Keep the source's timestamp, so a rebuild with the same input is byte-identical.
    font = TTFont(io.BytesIO(font_bytes), recalcTimestamp=False)
    subsetter = Subsetter(options)
    subsetter.populate(unicodes=codes)
    subsetter.subset(font)
    font.flavor = "woff2"
    font.save(path)


def write_ranges(core: str, accents: str) -> None:
    """Puts the ranges into layout.tsx: core files first, accents files second."""
    layout = LAYOUT.read_text()
    pattern = re.compile(r'(\{ prop: "unicode-range", value: ")[^"]*(" \})')
    calls = pattern.findall(layout)
    if len(calls) != 4:
        raise SystemExit(f"Expected 4 unicode-range declarations in {LAYOUT}, found {len(calls)}")
    values = iter([core, accents, core, accents])
    LAYOUT.write_text(pattern.sub(lambda match: f"{match.group(1)}{next(values)}{match.group(2)}", layout))


def main() -> None:
    ranges: dict[str, str] = {}
    for name, (italic, opsz, weight) in FACES.items():
        source = latin_face(italic, opsz, weight)
        codes = sorted(TTFont(io.BytesIO(source)).getBestCmap())
        core = [code for code in codes if in_core(code)]
        accents = [code for code in codes if not in_core(code)]
        subset(source, core, OUT / f"{name}.woff2")
        subset(source, accents, OUT / f"{name}-accents.woff2")
        face_ranges = {"core": as_range(core), "accents": as_range(accents)}
        # One unicode-range per family in layout.tsx, so every face must agree.
        if ranges and ranges != face_ranges:
            raise SystemExit(f"{name} covers different characters from the other faces")
        ranges = face_ranges
        print(f"{name}: {len(core)} core, {len(accents)} accent characters")

    write_ranges(ranges["core"], ranges["accents"])
    print("core unicode-range:", ranges["core"])
    print("accents unicode-range:", ranges["accents"])


if __name__ == "__main__":
    main()
