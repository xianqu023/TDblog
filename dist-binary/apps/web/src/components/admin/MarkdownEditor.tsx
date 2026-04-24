"use client";

import { useState } from "react";
import { Eye, Edit, Image as ImageIcon, FolderOpen } from "lucide-react";
import FileSelector from "@/components/admin/FileSelector";

interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: string;
  preview?: boolean;
}

// 简单的 Markdown 编辑器组件
export default function MarkdownEditor({
  value = "",
  onChange,
  placeholder = "开始写作...",
  height = "600px",
  preview = false,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);

  // 插入 Markdown 语法
  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = document.getElementById("markdown-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange?.(newText);
    
    // 恢复焦点
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // 上传图片
  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.url) {
            insertMarkdown(`![${file.name}](${data.url})`);
          }
        } else {
          alert("图片上传失败");
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("图片上传失败");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  // 从文件库选择图片
  const handleImageSelect = (file: any) => {
    insertMarkdown(`![${file.originalName}](${file.url})`);
  };

  // 简单的 Markdown 预览渲染
  const renderPreview = (content: string): string => {
    return content
      // 代码块
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>')
      // 行内代码
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      // 标题
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold my-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold my-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold my-4">$1</h1>')
      // 粗体和斜体
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener">$1</a>')
      // 图片
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded-lg" />')
      // 无序列表
      .replace(/^\s*[-*+]\s+(.+)$/gim, '<li class="ml-4">$1</li>')
      // 有序列表
      .replace(/^\s*\d+\.\s+(.+)$/gim, '<li class="ml-4 list-decimal">$1</li>')
      // 引用
      .replace(/^>\s*(.+)$/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600">$1</blockquote>')
      // 分隔线
      .replace(/^---$/gim, '<hr class="my-6 border-gray-300" />')
      // 段落
      .replace(/\n\n/g, '</p><p class="my-4">')
      // 换行
      .replace(/\n/g, '<br />');
  };

  if (preview) {
    return (
      <div 
        className="prose prose-slate max-w-none p-4"
        dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
      />
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* 工具栏 */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">
        <button
          onClick={() => insertMarkdown("# ")}
          className="p-2 hover:bg-gray-200 rounded text-sm font-bold"
          title="标题 1"
        >
          H1
        </button>
        <button
          onClick={() => insertMarkdown("## ")}
          className="p-2 hover:bg-gray-200 rounded text-sm font-bold"
          title="标题 2"
        >
          H2
        </button>
        <button
          onClick={() => insertMarkdown("### ")}
          className="p-2 hover:bg-gray-200 rounded text-sm font-bold"
          title="标题 3"
        >
          H3
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          onClick={() => insertMarkdown("**", "**")}
          className="p-2 hover:bg-gray-200 rounded text-sm font-bold"
          title="粗体"
        >
          B
        </button>
        <button
          onClick={() => insertMarkdown("*", "*")}
          className="p-2 hover:bg-gray-200 rounded text-sm italic"
          title="斜体"
        >
          I
        </button>
        <button
          onClick={() => insertMarkdown("~~", "~~")}
          className="p-2 hover:bg-gray-200 rounded text-sm line-through"
          title="删除线"
        >
          S
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          onClick={() => insertMarkdown("- ")}
          className="p-2 hover:bg-gray-200 rounded"
          title="无序列表"
        >
          • List
        </button>
        <button
          onClick={() => insertMarkdown("1. ")}
          className="p-2 hover:bg-gray-200 rounded"
          title="有序列表"
        >
          1. List
        </button>
        <button
          onClick={() => insertMarkdown("> ")}
          className="p-2 hover:bg-gray-200 rounded"
          title="引用"
        >
          &quot; Quote
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          onClick={() => insertMarkdown("```\n", "\n```")}
          className="p-2 hover:bg-gray-200 rounded text-sm font-mono"
          title="代码块"
        >
          {"<>"}
        </button>
        <button
          onClick={() => insertMarkdown("`", "`")}
          className="p-2 hover:bg-gray-200 rounded text-sm font-mono"
          title="行内代码"
        >
          code
        </button>
        <button
          onClick={handleImageUpload}
          disabled={uploading}
          className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
          title="上传图片"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowFileSelector(true)}
          className="p-2 hover:bg-gray-200 rounded"
          title="从文件库选择"
        >
          <FolderOpen className="h-4 w-4" />
        </button>
        <button
          onClick={() => insertMarkdown("[链接文字](", ")")}
          className="p-2 hover:bg-gray-200 rounded"
          title="链接"
        >
          Link
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`p-2 rounded flex items-center gap-1 ${showPreview ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
          title="预览"
        >
          {showPreview ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPreview ? "编辑" : "预览"}
        </button>
      </div>

      {/* 编辑区域 */}
      <div className="relative" style={{ height }}>
        {showPreview ? (
          <div 
            className="w-full h-full p-4 overflow-auto prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
          />
        ) : (
          <textarea
            id="markdown-editor"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full p-4 resize-none focus:outline-none font-mono text-sm leading-relaxed"
            style={{ minHeight: height }}
          />
        )}
      </div>

      {/* 底部状态栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50 text-xs text-gray-500">
        <span>支持 Markdown 语法</span>
        <span>{value.length} 字符</span>
      </div>

      {/* 文件选择器 */}
      <FileSelector
        isOpen={showFileSelector}
        onClose={() => setShowFileSelector(false)}
        onSelect={handleImageSelect}
        type="image"
      />
    </div>
  );
}

// 预览组件
export function MarkdownPreview({ content }: { content: string }) {
  const renderPreview = (content: string): string => {
    return content
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold my-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold my-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold my-4">$1</h1>')
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded-lg" />')
      .replace(/^\s*[-*+]\s+(.+)$/gim, '<li class="ml-4">$1</li>')
      .replace(/^\s*\d+\.\s+(.+)$/gim, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/^>\s*(.+)$/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600">$1</blockquote>')
      .replace(/^---$/gim, '<hr class="my-6 border-gray-300" />')
      .replace(/\n\n/g, '</p><p class="my-4">')
      .replace(/\n/g, '<br />');
  };

  return (
    <div 
      className="prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
    />
  );
}
