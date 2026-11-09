#!/usr/bin/env python3
"""Sync post <head> metadata and regenerate agent-facing catalogs from blog/posts.json.

Non-JS crawlers (Slack, Twitter, iMessage, etc.) read the static HTML's <meta> tags and
never run resource/blog.js, so the title/description baked into each post's index.html
has to be kept in sync by hand. This also rewrites sitemap.xml, agent.json, and the
auto Blog section in llms.txt from the published slug list. Run after adding a post or
editing front matter (title/date/excerpt/subtitle), before committing:

    python3 scripts/sync_post_meta.py

CI / pre-commit dry-run (exit 1 if committed outputs would change):

    python3 scripts/sync_post_meta.py --check
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE_URL = "https://zhihaowang.me"
AUTHOR = "Zhihao Wang"
LLMS_POSTS_BEGIN = "<!-- agent:posts -->"
LLMS_POSTS_END = "<!-- /agent:posts -->"
LLMS_POSTS_RE = re.compile(
    re.escape(LLMS_POSTS_BEGIN) + r".*?" + re.escape(LLMS_POSTS_END),
    re.S,
)


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


# Blog post / listing previews should not inherit the homepage headshot.
# Strip leftover photo tags so a later sync cannot re-bake them.
PHOTO_META_RE = re.compile(
    r'[ \t]*<meta\s+(?:property|name)="(?:og:image(?::\w+)?|twitter:image(?::\w+)?)"'
    r'\s+content=".*?"\s*/>[ \t]*\n?',
    re.I,
)


def strip_photo_meta(html):
    return PHOTO_META_RE.sub("", html)


def render_post(slug):
    """Return (relpath, new_html) or (relpath, None) if the post files are missing."""
    md_path = ROOT / "blog" / "posts" / f"{slug}.md"
    html_path = ROOT / "blog" / slug / "index.html"
    rel = f"blog/{slug}/index.html"
    if not md_path.exists() or not html_path.exists():
        return rel, None

    meta = parse_front_matter(md_path.read_text())
    title = meta.get("title", slug)
    date = meta.get("date", "")
    excerpt = meta.get("excerpt") or meta.get("subtitle") or ""
    page_title = f"{title} — {AUTHOR}"
    desc = excerpt or page_title
    url = f"{SITE_URL}/blog/{slug}"

    html = strip_photo_meta(html_path.read_text())
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
    return rel, html


def sync_post(slug):
    rel, html = render_post(slug)
    if html is None:
        print(f"skip {slug}: missing blog/posts/{slug}.md or blog/{slug}/index.html")
        return
    (ROOT / rel).write_text(html)
    print(f"synced {slug}")


def load_slugs():
    posts_json = json.loads((ROOT / "blog" / "posts.json").read_text())
    slugs = []
    for entry in posts_json.get("posts", []):
        slug = entry if isinstance(entry, str) else entry.get("slug")
        if slug:
            slugs.append(slug)
    return slugs


def post_lastmod(slug):
    md_path = ROOT / "blog" / "posts" / f"{slug}.md"
    if not md_path.exists():
        return None
    date = parse_front_matter(md_path.read_text()).get("date", "").strip()
    if not date:
        return None
    return date[:10]


def load_post_records(slugs):
    """Return published post dicts (newest first) from front matter."""
    records = []
    for slug in slugs:
        md_path = ROOT / "blog" / "posts" / f"{slug}.md"
        meta = parse_front_matter(md_path.read_text()) if md_path.exists() else {}
        title = meta.get("title", slug)
        date = meta.get("date", "")
        excerpt = meta.get("excerpt") or meta.get("subtitle") or ""
        records.append(
            {
                "slug": slug,
                "title": title,
                "date": date,
                "excerpt": excerpt,
                "url": f"{SITE_URL}/blog/{slug}",
                "markdown": f"{SITE_URL}/blog/posts/{slug}.md",
            }
        )
    return records


def sitemap_url_xml(loc, lastmod=None):
    lines = ["  <url>", f"    <loc>{loc}</loc>"]
    if lastmod:
        lines.append(f"    <lastmod>{lastmod}</lastmod>")
    lines.append("  </url>")
    return "\n".join(lines)


def render_sitemap(slugs):
    lastmods = [post_lastmod(slug) for slug in slugs]
    newest = max((d for d in lastmods if d), default=None)
    blocks = [
        sitemap_url_xml(f"{SITE_URL}/", newest),
        sitemap_url_xml(f"{SITE_URL}/blog/", newest),
    ]
    for slug, lastmod in zip(slugs, lastmods):
        blocks.append(sitemap_url_xml(f"{SITE_URL}/blog/{slug}", lastmod))
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(blocks)
        + "\n</urlset>\n"
    )


def write_sitemap(slugs):
    xml = render_sitemap(slugs)
    path = ROOT / "sitemap.xml"
    path.write_text(xml)
    print(f"wrote {path.relative_to(ROOT)} ({2 + len(slugs)} urls)")


def render_agent_json(slugs):
    posts = load_post_records(slugs)
    payload = {
        "version": "1.0",
        "name": AUTHOR,
        "url": SITE_URL,
        "description": (
            "Personal portfolio of Zhihao Wang — Staff Software Engineer at Temporal "
            "(Infrastructure Foundations). Distributed systems, cloud infrastructure, "
            "developer productivity, and Temporal."
        ),
        "identity": {
            "name": AUTHOR,
            "pronunciation": 'jr-how (preferred over "jee-how")',
            "pronouns": "he/him",
            "role": "Staff Software Engineer, Infrastructure Foundations",
            "organization": "Temporal",
            "location": "Pittsburgh, PA",
            "email": "zhihaowa@alumni.cmu.edu",
            "focus": [
                "distributed systems",
                "cloud infrastructure",
                "developer productivity",
                "Temporal",
            ],
        },
        "links": {
            "home": f"{SITE_URL}/",
            "blog": f"{SITE_URL}/blog",
            "resume": f"{SITE_URL}/resource/zhihao-wang-resume.pdf",
            "linkedin": "https://linkedin.com/in/zhihao-wang",
            "github": "https://github.com/wangzhihao0629",
            "llms_txt": f"{SITE_URL}/llms.txt",
            "llms_full_txt": f"{SITE_URL}/llms-full.txt",
            "agent_json": f"{SITE_URL}/agent.json",
            "posts_json": f"{SITE_URL}/blog/posts.json",
            "sitemap": f"{SITE_URL}/sitemap.xml",
            "robots": f"{SITE_URL}/robots.txt",
            "calendar": f"{SITE_URL}/calendar.html",
        },
        "pages": [
            {
                "id": "home",
                "title": "Home",
                "url": f"{SITE_URL}/",
                "summary": "Bio, talks, experience, education, and links",
            },
            {
                "id": "blog",
                "title": "Blog",
                "url": f"{SITE_URL}/blog",
                "summary": "Writing index; prefer Markdown under /blog/posts/<slug>.md",
            },
            {
                "id": "resume",
                "title": "Resume",
                "url": f"{SITE_URL}/resource/zhihao-wang-resume.pdf",
                "summary": "PDF resume",
            },
            {
                "id": "calendar",
                "title": "Calendar",
                "url": f"{SITE_URL}/calendar.html",
                "summary": "Embedded Google Calendar (may prompt for sign-in)",
            },
        ],
        "posts": posts,
        "talks": [
            {
                "type": "fireside chat",
                "title": (
                    "Choosing a Career Path in the Age of AI: "
                    "Journey from Product to Platform Engineering"
                ),
                "venue": "Carnegie Mellon University — Master of Software Engineering",
                "location": "Pittsburgh, PA",
                "date": "2026-11",
                "slides": (
                    f"{SITE_URL}/resource/slides/"
                    "Choosing-a-Career-Path-in-the-Age-of-AI-Journey-from-Product-to-Platform-Engineering.pdf"
                ),
            },
            {
                "type": "talk",
                "title": (
                    "From Bottlenecks to Self-Service: How Duolingo Built "
                    "Workflow-as-a-Service with Temporal Nexus"
                ),
                "venue": "Temporal Replay",
                "location": "San Francisco, CA",
                "date": "2026-04",
                "url": (
                    "https://temporal.io/resources/on-demand/"
                    "how-duolingo-built-workflow-as-a-service-with-temporal-nexus"
                ),
                "slides": (
                    f"{SITE_URL}/resource/slides/"
                    "From-Bottlenecks-to-Self-Service-How-Duolingo-Built-Workflow-as-a-Service-with-Temporal-Nexus.pdf"
                ),
            },
            {
                "type": "case study",
                "title": "Duolingo simplifies self-service infrastructure with Temporal Nexus",
                "venue": "Temporal",
                "date": "2025-10",
                "url": "https://temporal.io/resources/case-studies/duolingo-temporal-nexus",
            },
            {
                "type": "webinar",
                "title": "Scaling Developer Productivity with Temporal Nexus & Duolingo",
                "venue": "Temporal",
                "date": "2025-02",
                "url": "https://www.youtube.com/watch?v=tJ1OwSFokOg",
            },
        ],
        "experience": [
            {
                "organization": "Temporal Technologies",
                "location": "Pittsburgh, PA",
                "roles": [
                    {
                        "title": "Staff Software Engineer, Infrastructure Foundations",
                        "start": "2026-09",
                        "end": None,
                    }
                ],
            },
            {
                "organization": "Duolingo",
                "location": "Pittsburgh, PA",
                "roles": [
                    {
                        "title": "Staff Software Engineer, Cloud Operations",
                        "start": "2026-04",
                        "end": "2026-09",
                    },
                    {
                        "title": "Senior Software Engineer, Cloud Operations",
                        "start": "2023-02",
                        "end": "2026-03",
                    },
                ],
            },
            {
                "organization": "data.ai",
                "aka": "App Annie",
                "location": "Beijing, China",
                "roles": [
                    {
                        "title": "Senior Backend Software Engineer & Scrum Master",
                        "start": "2018-02",
                        "end": "2021-07",
                    }
                ],
            },
            {
                "organization": "VIPKID",
                "location": "Beijing, China",
                "roles": [
                    {
                        "title": "Software Engineer & Software Engineer Intern",
                        "start": "2016-08",
                        "end": "2018-02",
                    }
                ],
            },
        ],
        "education": [
            {
                "school": "Carnegie Mellon University",
                "unit": "School of Computer Science",
                "degree": "Master of Software Engineering",
                "location": "Pittsburgh, PA",
                "start": "2021-08",
                "end": "2022-12",
            },
            {
                "school": "Peking University",
                "unit": "National School of Development",
                "degree": "B.S. in Economics (double major)",
                "location": "Beijing, China",
                "start": "2014-09",
                "end": "2017-07",
            },
            {
                "school": "China University of Mining and Technology, Beijing",
                "unit": "School of Science",
                "degree": "B.S. in Information and Computing Science",
                "location": "Beijing, China",
                "start": "2013-09",
                "end": "2017-06",
            },
        ],
        "agent_notes": [
            "Prefer Markdown post bodies at /blog/posts/<slug>.md over HTML shells.",
            "llms.txt is the compact routing index; llms-full.txt has the longer biography.",
            "This is a static site; there is no MCP endpoint or agent payment surface yet.",
        ],
    }
    return json.dumps(payload, indent=2, ensure_ascii=False) + "\n"


def write_agent_json(slugs):
    path = ROOT / "agent.json"
    path.write_text(render_agent_json(slugs))
    print(f"wrote {path.relative_to(ROOT)}")


def render_llms_post_block(slugs):
    lines = [LLMS_POSTS_BEGIN]
    for post in load_post_records(slugs):
        detail = post["excerpt"] or "Blog post"
        lines.append(
            f'- [{post["title"]}]({post["markdown"]}): {detail} (HTML: {post["url"]})'
        )
    if len(lines) == 1:
        lines.append("- No published posts yet.")
    lines.append(LLMS_POSTS_END)
    return "\n".join(lines)


def render_llms_txt(slugs):
    path = ROOT / "llms.txt"
    if not path.exists():
        raise FileNotFoundError("llms.txt is missing; create it before syncing")
    current = path.read_text()
    if not LLMS_POSTS_RE.search(current):
        raise ValueError(
            f"llms.txt missing markers {LLMS_POSTS_BEGIN} ... {LLMS_POSTS_END}"
        )
    return LLMS_POSTS_RE.sub(render_llms_post_block(slugs), current, count=1)


def write_llms_txt(slugs):
    path = ROOT / "llms.txt"
    path.write_text(render_llms_txt(slugs))
    print(f"wrote {path.relative_to(ROOT)} (blog section)")


def check_sync(slugs):
    drifted = []
    for slug in slugs:
        rel, html = render_post(slug)
        if html is None:
            print(f"error: {slug}: missing blog/posts/{slug}.md or blog/{slug}/index.html")
            drifted.append(rel)
            continue
        current = (ROOT / rel).read_text()
        if current != html:
            print(f"drift: {rel}")
            drifted.append(rel)

    checks = [
        ("sitemap.xml", render_sitemap(slugs)),
        ("agent.json", render_agent_json(slugs)),
    ]
    try:
        checks.append(("llms.txt", render_llms_txt(slugs)))
    except (FileNotFoundError, ValueError) as err:
        print(f"drift: llms.txt ({err})")
        drifted.append("llms.txt")

    for rel, expected in checks:
        path = ROOT / rel
        if not path.exists() or path.read_text() != expected:
            print(f"drift: {rel}")
            drifted.append(rel)

    if drifted:
        print("run: python3 scripts/sync_post_meta.py")
        return 1
    print("ok: post meta, sitemap, agent.json, and llms.txt are in sync")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument(
        "--check",
        action="store_true",
        help="exit 1 if post heads, sitemap.xml, agent.json, or llms.txt would change",
    )
    args = parser.parse_args()
    slugs = load_slugs()
    if args.check:
        sys.exit(check_sync(slugs))
    for slug in slugs:
        sync_post(slug)
    write_sitemap(slugs)
    write_agent_json(slugs)
    write_llms_txt(slugs)


if __name__ == "__main__":
    main()
