import { readFileSync } from 'node:fs';
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
    transform(code, id) {
      if (!parentModuleRegex.test(id)) {
        return null;
      }
      if (!markdownRegex.test(code)) {
        return null;
      }
      const dir = path.dirname(id); // 当前目录
      const fileToContent: Record<string, string> = {};
      return code.replaceAll(markdownRegex, (match, ...args) => {
        const filePath = path.resolve(dir, args[1]);
        try {
          let content = fileToContent[filePath];
          if (!content) {
            content = readFileSync(filePath, 'utf-8');
            fileToContent[filePath] = content;
          }
          // 收集引入文件与md文件的关系，用于md文件的热更新
          let relationModuleIds = mdRelationMap.get(filePath);
          if (!relationModuleIds) {
            relationModuleIds = new Set();
            mdRelationMap.set(filePath, relationModuleIds);
          }
          relationModuleIds.add(id);

          return md.render(content);
        } catch (error) {
          return match; // 读取文件失败，返回原始内容
        }
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
  };
}
