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
        excerpt: parsed.meta.excerpt || parsed.meta.subtitle || '',
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
    var url = 'https://zhihaowang.me/blog/' + post.slug;
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
    var subtitleEl = document.querySelector('.post-subtitle');
    var timeEl = document.querySelector('.post-header time');
    var fileEl = document.getElementById('post-file');
    var bodyEl = document.getElementById('post-body') || document.querySelector('.post-body');
    if (titleEl) titleEl.textContent = post.title;
    if (subtitleEl) {
      if (post.excerpt) {
        subtitleEl.innerHTML = window.Markdown.renderInline(post.excerpt);
        subtitleEl.hidden = false;
      } else {
        subtitleEl.innerHTML = '';
        subtitleEl.hidden = true;
      }
    }
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

  function listingSubtitleHtml(text) {
    if (!text) return '';
    return '<p class="blog-excerpt">' + window.Markdown.renderInline(text) + '</p>';
  }

  function renderListing(posts, root) {
    if (!root) return;
    var home = root.getAttribute('data-variant') === 'home';
    root.innerHTML = posts.map(function (post) {
      var href = '/blog/' + post.slug;
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
          '<div class="blog-item-main">' +
            '<div class="blog-date">' + date + '</div>' +
            '<div class="blog-title"><a href="' + href + '">' +
              window.Markdown.renderInline(post.title) +
            '</a></div>' +
            listingSubtitleHtml(post.excerpt) +
          '</div>' +
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
      if (/^\/blog\/[^/]+\/?$/.test(href)) {
        items.splice(i, 1);
      }
    }
    var insertAt = items.length;
    for (i = 0; i < items.length; i++) {
      if ((items[i].href || '').replace(/\/+$/, '') === '/blog') {
        insertAt = i + 1;
        break;
      }
    }
    posts.forEach(function (p, n) {
      items.splice(insertAt + n, 0, {
        label: p.title,
        key: '·',
        href: '/blog/' + p.slug
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

  /* Native scroll restoration runs before async markdown fills #post-body. */
  var SCROLL_KEY_PREFIX = 'post-scroll:';
  var scrollSaveOk = false;
  var userTouchedScroll = false;

  function postScrollKey() {
    return SCROLL_KEY_PREFIX + (location.pathname || '').replace(/\/+$/, '');
  }

  function savePostScroll() {
    if (!scrollSaveOk) return;
    try {
      sessionStorage.setItem(postScrollKey(), String(window.scrollY || 0));
    } catch (e) { /* private mode / quota */ }
  }

  function readSavedPostScroll() {
    try {
      var raw = sessionStorage.getItem(postScrollKey());
      if (raw == null || raw === '') return null;
      var y = parseInt(raw, 10);
      return isNaN(y) ? null : y;
    } catch (e) {
      return null;
    }
  }

  function scrollToY(y) {
    try {
      window.scrollTo({ top: y, left: 0, behavior: 'instant' });
    } catch (e) {
      window.scrollTo(0, y);
    }
  }

  function applyPostScroll() {
    if (location.hash && location.hash.length > 1) {
      var id = location.hash.slice(1);
      try { id = decodeURIComponent(id); } catch (e) {}
      var el = id ? document.getElementById(id) : null;
      if (el) {
        try {
          el.scrollIntoView({ block: 'start', behavior: 'instant' });
        } catch (e) {
          if (el.scrollIntoView) el.scrollIntoView(true);
        }
        return;
      }
    }
    var y = readSavedPostScroll();
    if (y == null) return;
    scrollToY(y);
  }

  function afterImages(root, done) {
    var imgs = root ? root.querySelectorAll('img') : [];
    var pending = 0;
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      done();
    }
    function one() {
      pending--;
      if (pending <= 0) finish();
    }
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i].complete) continue;
      pending++;
      imgs[i].addEventListener('load', one);
      imgs[i].addEventListener('error', one);
    }
    if (pending === 0) {
      finish();
      return;
    }
    setTimeout(finish, 2500);
  }

  function restorePostScroll(bodyEl) {
    if (!userTouchedScroll) applyPostScroll();
    scrollSaveOk = true;
    afterImages(bodyEl, function () {
      if (!userTouchedScroll) applyPostScroll();
    });
  }

  function initPostScroll() {
    try {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    } catch (e) {}

    function touched() { userTouchedScroll = true; }
    window.addEventListener('wheel', touched, { passive: true });
    window.addEventListener('touchstart', touched, { passive: true });
    window.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'PageDown' || e.key === 'PageUp' ||
          e.key === 'Home' || e.key === 'End' ||
          e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        touched();
      }
    });

    window.addEventListener('pagehide', savePostScroll);
    window.addEventListener('beforeunload', savePostScroll);
    var saveTimer = null;
    window.addEventListener('scroll', function () {
      if (saveTimer) return;
      saveTimer = setTimeout(function () {
        saveTimer = null;
        savePostScroll();
      }, 100);
    }, { passive: true });
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
      restorePostScroll(document.getElementById('post-body') || document.querySelector('.post-body'));
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

    if (wantsPost) {
      initPostScroll();
      loadCurrentPost();
    }

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
