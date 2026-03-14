// --- 1. CONFIGURATION & STATE ---
let files = [
    { id: 'html-code', name: 'INDEX.HTML', lang: 'HTML' },
    { id: 'css-code', name: 'STYLE.CSS', lang: 'CSS' },
    { id: 'js-code', name: 'MAIN.JS', lang: 'JS' }
];

let minimizedFiles = []; // Array to store minimized file IDs

// --- 2. EDITOR WINDOW CONTROLS ---

function toggleMinimize(fileId) {
    const editorBox = document.getElementById(fileId).closest('.editor-box');
    
    if (editorBox.style.display === 'none') {
        // Unminimize
        editorBox.style.display = 'flex';
        minimizedFiles = minimizedFiles.filter(id => id !== fileId);
    } else {
        // Minimize
        editorBox.style.display = 'none';
        if (!minimizedFiles.includes(fileId)) {
            minimizedFiles.push(fileId);
        }
    }
    updateFileList(); // Update shutter list on change
}

function toggleFullscreen(fileId) {
    const editorBox = document.getElementById(fileId).closest('.editor-box');
    const isFullscreen = editorBox.classList.contains('fullscreen-editor');

    document.querySelectorAll('.editor-box').forEach(box => {
        box.classList.remove('fullscreen-editor');
    });

    if (!isFullscreen) {
        editorBox.classList.add('fullscreen-editor');
    }
}

function deleteFile(fileId) {
    if (!confirm(`Are you sure you want to delete this file? (${fileId.toUpperCase()})`)) return;

    // Remove from the files array
    files = files.filter(f => f.id !== fileId);
    
    // Remove the editor window from DOM
    const editorBox = document.getElementById(fileId).closest('.editor-box');
    editorBox.remove();
    
    updateFileList(); // Update shutter list
}

function addNewFile() {
    const fileName = prompt("Enter File Name (e.g., styles.css or script.js)");
    if (!fileName || fileName.trim() === "") return;

    const langMatch = fileName.match(/\.([^\.]+)$/);
    const lang = langMatch ? langMatch[1].toUpperCase() : 'UNKNOWN';
    const fileId = fileName.toLowerCase().replace('.', '-') + '-code';

    // Check if file ID already exists to prevent duplicate windows
    if (document.getElementById(fileId)) {
        alert("A window with this file ID already exists.");
        return;
    }

    files.push({ id: fileId, name: fileName.toUpperCase(), lang: lang });

    // Create New Editor Box DOM element
    const editorSection = document.getElementById('editorSection');
    const newBox = document.createElement('div');
    newBox.className = 'editor-box';
    newBox.innerHTML = `
        <div class="label">
            <span>${lang} <i class="fas fa-code"></i></span>
            <div class="window-actions">
                <i class="fas fa-minus" onclick="toggleMinimize('${fileId}')" title="Minimize"></i>
                <i class="fas fa-expand" onclick="toggleFullscreen('${fileId}')" title="Fullscreen"></i>
                <i class="fas fa-trash" onclick="deleteFile('${fileId}')" title="Delete"></i>
            </div>
        </div>
        <textarea id="${fileId}" spellcheck="false"></textarea>
    `;
    editorSection.appendChild(newBox);

    updateFileList();
    toggleLeftSidebar(); // Optionally close sidebar after adding
}


// --- 3. LEFT SIDEBAR & SHUTTER FUNCTIONS ---

function toggleLeftSidebar() {
    document.getElementById('leftSidebar').classList.toggle('open');
}

function updateFileList() {
    const fileList = document.getElementById('file-list-container');
    fileList.innerHTML = "";

    files.forEach(file => {
        const item = document.createElement('div');
        item.className = 'file-item';
        
        // Check if this file window is minimized
        if (minimizedFiles.includes(file.id)) {
            item.classList.add('minimized');
            item.title = `${file.name} (Minimized)`;
        } else if (!document.getElementById(file.id).closest('.editor-box') || document.getElementById(file.id).closest('.editor-box').style.display === 'none') {
            // Check for edge cases where display is none but not explicitly in minimized list
            item.classList.add('minimized');
        } else {
            item.title = file.name;
        }

        item.innerHTML = `
            <span><i class="fas fa-file-code"></i> ${file.name}</span>
            <div class="file-actions">
                <i class="fas fa-plus ${minimizedFiles.includes(file.id) ? '' : 'fa-minus'}" onclick="toggleMinimize('${file.id}')" title="${minimizedFiles.includes(file.id) ? 'Restore Window' : 'Minimize Window'}"></i>
                <i class="fas fa-expand" onclick="toggleFullscreen('${file.id}')" title="Fullscreen"></i>
                <i class="fas fa-trash" onclick="deleteFile('${file.id}')" title="Delete"></i>
            </div>
        `;
        
        // Clicking on file name should probably ensure window is unminimized
        item.querySelector('span').onclick = () => {
             const editorBox = document.getElementById(file.id).closest('.editor-box');
             if (editorBox.style.display === 'none') {
                toggleMinimize(file.id);
             }
             toggleLeftSidebar(); // Close sidebar
        };

        fileList.appendChild(item);
    });
}


// --- 4. PREVIEW OVERLAY FUNCTIONS (SMART RUN) ---

function runCode() {
    const overlay = document.getElementById('preview-overlay');
    overlay.style.display = 'flex';
    
    // Core run logic is expected in old functions, but assuming we have these:
    const htmlField = document.getElementById('html-code');
    const cssField = document.getElementById('css-code');
    const jsField = document.getElementById('js-code');

    if (!htmlField || !cssField || !jsField) {
        alert("Basic files required for live run are not present.");
        return;
    }

    const h = htmlField.value;
    const c = `<style>${cssField.value}</style>`;
    const j = `<script>${jsField.value}<\/script>`;
    const out = document.getElementById('output').contentWindow.document;
    
    out.open(); 
    out.write(h + c + j); 
    out.close();
}

function closePreview() { 
    document.getElementById('preview-overlay').style.display = 'none'; 
}

function allowFullscreen() {
    const wrapper = document.getElementById('wrapper');
    if (wrapper.requestFullscreen) {
        wrapper.requestFullscreen();
    } else if (wrapper.webkitRequestFullscreen) { /* Safari */
        wrapper.webkitRequestFullscreen();
    } else if (wrapper.msRequestFullscreen) { /* IE11 */
        wrapper.msRequestFullscreen();
    }
}

// Exit fullscreen via DOM API, triggered by standard exit or can be linked to a cancel button
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

// --- 5. INITIALIZATION ---

window.onload = () => {
    // Initial shutter list update
    updateFileList();
    
    // Ensure preview is hidden initially
    closePreview();
};

// Handle clicks outside suggestion box to close it (retaining old functionality)
const suggestionBox = document.getElementById('suggestion-box');
if (suggestionBox) {
    document.addEventListener('mousedown', (e) => {
        if (!suggestionBox.contains(e.target)) suggestionBox.style.display = 'none';
    });
}
