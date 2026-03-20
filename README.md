# R2DM

R2DM 是一个基于 `uni-app 3 + Vue 3 + Vite + TypeScript` 的跨平台工具箱应用，主打离线可用、单仓多端和轻交互体验。项目当前覆盖了金额转换、时间日期、设备信息、二维码、传感器、随机工具，以及若干组件化演算模块等多个日常场景。

## 项目定位

- 跨平台发布：支持 H5、微信小程序和 App。
- 工具统一管理：所有工具入口统一注册，首页和工具管理页自动同步。
- 本地优先：大部分功能不依赖后端，用户设置和部分记录保存在本地存储。
- 以 TypeScript 为主：当前大多数页面已使用 `Vue 3 + <script setup lang="ts">`，少量历史页面仍保留 Options API 写法。

## 当前功能

### 实用工具

- 💰 金额转大写：数字金额与中文大写金额互转。
- 🔐 编码/转换：支持 Base64、Hex、URL 编解码和 MD5。
- ⏰ 当前时间：显示精确到毫秒的时间、时间戳和世界时间。
- 📱 设备信息：查看系统、屏幕、像素比等设备信息。
- 📲 二维码分享：输入文本生成二维码，支持扫描、复制、保存。
- 📏 单位转换：支持长度、重量、温度、面积、体积、存储等类别。
- 💵 折扣/优惠计算器：折扣、满减和费用分摊计算。
- 📅 倒数日：记录纪念日并计算已过时间、周年和进度。
- ⚖️ BMI 计算器：根据身高体重计算 BMI 和区间结果。

### 设备与系统能力

- 🌐 网络信息：查看网络状态和基础网络诊断信息。
- 🧭 灵感罗盘：结合罗盘和加速度数据展示方向与水平状态。
- ⚙️ 系统设置：清理缓存、重启应用、检查更新。
- 🛠️ 工具管理：调整首页工具顺序和显示/隐藏状态。

### 随机与娱乐

- 🎲 随机数工具：随机数、抛硬币、掷骰子。
- 👨‍👩‍👧‍👦 亲戚计算器：查询复杂家庭称谓。
- 💑 配对缘分计算：娱乐向名字配对和分析。
- 🎴 随机决策助手：输入选项后随机帮你做选择。
- 🎂 生日/星座计算：查看年龄、星座、生肖等信息。

### 复合练习入口

- 📝 口算练习：四则运算练习入口，同时承载多个内嵌演算模块的切换。
- 🔢 矩阵演化器：在 4x4 网格中进行数值平移与归并推演。
- 🧱 围栏计算器：固定网格围合推演，支持智能陪练 / 双人模式、1-5 级难度和结果判定。
- 🌐 地势演算器：19x19 连通地势推演，支持智能陪练 / 双人模式、1-5 级难度、结果汇总与 1 级入门指引。

## 技术栈

- `uni-app` 3
- `Vue` 3
- `TypeScript` 5
- `Vite` 5
- `Sass`
- `dayjs`
- `relationship.js`
- `weapp-qrcode`
- `wot-design-uni`

## 核心实现

- 工具清单统一维护在 `src/utils/defaultTools.ts`，新增工具后首页和工具管理页会自动同步。
- 工具顺序和显隐状态由 `src/utils/toolsManager.ts` 管理，并通过本地存储持久化。
- 页面分享能力统一封装在 `src/utils/useShare.ts`，便于微信小程序场景复用。
- 页面全局风格和通用样式集中在 `src/styles/theme.scss`。
- `vite-plugin-uni-pages` 与 `pages.config.ts`、`src/pages.json` 配合生成页面配置。
- `src/pages/components/numberMerge/numberMerge.vue` 目前是一个复合入口页，口算练习与多个内嵌演算模块在同页内切换。
- `src/components/matrixEvolver/`、`src/components/fenceCalculator/`、`src/components/terrainAnalyzer/` 这类目录用于承载仅在入口页中复用的组件模块，无需额外注册独立页面。

## 目录结构

```text
R2GM/
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── pages/
│   │   ├── index/
│   │   └── components/
│   ├── components/
│   │   ├── PageHeader.vue
│   │   ├── matrixEvolver/
│   │   ├── fenceCalculator/
│   │   └── terrainAnalyzer/
│   ├── static/
│   ├── styles/
│   │   └── theme.scss
│   ├── utils/
│   │   ├── defaultTools.ts
│   │   ├── toolsManager.ts
│   │   └── useShare.ts
│   ├── manifest.json
│   └── pages.json
├── manifest.json
├── pages.config.ts
├── pages.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 环境要求

- Node.js >= 16
- npm >= 7

## 快速开始

### 安装依赖

```bash
npm install
```

如果依赖解析冲突，可以使用：

```bash
npm install --legacy-peer-deps
```

### 开发

```bash
npm run dev:h5
```

```bash
npm run dev:mp
```

```bash
npm run dev:app
```

### 构建

```bash
npm run build:h5
```

```bash
npm run build:mp
```

```bash
npm run build:app
```

### 类型检查

```bash
npm run type-check
```

### 配置同步

在修改根目录 `pages.json` 或 `manifest.json` 后，执行：

```bash
npm run sync:config
```

如果只想检查根目录配置和 `src/` 副本是否漂移，执行：

```bash
npm run check:config-sync
```

## 构建输出

- H5: `dist/build/h5/`
- 微信小程序开发目录: `dist/dev/mp-weixin/`
- 微信小程序生产目录: `dist/build/mp-weixin/`
- App: 通过 HBuilderX 或云打包服务打包

## 开发建议

- 推荐使用 VS Code 或 HBuilderX。
- 微信小程序调试建议配合微信开发者工具。
- 建议安装 `Volar`、`ESLint`、`Prettier`、`uni-helper` 等插件。

## 新增页面步骤

如果你要新增一个独立工具页面，建议按下面顺序操作。

### 1. 创建页面文件

在 `src/pages/components/` 下新建目录和页面文件，通常保持目录名和文件名一致，例如：

```text
src/pages/components/demoTool/demoTool.vue
```

推荐直接沿用现有页面结构，最小模板示例：

```vue
<template>
  <view class="container">
    <PageHeader title="🧪 示例工具" subtitle="页面描述" />

    <view class="page-content">
      <view class="card">
        <view class="section-title">示例内容</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '示例工具 - DM工具箱',
    path: '/pages/components/demoTool/demoTool'
  })
}
</script>

<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f7fa;
}
</style>
```

### 2. 注册页面路由

先在根目录 `pages.json` 里补上页面配置和导航标题：

```json
{
  "path": "pages/components/demoTool/demoTool",
  "style": {
    "navigationBarTitleText": "示例工具",
    "enablePullDownRefresh": false
  }
}
```

然后执行：

```bash
npm run sync:config
```

这样会自动更新 `src/pages.json` 里的页面路径与 `type` 元信息。

### 3. 接入首页工具列表

如果这个页面需要出现在首页和工具管理页，还要在 `src/utils/defaultTools.ts` 中新增一项：

```ts
{
  title: '示例工具',
  url: '/pages/components/demoTool/demoTool',
  icon: '🧪',
  visible: true
}
```

如果只是内部页面或设置页，不想出现在首页，可以只注册路由，不加到工具列表。

### 4. 复用项目公共能力

- 页面标题建议使用 `PageHeader`，保持视觉统一。
- 微信分享页建议接入 `getShareConfig()`。
- 通用样式优先复用 `src/styles/theme.scss` 中的类和变量。
- 需要本地持久化时，优先复用 `uni.setStorage` / `uni.getStorage` 的现有模式。

### 5. 只做内嵌组件时

如果功能不需要单独成为一个页面，而是像 `numberMerge` 里的演算模块一样仅在现有页面内切换，建议直接放到：

```text
src/components/<moduleName>/<moduleName>.vue
```

接入方式通常是：

- 在宿主页面中直接 `import` 组件并通过 `v-if` / `v-else-if` 控制显示。
- 通过事件（例如 `@back`）让内嵌组件把返回动作交回宿主页面处理。
- 这类组件不需要在 `pages.json` 注册，也不需要加入 `src/utils/defaultTools.ts`。

### 6. 自检

新增页面后，至少执行一次：

```bash
npm run sync:config
```

```bash
npm run type-check
```

如需验证构建链路，再执行：

```bash
npm run build:h5
```

### 7. 命名约定

- 页面路径建议使用 `src/pages/components/<目录名>/<文件名>.vue`。
- `url` 一律使用 `/pages/components/...` 这种绝对页面路径。
- 页面标题、分享标题、工具列表标题尽量保持一致，减少后期维护成本。
- 内嵌组件建议使用 `src/components/<目录名>/<文件名>.vue`，目录名与文件名保持一致，便于检索与迁移。

## 维护说明

- 根目录 `pages.json` 与 `manifest.json` 作为主配置。
- `src/pages.json` 只保留工具链需要的页面路径与 `type` 元信息，不建议手动编辑。
- 修改配置后用 `npm run sync:config` 更新 `src/manifest.json` 和 `src/pages.json` 的派生内容。
- `npm run check:config-sync` 可用于 CI 或提交前检查配置漂移。
- 本仓库当前采用 `MIT` License，详见根目录 [LICENSE](./LICENSE)。
