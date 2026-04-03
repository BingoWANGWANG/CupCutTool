const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 输出图片尺寸
const OUTPUT_WIDTH = 3300;
const OUTPUT_HEIGHT = 4400;
const ROW_COUNT = 4;
const MARGIN = 80; // 边距

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 静态文件服务
app.use(express.static('public'));
app.use('/uploads', express.static(uploadDir));

// 文件上传配置
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

// 首页
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CupCutTool - 杯子拼图工具</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 900px; margin: 0 auto; }
        h1 { color: white; text-align: center; margin-bottom: 30px; font-size: 2.5em; }
        .card { background: white; border-radius: 16px; padding: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .info { background: #e8f4ff; border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 14px; color: #333; }
        .info strong { color: #667eea; }
        .upload-area { border: 3px dashed #667eea; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.3s; margin-bottom: 20px; }
        .upload-area:hover { border-color: #764ba2; background: #f8f4ff; }
        .upload-area p { color: #666; margin-top: 10px; }
        .preview-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
        .preview-item { position: relative; border-radius: 8px; overflow: hidden; border: 2px solid #eee; }
        .preview-item img { width: 100%; height: 200px; object-fit: cover; display: block; }
        .preview-item .remove { position: absolute; top: 5px; right: 5px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px; }
        .preview-item .label { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; padding: 5px; font-size: 12px; text-align: center; }
        .btn { display: inline-block; padding: 12px 30px; border-radius: 8px; border: none; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; margin: 5px; }
        .btn-primary { background: #667eea; color: white; }
        .btn-primary:hover { background: #764ba2; transform: translateY(-2px); }
        .btn-secondary { background: #6c757d; color: white; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .result { margin-top: 20px; text-align: center; }
        .result img { max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .loading { display: none; text-align: center; padding: 20px; }
        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        input[type="file"] { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>CupCutTool</h1>
        <div class="card">
            <div class="info">
                <strong>使用方法：</strong> 上传4张图片，每张图片包含一行杯子（每行4个）。<br>
                输出图片尺寸：<strong>3300 × 4400 px</strong>（4行，每行对应一张输入图片）。
            </div>
            <div class="upload-area" id="uploadArea">
                <p style="font-size: 48px;">📁</p>
                <p><strong>点击或拖拽上传图片</strong></p>
                <p>请上传 <strong>4张</strong> 图片，每张对应一行杯子</p>
                <p style="color:#888;font-size:12px;margin-top:5px;">支持 JPG, PNG</p>
                <input type="file" id="fileInput" multiple accept="image/*">
            </div>
            <div class="preview-grid" id="previewGrid"></div>
            <div style="text-align: center;">
                <button class="btn btn-primary" id="mergeBtn" disabled>🔗 生成拼图</button>
                <button class="btn btn-secondary" id="clearBtn">🗑️ 清除全部</button>
            </div>
            <div class="loading" id="loading"><div class="spinner"></div><p style="margin-top: 15px;">处理中，请稍候...</p></div>
            <div class="result" id="result"></div>
        </div>
    </div>
    <script>
        let uploadedFiles = [];
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const previewGrid = document.getElementById('previewGrid');
        const mergeBtn = document.getElementById('mergeBtn');
        const clearBtn = document.getElementById('clearBtn');
        const loading = document.getElementById('loading');
        const result = document.getElementById('result');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.style.borderColor = '#764ba2'; uploadArea.style.background = '#f8f4ff'; });
        uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = '#667eea'; uploadArea.style.background = 'transparent'; });
        uploadArea.addEventListener('drop', (e) => { e.preventDefault(); uploadArea.style.borderColor = '#667eea'; uploadArea.style.background = 'transparent'; handleFiles(e.dataTransfer.files); });
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

        function handleFiles(files) {
            const remainingSlots = 4 - uploadedFiles.length;
            const filesToAdd = Array.from(files).slice(0, remainingSlots);
            filesToAdd.forEach(file => { if (uploadedFiles.length < 4 && file.type.startsWith('image/')) { uploadedFiles.push(file); } });
            updateUI();
        }

        function updateUI() {
            previewGrid.innerHTML = '';
            uploadedFiles.forEach((file, index) => {
                const div = document.createElement('div');
                div.className = 'preview-item';
                div.innerHTML = '<img src="' + URL.createObjectURL(file) + '" alt="Preview"><button class="remove" onclick="removeImage(' + index + ')">×</button><div class="label">第 ' + (index + 1) + ' 行</div>';
                previewGrid.appendChild(div);
            });
            mergeBtn.disabled = uploadedFiles.length !== 4;
        }

        window.removeImage = function(index) { uploadedFiles.splice(index, 1); updateUI(); };

        clearBtn.addEventListener('click', () => { uploadedFiles = []; updateUI(); result.innerHTML = ''; });

        mergeBtn.addEventListener('click', async () => {
            if (uploadedFiles.length !== 4) return;
            loading.style.display = 'block';
            result.innerHTML = '';
            const formData = new FormData();
            uploadedFiles.forEach((file, i) => { formData.append('images', file); });
            try {
                const response = await fetch('/merge', { method: 'POST', body: formData });
                const data = await response.json();
                if (data.success) { result.innerHTML = '<p><strong>拼图完成！</strong></p><img src="' + data.output + '" alt="Merged Result">'; }
                else { result.innerHTML = '<p style="color:red;">错误: ' + data.error + '</p>'; }
            } catch (err) { result.innerHTML = '<p style="color:red;">请求失败: ' + err.message + '</p>'; }
            loading.style.display = 'none';
        });
    </script>
</body>
</html>`);
});

// 获取图片的内容边界（裁剪空白区域）
function getContentBounds(ctx, img, threshold = 240) {
    const width = img.width;
    const height = img.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    let minX = width, minY = height, maxX = 0, maxY = 0;
    
    // 扫描非白色区域
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // 如果不是白色/近白色，认为是内容区域
            if (r < threshold || g < threshold || b < threshold) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    
    // 添加一点边距
    const padding = 20;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width - 1, maxX + padding);
    maxY = Math.min(height - 1, maxY + padding);
    
    return { minX, minY, maxX, maxY };
}

// 图片拼接接口
app.post('/merge', upload.array('images'), async (req, res) => {
    try {
        if (!req.files || req.files.length !== 4) {
            return res.json({ success: false, error: '请上传 4 张图片' });
        }

        const { createCanvas, loadImage } = require('canvas');
        
        // 创建输出画布
        const canvas = createCanvas(OUTPUT_WIDTH, OUTPUT_HEIGHT);
        const ctx = canvas.getContext('2d');
        
        // 白色背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
        
        // 可用宽度（左右留边距）
        const availableWidth = OUTPUT_WIDTH - (MARGIN * 2);
        const availableHeight = OUTPUT_HEIGHT - (MARGIN * 2);
        const rowHeight = availableHeight / ROW_COUNT;
        
        // 处理每张图片
        for (let i = 0; i < req.files.length; i++) {
            const img = await loadImage(req.files[i].path);
            
            // 创建临时画布获取边界
            const tempCanvas = createCanvas(img.width, img.height);
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0);
            
            // 获取内容边界
            const bounds = getContentBounds(tempCtx, img);
            const contentWidth = bounds.maxX - bounds.minX;
            const contentHeight = bounds.maxY - bounds.minY;
            
            // 裁剪后的内容区域
            const croppedWidth = contentWidth;
            const croppedHeight = contentHeight;
            
            // 计算缩放：让裁剪后的内容填充一行的宽度
            const scale = availableWidth / croppedWidth;
            const scaledWidth = croppedWidth * scale;
            const scaledHeight = croppedHeight * scale;
            
            // 如果缩放后高度超过一行，进行调整
            let finalWidth, finalHeight, offsetX, offsetY;
            
            if (scaledHeight <= rowHeight) {
                // 高度OK，宽度铺满，垂直居中
                finalWidth = scaledWidth;
                finalHeight = scaledHeight;
                offsetX = MARGIN;
                offsetY = MARGIN + i * rowHeight + (rowHeight - scaledHeight) / 2;
            } else {
                // 高度超出，用高度填充
                const scaleByHeight = rowHeight / croppedHeight;
                finalWidth = croppedWidth * scaleByHeight;
                finalHeight = rowHeight;
                offsetX = MARGIN + (availableWidth - finalWidth) / 2;
                offsetY = MARGIN + i * rowHeight;
            }
            
            // 绘制裁剪后的内容
            ctx.drawImage(
                img,
                bounds.minX, bounds.minY, croppedWidth, croppedHeight,  // 源区域
                offsetX, offsetY, finalWidth, finalHeight                // 目标区域
            );
            
            // 清理上传的文件
            fs.unlinkSync(req.files[i].path);
        }
        
        // 保存输出文件
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
