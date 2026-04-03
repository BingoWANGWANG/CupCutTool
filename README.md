# CupCutTool 开发文档

## 项目信息

- **项目名称**: CupCutTool
- **描述**: 图片拼接工具，将 4 张图片拼接成一张
- **输出尺寸**: 3300 × 4400 px
- **分支命名**: 中文命名（如 `main`、`批处理`）
- **当前最新版本**: v1.3.0

## 版本号规范

格式: `vX.Y.Z`
- X: 主版本号（大功能迭代）
- Y: 次版本号（功能新增/优化）
- Z: 修订号（bug 修复、小改动）

**注意**: 每次 commit message 不需要写版本号，但在 CHANGELOG.md 中必须标注当前版本号。

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

**示例**:
```markdown
## [v1.3.0] - 2026-04-04

### 新增功能
- 批量处理功能
  - 支持上传整个文件夹
  - 图片按名称自动排序
  - 每 4 张为一组生成拼图

### 修复问题
- 修复文件夹上传重复弹窗
```

## Git 分支管理

- `main`: 稳定版本，生产环境
- 功能分支: 使用中文命名，如 `批处理`、`功能优化`
- 合并后删除不需要的分支

## 常用命令

```bash
# 启动服务器
npm start

# 或手动
pkill -f "node server" 2>/dev/null
node server.js

# 提交代码
git add -A
git commit -m "提交信息"
git push origin <分支名>
```

## 代码结构

### 端口
- 开发服务器运行在 `http://localhost:3000`

### 关键变量
- `OUTPUT_WIDTH`: 3300
- `OUTPUT_HEIGHT`: 4400
- `ROW_COUNT`: 4
- `CROP_TOP`: 0.40 (裁剪顶部比例，可调)
- `MARGIN`: 0

### 主要接口
- `POST /merge`: 单次合并 4 张图片
- `POST /batch-merge`: 批量处理（支持 100+ 图片）

### 前端状态
- `uploadedFiles[]`: 当前上传的图片数组
- `folderFiles[]`: 文件夹模式上传的图片数组
- `cropSettings`: 裁剪设置 {x, y, scale, top}
