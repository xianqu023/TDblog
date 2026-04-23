import { marked } from 'marked';

// 配置 marked 选项
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * 处理图片：添加包装容器、响应式类名、禁用懒加载
 */
function processImagesInHtml(html: string): string {
  // 单独处理 <img> 标签，添加包装容器实现居中
  return html.replace(/(<img\s+[^>]*?src=["']([^"']+)["'][^>]*?\/?>)/gi, (match, imgTag, src) => {
    // 提取已有的 class
    const classMatch = imgTag.match(/class=["']([^"']*)["']/i);
    const existingClasses = classMatch ? classMatch[1] : '';
    const newClasses = 'article-image';
    const combinedClasses = existingClasses ? `${existingClasses} ${newClasses}`.trim() : newClasses;

    const hasWidth = /width=/i.test(imgTag);
    const hasHeight = /height=/i.test(imgTag);

    // 重新构建 img 标签
    let newImg = imgTag;
    if (!classMatch) {
      newImg = newImg.replace(/<img\s/i, `<img class="${combinedClasses}" `);
    } else {
      newImg = newImg.replace(/class=["'][^"']*["']/i, `class="${combinedClasses}"`);
    }
    
    // 禁用懒加载，使用异步解码
    newImg = newImg.replace(/>$/, ' loading="eager" decoding="async" fetchpriority="high">');

    // 用 figure 包裹实现居中和图注支持
    return `<figure class="article-image-wrapper">${newImg}</figure>`;
  });
}

/**
 * 自动排版：优化段落间距、标题层级、列表样式等
 */
function autoLayout(html: string): string {
  let result = html;

  // 1. 清理多余空行和空白
  result = result.replace(/(\r\n|\r)/g, '\n');
  result = result.replace(/\n{3,}/g, '\n\n');

  // 2. 为标题添加锚点 ID
  result = result.replace(
    /<h([2-6])>(.*?)<\/h\1>/gi,
    (match, level, content) => {
      const id = content
        .replace(/<[^>]*>/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .toLowerCase();
      return `<h${level} id="${id}" class="heading-anchor"><a href="#${id}" class="heading-link">${content}</a></h${level}>`;
    }
  );

  // 3. 为段落添加首行缩进选项（中文段落）
  result = result.replace(/<p>([\u4e00-\u9fff])/gi, '<p class="chinese-indent">$1');

  // 4. 优化引用块样式
  result = result.replace(
    /<blockquote>/gi,
    '<blockquote class="styled-blockquote">'
  );

  // 5. 为表格添加包装容器实现横向滚动
  result = result.replace(
    /<table>/gi,
    '<div class="table-wrapper"><table class="styled-table">'
  );
  result = result.replace(/<\/table>/gi, '</table></div>');

  // 6. 为代码块添加语言标识包装
  result = result.replace(
    /<pre><code class="language-(\w+)">/gi,
    '<div class="code-block-wrapper"><div class="code-block-header"><span class="code-lang">$1</span></div><pre class="styled-code-block"><code class="language-$1">'
  );
  result = result.replace(/<\/code><\/pre>/g, '</code></pre></div>');

  // 7. 为有序/无序列表添加样式类
  result = result.replace(/<ul>/gi, '<ul class="styled-list styled-list-ul">');
  result = result.replace(/<ol>/gi, '<ol class="styled-list styled-list-ol">');

  // 8. 为强调文本添加样式
  result = result.replace(/<strong>/gi, '<strong class="text-emphasis">');
  result = result.replace(/<em>/gi, '<em class="text-emphasis-italic">');

  // 9. 自动为连续图片添加轮播/网格包装（检测连续 2+ 张图）
  result = result.replace(
    /(<figure class="article-image-wrapper">[\s\S]*?<\/figure>\s*){2,}/g,
    (match) => {
      return `<div class="image-grid">${match}</div>`;
    }
  );

  // 10. 为第一个段落添加引语样式（如果有摘要）
  result = result.replace(
    /(<p[^>]*>.*?<\/p>)/,
    (match) => `<div class="article-lead">${match}</div>`
  );

  return result;
}

/**
 * 将 Markdown 转换为 HTML，并进行自动排版
 */
export function markdownToHtml(content: string): string {
  if (!content) return '';

  let html: string;

  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);

  if (hasHtmlTags) {
    html = content;
  } else {
    html = marked.parse(content) as string;
  }

  // 处理图片
  html = processImagesInHtml(html);

  // 自动排版
  html = autoLayout(html);

  return html;
}

/**
 * 生成封面图 URL，支持自动裁剪
 */
export function getCoverImageUrl(url: string, options?: {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'crop';
}): string {
  if (!url) return '';

  if (url.includes('unsplash.com')) {
    const width = options?.width || 1200;
    const height = options?.height || 630;
    const fit = options?.fit || 'crop';

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&h=${height}&fit=${fit}`;
  }

  return url;
}

/**
 * 提取纯文本
 */
export function extractPlainText(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}
