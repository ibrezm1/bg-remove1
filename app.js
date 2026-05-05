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

let originalImage = null;
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
    if (e.target.files.length) handleFile(e.target.files[0]);
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
    if (files.length) handleFile(files[0]);
});

// Controls
toleranceSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    toleranceVal.textContent = val;
    processImage();
});

downloadBtn.addEventListener('click', downloadResult);
resetBtn.addEventListener('click', resetApp);

// --- Core Logic ---

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            setupEditor();
        };
        img.src = e.target.result;
        originalPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function setupEditor() {
    uploadArea.classList.add('hidden');
    editorView.classList.remove('hidden');

    // Set canvas dimensions
    resultCanvas.width = originalImage.naturalWidth;
    resultCanvas.height = originalImage.naturalHeight;

    processImage();
}

function processImage() {
    if (!originalImage) return;

    const tolerance = parseInt(toleranceSlider.value);
    
    // Draw original
    ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
    ctx.drawImage(originalImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, resultCanvas.width, resultCanvas.height);
    const data = imageData.data;

    // Background removal logic
    // We look for pixels where R, G, and B are all above the threshold
    const threshold = 255 - tolerance;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Simple check: if all channels are above threshold, it's "white"
        if (r >= threshold && g >= threshold && b >= threshold) {
            data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function downloadResult() {
    const link = document.createElement('a');
    link.download = 'pureclear-result.png';
    link.href = resultCanvas.toDataURL('image/png');
    link.click();
}

function resetApp() {
    originalImage = null;
    fileInput.value = '';
    uploadArea.classList.remove('hidden');
    editorView.classList.add('hidden');
}
