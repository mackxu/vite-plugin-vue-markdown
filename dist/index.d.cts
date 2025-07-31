import { Plugin } from 'vite';

interface MarkdownPluginOptions {
    theme?: string;
}

declare function markdownPlugin(options?: MarkdownPluginOptions): Plugin;

export { markdownPlugin };
