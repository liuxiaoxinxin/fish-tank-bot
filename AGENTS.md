# AGENTS.md

本仓库是**鱼缸壁面清洁机器人**的结构设计文档库。所有文档是**单页 HTML + 内联 SVG**，
用浏览器直接打开即可阅读（无需构建、无需服务器）。

**本文件是文档设计风格的唯一真实来源。** 修改任何 HTML 之前先读这里；
改样式只改 `assets/notion.css`，不要往 HTML 里写 `<style>`。

---

## 1. 仓库结构

```
fish-tank-bot/
├── AGENTS.md          ← 本文件：设计规范（唯一真实来源）
├── CLAUDE.md          ← 仅 @AGENTS.md 一行，指向本文件
├── README.md          ← 文档索引
├── assets/
│   ├── notion.css     ← 全部样式。改外观只动这里
│   └── toc.js         ← 左侧目录：滚动高亮 + 移动端开合
├── suction.html       ← 吸附单元设计
├── motion.html        ← 运动单元设计
└── work.html          ← 作业机构设计
```

样式与脚本是**共享**的，两个 HTML 都从 `assets/` 引用。
因此文档必须和 `assets/` 保持相对位置，不要单独把某个 HTML 拷走。

---

## 2. 设计风格：Notion

### 2.1 每篇文档的必备骨架

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>鱼缸壁面清洁机器人 — XXX 设计</title>
<link rel="stylesheet" href="assets/notion.css">
</head>
<body>
<nav class="side" id="side">
  <div class="side-doc"><span class="side-icon">🧲</span><span class="side-name">吸附单元设计</span></div>
  <div class="side-label">目录</div>
  <ul class="side-list">
    <li><a href="#s1">1 · 章节标题</a></li>
    <li class="lv2"><a href="#s1a1">A · 小节标题</a></li>
  </ul>
</nav>
<button class="side-btn" type="button" aria-label="目录">&#9776;</button>
<main class="page">
<div class="page-inner">

<header>
  <div class="page-icon">🧲</div>
  <h1>鱼缸壁面清洁机器人 — 吸附单元设计</h1>
  <p class="sub">一句话副标题</p>
</header>

<!-- 正文 -->

<footer>说明文字</footer>
</div>
</main>
<script src="assets/toc.js"></script>
</body>
</html>
```

**五条硬性要求**（缺一个就不算合规）：

1. 只通过 `<link>` 引 `assets/notion.css`，**绝不写内联 `<style>`**
2. 有左侧目录导航 `.side`
3. `</body>` 前引 `assets/toc.js`
4. 正文开头是 `<header>` + `<div class="page-icon">` + `<h1>`
5. 正文包在 `<main class="page"><div class="page-inner">` 里

### 2.2 标题层级

| 层级 | 元素 | 字号 | 编号徽标 | 用途 |
|---|---|---|---|---|
| 文档标题 | `<h1>` | 40px | 无 | 每篇只有**一个**，放在 `<header>` 里 |
| 一级章节 | `<h2 id="sN">` | 24px | `<span class="n">1</span>` 数字 | 正文分节 |
| 小节 | `<h3 id="sNaM">` | 20px | `<span class="n">A</span>` 字母 | 章节内的子话题 |
| 段落标题 | `<h4>` | 16px | 无 | 少用 |

```html
<h2 id="s3"><span class="n">3</span>剥离力矩分析 — 决定吸盘直径的关键</h2>
<p class="cap">章节导语，灰色小字。</p>

<h3 id="s3a1"><span class="n">A</span>单吸盘的危险</h3>
```

**编号徽标是必需的**，它是视觉锚点也是目录的排序依据。不要跳级（h2 下面直接跟 h4）。

### 2.3 目录导航

目录**不是自动生成的**，加/删章节后必须手工同步。命名规则：

- `<h2 id="s3">` → 目录项 `<li><a href="#s3" title="3 · 标题">3 · 标题</a></li>`
- `<h3 id="s3a1">` → 目录项 `<li class="lv2"><a href="#s3a1" title="A · 标题">A · 标题</a></li>`
- 目录文字 = `编号 + " · " + 标题纯文本`（去掉 `<span class="n">` 和 `<span class="tag">`）
- **`title` 属性必填**：侧栏是 264px 单行，长标题会被 `text-overflow:ellipsis` 截断，
  靠 `title` 提供悬停全文

改完跑一遍自检，确认锚点全部命中：

```bash
python3 -c "
import re
for f in ('suction.html','motion.html'):
    s=open(f,encoding='utf-8').read()
    a=re.findall(r'<a href=\"#([^\"]+)\"',s); i=set(re.findall(r'<h[23] id=\"([^\"]+)\"',s))
    print(f, len(a), 'missing:', [x for x in a if x not in i])
"
```

`toc.js` 会按滚动位置给当前章节加 `.on` 高亮，无需手工维护。

### 2.4 内容块词表

用这些 class，不要自创：

| class | 渲染成 | 什么时候用 |
|---|---|---|
| `<p class="cap">` | 灰色导语 | 紧跟 `<h2>`/`<h3>` 后面，一句话说明这节讲什么 |
| `<div class="keybox">` | **黄色提示框**（无图标） | 全文最顶上的「结论先行」。**每篇最多一个** |
| `<div class="formula">` | **灰色提示框 + 💡** | 公式、推导、关键结论、选型建议 |
| `<div class="formula w">` | **红色提示框 + ⚠️** | 风险、禁止事项、硬约束 |
| `<ul class="pts">` | 圆点列表 | 并列的要点。`<li class="w">` 让圆点变红 |
| `<table>` + `.hl` / `.bad` | 表格，行有绿/红底 | 参数对比。`.hl` = 推荐项，`.bad` = 淘汰项 |
| `<div class="legend">` | 带圈数字的图例 | 配在 `.figrow` 里，对应 SVG 上的编号标注 |
| `<div class="figrow">` | 图 + 图例左右并排 | SVG 和图例并排时用；窄屏自动换行 |
| `<span class="tag">` | 绿色小标签 | 标题里的状态标注。`.tag.w` 红、`.tag.b` 蓝 |

**`.keybox` 和 `.formula` 里的标题用 `<h3>`，但样式由 `.keybox h3` 单独覆盖**，
不会变成 20px 小节标题，放心用。

### 2.5 颜色

**不要在 HTML 里写死十六进制颜色**，用 `assets/notion.css` 里的 CSS 变量：

```
--fg / --fg-2 / --fg-3          文本：主要 / 次要 / 弱化
--line / --line-2               分隔线
--callout                       提示框底
--red-fg  --red-bg              风险
--green-fg --green-bg           推荐 / 正确
--blue-fg  --blue-bg            中性提示、水压
--orange-fg --orange-bg         力、压强
--yellow-bg                     keybox 底色
```

Notion 原生色板，不要再引入新颜色。

**历史遗留变量别名**（`--ink` / `--ink-2` / `--ink-3` / `--bg` / `--card` /
`--teal` / `--teal-d` / `--warn` / `--blue`）在正文内联样式里仍在用，
**不要从 CSS 里删掉**。新代码一律用上面的新名字。

### 2.6 配图（内联 SVG）

- 用 `viewBox` + `style="width:100%;height:auto"`，让它自适应正文宽度
- **每个 SVG 里的 `id` 必须加图号前缀**（`f1Glass`、`f7Cup`…）。
  多个 SVG 在同一个页面里共享 id 命名空间，不加前缀会导致渐变／marker 串图。
- 图内标注用这三个 class，不要写死颜色：
  - `.s-lbl` 主标注（深色、600 字重）
  - `.s-sub` 次要说明（灰色）
  - `.s-w` 警告标注（红色）
- 力的箭头统一：蓝 `#2b7fd4` = 重力／水压，红 `#d9694a` = 剥离／危险，青绿 = 吸附相关
- 比例和形变幅度可以夸张，但**页脚要写明**：「非工程图纸 · 比例与形变幅度均已夸张处理」

---

## 3. 新增一篇文档

1. 复制第 2.1 节的骨架
2. 选一个 `page-icon` emoji（现有：吸附单元 🧲、运动单元 ⚙️、作业机构 🧹）
3. 按 2.2 写标题、按 2.3 写目录
4. 内容用 2.4 的词表
5. 跑 2.3 的自检脚本
6. 把新文档加进 `README.md` 索引

---

## 4. 写作约定

- **语言**：简体中文。技术术语保留英文原词（RPR、PDMS、Shore A、SF）
- **数字**：公式用 `<code>` 包起来；单位用 `N·m` `mm` `kPa`，乘号用 `·`
- **口吻**：直接给判断和数字，不说「可能」「也许」。风险要写清楚**后果**和**对策**
- **每节结尾**：给可执行的结论，不要只描述现象
- **参数要跨文档一致**：改一个参数（吸盘直径、丝杆导程、膜片尺寸）必须
  全文搜索另一个文档同步。目前基准配置：
  **∅25 吸盘 / ∅20 膜片 / 0.3 mm 丝杆导程 / −25 kPa / 有效重量 0.3–0.5 N**

---

## 5. 已知的坑

- **SVG id 冲突**：见 2.6。加新图时第一件事就是起前缀
- **`file://` 打开**：`<link>` 和 `<script src>` 都能正常加载，但如果只拷贝 HTML
  而不带 `assets/`，样式会全丢
- **窄屏**：≤860px 时侧栏收起、右下角出现汉堡按钮。新加的内容块要在这个宽度下检查一遍
