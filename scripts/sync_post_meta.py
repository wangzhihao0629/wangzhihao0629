#!/usr/bin/env python3
"""Sync each blog/<slug>/index.html <head> metadata from blog/posts/<slug>.md front matter.

Non-JS crawlers (Slack, Twitter, iMessage, etc.) read the static HTML's <meta> tags and
never run resource/blog.js, so the title/description baked into each post's index.html
has to be kept in sync by hand. Run this after adding a post or editing its front matter
(title/date/excerpt/subtitle), before committing:

    python3 scripts/sync_post_meta.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE_URL = "https://zhihaowang.me"
AUTHOR = "Zhihao Wang"


def parse_front_matter(text):
    m = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n?", text, re.S)
    if not m:
        return {}
    meta = {}
    for line in m.group(1).splitlines():
        if ":" not in line:
            continue
        key, val = line.split(":", 1)
        key, val = key.strip(), val.strip()
        if len(val) >= 2 and val[0] == val[-1] and val[0] in "\"'":
            val = val[1:-1]
        meta[key] = val
    return meta


def escape_attr(s):
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")


def escape_text(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def sync_post(slug):
    md_path = ROOT / "blog" / "posts" / f"{slug}.md"
    html_path = ROOT / "blog" / slug / "index.html"
    if not md_path.exists() or not html_path.exists():
        print(f"skip {slug}: missing blog/posts/{slug}.md or blog/{slug}/index.html")
        return

    meta = parse_front_matter(md_path.read_text())
    title = meta.get("title", slug)
    date = meta.get("date", "")
    excerpt = meta.get("excerpt") or meta.get("subtitle") or ""
    page_title = f"{title} — {AUTHOR}"
    desc = excerpt or page_title
    url = f"{SITE_URL}/blog/{slug}"

    html = html_path.read_text()
    replacements = [
        (r'<meta name="description" content=".*?" />',
         f'<meta name="description" content="{escape_attr(desc)}" />'),
        (r"<title>.*?</title>",
         f"<title>{escape_text(page_title)}</title>"),
        (r'<meta property="og:title" content=".*?" />',
         f'<meta property="og:title" content="{escape_attr(title)}" />'),
        (r'<meta property="og:description" content=".*?" />',
         f'<meta property="og:description" content="{escape_attr(desc)}" />'),
        (r'<meta property="og:url" content=".*?" />',
         f'<meta property="og:url" content="{url}" />'),
        (r'<meta property="article:published_time" content=".*?" />',
         f'<meta property="article:published_time" content="{date}" />'),
        (r'<meta name="twitter:title" content=".*?" />',
         f'<meta name="twitter:title" content="{escape_attr(page_title)}" />'),
        (r'<meta name="twitter:description" content=".*?" />',
         f'<meta name="twitter:description" content="{escape_attr(desc)}" />'),
        (r'<link rel="canonical" href=".*?" />',
         f'<link rel="canonical" href="{url}" />'),
    ]
    for pattern, replacement in replacements:
        html, count = re.subn(pattern, replacement, html, count=1)
        if count == 0:
            print(f"warning: {slug}: pattern not found: {pattern}")

    html_path.write_text(html)
    print(f"synced {slug}")


def main():
    posts_json = json.loads((ROOT / "blog" / "posts.json").read_text())
    for entry in posts_json.get("posts", []):
        slug = entry if isinstance(entry, str) else entry.get("slug")
        if slug:
            sync_post(slug)


if __name__ == "__main__":
    main()
