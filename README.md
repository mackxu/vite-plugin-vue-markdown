# vite-plugin-vue-markdown-vue

## 安装

```bash
npm install vite-plugin-vue-markdown-vue -D
pnpm add vite-plugin-vue-markdown-vue -D
```

## 配置

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { markdownPlugin } from 'vite-plugin-vue-markdown-vue';

export default defineConfig({
  plugins: [vue(), markdownPlugin()],
});
```

## 插件开发

- 源码目录 `plugin`
- 开发环境 `pnpm dev`
- 打包命令 `pnpm build`
  - 打包工具 tsup
- 依赖包安装
  - @types/node
  - @types/markdown-it
  - markdown-it
  - markdown-it-async
  - shiki
