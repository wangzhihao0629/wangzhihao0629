(function () {
  function normalizePathUrl() {
    var path = location.pathname;
    if (path.length > 1 && /\/$/.test(path)) {
      history.replaceState(null, '', path.replace(/\/+$/, '') + location.search + location.hash);
    }
  }

  function initTheme() {
    var btn = document.getElementById('theme-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  function initMobile() {
    var mobileBtn = document.getElementById('mobile-btn');
    var navLinks = document.getElementById('nav-links');
    if (!mobileBtn || !navLinks) return;
    mobileBtn.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { navLinks.classList.remove('open'); });
    });
  }

  function initNavActive() {
    var path = location.pathname.replace(/\/+$/, '') || '/';
    document.querySelectorAll('.nav-links a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      var clean = href.replace(/\/+$/, '') || '/';
      if (clean === '/blog' && path.indexOf('/blog') === 0) {
        a.classList.add('nav-active');
      } else if (clean === path) {
        a.classList.add('nav-active');
      }
    });
  }

  function initYear() {
    var yr = document.getElementById('yr');
    if (yr) yr.textContent = new Date().getFullYear();
  }

  var defaultCmdItems = [
    { label: 'home',                 key: '~', href: '/', group: 'nav' },
    { label: 'about',                key: '#', href: '/#about', group: 'nav' },
    { label: 'talks & publications', key: '#', href: '/#talks', group: 'nav' },
    { label: 'work experience',      key: '#', href: '/#experience', group: 'nav' },
    { label: 'education',            key: '#', href: '/#education', group: 'nav' },
    { label: '/blog',                key: '/', href: '/blog', group: 'nav' },
    { label: 'Job hunting in 2026',  key: '·', href: '/blog/job-hunting-in-2026', group: 'blog' },
    { label: 'resume (pdf)',         key: '↗', href: '/resource/zhihao-wang-resume.pdf', external: true, group: 'link' },
    { label: 'linkedin',             key: '↗', href: 'https://linkedin.com/in/zhihao-wang', external: true, group: 'link' },
    { label: 'github',               key: '↗', href: 'https://github.com/wangzhihao0629', external: true, group: 'link' },
    { label: 'toggle theme',         key: '◐', action: 'theme', group: 'action' }
  ];

  function initCmd() {
    if (!window.SITE_CMD_ITEMS) window.SITE_CMD_ITEMS = defaultCmdItems;
    var cmdItems = window.SITE_CMD_ITEMS;
    var overlay  = document.getElementById('cmd-overlay');
    var cmdInput = document.getElementById('cmd-input');
    var cmdRes   = document.getElementById('cmd-results');
    if (!overlay || !cmdInput || !cmdRes) return;

    var activeIdx = 0;
    var lastFiltered = [];
    var prevOverflow = '';

    if (!overlay.getAttribute('role')) overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    if (!overlay.getAttribute('aria-label')) overlay.setAttribute('aria-label', 'Jump to');
    cmdRes.setAttribute('role', 'listbox');

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function cmdScore(item, filter) {
      var q = (filter || '').toLowerCase().trim();
      if (!q) return 1;
      var label = (item.label || '').toLowerCase();
      var href = (item.href || '').toLowerCase();
      var key = (item.key || '').toLowerCase();
      var action = (item.action || '').toLowerCase();
      if (label === q || action === q) return 100;
      if (label.indexOf(q) === 0 || action.indexOf(q) === 0) return 80;
      var words = label.split(/[\s/&·\-]+/);
      for (var i = 0; i < words.length; i++) {
        if (words[i].indexOf(q) === 0) return 60;
      }
      if (label.indexOf(q) !== -1) return 40;
      if (href.indexOf(q) !== -1) return 25;
      if (key.indexOf(q) !== -1) return 10;
      return 0;
    }

    function cmdMeta(item) {
      if (item.action === 'theme') return 'action';
      if (item.external || /^https?:/.test(item.href || '')) return 'external';
      return item.href || '';
    }

    function filteredItems(filter) {
      var scored = [];
      for (var i = 0; i < cmdItems.length; i++) {
        var score = cmdScore(cmdItems[i], filter);
        if (score > 0) scored.push({ item: cmdItems[i], score: score, idx: i });
      }
      scored.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.idx - b.idx;
      });
      return scored.map(function (s) { return s.item; });
    }

    function setActive(idx) {
      var items = cmdRes.querySelectorAll('.cmd-item');
      if (!items.length) {
        activeIdx = 0;
        return;
      }
      if (idx < 0) idx = items.length - 1;
      if (idx >= items.length) idx = 0;
      items.forEach(function (el) {
        el.classList.remove('active');
        el.setAttribute('aria-selected', 'false');
      });
      activeIdx = idx;
      items[activeIdx].classList.add('active');
      items[activeIdx].setAttribute('aria-selected', 'true');
      if (items[activeIdx].scrollIntoView) {
        items[activeIdx].scrollIntoView({ block: 'nearest' });
      }
    }

    function renderCmdItems(filter) {
      lastFiltered = filteredItems(filter);
      activeIdx = 0;
      cmdRes.innerHTML = '';
      if (!lastFiltered.length) {
        var empty = document.createElement('div');
        empty.className = 'cmd-empty';
        empty.textContent = 'no matches';
        cmdRes.appendChild(empty);
        return lastFiltered;
      }
      lastFiltered.forEach(function (item, idx) {
        var el = document.createElement('div');
        el.className = 'cmd-item' + (idx === 0 ? ' active' : '');
        el.setAttribute('role', 'option');
        el.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
        el.innerHTML =
          '<span class="cmd-key">' + escapeHtml(item.key || '·') + '</span>' +
          '<span class="cmd-label">' + escapeHtml(item.label) + '</span>' +
          '<span class="cmd-meta">' + escapeHtml(cmdMeta(item)) + '</span>';
        el.addEventListener('mouseenter', function () { setActive(idx); });
        el.addEventListener('click', function () { goTo(item); });
        cmdRes.appendChild(el);
      });
      return lastFiltered;
    }

    function samePageHash(href) {
      if (!href) return null;
      if (href.charAt(0) === '#') return href;
      try {
        var url = new URL(href, location.href);
        var here = location.pathname.replace(/\/+$/, '') || '/';
        var there = url.pathname.replace(/\/+$/, '') || '/';
        if (there === here && url.hash) return url.hash;
      } catch (e) { /* ignore */ }
      return null;
    }

    function goTo(item) {
      closeCmd();
      if (item.action === 'theme') {
        var btn = document.getElementById('theme-btn');
        if (btn) btn.click();
        else {
          var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', next);
          localStorage.setItem('theme', next);
        }
        return;
      }
      var hash = samePageHash(item.href);
      if (hash) {
        var target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          if (history.replaceState) history.replaceState(null, '', hash);
          return;
        }
      }
      if (item.external || /^https?:/.test(item.href || '')) {
        window.open(item.href, '_blank', 'noopener');
      } else {
        window.location.href = item.href;
      }
    }

    function lockScroll(on) {
      if (on) {
        prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = prevOverflow;
      }
    }

    function openCmd() {
      overlay.classList.add('open');
      lockScroll(true);
      cmdInput.value = '';
      renderCmdItems('');
      cmdInput.focus();
    }

    function closeCmd() {
      if (!overlay.classList.contains('open')) return;
      overlay.classList.remove('open');
      lockScroll(false);
      cmdInput.blur();
    }

    function typingTarget(el) {
      if (!el || el === document.body) return false;
      var tag = (el.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (el.isContentEditable) return true;
      return false;
    }

    window.openCmd = openCmd;
    window.refreshCmdItems = function () {
      if (overlay.classList.contains('open')) renderCmdItems(cmdInput.value);
    };

    document.addEventListener('keydown', function (e) {
      if (overlay.classList.contains('open')) {
        var items = cmdRes.querySelectorAll('.cmd-item');
        if (e.key === 'Escape') {
          e.preventDefault();
          closeCmd();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (items.length) setActive(activeIdx + 1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (items.length) setActive(activeIdx - 1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (lastFiltered[activeIdx]) goTo(lastFiltered[activeIdx]);
        } else if (e.key === 'Tab') {
          e.preventDefault();
          if (items.length) setActive(e.shiftKey ? activeIdx - 1 : activeIdx + 1);
        }
      } else {
        var openShortcut = (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) ||
          ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey));
        if (openShortcut && !typingTarget(document.activeElement)) {
          e.preventDefault();
          openCmd();
        }
      }
    });

    cmdInput.addEventListener('input', function () { renderCmdItems(cmdInput.value); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeCmd(); });
  }

  function initUptime() {
    var wrap = document.getElementById('uptime-wrap');
    var uptime = document.getElementById('uptime');
    if (!uptime) return;
    if (wrap) {
      wrap.addEventListener('click', function (e) {
        this.classList.toggle('tip-open');
        e.stopPropagation();
      });
      document.addEventListener('click', function () {
        wrap.classList.remove('tip-open');
      });
    }
    var start = new Date(2016, 7, 1);
    var now = new Date();
    var diff = now - start;
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var years = Math.floor(days / 365);
    var rem = Math.floor((days % 365) / 30);
    var remDays = days % 30;
    uptime.textContent = 'uptime: ' + years + 'y ' + rem + 'm ' + remDays + 'd';
  }

  function initVisitorCount() {
    var el = document.getElementById('visitor-count');
    if (!el) return;
    fetch('https://api.counterapi.dev/v2/zhihaowang-me/zhihaowang-me/up')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.data && data.data.up_count !== undefined) {
          el.textContent = 'visits: ' + data.data.up_count.toLocaleString();
        }
      })
      .catch(function () {
        el.style.display = 'none';
      });
  }

  function initProgress() {
    var progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;
    window.addEventListener('scroll', function () {
      var scrolled = document.documentElement.scrollTop;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (total > 0 ? (scrolled / total * 100) : 0) + '%';
    }, { passive: true });
  }

  normalizePathUrl();
  initTheme();
  initMobile();
  initNavActive();
  initYear();
  initCmd();
  initUptime();
  initVisitorCount();
  initProgress();
})();
