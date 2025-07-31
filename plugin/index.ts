import type { Plugin } from 'vite';
import { transformMarkdown } from './md';
import type { MarkdownPluginOptions } from './types';

export function markdownPlugin(options: MarkdownPluginOptions = {}): Plugin {
  const markdownToVue = transformMarkdown(options);

  return {
    name: 'vite:markdown',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.endsWith('.md')) {
        return null;
      }
      try {
        return await markdownToVue(code);
      } catch (error: any) {
        this.error(error);
      }
    },
    handleHotUpdate(ctx) {
      const { file, read } = ctx;
      if (!file.endsWith('.md')) {
        return;
      }
      ctx.read = async () => {
        const code = await read();
        return await markdownToVue(code);
      };
    },
  };
}
