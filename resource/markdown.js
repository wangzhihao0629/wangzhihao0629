/* Tiny Markdown → HTML for blog posts. No dependencies.
   Front matter: --- title / date / excerpt ---
   Blocks: headings, paragraphs, lists, quotes, fences, tables, hr,
           raw HTML, :::callout fences.
   Inline: `code`, [links](url), ![images](url), **bold**, *italic*. */
(function (global) {
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, '&quot;');
  }

  function safeUrl(url) {
    var u = String(url).trim();
    if (/^(javascript|data|vbscript):/i.test(u)) return '#';
    return u;
  }

  function parseFrontMatter(src) {
    var text = String(src).replace(/^\uFEFF/, '');
    var m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!m) return { meta: {}, body: text };
    var meta = {};
    m[1].split(/\r?\n/).forEach(function (line) {
      var idx = line.indexOf(':');
      if (idx === -1) return;
      var key = line.slice(0, idx).trim();
      var val = line.slice(idx + 1).trim();
      if (!key) return;
      if (
        (val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') ||
        (val.charAt(0) === "'" && val.charAt(val.length - 1) === "'")
      ) {
        val = val.slice(1, -1);
      }
      meta[key] = val;
    });
    return { meta: meta, body: text.slice(m[0].length) };
  }

  function renderInline(text) {
    if (!text) return '';
    var html = '';
    var i = 0;
    var s = String(text);
    var len = s.length;

    function starts(str, pos) {
      return s.substr(pos, str.length) === str;
    }

    while (i < len) {
      if (s.charAt(i) === '\\' && i + 1 < len) {
        html += escapeHtml(s.charAt(i + 1));
        i += 2;
        continue;
      }

      if (s.charAt(i) === '`') {
        var codeEnd = s.indexOf('`', i + 1);
        if (codeEnd !== -1) {
          html += '<code>' + escapeHtml(s.slice(i + 1, codeEnd)) + '</code>';
          i = codeEnd + 1;
          continue;
        }
      }

      if (s.charAt(i) === '!' && s.charAt(i + 1) === '[') {
        var altClose = s.indexOf('](', i + 2);
        if (altClose !== -1) {
          var imgUrlEnd = s.indexOf(')', altClose + 2);
          if (imgUrlEnd !== -1) {
            html +=
              '<img src="' +
              escapeAttr(safeUrl(s.slice(altClose + 2, imgUrlEnd))) +
              '" alt="' +
              escapeAttr(s.slice(i + 2, altClose)) +
              '">';
            i = imgUrlEnd + 1;
            continue;
          }
        }
      }

      if (s.charAt(i) === '[') {
        var labelClose = s.indexOf('](', i + 1);
        if (labelClose !== -1) {
          var urlEnd = s.indexOf(')', labelClose + 2);
          if (urlEnd !== -1) {
            html +=
              '<a href="' +
              escapeAttr(safeUrl(s.slice(labelClose + 2, urlEnd))) +
              '">' +
              renderInline(s.slice(i + 1, labelClose)) +
              '</a>';
            i = urlEnd + 1;
            continue;
          }
        }
      }

      if (starts('**', i)) {
        var boldEnd = s.indexOf('**', i + 2);
        if (boldEnd !== -1) {
          html += '<strong>' + renderInline(s.slice(i + 2, boldEnd)) + '</strong>';
          i = boldEnd + 2;
          continue;
        }
      }

      if (s.charAt(i) === '*') {
        var emEnd = s.indexOf('*', i + 1);
        if (emEnd !== -1) {
          html += '<em>' + renderInline(s.slice(i + 1, emEnd)) + '</em>';
          i = emEnd + 1;
          continue;
        }
      }

      html += escapeHtml(s.charAt(i));
      i++;
    }
    return html;
  }

  function isBlank(line) {
    return line == null || /^\s*$/.test(line);
  }

  function isHr(line) {
    return /^(\*\s*){3,}$/.test(line.trim()) ||
      /^(-\s*){3,}$/.test(line.trim()) ||
      /^(_\s*){3,}$/.test(line.trim());
  }

  function isFence(line) {
    return /^```/.test(line);
  }

  function isCalloutOpen(line) {
    return /^::: *callout\s*$/i.test(line);
  }

  function isHeading(line) {
    return /^#{1,6}\s+\S/.test(line);
  }

  function isUl(line) {
    return /^\s*[-*+]\s+\S/.test(line);
  }

  function isOl(line) {
    return /^\s*\d+[.)]\s+\S/.test(line);
  }

  function isQuote(line) {
    return /^>\s?/.test(line);
  }

  function isTableSep(line) {
    return /^\s*\|?(\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/.test(line);
  }

  function looksLikeTableRow(line) {
    return line.indexOf('|') !== -1;
  }

  function isHtmlBlock(line) {
    return /^<\/?(div|aside|section|blockquote|table|pre|hr|p|h[1-6]|ul|ol|details|figure|article)\b/i.test(line) ||
      /^<!--/.test(line);
  }

  function isBlockStart(line) {
    return isBlank(line) ||
      isHr(line) ||
      isFence(line) ||
      isCalloutOpen(line) ||
      isHeading(line) ||
      isUl(line) ||
      isOl(line) ||
      isQuote(line) ||
      isHtmlBlock(line) ||
      /^:::\s*$/.test(line);
  }

  function splitTableRow(line) {
    var s = line.trim();
    if (s.charAt(0) === '|') s = s.slice(1);
    if (s.charAt(s.length - 1) === '|') s = s.slice(0, -1);
    return s.split('|').map(function (c) { return c.trim(); });
  }

  function toHtml(md) {
    var lines = String(md).replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    var html = [];
    var i = 0;

    function parseList(ordered) {
      var re = ordered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*+]\s+(.*)$/;
      var items = [];
      while (i < lines.length) {
        var m = lines[i].match(re);
        if (!m) {
          if (isBlank(lines[i]) && i + 1 < lines.length && re.test(lines[i + 1])) {
            i++;
            continue;
          }
          break;
        }
        var item = m[1];
        i++;
        while (
          i < lines.length &&
          /^\s{2,}\S/.test(lines[i]) &&
          !re.test(lines[i]) &&
          !isHeading(lines[i]) &&
          !isFence(lines[i])
        ) {
          item += ' ' + lines[i].trim();
          i++;
        }
        items.push('<li>' + renderInline(item) + '</li>');
      }
      var tag = ordered ? 'ol' : 'ul';
      return '<' + tag + '>\n' + items.join('\n') + '\n</' + tag + '>';
    }

    function parseTable() {
      var header = splitTableRow(lines[i]);
      i += 2;
      var rows = [];
      while (i < lines.length && looksLikeTableRow(lines[i]) && !isBlank(lines[i])) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      var out = ['<table>', '<thead>', '<tr>'];
      header.forEach(function (c) {
        out.push('<th>' + renderInline(c) + '</th>');
      });
      out.push('</tr>', '</thead>', '<tbody>');
      rows.forEach(function (row) {
        out.push('<tr>');
        header.forEach(function (_, idx) {
          out.push('<td>' + renderInline(row[idx] || '') + '</td>');
        });
        out.push('</tr>');
      });
      out.push('</tbody>', '</table>');
      return out.join('');
    }

    while (i < lines.length) {
      var line = lines[i];
      if (isBlank(line)) {
        i++;
        continue;
      }

      if (isCalloutOpen(line)) {
        i++;
        var callout = [];
        while (i < lines.length && !/^:::\s*$/.test(lines[i])) {
          callout.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++;
        var inner = toHtml(callout.join('\n')).trim();
        if (/^<p>[\s\S]*<\/p>$/.test(inner) && inner.indexOf('<p>') === inner.lastIndexOf('<p>')) {
          inner = inner.slice(3, -4);
        }
        html.push('<div class="callout">' + inner + '</div>');
        continue;
      }

      if (isFence(line)) {
        i++;
        var code = [];
        while (i < lines.length && !/^```/.test(lines[i])) {
          code.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++;
        html.push('<pre><code>' + escapeHtml(code.join('\n')) + '</code></pre>');
        continue;
      }

      if (isHtmlBlock(line)) {
        var open = line.match(/^<([a-zA-Z][\w:-]*)\b/);
        var tag = open ? open[1].toLowerCase() : '';
        var buf = [line];
        i++;
        if (tag && tag !== 'hr' && !/\/\s*>$/.test(line) && !/^<!--/.test(line)) {
          var closer = new RegExp('^</' + tag + '>\\s*$', 'i');
          while (i < lines.length && !closer.test(lines[i])) {
            buf.push(lines[i]);
            i++;
          }
          if (i < lines.length) {
            buf.push(lines[i]);
            i++;
          }
        } else if (/^<!--/.test(line) && line.indexOf('-->') === -1) {
          while (i < lines.length && lines[i].indexOf('-->') === -1) {
            buf.push(lines[i]);
            i++;
          }
          if (i < lines.length) {
            buf.push(lines[i]);
            i++;
          }
        }
        html.push(buf.join('\n'));
        continue;
      }

      if (isHr(line)) {
        html.push('<hr />');
        i++;
        continue;
      }

      var heading = line.match(/^(#{1,6})\s+(.+?)\s*$/);
      if (heading) {
        var level = heading[1].length;
        var title = heading[2].replace(/\s+#+\s*$/, '');
        html.push('<h' + level + '>' + renderInline(title) + '</h' + level + '>');
        i++;
        continue;
      }

      if (looksLikeTableRow(line) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        html.push(parseTable());
        continue;
      }

      if (isQuote(line)) {
        var quote = [];
        while (i < lines.length && isQuote(lines[i])) {
          quote.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        html.push('<blockquote>' + toHtml(quote.join('\n')) + '</blockquote>');
        continue;
      }

      if (isUl(line)) {
        html.push(parseList(false));
        continue;
      }

      if (isOl(line)) {
        html.push(parseList(true));
        continue;
      }

      var para = [];
      while (i < lines.length && !isBlockStart(lines[i])) {
        para.push(lines[i]);
        i++;
      }
      if (para.length) {
        html.push('<p>' + renderInline(para.join(' ')) + '</p>');
      }
    }

    return html.join('\n');
  }

  global.Markdown = {
    parseFrontMatter: parseFrontMatter,
    toHtml: toHtml,
    renderInline: renderInline
  };
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this);
