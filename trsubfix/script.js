// Character mapping for Turkish characters
const charDict = {
    'Ý': 'İ',
    'ý': 'ı',
    'Þ': 'Ş',
    'þ': 'ş',
    'ð': 'ğ'
};

const prefix = 'tr_';

// DOM elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const status = document.getElementById('status');

// Event listeners for drag and drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('dragover');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('dragover');
    });
});

// Handle file drop
dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    handleFiles(files);
});

// Handle file selection via click
dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Main function to handle files
async function handleFiles(files) {
    status.textContent = 'Processing files...';
    status.className = 'status';

    const fileArray = Array.from(files);

    if (fileArray.length === 0) {
        showError('No files selected');
        return;
    }

    try {
        if (fileArray.length === 1 && fileArray[0].name.endsWith('.zip')) {
            await handleZipFile(fileArray[0]);
        } else {
            await handleSrtFiles(fileArray);
        }
    } catch (error) {
        showError('Error processing files: ' + error.message);
    }
}

// Handle individual SRT files
async function handleSrtFiles(files) {
    const srtFiles = files.filter(file => file.name.endsWith('.srt'));

    if (srtFiles.length === 0) {
        showError('No .srt files found');
        return;
    }

    const fixedFiles = await Promise.all(srtFiles.map(async (file) => {
        const content = await readFileAsText(file);
        const fixedContent = fixTurkishCharacters(content);
        return {
            name: prefix + file.name,
            content: fixedContent
        };
    }));

    if (fixedFiles.length === 1) {
        // Download single file
        downloadFile(fixedFiles[0].name, fixedFiles[0].content);
        showSuccess('File processed and downloaded successfully');
    } else {
        // Zip multiple files
        const zip = new JSZip();
        fixedFiles.forEach(file => {
            zip.file(file.name, file.content);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadFile(prefix + 'subtitles.zip', zipBlob);
        showSuccess('Files processed, zipped, and downloaded successfully');
    }
}

// Handle ZIP file
async function handleZipFile(file) {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const newZip = new JSZip();

    let processedCount = 0;

    for (const [filename, file] of Object.entries(contents.files)) {
        if (filename.endsWith('.srt') && !file.dir) {
            const content = await file.async('text');
            const fixedContent = fixTurkishCharacters(content);
            newZip.file(prefix + filename, fixedContent);
            processedCount++;
        }
    }

    if (processedCount === 0) {
        showError('No .srt files found in the zip archive');
        return;
    }

    const zipBlob = await newZip.generateAsync({ type: 'blob' });
    downloadFile(prefix + 'subtitles.zip', zipBlob);
    showSuccess(`Processed ${processedCount} subtitle files and created new zip`);
}

// Fix Turkish characters in text
function fixTurkishCharacters(text) {
    return text.replace(/[Ýýþð]/g, char => charDict[char] || char);
}

// Utility functions
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file, 'latin1');
    });
}

function downloadFile(filename, content) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showSuccess(message) {
    status.textContent = message;
    status.className = 'status success';
}

function showError(message) {
    status.textContent = message;
    status.className = 'status error';
} 