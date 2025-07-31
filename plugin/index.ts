import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { HmrContext, ModuleNode, Plugin } from 'vite';
import md from './md';

const parentModuleRegex = /\.vue$/;
const markdownRegex = /<markdown\s+src\s*=\s*(?<quote>["'])(.*?)\k<quote>[^>]*\s*(?:\/>|>[\s]*<\/markdown>)/gi;

export function markdownPlugin(): Plugin {
  // 存放md url 与 引入文件id的映射关系
  const mdRelationMap = new Map<string, Set<string>>();

  return {
    name: 'vite:markdown',
    enforce: 'pre',
    async transform(code, id) {
      if (!parentModuleRegex.test(id)) {
        return null;
      }

      // 收集md文件路径
      const mdFiles = Array.from(code.matchAll(markdownRegex)).map((match) => match[2]);
      if (mdFiles.length === 0) {
        return null;
      }

      const dir = path.dirname(id); // 当前目录
      // 并行读取md文件内容
      const fileToContent: Record<string, string> = Object.fromEntries(
        await Promise.all(
          mdFiles.map(async (file) => {
            const filePath = path.resolve(dir, file);
            return [file, await readFile(filePath, { encoding: 'utf8' })];
          })
        )
      );

      // 收集引入文件与md文件的关系，用于md文件的热更新
      mdFiles.forEach((file) => {
        const filePath = path.resolve(dir, file);
        let relationModuleIds = mdRelationMap.get(filePath);
        if (!relationModuleIds) {
          relationModuleIds = new Set();
          mdRelationMap.set(filePath, relationModuleIds);
        }
        relationModuleIds.add(id);
      });

      // 替换md文件内容
      return code.replaceAll(markdownRegex, (full, ...args) => {
        const fileSrc = args[1];
        const content = fileToContent[fileSrc] ?? full;
        return md.render(content);
      });
    },
    // 根据file，更新依赖文件
    handleHotUpdate({ file, server, modules }: HmrContext) {
      if (!file.endsWith('.md')) return modules;
      const relationModuleIds = mdRelationMap.get(file);
      if (!relationModuleIds) return modules;
      // 通知依赖文件热更新
      const hotModules = Array.from(relationModuleIds)
        .map((id) => server.moduleGraph.getModuleById(id))
        .filter((m): m is ModuleNode => !!m);
      return [...modules, ...hotModules];
    },
    buildEnd() {
      mdRelationMap.clear();
    },
  };
}
