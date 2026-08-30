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
    { label: 'home',              key: '~', href: '/' },
    { label: 'about',             key: '#', href: '/#about' },
    { label: 'talks & publications', key: '#', href: '/#talks' },
    { label: 'work experience',     key: '#', href: '/#experience' },
    { label: 'education',          key: '#', href: '/#education' },
    { label: '/blog',            key: '/', href: '/blog' },
    { label: 'Job hunting in 2026', key: '·', href: '/blog/job-hunting-in-2026' },
    { label: 'resume (pdf)',      key: '↗', href: '/resource/zhihao-wang-resume.pdf', external: true },
    { label: 'linkedin',          key: '↗', href: 'https://linkedin.com/in/zhihao-wang', external: true },
    { label: 'github',            key: '↗', href: 'https://github.com/wangzhihao0629', external: true }
  ];

  function initCmd() {
    if (!window.SITE_CMD_ITEMS) window.SITE_CMD_ITEMS = defaultCmdItems;
    var cmdItems = window.SITE_CMD_ITEMS;
    var overlay  = document.getElementById('cmd-overlay');
    var cmdInput = document.getElementById('cmd-input');
    var cmdRes   = document.getElementById('cmd-results');
    if (!overlay || !cmdInput || !cmdRes) return;

    var activeIdx = 0;

    function cmdMatches(item, filter) {
      var q = (filter || '').toLowerCase();
      if (!q) return true;
      if (item.label.toLowerCase().indexOf(q) !== -1) return true;
      if ((item.href || '').toLowerCase().indexOf(q) !== -1) return true;
      if ((item.key || '').toLowerCase().indexOf(q) !== -1) return true;
      return false;
    }

    function renderCmdItems(filter) {
      var filtered = cmdItems.filter(function (i) {
        return cmdMatches(i, filter);
      });
      activeIdx = 0;
      cmdRes.innerHTML = '';
      filtered.forEach(function (item, idx) {
        var el = document.createElement('div');
        el.className = 'cmd-item' + (idx === 0 ? ' active' : '');
        el.innerHTML = '<span class="cmd-key">' + item.key + '</span>' + item.label;
        el.addEventListener('mouseenter', function () {
          cmdRes.querySelectorAll('.cmd-item').forEach(function (e) { e.classList.remove('active'); });
          el.classList.add('active');
          activeIdx = idx;
        });
        el.addEventListener('click', function () { goTo(item); });
        cmdRes.appendChild(el);
      });
      return filtered;
    }

    function goTo(item) {
      closeCmd();
      if (item.external || /^https?:/.test(item.href)) {
        window.open(item.href, '_blank');
      } else {
        window.location.href = item.href;
      }
    }

    function openCmd() {
      overlay.classList.add('open');
      cmdInput.value = '';
      renderCmdItems('');
      cmdInput.focus();
    }

    function closeCmd() {
      overlay.classList.remove('open');
      cmdInput.blur();
    }

    window.openCmd = openCmd;
    window.refreshCmdItems = function () {
      if (overlay.classList.contains('open')) renderCmdItems(cmdInput.value);
    };

    document.addEventListener('keydown', function (e) {
      if (overlay.classList.contains('open')) {
        var items = cmdRes.querySelectorAll('.cmd-item');
        if (e.key === 'Escape') { closeCmd(); }
        else if (e.key === 'ArrowDown') {
          e.preventDefault();
          items[activeIdx] && items[activeIdx].classList.remove('active');
          activeIdx = Math.min(activeIdx + 1, items.length - 1);
          items[activeIdx] && items[activeIdx].classList.add('active');
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          items[activeIdx] && items[activeIdx].classList.remove('active');
          activeIdx = Math.max(activeIdx - 1, 0);
          items[activeIdx] && items[activeIdx].classList.add('active');
        } else if (e.key === 'Enter') {
          var filtered = cmdItems.filter(function (i) {
            return cmdMatches(i, cmdInput.value);
          });
          if (filtered[activeIdx]) goTo(filtered[activeIdx]);
        }
      } else {
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
          e.preventDefault();
          openCmd();
        }
      }
    });

    cmdInput.addEventListener('input', function () { renderCmdItems(cmdInput.value); activeIdx = 0; });
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
