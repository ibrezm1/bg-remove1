const dropZone = document.getElementById('dropZone');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const editorView = document.getElementById('editorView');
const originalPreview = document.getElementById('originalPreview');
const resultCanvas = document.getElementById('resultCanvas');
const toleranceSlider = document.getElementById('tolerance');
const toleranceVal = document.getElementById('toleranceVal');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const themeToggle = document.getElementById('themeToggle');

const singlePreview = document.getElementById('singlePreview');
const batchGrid = document.getElementById('batchGrid');
const batchInfo = document.getElementById('batchInfo');
const batchCount = document.getElementById('batchCount');

let originalImage = null; // Used for single mode
let batchImages = []; // Array of { name, img }
let isBatch = false;
const ctx = resultCanvas.getContext('2d', { willReadFrequently: true });

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.textContent = '🌙';
    } else {
        themeToggle.textContent = '☀️';
    }
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    themeToggle.textContent = isLight ? '🌙' : '☀️';
});

initTheme();

// --- Event Listeners ---

uploadArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFiles(e.target.files);
});

// Drag & Drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => uploadArea.classList.add('drag-over'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('drag-over'), false);
});

uploadArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) handleFiles(files);
});

// Controls
toleranceSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    toleranceVal.textContent = val;
    if (isBatch) {
        renderBatch();
    } else {
        processImage();
    }
});

downloadBtn.addEventListener('click', () => {
    if (isBatch) {
        downloadZip();
    } else {
        downloadResult();
    }
});

resetBtn.addEventListener('click', resetApp);

// --- Core Logic ---

async function handleFiles(files) {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) {
        alert('Please upload image files.');
        return;
    }

    uploadArea.classList.add('hidden');
    editorView.classList.remove('hidden');

    if (imageFiles.length === 1) {
        isBatch = false;
        singlePreview.classList.remove('hidden');
        batchGrid.classList.add('hidden');
        batchInfo.classList.add('hidden');
        downloadBtn.textContent = 'Download PNG';
        
        const file = imageFiles[0];
        const img = await loadImage(file);
        originalImage = img;
        originalPreview.src = img.src;
        resultCanvas.width = img.naturalWidth;
        resultCanvas.height = img.naturalHeight;
        processImage();
    } else {
        isBatch = true;
        singlePreview.classList.add('hidden');
        batchGrid.classList.remove('hidden');
        batchInfo.classList.remove('hidden');
        downloadBtn.textContent = 'Download ZIP';
        
        batchImages = [];
        batchGrid.innerHTML = '';
        batchCount.textContent = `Loading ${imageFiles.length} images...`;
        
        for (const file of imageFiles) {
            const img = await loadImage(file);
            batchImages.push({ name: file.name, img });
        }
        
        renderBatch();
    }
}

function loadImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function processImage(imgSource = originalImage) {
    if (!imgSource) return;

    const tolerance = parseInt(toleranceSlider.value);
    
    // Use an internal canvas for batch processing to avoid flickering
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imgSource.naturalWidth;
    tempCanvas.height = imgSource.naturalHeight;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    
    tempCtx.drawImage(imgSource, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    const threshold = 255 - tolerance;

    for (let i = 0; i < data.length; i += 4) {
        if (data[i] >= threshold && data[i + 1] >= threshold && data[i + 2] >= threshold) {
            data[i + 3] = 0;
        }
    }

    tempCtx.putImageData(imageData, 0, 0);

    // If it's single mode, update the main canvas
    if (!isBatch) {
        resultCanvas.width = tempCanvas.width;
        resultCanvas.height = tempCanvas.height;
        ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
    }

    return tempCanvas.toDataURL('image/png');
}

function renderBatch() {
    batchGrid.innerHTML = '';
    batchCount.textContent = `Processing ${batchImages.length} images...`;

    batchImages.forEach((item, index) => {
        const resultDataUrl = processImage(item.img);
        
        const itemEl = document.createElement('div');
        itemEl.className = 'batch-item';
        itemEl.innerHTML = `
            <div class="canvas-wrapper transparency-grid">
                <img src="${resultDataUrl}" style="max-width:100%; max-height:100%; object-fit:contain;">
            </div>
            <div class="item-name">${item.name}</div>
        `;
        batchGrid.appendChild(itemEl);
    });

    batchCount.textContent = `Ready! ${batchImages.length} images processed.`;
}

function downloadResult() {
    const link = document.createElement('a');
    link.download = 'pureclear-result.png';
    link.href = resultCanvas.toDataURL('image/png');
    link.click();
}

async function downloadZip() {
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Generating ZIP...';
    
    const zip = new JSZip();
    
    batchImages.forEach(item => {
        const resultDataUrl = processImage(item.img);
        const base64Data = resultDataUrl.split(',')[1];
        const fileName = item.name.replace(/\.[^/.]+$/, "") + ".png";
        zip.file(fileName, base64Data, { base64: true });
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'pureclear-batch-results.zip';
    link.click();
    
    downloadBtn.disabled = false;
    downloadBtn.textContent = 'Download ZIP';
}

function resetApp() {
    originalImage = null;
    batchImages = [];
    fileInput.value = '';
    uploadArea.classList.remove('hidden');
    editorView.classList.add('hidden');
}
