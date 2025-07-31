import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['plugin/index.ts'],
  format: ['cjs', 'esm'],
  external: ['vite'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  tsconfig: './tsconfig.node.json', // 需要指定，解决 DTS Build error
});
