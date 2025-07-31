// plugin/md.ts
function transformMarkdown(options) {
  const setupPromise = (async () => {
    const { default: MarkdownIt } = await import("markdown-it-async");
    const md = MarkdownIt({
      async highlight(code, lang) {
        const { codeToHtml } = await import("shiki");
        return await codeToHtml(code, { lang, theme: options.theme || "vitesse-dark" });
      }
    });
    return md;
  })();
  return async (code) => {
    const md = await setupPromise;
    const html = await md.renderAsync(code);
    return `<template>${html}</template>`;
  };
}

// plugin/index.ts
function markdownPlugin(options = {}) {
  const markdownToVue = transformMarkdown(options);
  return {
    name: "vite:markdown",
    enforce: "pre",
    async transform(code, id) {
      if (!id.endsWith(".md")) {
        return null;
      }
      try {
        return await markdownToVue(code);
      } catch (error) {
        this.error(error);
      }
    },
    handleHotUpdate(ctx) {
      const { file, read } = ctx;
      if (!file.endsWith(".md")) {
        return;
      }
      ctx.read = async () => {
        const code = await read();
        return await markdownToVue(code);
      };
    }
  };
}
export {
  markdownPlugin
};
//# sourceMappingURL=index.js.map