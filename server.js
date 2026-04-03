const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const OUTPUT_WIDTH = 3300;
const OUTPUT_HEIGHT = 4400;
const ROW_COUNT = 4;
const MARGIN = 60;

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
            </div>
            
            <div class="preview-list" id="previewList"></div>
            
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
            </div>
        </div>
    </div>
    
    <script>
        let uploadedFiles = [];
        
        const dropArea = document.getElementById('dropArea');
        const fileInput = document.getElementById('fileInput');
        const previewList = document.getElementById('previewList');
        const mergeBtn = document.getElementById('mergeBtn');
        const clearBtn = document.getElementById('clearBtn');
        const loading = document.getElementById('loading');
        const resultArea = document.getElementById('resultArea');
        const resultPlaceholder = document.getElementById('resultPlaceholder');
        const resultContent = document.getElementById('resultContent');
        const resultImage = document.getElementById('resultImage');
        
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
        }
        
        window.removeImage = function(index) {
            uploadedFiles.splice(index, 1);
            updateUI();
        };
        
        clearBtn.addEventListener('click', () => {
            uploadedFiles = [];
            resultImage.src = '';
            resultContent.classList.remove('active');
            resultPlaceholder.style.display = 'block';
            updateUI();
        });
        
        mergeBtn.addEventListener('click', async () => {
            if (uploadedFiles.length !== 4) return;
            
            loading.classList.add('active');
            resultPlaceholder.style.display = 'none';
            resultContent.classList.remove('active');
            
            const formData = new FormData();
            uploadedFiles.forEach((file, i) => {
                formData.append('images', file);
            });
            
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

app.post('/merge', upload.array('images'), async (req, res) => {
    try {
        if (!req.files || req.files.length !== 4) {
            return res.json({ success: false, error: '请上传 4 张图片' });
        }

        const { createCanvas, loadImage } = require('canvas');
        
        const canvas = createCanvas(OUTPUT_WIDTH, OUTPUT_HEIGHT);
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
        
        const availableWidth = OUTPUT_WIDTH - (MARGIN * 2);
        const availableHeight = OUTPUT_HEIGHT - (MARGIN * 2);
        const rowHeight = availableHeight / ROW_COUNT;
        
        for (let i = 0; i < req.files.length; i++) {
            const img = await loadImage(req.files[i].path);
            
            const tempCanvas = createCanvas(img.width, img.height);
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0);
            
            const bounds = getContentBounds(tempCtx, img);
            const croppedWidth = bounds.maxX - bounds.minX;
            const croppedHeight = bounds.maxY - bounds.minY;
            
            const scale = availableWidth / croppedWidth;
            const scaledWidth = croppedWidth * scale;
            const scaledHeight = croppedHeight * scale;
            
            let finalWidth, finalHeight, offsetX, offsetY;
            
            if (scaledHeight <= rowHeight) {
                finalWidth = scaledWidth;
                finalHeight = scaledHeight;
                offsetX = MARGIN;
                offsetY = MARGIN + i * rowHeight + (rowHeight - scaledHeight) / 2;
            } else {
                const scaleByHeight = rowHeight / croppedHeight;
                finalWidth = croppedWidth * scaleByHeight;
                finalHeight = rowHeight;
                offsetX = MARGIN + (availableWidth - finalWidth) / 2;
                offsetY = MARGIN + i * rowHeight;
            }
            
            ctx.drawImage(
                img,
                bounds.minX, bounds.minY, croppedWidth, croppedHeight,
                offsetX, offsetY, finalWidth, finalHeight
            );
            
            fs.unlinkSync(req.files[i].path);
        }
        
        const outputName = 'cup-merged-' + Date.now() + '.png';
        const outputPath = path.join(uploadDir, outputName);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
        
        res.json({ success: true, output: '/uploads/' + outputName });
    } catch (err) {
        console.error('Merge error:', err);
        res.json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log('CupCutTool running! Visit http://localhost:' + PORT);
});
