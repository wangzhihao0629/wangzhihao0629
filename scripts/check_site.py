#!/usr/bin/env python3
"""Catalog and sitemap/robots checks for the static site.

    python3 scripts/check_site.py --catalog
    python3 scripts/check_site.py --sitemap
    python3 scripts/check_site.py          # both
"""
import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import sync_post_meta as meta

RESERVED_BLOG_DIRS = {"posts", "_template"}
SITE_URL = meta.SITE_URL
ROOT = meta.ROOT


def check_catalog():
    errors = []
    slugs = meta.load_slugs()
    slug_set = set(slugs)

    for slug in slugs:
        md_path = ROOT / "blog" / "posts" / f"{slug}.md"
        html_path = ROOT / "blog" / slug / "index.html"
        if not md_path.exists():
            errors.append(f"listed in blog/posts.json but missing blog/posts/{slug}.md")
        if not html_path.exists():
            errors.append(f"listed in blog/posts.json but missing blog/{slug}/index.html")

    posts_dir = ROOT / "blog" / "posts"
    if posts_dir.is_dir():
        for md_path in sorted(posts_dir.glob("*.md")):
            slug = md_path.stem
            if slug not in slug_set:
                errors.append(f"orphan markdown not in blog/posts.json: blog/posts/{slug}.md")

    blog_dir = ROOT / "blog"
    if blog_dir.is_dir():
        for child in sorted(blog_dir.iterdir()):
            if not child.is_dir() or child.name in RESERVED_BLOG_DIRS:
                continue
            if child.name not in slug_set:
                errors.append(f"orphan post dir not in blog/posts.json: blog/{child.name}/")

    if errors:
        print("catalog check failed:")
        for err in errors:
            print(f"  {err}")
        return 1
    print(f"ok: catalog ({len(slugs)} published slug(s))")
    return 0


def sitemap_locs(text):
    return {loc.strip() for loc in re.findall(r"<loc>(.*?)</loc>", text)}


def check_sitemap():
    errors = []
    robots = ROOT / "robots.txt"
    sitemap = ROOT / "sitemap.xml"
    if not robots.is_file():
        errors.append("missing robots.txt at repo root")
    if not sitemap.is_file():
        errors.append("missing sitemap.xml at repo root")
        print("sitemap/robots check failed:")
        for err in errors:
            print(f"  {err}")
        return 1

    slugs = meta.load_slugs()
    required = {f"{SITE_URL}/", f"{SITE_URL}/blog/"}
    required.update(f"{SITE_URL}/blog/{slug}" for slug in slugs)
    missing = sorted(required - sitemap_locs(sitemap.read_text()))
    if missing:
        errors.append("sitemap.xml missing required loc(s):")
        errors.extend(f"    {url}" for url in missing)

    if errors:
        print("sitemap/robots check failed:")
        for err in errors:
            print(f"  {err}")
        return 1
    print(f"ok: robots.txt and sitemap.xml ({len(required)} required url(s))")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--catalog", action="store_true", help="check posts.json vs markdown/html")
    parser.add_argument("--sitemap", action="store_true", help="check robots.txt and sitemap coverage")
    args = parser.parse_args()
    run_all = not args.catalog and not args.sitemap
    status = 0
    if args.catalog or run_all:
        status |= check_catalog()
    if args.sitemap or run_all:
        status |= check_sitemap()
    sys.exit(status)


if __name__ == "__main__":
    main()
