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
// ─── SYNTAX HIGHLIGHTING ────────────────────────────────
const C_KEYWORDS = ['auto','break','case','char','const','continue','default','do','double','else','enum','extern','float','for','goto','if','inline','int','long','register','restrict','return','short','signed','sizeof','static','struct','switch','typedef','union','unsigned','void','volatile','while','_Bool','_Complex','_Imaginary','NULL','true','false','TRUE','FALSE'];
const C_TYPES = ['int','char','float','double','long','short','void','unsigned','signed','size_t','FILE','bool'];
const C_STDLIB = ['printf','scanf','fprintf','sprintf','snprintf','malloc','calloc','realloc','free','strlen','strcpy','strncpy','strcat','strcmp','memcpy','memset','fopen','fclose','fread','fwrite','fgets','fputs','puts','gets','getchar','putchar','atoi','atof','atol','exit','abs','rand','srand','sizeof','main'];

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function highlightLine(line) {
  // Preprocessor directives
  if (/^\s*#/.test(line)) {
    return `<span class="syn-pre">${escHtml(line)}</span>`;
  }

  let result = '';
  let i = 0;
  while (i < line.length) {
    // Single-line comment
    if (line[i] === '/' && line[i+1] === '/') {
      result += `<span class="syn-cmt">${escHtml(line.slice(i))}</span>`;
      break;
    }
    // Multi-line comment start (simplified)
    if (line[i] === '/' && line[i+1] === '*') {
      const end = line.indexOf('*/', i+2);
      if (end !== -1) {
        result += `<span class="syn-cmt">${escHtml(line.slice(i, end+2))}</span>`;
        i = end + 2;
        continue;
      } else {
        result += `<span class="syn-cmt">${escHtml(line.slice(i))}</span>`;
        break;
      }
    }
    // Strings
    if (line[i] === '"') {
      let j = i + 1;
      while (j < line.length && !(line[j] === '"' && line[j-1] !== '\\')) j++;
      result += `<span class="syn-str">${escHtml(line.slice(i, j+1))}</span>`;
      i = j + 1;
      continue;
    }
    // Char literals
    if (line[i] === "'") {
      let j = i + 1;
      while (j < line.length && !(line[j] === "'" && line[j-1] !== '\\')) j++;
      result += `<span class="syn-str">${escHtml(line.slice(i, j+1))}</span>`;
      i = j + 1;
      continue;
    }
    // Numbers
    if (/[0-9]/.test(line[i]) && (i === 0 || /[^a-zA-Z_]/.test(line[i-1]))) {
      let j = i;
      while (j < line.length && /[0-9.xXa-fA-F]/.test(line[j])) j++;
      result += `<span class="syn-num">${escHtml(line.slice(i, j))}</span>`;
      i = j;
      continue;
    }
    // Words
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);
      // Check if followed by (
      const isCall = line[j] === '(';
      if (C_KEYWORDS.includes(word) && !C_TYPES.includes(word)) {
        result += `<span class="syn-kw">${escHtml(word)}</span>`;
      } else if (C_TYPES.includes(word)) {
        result += `<span class="syn-type">${escHtml(word)}</span>`;
      } else if (C_STDLIB.includes(word) || isCall) {
        result += `<span class="syn-fn">${escHtml(word)}</span>`;
      } else {
        result += `<span class="syn-def">${escHtml(word)}</span>`;
      }
      i = j;
      continue;
    }
    // Operators / punctuation
    if ('{}[]();,=+-*/<>!&|^%~?:.'.includes(line[i])) {
      result += `<span class="syn-op">${escHtml(line[i])}</span>`;
      i++;
      continue;
    }
    result += escHtml(line[i]);
    i++;
  }
  return result;
}