const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const OUTPUT_WIDTH = 3300;
const OUTPUT_HEIGHT = 4400;
const ROW_COUNT = 4;
const MARGIN = 0;

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(express.static('public'));
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CupCutTool</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        @font-face {
            font-family: 'Space Grotesk';
            src: local('Space Grotesk'), local('SpaceGrotesk-Regular');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Space Grotesk';
            src: local('Space Grotesk Medium'), local('SpaceGrotesk-Medium');
            font-weight: 500;
            font-style: normal;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: 'Space Grotesk', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #f5f5f5;
            color: #111;
            min-height: 100vh;
            padding: 16px;
        }
        
        .container {
            position: relative;
            z-index: 1;
            display: flex;
            justify-content: center;
            gap: 16px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        /* Left Panel */
        .left-panel {
            width: 280px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        /* Right Panel */
        .right-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        /* Header */
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 14px;
            background: rgba(255,255,255,0.9);
            backdrop-filter: blur(20px);
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
        
        .logo {
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 2px;
        }
        
        .menu-icon {
            width: 16px;
            height: 10px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            cursor: pointer;
        }
        
        .menu-icon span {
            display: block;
            height: 1px;
            background: #111;
        }
        
        .menu-icon span:nth-child(1) { width: 100%; }
        .menu-icon span:nth-child(2) { width: 60%; }
        .menu-icon span:nth-child(3) { width: 80%; }
        
        /* Upload Zone */
        .drop-area {
            border: 1px dashed #ccc;
            border-radius: 10px;
            padding: 20px 14px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: rgba(255,255,255,0.8);
        }
        
        .drop-area:hover {
            border-color: #111;
            background: #fff;
        }
        
        .drop-area.dragover {
            border-color: #111;
            border-style: solid;
            background: #fff;
        }
        
        .drop-icon {
            font-size: 20px;
            margin-bottom: 6px;
            color: #999;
        }
        
        .drop-text {
            font-size: 12px;
            color: #333;
            margin-bottom: 2px;
        }
        
        .drop-hint {
            font-size: 10px;
            color: #aaa;
        }
        
        input[type="file"] { display: none; }
        
        /* Specs */
        .specs {
            padding: 10px 14px;
            background: rgba(255,255,255,0.5);
            border-radius: 8px;
        }
        
        .spec-row {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #888;
            margin-bottom: 4px;
        }
        
        .spec-row:last-child { margin-bottom: 0; }
        
        .spec-label { color: #999; }
        .spec-value { color: #333; font-weight: 500; }
        
        /* Preview List */
        .preview-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .preview-item {
            position: relative;
            height: 60px;
            border-radius: 6px;
            overflow: hidden;
            background: #fff;
            border: 1px solid #e8e8e8;
            display: flex;
            align-items: center;
            padding: 8px;
            gap: 10px;
        }
        
        .preview-item img {
            height: 100%;
            width: 80px;
            object-fit: cover;
            border-radius: 4px;
        }
        
        .preview-item .info {
            flex: 1;
            font-size: 11px;
            color: #666;
        }
        
        .preview-item .index {
            font-size: 10px;
            color: #999;
            background: #f5f5f5;
            padding: 2px 8px;
            border-radius: 10px;
        }
        
        .preview-item .remove {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 18px;
            height: 18px;
            background: rgba(0,0,0,0.6);
            border-radius: 50%;
            color: #fff;
            border: none;
            cursor: pointer;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.2s;
        }
        
        .preview-item:hover .remove { opacity: 1; }
        
        .preview-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background: #f5f5f5;
            border-radius: 4px;
            color: #ccc;
            font-size: 12px;
        }
        
        /* Actions */
        .actions {
            display: flex;
            gap: 8px;
            margin-top: auto;
        }
        
        .btn {
            flex: 1;
            padding: 10px 16px;
            border-radius: 50px;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
        }
        
        .btn-primary {
            background: #111;
            color: #fff;
            border: 1px solid #111;
        }
        
        .btn-primary:hover { background: #333; }
        .btn-primary:disabled { background: #ccc; border-color: #ccc; cursor: not-allowed; }
        
        .btn-secondary {
            background: transparent;
            color: #666;
            border: 1px solid #ccc;
        }
        
        .btn-secondary:hover { border-color: #111; color: #111; }
        
        .btn-folder {
            background: #f5f5f5;
            color: #333;
            border: 1px solid #ddd;
            margin-top: 8px;
            font-size: 11px;
            padding: 8px 16px;
        }
        
        .btn-folder:hover { background: #eee; }
        
        /* Batch Results */
        .batch-results {
            display: none;
            width: 100%;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #eee;
        }
        
        .batch-results.active { display: block; }
        
        .batch-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .batch-title {
            font-size: 14px;
            font-weight: 600;
            color: #333;
        }
        
        .batch-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 12px;
        }
        
        .batch-item {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            background: #fff;
        }
        
        .batch-item img {
            width: 100%;
            display: block;
        }
        
        .batch-item-label {
            font-size: 10px;
            color: #999;
            text-align: center;
            padding: 4px;
            background: #fafafa;
        }
        
        .batch-item .btn-download {
            display: block;
            text-align: center;
            padding: 6px;
            background: #f5f5f5;
            color: #333;
            text-decoration: none;
            font-size: 10px;
            border-top: 1px solid #e0e0e0;
        }
        
        /* Result Area */
        .result-area {
            flex: 1;
            border: 2px dashed #ccc;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.5);
            position: relative;
            min-height: 400px;
        }
        
        .result-placeholder {
            text-align: center;
        }
        
        .result-placeholder-icon {
            font-size: 48px;
            color: #ddd;
            margin-bottom: 12px;
        }
        
        .result-placeholder-text {
            font-size: 12px;
            color: #999;
        }
        
        .result-content {
            display: none;
            width: 100%;
            height: 100%;
            padding: 16px;
            flex-direction: column;
        }
        
        .result-content.active { display: flex; }
        
        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .result-title {
            font-size: 11px;
            color: #999;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        .result-hint {
            font-size: 10px;
            color: #999;
        }
        
        .btn-download {
            padding: 6px 16px;
            background: #111;
            color: #fff;
            border: none;
            border-radius: 50px;
            font-size: 11px;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .btn-download:hover { background: #333; }
        
        .result-image-wrap {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: auto;
        }
        
        .result-image-wrap img {
            max-width: 100%;
            max-height: 100%;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        /* Loading */
        .loading {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            flex-direction: column;
            align-items: center;
        }
        
        .loading.active { display: flex; }
        
        .spinner {
            width: 24px;
            height: 24px;
            border: 1px solid #e0e0e0;
            border-top-color: #111;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 8px;
        }
        
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .loading-text {
            font-size: 11px;
            color: #999;
        }
        
        @media (max-width: 768px) {
            .container { flex-direction: column; }
            .left-panel { width: 100%; }
            .result-area { min-height: 300px; }
        }
        
        /* Crop Adjustment Section */
        .crop-adjust-section {
            padding: 14px;
            background: rgba(255,255,255,0.5);
            border-radius: 8px;
            border: 1px solid #e0e0e0;
            margin-top: 10px;
        }
        
        .crop-title {
            font-size: 11px;
            color: #999;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        
        .crop-preview-wrap {
            background: #f0f0f0;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 10px;
        }
        
        .crop-preview {
            width: 100%;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        .crop-preview img {
            max-width: 100%;
            max-height: 100%;
        }
        
        .crop-box {
            position: absolute;
            border: 2px dashed #007AFF;
            background: rgba(0,122,255,0.1);
        }
        
        .crop-controls {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .crop-slider-row {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .crop-slider-row label {
            font-size: 11px;
            color: #666;
            width: 50px;
        }
        
        .crop-slider-row input[type="range"] {
            flex: 1;
            height: 4px;
            -webkit-appearance: none;
            background: #ddd;
            border-radius: 2px;
        }
        
        .crop-slider-row input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            background: #007AFF;
            border-radius: 50%;
            cursor: pointer;
        }
        
        .crop-slider-row span {
            font-size: 11px;
            color: #999;
            width: 40px;
            text-align: right;
        }
        
        body.dark .crop-adjust-section {
            background: rgba(30,30,30,0.8);
            border-color: #333;
        }
        
        body.dark .crop-title { color: #aaa; }
        body.dark .crop-preview-wrap { background: #1a1a1a; }
        body.dark .crop-slider-row label { color: #aaa; }
        body.dark .crop-slider-row input[type="range"] { background: #444; }
    </style>
</head>
<body>
    <div class="container">
        <div class="left-panel">
            <header>
                <div class="logo">CUPCUTTOOL</div>
                <div class="menu-icon"><span></span><span></span><span></span></div>
            </header>
            
            <div class="drop-area" id="dropArea">
                <div class="drop-icon">+</div>
                <p class="drop-text">上传图片</p>
                <p class="drop-hint">拖拽或点击 · 4 张</p>
                <input type="file" id="fileInput" multiple accept="image/*">
            </div>
            
            <input type="file" id="folderInput" webkitdirectory multiple style="display:none">
            <button class="btn btn-folder" id="folderBtn">📁 上传文件夹</button>
            
            <div class="specs">
                <div class="spec-row">
                    <span class="spec-label">尺寸</span>
                    <span class="spec-value">3300 × 4400 px</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">布局</span>
                    <span class="spec-value">4 行</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">格式</span>
                    <span class="spec-value">PNG</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">裁剪顶部</span>
                    <input type="number" id="cropTopInput" value="0.4" step="0.01" min="0" max="1" style="width:60px">
                </div>
            </div>
            
            <div class="preview-list" id="previewList"></div>
            
            <!-- 裁剪调整区域 -->
            <div class="crop-adjust-section" id="cropAdjustSection" style="display:none;">
                <div class="crop-title">裁剪调整</div>
                <div class="crop-preview-wrap">
                    <div class="crop-preview" id="cropPreview"></div>
                </div>
                <div class="crop-controls">
                    <div class="crop-slider-row">
                        <label>X偏移</label>
                        <input type="range" id="cropX" min="-500" max="500" value="0">
                        <span id="cropXVal">0</span>
                    </div>
                    <div class="crop-slider-row">
                        <label>Y偏移</label>
                        <input type="range" id="cropY" min="-500" max="500" value="0">
                        <span id="cropYVal">0</span>
                    </div>
                    <div class="crop-slider-row">
                        <label>缩放</label>
                        <input type="range" id="cropScale" min="50" max="200" value="100">
                        <span id="cropScaleVal">100%</span>
                    </div>
                    <button class="btn btn-secondary" id="applyCropBtn">应用裁剪</button>
                </div>
            </div>
            
            <div class="actions">
                <button class="btn btn-primary" id="mergeBtn" disabled>生成拼图</button>
                <button class="btn btn-secondary" id="clearBtn">清除</button>
            </div>
        </div>
        
        <div class="right-panel">
            <div class="result-area" id="resultArea">
                <div class="result-placeholder" id="resultPlaceholder">
                    <div class="result-placeholder-icon">⬜</div>
                    <div class="result-placeholder-text">生成的拼图将显示在这里</div>
                </div>
                <div class="loading" id="loading">
                    <div class="spinner"></div>
                    <p class="loading-text">处理中...</p>
                </div>
                <div class="result-content" id="resultContent">
                    <div class="result-header">
                        <span class="result-title">生成结果</span>
                        <a class="btn-download" id="downloadBtn" download>下载图片</a>
                    </div>
                    <div class="result-image-wrap">
                        <img id="resultImage" src="" alt="Result">
                    </div>
                </div>
                
                <!-- 批量结果区域 -->
                <div class="batch-results" id="batchResults">
                    <div class="batch-header">
                        <span class="batch-title">批量结果</span>
                        <button class="btn btn-primary" id="downloadAllBtn">下载全部</button>
                    </div>
                    <div class="batch-grid" id="batchGrid"></div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let uploadedFiles = [];
        let folderFiles = [];
        
        const dropArea = document.getElementById('dropArea');
        const fileInput = document.getElementById('fileInput');
        const folderInput = document.getElementById('folderInput');
        const folderBtn = document.getElementById('folderBtn');
        const previewList = document.getElementById('previewList');
        const mergeBtn = document.getElementById('mergeBtn');
        const clearBtn = document.getElementById('clearBtn');
        const loading = document.getElementById('loading');
        const resultArea = document.getElementById('resultArea');
        const resultPlaceholder = document.getElementById('resultPlaceholder');
        const resultContent = document.getElementById('resultContent');
        const resultImage = document.getElementById('resultImage');
        const batchResults = document.getElementById('batchResults');
        const batchGrid = document.getElementById('batchGrid');
        const downloadAllBtn = document.getElementById('downloadAllBtn');
        
        // 文件夹上传
        folderBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            folderInput.click();
        });
        folderInput.addEventListener('change', (e) => handleFolderUpload(e.target.files));
        
        dropArea.addEventListener('click', () => fileInput.click());
        
        dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropArea.classList.add('dragover');
        });
        
        dropArea.addEventListener('dragleave', () => {
            dropArea.classList.remove('dragover');
        });
        
        dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            dropArea.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });
        
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
        
        function handleFiles(files) {
            const remainingSlots = 4 - uploadedFiles.length;
            const filesToAdd = Array.from(files).slice(0, remainingSlots);
            filesToAdd.forEach(file => {
                if (uploadedFiles.length < 4 && file.type.startsWith('image/')) {
                    uploadedFiles.push(file);
                }
            });
            updateUI();
        }
        
        function updateUI() {
            previewList.innerHTML = '';
            
            for (let i = 0; i < 4; i++) {
                const div = document.createElement('div');
                div.className = 'preview-item';
                
                if (uploadedFiles[i]) {
                    div.innerHTML = '<img src="' + URL.createObjectURL(uploadedFiles[i]) + '" alt=""><span class="info">第 ' + (i + 1) + ' 张</span><span class="index">' + (i + 1) + '</span><button class="remove" onclick="removeImage(' + i + ')">×</button>';
                } else {
                    div.innerHTML = '<div class="preview-placeholder">' + (i + 1) + '</div><span class="info">待上传</span>';
                }
                
                previewList.appendChild(div);
            }
            
            mergeBtn.disabled = uploadedFiles.length !== 4;
            
            // Show/hide crop section
            if (uploadedFiles.length > 0) {
                showCropSection();
            } else {
                cropSection.style.display = 'none';
            }
        }
        
        window.removeImage = function(index) {
            uploadedFiles.splice(index, 1);
            updateUI();
        };
        
        // Crop Adjustment
        let cropSettings = { x: 0, y: 0, scale: 100, top: 0.4 };
        const cropSection = document.getElementById('cropAdjustSection');
        const cropPreview = document.getElementById('cropPreview');
        const cropXSlider = document.getElementById('cropX');
        const cropYSlider = document.getElementById('cropY');
        const cropScaleSlider = document.getElementById('cropScale');
        const cropXVal = document.getElementById('cropXVal');
        const cropYVal = document.getElementById('cropYVal');
        const cropScaleVal = document.getElementById('cropScaleVal');
        const cropTopInput = document.getElementById('cropTopInput');
        
        cropTopInput.addEventListener('change', (e) => {
            cropSettings.top = parseFloat(e.target.value) || 0.4;
            // 如果已有图片，自动重新生成
            if (uploadedFiles.length === 4) {
                mergeBtn.click();
            } else if (folderFiles.length > 0) {
                // 重新执行批量处理
                handleFolderUpload(folderFiles);
            }
        });
        
        function updateCropPreview() {
            if (uploadedFiles.length === 0) {
                cropPreview.innerHTML = '<span style="color:#999;font-size:12px">先上传图片</span>';
                return;
            }
            
            const file = uploadedFiles[0];
            const url = URL.createObjectURL(file);
            const scale = cropSettings.scale / 100;
            const left = 50 - scale * 50 + cropSettings.x / 10;
            const top = 50 - scale * 50 + cropSettings.y / 10;
            const width = scale * 100;
            const height = scale * 100;
            
            cropPreview.innerHTML = '<img src="' + url + '" style="max-width:100%;max-height:100%">' +
                '<div class="crop-box" style="left:' + left + '%;top:' + top + '%;width:' + width + '%;height:' + height + '%"></div>';
        }
        
        cropXSlider.addEventListener('input', (e) => {
            cropSettings.x = parseInt(e.target.value);
            cropXVal.textContent = cropSettings.x;
            updateCropPreview();
        });
        
        cropYSlider.addEventListener('input', (e) => {
            cropSettings.y = parseInt(e.target.value);
            cropYVal.textContent = cropSettings.y;
            updateCropPreview();
        });
        
        cropScaleSlider.addEventListener('input', (e) => {
            cropSettings.scale = parseInt(e.target.value);
            cropScaleVal.textContent = cropSettings.scale + '%';
            updateCropPreview();
        });
        
        function showCropSection() {
            cropSection.style.display = 'block';
            updateCropPreview();
        }
        
        clearBtn.addEventListener('click', () => {
            uploadedFiles = [];
            resultImage.src = '';
            resultContent.classList.remove('active');
            resultPlaceholder.style.display = 'block';
            updateUI();
        });
        
        // 文件夹批量上传
        function handleFolderUpload(files) {
            if (files.length === 0) return;
            
            // 按名称排序
            const sortedFiles = Array.from(files)
                .filter(f => f.type.startsWith('image/'))
                .sort((a, b) => a.name.localeCompare(b.name));
            
            if (sortedFiles.length < 4) {
                alert('文件夹中至少需要4张图片');
                return;
            }
            
            const groupCount = Math.ceil(sortedFiles.length / 4);
            const totalImages = groupCount * 4;
            
            // 填充到4的倍数
            while (sortedFiles.length < totalImages) {
                sortedFiles.push(sortedFiles[sortedFiles.length % 4]);
            }
            
            // 保存文件引用用于后续重新生成
            folderFiles = sortedFiles;
            
            loading.classList.add('active');
            resultPlaceholder.style.display = 'none';
            batchResults.classList.add('active');
            batchGrid.innerHTML = '<p style="color:#666">正在处理...</p>';
            
            const formData = new FormData();
            sortedFiles.forEach((file, i) => {
                formData.append('images', file);
            });
            
            // 添加裁剪参数
            formData.append('cropX', cropSettings.x);
            formData.append('cropY', cropSettings.y);
            formData.append('cropScale', cropSettings.scale);
            formData.append('cropTop', cropSettings.top);
            
            fetch('/batch-merge', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                loading.classList.remove('active');
                if (data.success) {
                    window.batchOutputs = data.outputs.map(o => o.output);
                    
                    batchGrid.innerHTML = '';
                    data.outputs.forEach((item, i) => {
                        const div = document.createElement('div');
                        div.className = 'batch-item';
                        div.innerHTML = '<img src="' + item.output + '" alt="Batch ' + item.index + '"><div class="batch-item-label">第 ' + item.index + ' 组</div><a class="btn-download" href="' + item.output + '" download>下载</a>';
                        batchGrid.appendChild(div);
                    });
                    
                    downloadAllBtn.onclick = () => {
                        window.batchOutputs.forEach((src, i) => {
                            const a = document.createElement('a');
                            a.href = src;
                            a.download = 'cup-batch-' + (i + 1) + '.jpg';
                            a.click();
                        });
                    };
                } else {
                    batchGrid.innerHTML = '<p style="color:red">处理失败: ' + data.error + '</p>';
                }
            })
            .catch(err => {
                loading.classList.remove('active');
                batchGrid.innerHTML = '<p style="color:red">错误: ' + err.message + '</p>';
            });
        }
        
        mergeBtn.addEventListener('click', async () => {
            if (uploadedFiles.length !== 4) return;
            
            loading.classList.add('active');
            resultPlaceholder.style.display = 'none';
            resultContent.classList.remove('active');
            
            const formData = new FormData();
            uploadedFiles.forEach((file, i) => {
                formData.append('images', file);
            });
            
            // 添加裁剪参数
            formData.append('cropX', cropSettings.x);
            formData.append('cropY', cropSettings.y);
            formData.append('cropScale', cropSettings.scale);
            formData.append('cropTop', cropSettings.top);
            
            try {
                const response = await fetch('/merge', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                
                if (data.success) {
                    resultImage.src = data.output;
                    document.getElementById('downloadBtn').href = data.output;
                    resultContent.classList.add('active');
                } else {
                    alert('错误: ' + data.error);
                    resultPlaceholder.style.display = 'block';
                }
            } catch (err) {
                alert('请求失败: ' + err.message);
                resultPlaceholder.style.display = 'block';
            }
            
            loading.classList.remove('active');
        });
        
        updateUI();
    </script>
</body>
</html>`);
});

function getContentBounds(ctx, img, threshold = 240) {
    const width = img.width;
    const height = img.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    let minX = width, minY = height, maxX = 0, maxY = 0;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            if (r < threshold || g < threshold || b < threshold) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    
    const padding = 20;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width - 1, maxX + padding);
    maxY = Math.min(height - 1, maxY + padding);
    
    return { minX, minY, maxX, maxY };
}

// ONNX 模型加载（单例）
let ortSession = null;
async function getModel() {
    if (!ortSession) {
        console.log('加载 ONNX 模型中...');
        const { InferenceSession } = require('onnxruntime-node');
        ortSession = await InferenceSession.create(
            require('path').join(__dirname, 'public', 'model', 'exp-2.onnx')
        );
        console.log('ONNX 模型加载完成');
    }
    return ortSession;
}

// 固定裁剪参数
let CROP_TOP = 0.40;  // 裁剪顶部 40% 高度以下
const CROP_SIDES = 0.10; // 左右各留 10% 边距

app.post('/merge', upload.fields([{ name: 'images', maxCount: 4 }]), async (req, res) => {
    try {
        const files = req.files['images'];
        if (!files || files.length !== 4) {
            return res.json({ success: false, error: '请上传 4 张图片' });
        }

        const { createCanvas, loadImage } = require('canvas');
        
        // 获取裁剪参数
        const cropX = parseInt(req.body.cropX) || 0;
        const cropY = parseInt(req.body.cropY) || 0;
        const cropScale = (parseInt(req.body.cropScale) || 100) / 100;
        const cropTop = parseFloat(req.body.cropTop) || 0.4;
        CROP_TOP = cropTop;
        
        console.log('裁剪参数:', { cropX, cropY, cropScale, cropTop });
        
        const canvas = createCanvas(OUTPUT_WIDTH, OUTPUT_HEIGHT);
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
        
        const availableWidth = OUTPUT_WIDTH - (MARGIN * 2);
        const availableHeight = OUTPUT_HEIGHT - (MARGIN * 2);
        const rowHeight = availableHeight / ROW_COUNT;
        
        for (let i = 0; i < files.length; i++) {
            const img = await loadImage(files[i].path);
            
            // 固定裁剪：从 cupTop 开始到图片底部
            const srcX = Math.floor(img.width * CROP_SIDES);
            const srcY = Math.floor(img.height * CROP_TOP);
            const srcW = img.width - srcX * 2;
            const srcH = img.height - srcY;
            
            const cx = srcX;
            const cy = srcY;
            const cw = srcW;
            const ch = srcH;
            
            console.log(`图片${i+1}: 裁剪区域 [${cx.toFixed(0)}, ${cy.toFixed(0)}, ${cw.toFixed(0)}x${ch.toFixed(0)}]`);
            
            // 宽度撑满 3300px，高度等比缩放
            const scaleByWidth = availableWidth / cw;
            const scaledHeight = ch * scaleByWidth;
            
            let finalWidth = availableWidth;
            let finalHeight = scaledHeight;
            let offsetX = MARGIN;
            let offsetY;
            
            if (scaledHeight <= rowHeight) {
                // 高度不够，垂直居中
                offsetY = MARGIN + i * rowHeight + (rowHeight - scaledHeight) / 2;
            } else {
                // 高度超出，直接从顶部开始裁
                offsetY = MARGIN + i * rowHeight;
            }
            
            ctx.drawImage(
                img,
                cx, cy, cw, ch,
                offsetX, offsetY, finalWidth, finalHeight
            );
            
            fs.unlinkSync(files[i].path);
        }
        
        const outputName = 'cup-merged-' + Date.now() + '.jpg';
        const outputPath = path.join(uploadDir, outputName);
        const buffer = canvas.toBuffer('image/jpeg', { quality: 0.92 });
        fs.writeFileSync(outputPath, buffer);
        
        res.json({ success: true, output: '/uploads/' + outputName });
    } catch (err) {
        console.error('Merge error:', err);
        res.json({ success: false, error: err.message });
    }
});

// 批量合并接口
app.post('/batch-merge', upload.array('images', 100), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.json({ success: false, error: '请上传图片' });
        }

        const { createCanvas, loadImage } = require('canvas');
        
        // 按名称排序
        files.sort((a, b) => a.originalname.localeCompare(b.originalname));
        
        // 获取裁剪参数
        const cropX = parseInt(req.body.cropX) || 0;
        const cropY = parseInt(req.body.cropY) || 0;
        const cropScale = (parseInt(req.body.cropScale) || 100) / 100;
        const cropTop = parseFloat(req.body.cropTop) || 0.4;
        CROP_TOP = cropTop;
        
        const results = [];
        const groupCount = Math.ceil(files.length / 4);
        
        for (let g = 0; g < groupCount; g++) {
            const groupFiles = files.slice(g * 4, g * 4 + 4);
            
            const canvas = createCanvas(OUTPUT_WIDTH, OUTPUT_HEIGHT);
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
            
            const availableWidth = OUTPUT_WIDTH - (MARGIN * 2);
            const availableHeight = OUTPUT_HEIGHT - (MARGIN * 2);
            const rowHeight = availableHeight / ROW_COUNT;
            
            for (let i = 0; i < groupFiles.length; i++) {
                const img = await loadImage(groupFiles[i].path);
                
                const srcX = Math.floor(img.width * CROP_SIDES);
                const srcY = Math.floor(img.height * CROP_TOP);
                const srcW = img.width - srcX * 2;
                const srcH = img.height - srcY;
                
                const scaleByWidth = availableWidth / srcW;
                const scaledHeight = srcH * scaleByWidth;
                
                let offsetX = MARGIN;
                let offsetY;
                
                if (scaledHeight <= rowHeight) {
                    offsetY = MARGIN + i * rowHeight + (rowHeight - scaledHeight) / 2;
                } else {
                    offsetY = MARGIN + i * rowHeight;
                }
                
                ctx.drawImage(
                    img,
                    srcX, srcY, srcW, srcH,
                    offsetX, offsetY, availableWidth, scaledHeight
                );
                
                fs.unlinkSync(groupFiles[i].path);
            }
            
            const outputName = 'cup-batch-' + g + '-' + Date.now() + '.jpg';
            const outputPath = path.join(uploadDir, outputName);
            const buffer = canvas.toBuffer('image/jpeg', { quality: 0.92 });
            fs.writeFileSync(outputPath, buffer);
            
            results.push({
                index: g + 1,
                output: '/uploads/' + outputName
            });
        }
        
        res.json({ success: true, outputs: results });
    } catch (err) {
        console.error('Batch merge error:', err);
        res.json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log('CupCutTool running! Visit http://localhost:' + PORT);
});
