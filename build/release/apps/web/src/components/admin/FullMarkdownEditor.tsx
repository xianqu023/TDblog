"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

// 动态导入 MDEditor
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px] border rounded-lg bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    ),
  }
);

const MDPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    ),
  }
);

// Emoji 列表
const EMOJI_LIST = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂",
  "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛",
  "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳",
  "👍", "👎", "👏", "🙌", "💪", "🎉", "✨", "🔥", "💯", "❤️",
  "😍", "🤔", "😴", "😭", "😤", "😡", "🤯", "😱", "🤗", "🤭",
];

interface FullMarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: number | string;
  preview?: "live" | "edit" | "preview";
}

export default function FullMarkdownEditor({
  value = "",
  onChange,
  placeholder = "开始写作...",
  height = 600,
  preview = "live",
}: FullMarkdownEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // 生成目录
  const generateTOC = useCallback(() => {
    const lines = value.split("\n");
    const toc: string[] = [];
    const headings: { level: number; text: string }[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        headings.push({ level, text });
      }
    });

    if (headings.length === 0) return "<!-- 没有检测到标题 -->";

    toc.push("## 目录\n");
    headings.forEach(({ level, text }) => {
      const indent = "  ".repeat(level - 1);
      toc.push(`${indent}- [${text}](#${text.toLowerCase().replace(/\s+/g, "-")})`);
    });

    return toc.join("\n");
  }, [value]);

  // 插入目录
  const insertTOC = useCallback(() => {
    const toc = generateTOC();
    const newValue = value ? `${toc}\n\n${value}` : toc;
    onChange?.(newValue);
  }, [generateTOC, value, onChange]);

  // 图片上传
  const handleImageUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      setUploading(true);
      const urls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.url) urls.push(data.data.url);
        }
      }

      if (urls.length > 0 && onChange) {
        const md = urls.map((u) => `![image](${u})`).join("\n");
        onChange(value ? `${value}\n${md}` : md);
      }

      setUploading(false);
    };

    input.click();
  }, [value, onChange]);

  // AI 生成封面
  const generateCover = useCallback(async () => {
    const title = window.prompt("请输入文章标题:");
    if (!title) return;

    setGeneratingCover(true);
    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: title, type: "cover" }),
      });

      const data = await res.json();
      if (data.success && data.url) {
        const md = `![封面](${data.url})`;
        onChange?.(value ? `${md}\n\n${value}` : md);
      }
    } catch (e) {
      alert("生成失败");
    }
    setGeneratingCover(false);
  }, [value, onChange]);

  // 插入各种元素
  const insertMath = useCallback(() => {
    const block = `$$\nE = mc^2\n$$`;
    onChange?.(value ? `${value}\n\n${block}` : block);
  }, [value, onChange]);

  const insertFlowchart = useCallback(() => {
    const block = "\`\`\`mermaid\nflowchart TD\n    A[开始] --> B{判断}\n    B -->|是| C[处理1]\n    B -->|否| D[处理2]\n\`\`\`";
    onChange?.(value ? `${value}\n\n${block}` : block);
  }, [value, onChange]);

  const insertSequence = useCallback(() => {
    const block = "\`\`\`mermaid\nsequenceDiagram\n    A->>B: 请求\n    B-->>A: 响应\n\`\`\`";
    onChange?.(value ? `${value}\n\n${block}` : block);
  }, [value, onChange]);

  const insertGantt = useCallback(() => {
    const block = "\`\`\`mermaid\ngantt\n    title 项目计划\n    任务1 :a1, 2024-01-01, 7d\n    任务2 :after a1, 5d\n\`\`\`";
    onChange?.(value ? `${value}\n\n${block}` : block);
  }, [value, onChange]);

  const insertPie = useCallback(() => {
    const block = "\`\`\`mermaid\npie\n    \"A\" : 40\n    \"B\" : 30\n    \"C\" : 30\n\`\`\`";
    onChange?.(value ? `${value}\n\n${block}` : block);
  }, [value, onChange]);

  const insertMindmap = useCallback(() => {
    const block = "\`\`\`mermaid\nmindmap\n  root((主题))\n    分支1\n      子分支\n    分支2\n\`\`\`";
    onChange?.(value ? `${value}\n\n${block}` : block);
  }, [value, onChange]);

  const insertTable = useCallback(() => {
    const block = `| A | B | C |
|---|---|---|
| 1 | 2 | 3 |
| 4 | 5 | 6 |`;
    onChange?.(value ? `${value}\n\n${block}` : block);
  }, [value, onChange]);

  const insertTaskList = useCallback(() => {
    const block = `- [ ] 任务1
- [ ] 任务2
- [x] 已完成`;
    onChange?.(value ? `${value}\n\n${block}` : block);
  }, [value, onChange]);

  const insertEmoji = useCallback((emoji: string) => {
    onChange?.(value + emoji);
    setShowEmojiPicker(false);
  }, [value, onChange]);

  const commands = [
    { name: "upload", icon: "📷", title: "上传图片", exec: handleImageUpload },
    { name: "ai-cover", icon: generatingCover ? "⏳" : "🎨", title: "AI封面", exec: generateCover },
    { name: "toc", icon: "📑", title: "目录", exec: insertTOC },
    { name: "math", icon: "∑", title: "公式", exec: insertMath },
    { name: "flow", icon: "流程", title: "流程图", exec: insertFlowchart },
    { name: "seq", icon: "序列", title: "序列图", exec: insertSequence },
    { name: "gantt", icon: "甘特", title: "甘特图", exec: insertGantt },
    { name: "pie", icon: "饼图", title: "饼图", exec: insertPie },
    { name: "mind", icon: "导图", title: "思维导图", exec: insertMindmap },
    { name: "table", icon: "▦", title: "表格", exec: insertTable },
    { name: "task", icon: "☑", title: "任务列表", exec: insertTaskList },
  ];

  return (
    <div data-color-mode="light" className="relative h-full flex flex-col">
      {uploading && (
        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {/* 自定义工具栏 */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b flex-wrap">
        {commands.map((cmd) => (
          <button
            key={cmd.name}
            onClick={cmd.exec}
            title={cmd.title}
            className="px-2 py-1 text-xs hover:bg-gray-200 rounded"
          >
            {cmd.icon}
          </button>
        ))}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="px-2 py-1 text-xs hover:bg-gray-200 rounded"
            title="Emoji"
          >
            😀
          </button>
          {showEmojiPicker && (
            <div className="absolute top-8 left-0 z-50 bg-white border rounded shadow-lg p-2 grid grid-cols-10 gap-1 w-64">
              {EMOJI_LIST.map((e) => (
                <button key={e} onClick={() => insertEmoji(e)} className="hover:bg-gray-100 rounded">
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <MDEditor
        value={value}
        onChange={(v) => onChange?.(v || "")}
        height={typeof height === "number" ? height - 40 : 560}
        preview={preview}
        textareaProps={{ placeholder }}
      />
    </div>
  );
}

// 预览组件
export function MarkdownPreview({ content }: { content: string }) {
  return (
    <div data-color-mode="light" className="prose prose-slate max-w-none">
      <MDPreview source={content} />
    </div>
  );
}
