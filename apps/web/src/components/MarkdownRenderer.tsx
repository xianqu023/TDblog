import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // 配置 marked 选项
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  // 将 Markdown 转换为 HTML
  const html = marked(content);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
