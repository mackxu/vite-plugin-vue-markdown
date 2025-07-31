"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// plugin/index.ts
var index_exports = {};
__export(index_exports, {
  markdownPlugin: () => markdownPlugin
});
module.exports = __toCommonJS(index_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  markdownPlugin
});
//# sourceMappingURL=index.cjs.map