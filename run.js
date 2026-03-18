
let currentActiveFile = null;

function runCode() {
    const htmlFiles = Object.keys(files).filter(f => f.endsWith('.html'));
    if (htmlFiles.length === 0) {
        showToast("No HTML files available!");
        return;
    }

    let selectedFile;
    if (currentActiveFile && files[currentActiveFile]) {
        selectedFile = currentActiveFile;
    } else {
        selectedFile = htmlFiles[0];
    }

    currentActiveFile = selectedFile;

    const overlay = document.getElementById('preview-overlay');
    const frame = document.getElementById('output-frame');
    
    overlay.style.display = 'flex';

    let themeCSS = "";
    Object.keys(files).forEach(name => {
        if(name.endsWith('.css')) themeCSS += files[name].content + "\n";
    });

    let jsContent = "";
    Object.keys(files).forEach(name => {
        if(name.endsWith('.js')) jsContent += files[name].content + "\n";
    });

    let finalHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: white; }
                ${themeCSS}
            </style>
        </head>
        <body>
            ${files[selectedFile].content}
            <script>
                try {
                    ${jsContent}
                } catch (err) {
                    console.error("JS Error: ", err);
                }
            </script>
        </body>
        </html>
    `;

    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(finalHTML);
    doc.close();
}

function refreshPreview() {
    runCode();
    showToast("Preview Refreshed");
}

function setPreviewSize(width) {
    const frame = document.getElementById('output-frame');
    if (!frame) return;

    if (width === '100%') {
        frame.style.width = "100%";
        frame.style.height = "100%";
        frame.style.border = "none";
        frame.style.borderRadius = "0";
    } else {
        frame.style.width = "375px";
        frame.style.height = "667px";
        frame.style.border = "12px solid #333";
        frame.style.borderRadius = "30px";
    }
}

function closePreview() {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'none';
}

function showToast(msg) {
    let toast = document.createElement('div');
    toast.innerText = msg;
    toast.style.cssText = `
        position: fixed; bottom: 50px; left: 50%; transform: translateX(-50%);
        background: var(--accent); color: #000; padding: 10px 20px; 
        border-radius: 8px; font-weight: bold; z-index: 100000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function resetAllSettings() {
    if(confirm("Reset everything to default?")) {
        files = JSON.parse(JSON.stringify(defaultFiles));
        document.getElementById('editor-grid').innerHTML = '';
        updateTaskbar();
        addFileToUI("index.html", "html", files["index.html"].content);
        addFileToUI("style.css", "css", files["style.css"].content);
        showToast("System Reset Successful");
    }
}
