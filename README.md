# R2DM

一个基于 uni-app + Vue 3 + TypeScript + Vite 的跨平台小工具集合。

## 技术栈

- **框架**: uni-app 3.0 (Vue 3)
- **语言**: TypeScript 5.4
- **构建工具**: Vite 5.2
- **包管理**: npm
- **代码规范**: ESLint + Prettier

## 功能特点

+ 💰 金额大小写转换 - 支持数字金额转中文大写
+ 📡 WiFi 网络信息查询 - 查看本地 IP、网络类型、WiFi 信息
+ 🔐 Base64 转换 / MD5 计算 - 编解码工具
+ ⏰ 当前时间查询 - 实时显示精确到毫秒的时间

## 环境要求

- Node.js >= 16
- npm >= 7

## 开发工具

- VS Code（推荐）/ HBuilderX
- 微信开发者工具（用于小程序调试）

## 快速开始

### 1. 安装依赖

```bash
npm install --legacy-peer-deps
```

### 2. 运行开发服务器

#### 开发 H5 端
```bash
npm run dev:h5
```

#### 开发微信小程序
```bash
npm run dev:mp
# 或
npm run dev:mp-weixin
```

#### 开发支付宝小程序
```bash
npm run dev:mp-alipay
```

#### 开发 App
```bash
npm run dev:app
```

### 3. 构建项目

#### 构建 H5
```bash
npm run build:h5
```

#### 构建微信小程序
```bash
npm run build:mp
# 或
npm run build:mp-weixin
```

#### 其他平台
```bash
npm run build:app          # App
npm run build:mp-alipay    # 支付宝小程序
npm run build:mp-baidu     # 百度小程序
npm run build:mp-toutiao   # 抖音小程序
npm run build:mp-qq        # QQ 小程序
```

### 4. 类型检查

```bash
npm run type-check
```

## 项目结构

```
R2GM/
├── src/
│   ├── App.vue                       # 根组件 (TypeScript)
│   ├── main.ts                       # 入口文件 (TypeScript)
│   ├── pages/                        # 页面目录
│   │   ├── index/                    # 首页
│   │   │   └── index.vue            # 工具列表
│   │   └── components/              # 功能组件
│   │       ├── convertCurrency/     # 金额转换
│   │       ├── networkInfo/         # 网络信息
│   │       ├── base64Conver/        # Base64/MD5
│   │       └── timeNow/             # 时间显示
│   ├── static/                      # 静态资源
│   ├── shims-uni.d.ts              # uni-app 类型定义
│   ├── pages.json                   # 页面配置
│   └── manifest.json                # 应用配置
├── env/                             # 环境变量配置
│   ├── .env.development            # 开发环境
│   └── .env.production             # 生产环境
├── vite.config.ts                   # Vite 配置 (TypeScript)
├── tsconfig.json                    # TypeScript 配置
├── tsconfig.node.json              # Node 环境 TS 配置
├── package.json                     # 项目配置
├── .gitignore                      # Git 忽略文件
└── README.md                        # 项目说明
```

## TypeScript 说明

项目已完全迁移到 TypeScript：

- ✅ 所有 Vue 组件使用 `<script setup lang="ts">` 语法
- ✅ Composition API 替代 Options API
- ✅ 完整的类型注解和接口定义
- ✅ 为外部 JS 库提供类型定义文件

### 已知类型问题

uni-app 的 `<button type="primary">` 等组件属性与标准 HTML 类型定义存在冲突，这是 uni-app 框架的已知限制，不影响实际运行。

## 配置说明

### 环境变量

项目使用 `env/` 目录下的环境变量文件：
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

可在文件中配置 API 地址、CDN 路径等环境相关变量。

### 支持的平台

通过 `npm run dev:` 或 `npm run build:` 命令可以构建以下平台：

| 平台 | 开发命令 | 构建命令 |
|------|---------|---------|
| H5 | `npm run dev:h5` | `npm run build:h5` |
| 微信小程序 | `npm run dev:mp-weixin` | `npm run build:mp-weixin` |
| 支付宝小程序 | `npm run dev:mp-alipay` | `npm run build:mp-alipay` |
| 百度小程序 | `npm run dev:mp-baidu` | `npm run build:mp-baidu` |
| 抖音小程序 | `npm run dev:mp-toutiao` | `npm run build:mp-toutiao` |
| QQ 小程序 | `npm run dev:mp-qq` | `npm run build:mp-qq` |
| 快手小程序 | `npm run dev:mp-kuaishou` | `npm run build:mp-kuaishou` |
| 京东小程序 | `npm run dev:mp-jd` | `npm run build:mp-jd` |
| App | `npm run dev:app` | `npm run build:app` |

## 构建输出

- **H5**: 构建输出到 `dist/build/h5/` 目录
- **小程序**: 构建输出到 `dist/build/mp-{platform}/` 目录
  - 微信小程序开发版: `dist/dev/mp-weixin/`
  - 使用微信开发者工具导入 `dist/dev/mp-weixin` 目录即可预览
- **App**: 需要通过 HBuilderX 或云打包服务进行打包

## 开发建议

### VS Code 插件

推荐安装以下插件以获得更好的开发体验：

- Vue Language Features (Volar)
- TypeScript Vue Plugin (Volar)
- ESLint
- Prettier - Code formatter
- uni-app-snippets
- uni-helper

### 调试小程序

1. 运行 `npm run dev:mp-weixin` 启动开发服务器
2. 打开微信开发者工具
3. 导入项目目录 `dist/dev/mp-weixin`
4. 即可开始调试

### 常见问题

**Q: 安装依赖失败？**  
A: 尝试使用 `npm install --legacy-peer-deps` 安装

**Q: TypeScript 类型检查报错？**  
A: uni-app 组件属性与标准 HTML 存在类型差异，不影响运行，可忽略

**Q: 编译速度慢？**  
A: 首次编译较慢，后续会利用缓存加速

## 技术亮点

- 🚀 使用 Vite 构建，开发体验极速
- 📦 完整的 TypeScript 类型支持
- 🎨 Vue 3 Composition API，代码更简洁
- 🔧 支持多平台一键构建
- ⚡️ 模块化组件设计，易于扩展

## 许可证

Apache 2.0
