import type { MarkdownPluginOptions } from './types';

export function transformMarkdown(options: MarkdownPluginOptions) {
  const setupPromise = (async () => {
    const { default: MarkdownIt } = await import('markdown-it-async');
    const md = MarkdownIt({
      async highlight(code, lang) {
        const { codeToHtml } = await import('shiki');
        return await codeToHtml(code, { lang, theme: options.theme || 'vitesse-dark' });
      },
    });
    return md;
  })();

  return async (code: string) => {
    const md = await setupPromise;
    code = processTemplateVariable(code);
    const html = await md.renderAsync(code);
    return `<template>${html}</template>`;
  };
}

const TMPL_VAR_RG = /\{\{\s+([\w$]+(?:\??\.[\w$]+)*)\s+\}\}/g;

function processTemplateVariable(code: string) {
  return code.replace(TMPL_VAR_RG, '{{$attrs.$1}}');
}
