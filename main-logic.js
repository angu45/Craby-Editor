/** * Craby Editor - Core Logic
 * Handles partitioning, file management, and execution
 */

const editorWrapper = document.getElementById('editor-wrapper');
const outputIframe = document.getElementById('output');
const previewOverlay = document.getElementById('preview-overlay');

// 1. Dynamic Partitioning Logic
function updateVisibility() {
    const boxes = {
        html: { box: document.getElementById('box-html'), chk: document.getElementById('chk-html') },
        css: { box: document.getElementById('box-css'), chk: document.getElementById('chk-css') },
        js: { box: document.getElementById('box-js'), chk: document.getElementById('chk-js') }
    };

    let visibleCount = 0;
    Object.values(boxes).forEach(item => {
        if (item.chk.checked) {
            item.box.style.display = 'flex';
            visibleCount++;
        } else {
            item.box.style.display = 'none';
        }
    });

    // Equal Height Partitioning: e.g., 3 files = 33.33% each
    const heightPercentage = visibleCount > 0 ? (100 / visibleCount) + '%' : '0%';
    Object.values(boxes).forEach(item => {
        if (item.chk.checked) item.box.style.height = heightPercentage;
    });
}

// 2. File Management
function minimizeBox(type) {
    const checkbox = document.getElementById(`chk-${type}`);
    checkbox.checked = false;
    updateVisibility();
}

function deleteFile(type) {
    if (confirm(`Are you sure you want to clear ${type.toUpperCase()} content?`)) {
        document.getElementById(`${type}-code`).value = '';
        saveHistory(type, '');
    }
}

// 3. Live Preview & Device Toggle
function runCode() {
    const html = document.getElementById('html-code').value;
    const css = `<style>${document.getElementById('css-code').value}</style>`;
    const js = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    
    const source = `${html}${css}${js}`;
    
    previewOverlay.style.display = 'flex';
    const iframeDoc = outputIframe.contentDocument || outputIframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(source);
    iframeDoc.close();
}

function closePreview() {
    previewOverlay.style.display = 'none';
}

function setDevice(mode) {
    const wrapper = document.querySelector('.iframe-wrapper');
    if (mode === 'mobile') {
        wrapper.style.width = '375px';
        wrapper.style.height = '667px';
        wrapper.style.border = '12px solid #333';
        wrapper.style.borderRadius = '20px';
    } else {
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.border = 'none';
    }
}

// 4. Safe Download (Blob URL)
function exportCode() {
    const html = document.getElementById('html-code').value;
    const css = `<style>${document.getElementById('css-code').value}</style>`;
    const js = `<script>${document.getElementById('js-code')?.value || ''}<\/script>`;
    
    const fullCode = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Exported from Craby Editor</title>
    ${css}
</head>
<body>
    ${html}
    ${js}
</body>
</html>`;

    const blob = new Blob([fullCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
}

// Sidebar Toggles
function toggleLeftSidebar() {
    const sidebar = document.getElementById('leftSidebar');
    const shutter = document.getElementById('shutterBtn');
    sidebar.classList.toggle('active');
    shutter.innerHTML = sidebar.classList.contains('active') ? 
        '<i class="fas fa-chevron-left"></i>' : '<i class="fas fa-chevron-right"></i>';
}
