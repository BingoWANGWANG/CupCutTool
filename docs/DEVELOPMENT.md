# CupCutTool AI 开发助手文档

## 项目概述

**用途**：将 4 张图片垂直拼接为一张大图（3300×4400px），用于电商产品展示。

**核心技术栈**：Node.js + Express + Canvas + Multer

**运行端口**：3000

---

## 功能逻辑

### 单次上传模式
1. 用户点击上传区域，选择恰好 4 张图片
2. 点击「生成拼图」
3. 后端 `/merge` 接口处理，返回拼接结果
4. 前端展示并允许下载

### 文件夹批量模式
1. 用户点击「📁 上传文件夹」按钮
2. 选择整个文件夹
3. 前端按文件名排序，每 4 张为一组
4. 调用 `/batch-merge` 批量处理
5. 前端展示批量结果网格

### 裁剪参数
- `CROP_TOP`：裁剪起始位置比例（默认 0.4，即从 40% 高度开始裁剪）
- 用户可通过输入框动态调整，调整后自动重新生成

---

## 关键代码位置

### 后端接口
| 接口 | 路径 | 说明 |
|------|------|------|
| `POST /merge` | server.js ~line 1019 | 单次合并 4 张图片 |
| `POST /batch-merge` | server.js ~line 1100 | 批量处理 100+ 图片 |

### 前端状态变量
| 变量 | 说明 |
|------|------|
| `uploadedFiles[]` | 单次模式的图片数组 |
| `folderFiles[]` | 文件夹模式的图片数组（用于重新生成） |
| `cropSettings{}` | 裁剪参数 {x, y, scale, top} |

### 裁剪相关
- `CROP_TOP`：全局变量，位于 server.js 顶部（约 line 1009）
- 需要设置为 `let` 而非 `const` 以支持动态修改

---

## 版本历史

| 版本 | 日期 | 主要内容 |
|------|------|----------|
| v1.0.0 | 2026-04-03 | 首次发布，基础拼接功能 |
| v1.1.0 | 2026-04-03 | Nothing 风格 UI |
| v1.2.0 | 2026-04-03 | 两栏布局、下载按钮 |
| v1.3.0 | 2026-04-04 | 批量处理功能、裁剪参数可调 |
| v1.4.0 | 2026-04-04 | 界面优化、确认剪裁按钮 |

---

---

## 常见问题排查

### 1. 按钮点击无反应
- 检查 `input[type="file"]` 是否被 `display: none` 隐藏但没有设置可点击区域
- 解决方案：使用 `opacity: 0; position: absolute` 覆盖

### 2. 文件夹上传弹窗出现两次
- 原因：`folderInput` 在 `dropArea` 内部，点击时冒泡触发两次
- 解决方案：将 `folderInput` 移到 `dropArea` 外部

### 3. 修改裁剪参数后无法重新生成
- 原因：批量模式的文件没有保存
- 解决方案：使用 `folderFiles[]` 数组保存文件引用

### 4. 服务器重启后页面不更新
- 原因：express.static 优先返回 public/index.html
- 解决方案：删除 public/index.html 或确保 server.js 内联 HTML 最新

---

## Git 分支规范

- 分支名使用中文（如 `批处理`、`main`）
- 每次功能完成后退需要更新 CHANGELOG.md
- 版本号格式：`vX.Y.Z`

## CHANGELOG 格式

```markdown
## [vX.Y.Z] - YYYY-MM-DD

### 新增功能
- 功能描述

### 修复问题
- 修复描述

### 代码优化
- 优化描述
```

---

## 启动命令

```bash
cd /Users/bingo/Documents/VibeCoding
npm start
# 或
node server.js
```

如需重启：
```bash
pkill -f "node server" && npm start
```

---

## 文件夹结构

```
CupCutTool/
├── server.js          # 主服务器文件（含 HTML/CSS/JS）
├── package.json
├── CHANGELOG.md       # 更新日志
├── README.md          # 开发文档
├── docs/
│   ├── PRODUCT.md     # 用户文档
│   └── DEVELOPMENT.md # AI 开发文档（本文件）
└── public/
    └── uploads/       # 上传目录（自动创建）
```
