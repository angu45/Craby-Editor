// ─── LANGUAGE DATA ────────────────────────────────

// HTML
const HTML_TAGS = ['html','head','body','div','span','h1','h2','h3','p','a','img','input','button','form','label','script','style','link','meta','ul','li','table','tr','td','th','section','article','header','footer','nav'];
const HTML_ATTRS = ['class','id','src','href','alt','type','name','value','placeholder','style','width','height','onclick'];

// CSS
const CSS_PROPERTIES = ['color','background','margin','padding','border','display','position','top','left','right','bottom','flex','grid','font-size','font-weight','width','height','z-index'];
const CSS_VALUES = ['auto','block','inline','none','flex','grid','absolute','relative','bold'];

// JAVA
const JAVA_KEYWORDS = ['abstract','assert','boolean','break','byte','case','catch','char','class','const','continue','default','do','double','else','enum','extends','final','finally','float','for','if','implements','import','instanceof','int','interface','long','native','new','package','private','protected','public','return','short','static','strictfp','super','switch','synchronized','this','throw','throws','transient','try','void','volatile','while'];
const JAVA_TYPES = ['int','float','double','char','boolean','long','short','byte','String'];

// ─── COMMON ────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── HTML HIGHLIGHT ────────────────────────────────
function highlightHTML(line) {
  let result = '';
  let i = 0;

  while (i < line.length) {
    // Tag start
    if (line[i] === '<') {
      let j = i;
      while (j < line.length && line[j] !== '>') j++;

      let tagContent = line.slice(i, j + 1);

      // Highlight tag name
      tagContent = tagContent.replace(/<\/?([a-zA-Z0-9]+)/, (m, tag) => {
        return m.replace(tag, `<span class="syn-tag">${tag}</span>`);
      });

      // Highlight attributes
      tagContent = tagContent.replace(/([a-zA-Z\-]+)=/g, (m, attr) => {
        return `<span class="syn-attr">${attr}</span>=`;
      });

      // Highlight values
      tagContent = tagContent.replace(/"([^"]*)"/g, (m) => {
        return `<span class="syn-str">${escHtml(m)}</span>`;
      });

      result += `<span class="syn-op">&lt;</span>` + tagContent.slice(1, -1) + `<span class="syn-op">&gt;</span>`;
      i = j + 1;
      continue;
    }

    result += escHtml(line[i]);
    i++;
  }

  return result;
}

// ─── CSS HIGHLIGHT ────────────────────────────────
function highlightCSS(line) {
  let result = escHtml(line);

  // Selectors
  result = result.replace(/([.#]?[a-zA-Z0-9_-]+)\s*\{/g, `<span class="syn-def">$1</span> {`);

  // Properties
  result = result.replace(/([a-z-]+)\s*:/g, `<span class="syn-attr">$1</span>:`);

  // Values
  result = result.replace(/:\s*([^;]+)/g, (m, val) => {
    return `: <span class="syn-str">${val}</span>`;
  });

  return result;
}

// ─── JAVA HIGHLIGHT ────────────────────────────────
function highlightJava(line) {
  let result = '';
  let words = line.split(/(\W+)/);

  for (let word of words) {
    if (JAVA_KEYWORDS.includes(word)) {
      result += `<span class="syn-kw">${word}</span>`;
    } else if (JAVA_TYPES.includes(word)) {
      result += `<span class="syn-type">${word}</span>`;
    } else if (/^[0-9]+$/.test(word)) {
      result += `<span class="syn-num">${word}</span>`;
    } else if (word.startsWith('"') && word.endsWith('"')) {
      result += `<span class="syn-str">${escHtml(word)}</span>`;
    } else if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(word) && line.includes(word + '(')) {
      result += `<span class="syn-fn">${word}</span>`;
    } else {
      result += escHtml(word);
    }
  }

  return result;
}

// ─── MAIN SWITCH FUNCTION ────────────────────────────────
function highlightCode(line, lang) {
  switch (lang) {
    case 'html': return highlightHTML(line);
    case 'css': return highlightCSS(line);
    case 'java': return highlightJava(line);
    default: return escHtml(line);
  }
}