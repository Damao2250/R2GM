# R2DM

R2DM 是一个基于 `uni-app 3 + Vue 3 + Vite + TypeScript` 的跨平台工具箱应用，主打离线可用、单仓多端和轻交互体验。项目当前覆盖了金额转换、时间日期、设备信息、二维码、传感器、随机娱乐等多个日常场景。

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
- 📝 口算练习 / 🔢 数值矩阵：同一页面内包含口算练习和数值矩阵玩法。

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
│   │   └── PageHeader.vue
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

把新页面加入 `src/pages.json`：

```json
{
  "path": "pages/components/demoTool/demoTool",
  "type": "page"
}
```

同时同步到根目录 `pages.json`，补上导航标题：

```json
{
  "path": "pages/components/demoTool/demoTool",
  "style": {
    "navigationBarTitleText": "示例工具",
    "enablePullDownRefresh": false
  }
}
```

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

### 5. 自检

新增页面后，至少执行一次：

```bash
npm run type-check
```

如需验证构建链路，再执行：

```bash
npm run build:h5
```

### 6. 命名约定

- 页面路径建议使用 `src/pages/components/<目录名>/<文件名>.vue`。
- `url` 一律使用 `/pages/components/...` 这种绝对页面路径。
- 页面标题、分享标题、工具列表标题尽量保持一致，减少后期维护成本。

## 维护说明

- 页面清单当前维护在 `src/pages.json`，根目录 `pages.json` 保持与其同步，方便不同 uni-app 工具链使用。
- `manifest.json` 与 `src/manifest.json` 需要保持一致，避免多端配置漂移。
- 本仓库未附带 `LICENSE` 文件，如需开源发布，建议补充正式许可证声明。
