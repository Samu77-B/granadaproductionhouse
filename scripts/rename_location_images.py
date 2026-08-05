"""
Rename location page images to clean numbered names and update HTML refs.
"""
from __future__ import annotations

import re
import shutil
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1] / "build" / "location"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

# prefix used in filenames for each location page folder
PAGES = {
    "alpine-and-vistas": "Alpine-and-Vistas",
    "mediterranean-coastlines": "mediterranean-coastlines",
    "moorish-architecture": "Moorish-Architecture",
    "historic-and-traditional": "Historic-and-Traditional",
    "granada-city-center": "Granada-City-Center",
}


def resolve_src(page_dir: Path, src: str) -> Path | None:
    raw = unquote(src.split("?")[0])
    path = (page_dir / raw).resolve()
    if path.is_file():
        return path
    return None


def collect_srcs(html: str) -> list[str]:
    return re.findall(r'<img[^>]+src="([^"]+)"', html)


def rename_page(page_slug: str, prefix: str) -> dict[str, str]:
    page_dir = ROOT / page_slug
    html_path = page_dir / "index.html"
    html = html_path.read_text(encoding="utf-8")
    srcs = collect_srcs(html)

    mapping: dict[str, str] = {}  # old src -> new filename
    seen_files: dict[Path, str] = {}  # resolved path -> new filename
    counter = 0

    for src in srcs:
        src_path = resolve_src(page_dir, src)
        if src_path is None:
            print(f"  MISSING: {src}")
            continue
        if src_path in seen_files:
            mapping[src] = seen_files[src_path]
            continue

        counter += 1
        ext = src_path.suffix.lower()
        if ext == ".jpeg":
            ext = ".jpeg"
        new_name = f"{prefix}-{counter:02d}{ext}"
        dest = page_dir / new_name

        if src_path.resolve() != dest.resolve():
            shutil.copy2(src_path, dest)
            print(f"  {src_path.name.encode('ascii', 'replace').decode()} -> {new_name}")
        else:
            print(f"  keep {new_name}")

        seen_files[src_path] = new_name
        mapping[src] = new_name

    # rewrite HTML src attributes for mapped images
    def replace_src(match: re.Match[str]) -> str:
        prefix, src, suffix = match.group(1), match.group(2), match.group(3)
        if src in mapping:
            return f"{prefix}{mapping[src]}{suffix}"
        return match.group(0)

    new_html = re.sub(r'(<img[^>]+src=")([^"]+)(")', replace_src, html)
    html_path.write_text(new_html, encoding="utf-8")
    print(f"  updated {html_path.relative_to(ROOT.parent.parent)}")
    return mapping


def update_locations_index(hero_by_page: dict[str, str]) -> None:
    index_path = ROOT / "index.html"
    html = index_path.read_text(encoding="utf-8")

    # rename main locations hero
    main_src = "MAIN%20IMAGE%20OUR%20LOCATION%20PAGE%20MAIN%20IMAGE.png"
    main_path = resolve_src(ROOT, main_src)
    if main_path and main_path.is_file():
        new_main = "Locations-01.png"
        dest = ROOT / new_main
        if main_path.resolve() != dest.resolve():
            shutil.copy2(main_path, dest)
            print(f"  locations hero -> {new_main}")
        html = html.replace(f'src="{main_src}"', f'src="{new_main}"')

    # card thumbnails: first image for each page becomes Prefix-01
    replacements = {
        "moorish-architecture/": hero_by_page.get("moorish-architecture"),
        "historic-and-traditional/": hero_by_page.get("historic-and-traditional"),
        "mediterranean-coastlines/": hero_by_page.get("mediterranean-coastlines"),
        "granada-city-center/": hero_by_page.get("granada-city-center"),
        "alpine-and-vistas/": hero_by_page.get("alpine-and-vistas"),
    }

    # Replace card image srcs by matching href context blocks
    for href, hero_name in replacements.items():
        if not hero_name:
            continue
        pattern = rf'(href="{re.escape(href)}"[\s\S]*?<img\s+src=")([^"]+)(")'
        html, n = re.subn(pattern, rf"\1{href}{hero_name}\3", html, count=1)
        if n:
            print(f"  index card {href} -> {hero_name}")

    index_path.write_text(html, encoding="utf-8")
    print("  updated location/index.html")


def main() -> None:
    hero_by_page: dict[str, str] = {}
    for slug, prefix in PAGES.items():
        print(f"\n=== {slug} ({prefix}) ===")
        mapping = rename_page(slug, prefix)
        # hero is first unique image => Prefix-01
        hero = next((v for v in mapping.values() if v.startswith(f"{prefix}-01")), None)
        if hero:
            hero_by_page[slug] = hero

    print("\n=== location index ===")
    update_locations_index(hero_by_page)
    print("\nDone.")


if __name__ == "__main__":
    main()
