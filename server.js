const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const OUTPUT_WIDTH = 3300;
const OUTPUT_HEIGHT = 4400;
const ROW_COUNT = 4;
const MARGIN = 80;

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
        @font-face {
            font-family: 'Space Grotesk';
            src: local('Space Grotesk Bold'), local('SpaceGrotesk-Bold');
            font-weight: 600;
            font-style: normal;
        }
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: 'Space Grotesk', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #f5f5f5;
            color: #111;
            min-height: 100vh;
            position: relative;
        }
        
        /* Dot Grid Background */
        .dot-grid {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: radial-gradient(circle, #ccc 1px, transparent 1px);
            background-size: 24px 24px;
            pointer-events: none;
            z-index: 0;
        }
        
        /* Header */
        header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            background: rgba(245, 245, 245, 0.9);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid #e0e0e0;
        }
        
        .header-inner {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 2px;
        }
        
        .menu-icon {
            width: 24px;
            height: 16px;
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
        
        /* Main Content */
        main {
            position: relative;
            z-index: 1;
            padding-top: 100px;
        }
        
        /* Hero Section */
        .hero {
            text-align: center;
            padding: 80px 40px 60px;
        }
        
        h1 {
            font-size: 48px;
            font-weight: 500;
            letter-spacing: -1px;
            margin-bottom: 16px;
        }
        
        .subtitle {
            font-size: 16px;
            color: #666;
            font-weight: 300;
        }
        
        /* Upload Zone */
        .upload-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 0 40px 80px;
        }
        
        .drop-area {
            border: 1px dashed #ccc;
            border-radius: 16px;
            padding: 60px 40px;
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
            transform: scale(1.02);
        }
        
        .drop-icon {
            font-size: 32px;
            margin-bottom: 16px;
            color: #999;
        }
        
        .drop-text {
            font-size: 15px;
            color: #333;
            margin-bottom: 8px;
        }
        
        .drop-hint {
            font-size: 13px;
            color: #999;
        }
        
        input[type="file"] {
            display: none;
        }
        
        /* Specs */
        .specs {
            display: flex;
            justify-content: center;
            gap: 48px;
            padding: 40px;
            border-top: 1px solid #e0e0e0;
            border-bottom: 1px solid #e0e0e0;
            background: rgba(255,255,255,0.5);
        }
        
        .spec {
            text-align: center;
        }
        
        .spec-value {
            font-size: 20px;
            font-weight: 500;
            margin-bottom: 4px;
        }
        
        .spec-label {
            font-size: 11px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        /* Preview Section */
        .preview-section {
            max-width: 900px;
            margin: 0 auto;
            padding: 60px 40px;
        }
        
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
        }
        
        .section-title {
            font-size: 12px;
            color: #999;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        
        .preview-count {
            font-size: 12px;
            color: #999;
        }
        
        .preview-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .preview-item {
            position: relative;
            aspect-ratio: 1;
            border-radius: 12px;
            overflow: hidden;
            background: #fff;
            border: 1px solid #e8e8e8;
        }
        
        .preview-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .preview-item .remove {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 28px;
            height: 28px;
            background: rgba(0,0,0,0.7);
            border-radius: 50%;
            color: #fff;
            border: none;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.2s;
        }
        
        .preview-item:hover .remove {
            opacity: 1;
        }
        
        .preview-item .remove:hover {
            background: #111;
        }
        
        .preview-index {
            position: absolute;
            bottom: 8px;
            left: 8px;
            font-size: 11px;
            color: #999;
            background: rgba(255,255,255,0.9);
            padding: 4px 10px;
            border-radius: 12px;
        }
        
        .preview-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ddd;
            font-size: 24px;
        }
        
        /* Actions */
        .actions {
            display: flex;
            gap: 16px;
            justify-content: center;
        }
        
        .btn {
            padding: 14px 40px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 0.5px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
        }
        
        .btn-primary {
            background: #111;
            color: #fff;
            border: 1px solid #111;
        }
        
        .btn-primary:hover {
            background: #333;
        }
        
        .btn-primary:disabled {
            background: #ccc;
            border-color: #ccc;
            cursor: not-allowed;
        }
        
        .btn-secondary {
            background: transparent;
            color: #666;
            border: 1px solid #ccc;
        }
        
        .btn-secondary:hover {
            border-color: #111;
            color: #111;
        }
        
        /* Loading */
        .loading {
            display: none;
            flex-direction: column;
            align-items: center;
            padding: 60px;
        }
        
        .loading.active {
            display: flex;
        }
        
        .spinner {
            width: 32px;
            height: 32px;
            border: 1px solid #e0e0e0;
            border-top-color: #111;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .loading-text {
            font-size: 13px;
            color: #999;
        }
        
        /* Result */
        .result {
            display: none;
            text-align: center;
            padding: 40px;
        }
        
        .result.active {
            display: block;
        }
        
        .result img {
            max-width: 100%;
            border-radius: 12px;
            border: 1px solid #e8e8e8;
            margin-bottom: 12px;
        }
        
        .result-hint {
            font-size: 12px;
            color: #999;
        }
        
        /* Floating Button */
        .floating-btn {
            position: fixed;
            bottom: 32px;
            left: 50%;
            transform: translateX(-50%);
            padding: 14px 32px;
            background: rgba(255,255,255,0.9);
            backdrop-filter: blur(10px);
            border: 1px solid #e0e0e0;
            border-radius: 50px;
            font-size: 12px;
            color: #666;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 100;
            display: none;
        }
        
        .floating-btn:hover {
            background: #fff;
            border-color: #111;
            color: #111;
        }
        
        .floating-btn.visible {
            display: block;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            h1 { font-size: 32px; }
            .specs { flex-wrap: wrap; gap: 24px; }
            .preview-grid { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div class="dot-grid"></div>
    
    <header>
        <div class="header-inner">
            <div class="logo">CUPCUTTOOL</div>
            <div class="menu-icon">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </header>
    
    <main>
        <section class="hero">
            <h1>图片拼接工具</h1>
            <p class="subtitle">将多张图片快速拼接为一张整齐的拼图</p>
        </section>
        
        <div class="upload-container">
            <div class="drop-area" id="dropArea">
                <div class="drop-icon">+</div>
                <p class="drop-text">点击或拖拽上传图片</p>
                <p class="drop-hint">上传 4 张图片进行拼接</p>
                <input type="file" id="fileInput" multiple accept="image/*">
            </div>
        </div>
        
        <div class="specs">
            <div class="spec">
                <div class="spec-value">3300</div>
                <div class="spec-label">宽度 px</div>
            </div>
            <div class="spec">
                <div class="spec-value">4400</div>
                <div class="spec-label">高度 px</div>
            </div>
            <div class="spec">
                <div class="spec-value">4</div>
                <div class="spec-label">图片行数</div>
            </div>
            <div class="spec">
                <div class="spec-value">PNG</div>
                <div class="spec-label">输出格式</div>
            </div>
        </div>
        
        <section class="preview-section" id="previewSection" style="display:none;">
            <div class="section-header">
                <span class="section-title">已上传</span>
                <span class="preview-count" id="previewCount">0 / 4</span>
            </div>
            <div class="preview-grid" id="previewGrid"></div>
            <div class="actions">
                <button class="btn btn-primary" id="mergeBtn" disabled>生成拼图</button>
                <button class="btn btn-secondary" id="clearBtn">重新选择</button>
            </div>
        </section>
        
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p class="loading-text">处理中...</p>
        </div>
        
        <div class="result" id="result">
            <img id="resultImage" src="" alt="Result">
            <p class="result-hint">右键点击图片保存到本地</p>
        </div>
    </main>
    
    <button class="floating-btn" id="floatingBtn">↑ 生成拼图</button>
    
    <script>
        let uploadedFiles = [];
        
        const dropArea = document.getElementById('dropArea');
        const fileInput = document.getElementById('fileInput');
        const previewSection = document.getElementById('previewSection');
        const previewGrid = document.getElementById('previewGrid');
        const previewCount = document.getElementById('previewCount');
        const mergeBtn = document.getElementById('mergeBtn');
        const clearBtn = document.getElementById('clearBtn');
        const loading = document.getElementById('loading');
        const result = document.getElementById('result');
        const resultImage = document.getElementById('resultImage');
        const floatingBtn = document.getElementById('floatingBtn');
        
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
            if (uploadedFiles.length > 0) {
                previewSection.style.display = 'block';
                floatingBtn.classList.add('visible');
            } else {
                previewSection.style.display = 'none';
                floatingBtn.classList.remove('visible');
            }
            
            previewCount.textContent = uploadedFiles.length + ' / 4';
            
            previewGrid.innerHTML = '';
            
            for (let i = 0; i < 4; i++) {
                const div = document.createElement('div');
                div.className = 'preview-item';
                
                if (uploadedFiles[i]) {
                    div.innerHTML = '<img src="' + URL.createObjectURL(uploadedFiles[i]) + '" alt="Preview"><button class="remove" onclick="removeImage(' + i + ')">×</button><span class="preview-index">' + (i + 1) + '</span>';
                } else {
                    div.innerHTML = '<div class="preview-placeholder">' + (i + 1) + '</div>';
                }
                
                previewGrid.appendChild(div);
            }
            
            mergeBtn.disabled = uploadedFiles.length !== 4;
            floatingBtn.disabled = uploadedFiles.length !== 4;
        }
        
        window.removeImage = function(index) {
            uploadedFiles.splice(index, 1);
            updateUI();
        };
        
        clearBtn.addEventListener('click', () => {
            uploadedFiles = [];
            result.classList.remove('active');
            updateUI();
        });
        
        floatingBtn.addEventListener('click', () => {
            if (uploadedFiles.length === 4) {
                mergeBtn.click();
            }
        });
        
        mergeBtn.addEventListener('click', async () => {
            if (uploadedFiles.length !== 4) return;
            
            loading.classList.add('active');
            result.classList.remove('active');
            floatingBtn.classList.remove('visible');
            
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
                    result.classList.add('active');
                    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    alert('错误: ' + data.error);
                }
            } catch (err) {
                alert('请求失败: ' + err.message);
            }
            
            loading.classList.remove('active');
            floatingBtn.classList.add('visible');
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
