import { marked } from 'marked';
import { useEffect, useState, useMemo, useCallback } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// 解码 HTML 实体 - 使用正则表达式替换
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
}

// 检测内容是否为 HTML 格式
function isHtmlContent(content: string): boolean {
  const decoded = decodeHtmlEntities(content);
  const htmlPattern = /<(h[1-6]|p|div|span|img|pre|code|ul|ol|li|a|strong|em|blockquote|table|tr|td|th|br|hr)[\s>]/i;
  return htmlPattern.test(decoded);
}

// 处理图片标签，添加统一样式
function processImageStyles(html: string): string {
  // 匹配 <img> 标签并添加统一样式
  return html.replace(
    /<img([^>]*)>/gi,
    (match, attrs) => {
      // 如果已经有 class 属性，追加样式
      if (attrs.includes('class=')) {
        return match.replace(
          /class="([^"]*)"/gi,
          'class="$1 article-image"'
        );
      }
      // 否则添加 class 属性
      return `<img${attrs} class="article-image">`;
    }
  );
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [html, setHtml] = useState<string>('');

  // 使用 useCallback 缓存处理函数
  const processContent = useCallback((contentStr: string) => {
    const decodedContent = decodeHtmlEntities(contentStr);
    
    if (isHtmlContent(decodedContent)) {
      return processImageStyles(decodedContent);
    } else {
      const result = marked.parse(decodedContent);
      if (typeof result === 'string') {
        return processImageStyles(result);
      } else {
        // 如果是 Promise，同步返回空字符串，异步处理
        result.then((res) => {
          setHtml(processImageStyles(res));
        });
        return '';
      }
    }
  }, []);

  // 使用 useMemo 缓存处理后的 HTML
  const processedHtml = useMemo(() => {
    return processContent(content);
  }, [content, processContent]);

  useEffect(() => {
    const htmlContent = processContent(content);
    // 设置处理后的 HTML 内容
    if (htmlContent) {
      setHtml(htmlContent);
    }
  }, [content, processContent]);

  return (
    <div
      className={`markdown-content ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}