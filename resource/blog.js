/* Load blog/posts.json + Markdown, fill listing/post chrome, jump-to, typewriter. */
(function () {
  var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function formatDate(iso, kind) {
    if (!iso) return '';
    var p = String(iso).split('-');
    if (p.length < 2) return iso;
    var month = MONTH_NAMES[parseInt(p[1], 10) - 1] || p[1];
    var year = p[0];
    var day = p[2] ? String(parseInt(p[2], 10)) : '';
    if (kind === 'short') return month + ' ' + year;
    if (day) return month + ' ' + day + ', ' + year;
    return month + ' ' + year;
  }

  function slugFromPath(pathname) {
    var parts = (pathname || location.pathname).replace(/\/+$/, '').split('/').filter(Boolean);
    if (parts[0] !== 'blog' || !parts[1] || parts[1] === 'posts') return '';
    if (parts[1].indexOf('.') !== -1) return '';
    return parts[1];
  }

  function slugsFromCatalog(data) {
    var raw = (data && data.posts) || [];
    return raw.map(function (p) {
      return typeof p === 'string' ? p : p.slug;
    }).filter(Boolean);
  }

  function loadMarkdown(slug) {
    return fetch('/blog/posts/' + encodeURIComponent(slug) + '.md').then(function (res) {
      if (!res.ok) throw new Error('missing markdown');
      return res.text();
    }).then(function (text) {
      var parsed = window.Markdown.parseFrontMatter(text);
      return {
        slug: slug,
        title: parsed.meta.title || slug,
        date: parsed.meta.date || '',
        excerpt: parsed.meta.excerpt || '',
        body: parsed.body,
        html: window.Markdown.toHtml(parsed.body)
      };
    });
  }

  var catalogPromise = null;

  function loadCatalog() {
    if (catalogPromise) return catalogPromise;
    catalogPromise = fetch('/blog/posts.json')
      .then(function (res) {
        if (!res.ok) throw new Error('missing posts.json');
        return res.json();
      })
      .then(function (data) {
        var slugs = slugsFromCatalog(data);
        return Promise.all(slugs.map(function (slug) {
          return loadMarkdown(slug).catch(function () {
            return { slug: slug, title: slug, date: '', excerpt: '', body: '', html: '' };
          });
        }));
      });
    return catalogPromise;
  }

  function setMeta(name, content, attr) {
    if (!content) return;
    attr = attr || 'name';
    var el = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (el) el.setAttribute('content', content);
  }

  function applyPostMeta(post) {
    var url = 'https://zhihaowang.me/blog/' + post.slug + '/';
    var desc = post.excerpt || (post.title + ' — Zhihao Wang');
    document.title = post.title + ' — Zhihao Wang';
    setMeta('description', desc);
    setMeta('og:title', post.title, 'property');
    setMeta('og:description', desc, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:type', 'article', 'property');
    setMeta('article:published_time', post.date, 'property');
    setMeta('twitter:title', post.title + ' — Zhihao Wang');
    setMeta('twitter:description', desc);
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', url);
  }

  function fillPost(post) {
    var titleEl = document.querySelector('.post-title');
    var timeEl = document.querySelector('.post-header time');
    var fileEl = document.getElementById('post-file');
    var bodyEl = document.getElementById('post-body') || document.querySelector('.post-body');
    if (titleEl) titleEl.textContent = post.title;
    if (timeEl) {
      if (post.date) timeEl.setAttribute('datetime', post.date);
      timeEl.textContent = formatDate(post.date, 'long');
    }
    if (fileEl) fileEl.textContent = post.slug + '.md';
    if (bodyEl) {
      bodyEl.innerHTML = post.html;
      bodyEl.classList.remove('is-loading');
    }
    applyPostMeta(post);
  }

  function showPostChrome(ok) {
    var postMain = document.getElementById('post-main') || document.querySelector('main.post');
    var missing = document.getElementById('not-found');
    if (ok) {
      if (postMain) postMain.hidden = false;
      if (missing) missing.hidden = true;
    } else if (missing) {
      if (postMain && postMain !== missing) postMain.hidden = true;
      missing.hidden = false;
      var pathEl = document.getElementById('missing-path');
      if (pathEl) pathEl.textContent = location.pathname;
    }
  }

  function renderListing(posts, root) {
    if (!root) return;
    var home = root.getAttribute('data-variant') === 'home';
    root.innerHTML = posts.map(function (post) {
      var href = '/blog/' + post.slug + '/';
      var date = formatDate(post.date, 'short');
      if (home) {
        return (
          '<div class="blog-item">' +
            '<div>' +
              '<div class="talk-meta"><span class="badge badge-blog">blog</span></div>' +
              '<div class="blog-title"><a href="' + href + '">' +
                window.Markdown.renderInline(post.title) +
              '</a></div>' +
            '</div>' +
            '<div class="blog-date">' + date + '</div>' +
          '</div>'
        );
      }
      return (
        '<article class="blog-item">' +
          '<div>' +
            '<div class="blog-meta-row"><span class="badge badge-blog">blog</span></div>' +
            '<div class="blog-title"><a href="' + href + '">' +
              window.Markdown.renderInline(post.title) +
            '</a></div>' +
          '</div>' +
          '<div class="blog-date">' + date + '</div>' +
        '</article>'
      );
    }).join('');
  }

  function mergePostsIntoCmd(posts) {
    var items = window.SITE_CMD_ITEMS || window.cmdItems;
    if (!items || !items.splice) return;
    var i;
    for (i = items.length - 1; i >= 0; i--) {
      var href = items[i].href || '';
      if (href.indexOf('/blog/') === 0 && href !== '/blog/' && href !== '/blog') {
        items.splice(i, 1);
      }
    }
    var insertAt = items.length;
    for (i = 0; i < items.length; i++) {
      if ((items[i].href || '') === '/blog/') {
        insertAt = i + 1;
        break;
      }
    }
    posts.forEach(function (p, n) {
      items.splice(insertAt + n, 0, {
        label: p.title,
        key: '·',
        href: '/blog/' + p.slug + '/'
      });
    });
    if (typeof window.refreshCmdItems === 'function') window.refreshCmdItems();
  }

  function applyTypewriter(posts) {
    if (!window.cycles) return;
    for (var i = 0; i < window.cycles.length; i++) {
      if (window.cycles[i].cmd === 'ls -1 blog/') {
        window.cycles[i].out = posts.map(function (p) { return p.slug; });
      }
    }
  }

  function loadCurrentPost() {
    var slug = slugFromPath();
    var postMain = document.getElementById('post-main') || document.querySelector('main.post');
    var is404 = !!document.getElementById('not-found');
    if (!slug || !postMain) {
      if (is404) showPostChrome(false);
      return Promise.resolve(null);
    }
    return loadMarkdown(slug).then(function (post) {
      fillPost(post);
      showPostChrome(true);
      return post;
    }).catch(function () {
      var bodyEl = document.getElementById('post-body') || document.querySelector('.post-body');
      if (is404) {
        showPostChrome(false);
      } else if (bodyEl) {
        bodyEl.classList.remove('is-loading');
        bodyEl.innerHTML = '<p>could not load <code>blog/posts/' + slug + '.md</code>.</p>';
      }
      return null;
    });
  }

  function init() {
    if (!window.Markdown) return;
    var listing = document.getElementById('blog-list');
    var wantsPost = !!slugFromPath() &&
      (document.querySelector('main.post') || document.getElementById('post-main'));

    if (wantsPost) loadCurrentPost();

    loadCatalog().then(function (posts) {
      mergePostsIntoCmd(posts);
      applyTypewriter(posts);
      if (listing) renderListing(posts, listing);
    }).catch(function () { /* keep static fallbacks */ });
  }

  window.Blog = {
    slugFromPath: slugFromPath,
    loadCatalog: loadCatalog,
    loadMarkdown: loadMarkdown,
    formatDate: formatDate
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
