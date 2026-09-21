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
├── README.md          ← 文档索引（Markdown）
├── index.html         ← 文档总目录（浏览入口，双栏卡片）
├── assets/
│   ├── notion.css     ← 全部样式。改外观只动这里
│   └── toc.js         ← 左侧目录：滚动高亮 + 移动端开合
├── suction.html       ← 吸附单元设计
├── motion.html        ← 运动单元设计
├── work.html          ← 作业机构设计
├── body.html          ← 主体设计
├── dock.html          ← 充电坞站设计
├── ctrl.html          ← 主控与传感器设计
├── bom.html           ← Demo 样机物料清单
└── model.html         ← 整机三维示意（three.js，见第 6 节）
```

样式与脚本是**共享**的，所有 HTML 都从 `assets/` 引用。
因此文档必须和 `assets/` 保持相对位置，不要单独把某个 HTML 拷走。

`model.html` 是唯一例外：它的三维代码**全部内联在 HTML 里**，
不从 `assets/` 引脚本。原因见第 6 节。其余四条规定它一样要守。

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
import re, glob
for f in sorted(glob.glob('*.html')):
    s = open(f, encoding='utf-8').read()
    a = re.findall(r'<a href=\"#([^\"]+)\"', s)
    i = set(re.findall(r'<h[23] id=\"([^\"]+)\"', s))
    toc = re.search(r'<ul class=\"side-list\">(.*?)</ul>', s, re.S)
    t = re.findall(r'<a href=\"#([^\"]+)\"(?![^>]*title=)', toc.group(1)) if toc else []
    print(f, len(a), 'missing:', [x for x in a if x not in i], 'toc-no-title:', t)
"
```

`missing` 要为空（正文里的交叉引用链接也算在内），`toc-no-title` 要为空
（`title` 只对**目录项**是必填的，正文里「见第 7 节」这种链接不需要）。

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
| `<div class="legend">` | 带圈数字的图例 | 配在 `.figrow` 里，或跟在全宽 `<svg style="width:100%;height:auto">` 之后。对应 SVG 上的编号标注 |
| `<div class="figrow">` | 图 + 图例左右并排 | SVG 和图例并排时用；窄屏自动换行。CSS 给 `.figrow svg` 加了 `max-width:520px`，所以它只适合**最小字号 ≥12 px** 的图；标 11 px 的细图要用全宽 |
| `<ul class="doclist">` | 双栏文档卡片（窄屏单栏） | 只给 `index.html` 用。每项 = `<li><a href="X.html"><span class="di">emoji</span><div><b>标题</b><p>一句话说明</p></div></a></li>` |
| `<span class="tag">` | 绿色小标签 | 标题里的状态标注。`.tag.w` 红、`.tag.b` 蓝 |
| `<div class="viewer">` | **三维视图容器** | 只给 `model.html` 用，见第 6 节 |
| `<div class="viewer-stage">` | 画布区（放 canvas） | 里面放 `.viewer-hint` 和 `.viewer-fallback` |
| `<div class="viewer-bar">` | 工具条一行 | 视角按钮 / 滑杆 / 勾选项。`<span class="sp">` 是弹性间隔 |
| `<div class="viewer-chip">` | 带勾选框的标签 | `<label class="viewer-chip"><input type=checkbox>文字</label>` |
| `<button class="viewer-btn">` | 小方按钮 | 视角预设 |
| `<div class="viewer-range">` | 滑杆 + 文字 | 分层展开 |
| `<div class="viewer-fallback">` | 加载失败时的说明 | 默认隐藏，容器加 `.is-dead` 后显示 |
| `<table class="viewer-table">` | 稍小号的表格 | 三维视图里的读数表 |

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
2. 选一个 `page-icon` emoji（现有：吸附单元 🧲、运动单元 ⚙️、作业机构 🧹、主体 📦、
   坞站 🔌、主控与传感器 🧠、整机三维示意 🧊、物料清单 🧾、文档总目录 🐟）
3. 按 2.2 写标题、按 2.3 写目录
4. 内容用 2.4 的词表
5. 跑 2.3 的自检脚本
6. **两处索引都要加**：`README.md` 的文档表，和 `index.html` 里的 `.doclist` 卡片

---

## 4. 写作约定

- **语言**：简体中文。技术术语保留英文原词（RPR、PDMS、Shore A、SF）
- **数字**：公式用 `<code>` 包起来；单位用 `N·m` `mm` `kPa`，乘号用 `·`
- **口吻**：直接给判断和数字，不说「可能」「也许」。风险要写清楚**后果**和**对策**
- **每节结尾**：给可执行的结论，不要只描述现象
- **参数要跨文档一致**：改一个参数（吸盘直径、丝杆导程、膜片尺寸）必须
  全文搜索另一个文档同步。目前基准配置：
  **∅25 吸盘 / ∅20 膜片 / 0.3 mm 丝杆导程 / −25 kPa / 有效重量 0.3–0.5 N**
  （主体侧）：**整机质量 1097 g / 配重约 253 g / 排水体积 1056 cm³ / 总厚 64 mm /
  O 圈 ∅2.0，槽 2.6 × 1.6 mm / 穿舱点 0 个**。
  （运动侧）：**三足 3-RPR 并联平台 / 3 × ∅25 吸盘 / 吸盘圆 R_t = 100 mm / 机身铰点圆 r = 50 mm，两圆错开 60°（径向布置雅可比奇异，见 `motion.html` 第 5 节）/ 推杆行程 20–40 mm → 步距 d ≈ 12–23 mm / **三条腿编号 a / b / c**（吸盘 A 前足 / B 机尾右 / C 机尾左；铰点座 = 吸盘方位 +60°，即 330° / 90° / 210°，坐标 (43.3, −25) / (0, +50) / (−43.3, −25)）—— 全仓库统一用这套叫法，**铰点座 b 在机尾正后方、与刷辊投影重叠，靠一根从刷辊上方跨过去的跨梁吊住** /
  刷辊轴线在机身重心之后 y = +18 mm（该处三角形宽 136 mm），**刷辊 ∅34 × 80 mm（有效扫宽 75 mm）、平台横向偏移限 ±10 mm**（再长就被杆 c 的扫掠包络卡住，见 `work.html` 第 7 节）/ 作业头有 20 mm 被动退让行程（对接时被坞站顶块顶离玻璃）**。
  （坞站侧）：**线圈间隙 13.0 mm（玻璃占 5）/ k ≈ 0.15–0.25 / 端到端效率 45% /
  5 W 入 → 2.2 W 入电池 / 每次停留约 5 min / 对接精度 ±5 mm（捕获 ±25 mm）/ 圆盘 Ø90 圆心偏心到 (−15, −32)（跟着前窗模块；盘边距前右铰点 (43.3, −25) 中心 13.7 mm，铰点座 ≤ ∅27 就不用开缺口）**。
  （主控侧）：**待机目标 1.0 mW（= 0.17 Wh/周 ÷ 168 h）/ 整板深度睡眠 < 50 µA /
  唤醒周期 30 min / 机器人侧 ESP32-S3（无 PSRAM）/ 坞站侧 ESP32-C6 + RV1106 /
  链路 BLE 穿玻璃 + 坞站 MQTT/TLS 上云 / 作业每天 3 次 × 2.1 min = 0.4 Wh/天**。
  这几组是互相咬合的估算值 —— 改了排水体积就要回头改配重，反之亦然；
  改了玻璃厚度或线圈直径就要回头改坞站功率和充电时间；
  改了作业频次（每天 3 次）就要回头改坞站的对接寿命论证。

  **架构前提：机器人不作业就回坞站待机，中途电量低也回坞补。**
  这一条是好几处结论的支点，改它要回头改一串东西：
  吸盘在停靠期间不必补抽（停留 5 min ≪ 漏气的几十分钟尺度），
  所以「真空维持」这一项是 0 而不是 5 mW；
  电池不再需要撑 2.5 周，1000 mAh 因此明显偏大（见 `body.html` 第 5 节）；
  而代价换成了对接次数 —— 每天 6 次以上，判据是连续 200 次成功率 ≥ 99%。
  **注意：`dock.html` 第 3 节的 13 mm 间隙论证不因此改变**，线圈是按平均功率选的。

---

## 5. 已知的坑

- **SVG id 冲突**：见 2.6。加新图时第一件事就是起前缀
- **SVG 文字会静默超出 `viewBox` 被裁掉**：根 `<svg>` 默认 `overflow:hidden`，
  超出的文字不是换行而是**直接消失**，静态检查完全看不出来，必须渲染才知道。
  正文栏宽 724px（`.page-inner` 900 − padding 176），720 宽的 `viewBox` 基本 1:1，
  所以**一行 `.s-sub` 在 720 宽的图里大约只能放 33 个汉字** —— 超了就得改文案或拆两行。
  一次量完全部文档的全部图（两条命令，第二条依赖第一条生成的 `/tmp/svgfit.html`）：

  ```bash
  python3 -c '
  import re, glob
  page = "<link rel=\"stylesheet\" href=\"assets/notion.css\"><body style=\"margin:0\">"
  for f in sorted(glob.glob("*.html")):
      for i, b in enumerate(re.findall(r"<svg\b.*?</svg>", open(f, encoding="utf-8").read(), re.S), 1):
          page += "<div data-k=\"%s#%d\" style=\"width:880px\">%s</div>" % (f, i, b)
  js = """
  const out=[];
  document.querySelectorAll("div[data-k]").forEach(d=>{
    const k=d.dataset.k, svg=d.querySelector("svg"), sb=svg.getBoundingClientRect();
    svg.querySelectorAll("text").forEach(t=>{
      if(!t.getClientRects().length) return;
      const r=t.getBoundingClientRect(), o=[];
      if(r.right>sb.right+1) o.push("R+"+(r.right-sb.right).toFixed(1));
      if(r.left<sb.left-1)  o.push("L-"+(sb.left-r.left).toFixed(1));
      if(r.bottom>sb.bottom+1) o.push("B+"+(r.bottom-sb.bottom).toFixed(1));
      if(r.top<sb.top-1)    o.push("T-"+(sb.top-r.top).toFixed(1));
      if(o.length) out.push(k+" "+o.join(",")+" | "+t.textContent);
    });
  });
  document.getElementById("out").textContent = out.length ? out.join(String.fromCharCode(10)) : "ALL CLEAN";
  """
  open("/tmp/svgfit.html","w",encoding="utf-8").write(page + "<pre id=out></pre><script>" + js + "</script>")
  '

  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
    --dump-dom --virtual-time-budget=3000 file:///tmp/svgfit.html 2>/dev/null \
    | python3 -c 'import sys,re,html;m=re.search(r"<pre id=\"?out\"?>(.*?)</pre>",sys.stdin.read(),re.S);print(html.unescape(m.group(1)) if m else "NO OUT")'
  ```

  输出必须是 `ALL CLEAN`。**必须用 `getBoundingClientRect`，不要用
  `x + getComputedTextLength()`** —— 后者看不到父级 `<g transform>`，
  会把 `translate(428,0)` 里的 `x=103` 当成真实坐标，报出完全错误的结论。
- **`file://` 打开**：`<link>` 和 `<script src>` 都能正常加载，但如果只拷贝 HTML
  而不带 `assets/`，样式会全丢
- **窄屏**：≤860px 时侧栏收起、右下角出现汉堡按钮。新加的内容块要在这个宽度下检查一遍
- **`toc.js` 只认 `href^="#"` 的目录项**：一个 `.side-list` 里如果全是跳别的文件的链接，
  脚本会在 `if (!links.length) return` 处整个退出，**汉堡按钮跟着失效**（那段代码在同一个
  IIFE 里、在它后面）。所以侧栏必须是本页的章节锚点；要指向别的文档，走正文里的链接或
  `.doclist` 卡片，不要塞进侧栏

---

## 6. 三维视图（`model.html`）

`model.html` 用 three.js 渲染整机产品示意。它是本仓库唯一有脚本逻辑的文档，
所以单独定几条规矩。

### 6.1 three.js 只能从 CDN 取，代码必须内联

这是 `file://` 的硬约束，不是偏好：

- **本地 ES module 会被 CORS 拦死。** 实测
  `<script type="module">import * as THREE from './three.module.js'</script>`
  在 `file://` 下直接失败，控制台报 `blocked by CORS policy`。
  `<link>` 和 `<script src>`（传统脚本）不受影响，module 受影响。
- **three.js 从 r160 起不再发 UMD 构建**，`three.min.js` 没有了，
  本地只剩 ESM 一条路，而那条路走不通。
- **所以：三维代码内联在 `model.html` 里，一切 import 走 importmap 指向 https CDN。**

```html
<script type="importmap">
{ "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/"
} }
</script>
```

- **版本必须钉死**，不要写 `three@latest`。r155 前后光照强度的量纲变过，
  同一个 `intensity` 换版本会明显偏亮或偏暗。
- **不要在 `assets/` 里放 `.js` 模块**给 `model.html` 引 —— 引不到。
- CDN 取不到时（离线）必须给一段说明，不能留白屏：
  容器加 `.is-dead` 就显示 `.viewer-fallback`。

### 6.2 无头验证

改了三维部分要真的渲染一遍，不能只看代码。
Chrome 无头下 WebGL 需要 `--enable-unsafe-swiftshader`（**单独用这一个**，
`--use-angle=swiftshader`、`--use-gl=angle` 都不行）：

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --enable-unsafe-swiftshader --disable-gpu --dump-dom \
  --virtual-time-budget=9000 file://$PWD/model.html 2>/dev/null | grep -c canvas
```

`--dump-dom` 只看得到 DOM，**看不到控制台**。想无头读自检和标注排布，
在文档末尾再插一段脚本，把 `console.log` 接管下来、把结果塞进一个
`<pre>` 里，再 dump 出来。要点是**别写回 `model.html`** —— 覆盖源文件
最容易连带删掉 `</body>` 前的 `assets/toc.js`（踩过）。

### 6.3 改 `model.html` 的规矩

- **尺寸只写在 `CFG` 一个对象里**，每条右边标 `// src:`（文档给的）、
  `// 推导`（算出来的）、`// 示意`（文档没给、为了让模型能看而取的）。
  **`// 示意` 的值不能当成设计输入**，定稿要写回对应文档。
- **一个零件一个 `build*()` 函数**，函数之间不互相调用，各自返回一个 `Group`。
- **新增零件要在 `LAYERS` 表里登记**，否则「分层展开」滑杆不会动它。
- **加了约束就写进 `checks()`**，它会渲染成页面上的表并 `console.table`。
  自检不通过必须在页面上标红，不要只 `console.warn`。
- **标注 = 世界坐标的锚点 + 屏幕坐标的 `at`**，见 `buildLabels()`。
  `at` 是 `[u, v]`，u 从左边 0→1，v 从上边 0→1，**不是世界坐标**。
  写成屏幕坐标是因为世界坐标的偏移只在调它的那个视角下好看，一换视角就全糊在一起。
  锚点仍然跟着 `CFG` 走，所以零件挪了标注的引线自己会跟过去。
  `makeLabel()` 里的 `k` 只决定标注看起来多大（当前约 15px 标题字），与位置无关。
- **改完标注跑一遍 `BOT.labelLayout()`**，控制台会打一张表，
  压住或出框的条目直接点名，不要靠肉眼。改视角取景跑 `BOT.modelBounds()`，
  它按 canvas 像素报模型的四条边距（玻璃和坞站是背景板，不参与判据）。
