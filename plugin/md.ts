import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

export default new MarkdownIt({
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        // md中代码块需要包裹标签，否则会报错，所以需要替换掉{}
        const code = hljs
          .highlight(str, { language: lang })
          .value.replaceAll(/{/g, '&#123;')
          .replaceAll(/}/g, '&#125;')
          .replaceAll(/\n/g, '<br />');
        return code;
      } catch (err) {
        console.log(err);
      }
    }
    return ''; // use external default escaping
  },
});
