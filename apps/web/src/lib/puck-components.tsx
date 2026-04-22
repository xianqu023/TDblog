"use client";

import React from "react";
import { ComponentConfig } from "@puckeditor/core";

export interface HeroProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  overlayOpacity: number;
  ctaText: string;
  ctaLink: string;
  alignment: "left" | "center" | "right";
  height: string;
}

export const Hero: ComponentConfig<HeroProps> = {
  label: "Hero 横幅",
  defaultProps: {
    title: "欢迎来到我的博客",
    subtitle: "分享技术与生活的点点滴滴",
    backgroundImage: "",
    overlayOpacity: 0.5,
    ctaText: "开始阅读",
    ctaLink: "/articles",
    alignment: "center",
    height: "600px",
  },
  fields: {
    title: { type: "text" },
    subtitle: { type: "text" },
    backgroundImage: { type: "text" },
    overlayOpacity: { type: "number" },
    ctaText: { type: "text" },
    ctaLink: { type: "text" },
    alignment: {
      type: "radio",
      options: [
        { label: "左", value: "left" },
        { label: "中", value: "center" },
        { label: "右", value: "right" },
      ],
    },
    height: { type: "text" },
  },
  render: ({ title, subtitle, ctaText, ctaLink, alignment, height }) => {
    return (
      <div
        className="relative py-20 px-8 text-center"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          minHeight: height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: alignment === "center" ? "center" : alignment === "left" ? "flex-start" : "flex-end",
        }}
      >
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">{title}</h1>
          <p className="text-xl mb-8 text-white/90">{subtitle}</p>
          {ctaText && (
            <a href={ctaLink || "#"} className="inline-block px-8 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100">
              {ctaText}
            </a>
          )}
        </div>
      </div>
    );
  },
};

export interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  alignment: "left" | "center" | "right";
  color: string;
}

export const Heading: ComponentConfig<HeadingProps> = {
  label: "标题",
  defaultProps: {
    level: 2,
    text: "这是一个标题",
    alignment: "left",
    color: "#000000",
  },
  fields: {
    level: { type: "number" },
    text: { type: "text" },
    alignment: {
      type: "radio",
      options: [
        { label: "左", value: "left" },
        { label: "中", value: "center" },
        { label: "右", value: "right" },
      ],
    },
    color: { type: "text" },
  },
  render: ({ level, text, alignment, color }) => {
    const Tag = `h${level}` as React.ElementType;
    return (
      <div className="py-4 px-6">
        <Tag className="font-bold" style={{ textAlign: alignment, color }}>
          {text}
        </Tag>
      </div>
    );
  },
};

export interface TextProps {
  text: string;
  fontSize: string;
  lineHeight: string;
  color: string;
  alignment: "left" | "center" | "right";
}

export const Text: ComponentConfig<TextProps> = {
  label: "文本段落",
  defaultProps: {
    text: "这是一段文本内容。",
    fontSize: "1rem",
    lineHeight: "1.75",
    color: "#666666",
    alignment: "left",
  },
  fields: {
    text: { type: "textarea" },
    fontSize: { type: "text" },
    lineHeight: { type: "text" },
    color: { type: "text" },
    alignment: {
      type: "radio",
      options: [
        { label: "左", value: "left" },
        { label: "中", value: "center" },
        { label: "右", value: "right" },
      ],
    },
  },
  render: ({ text, alignment, color }) => {
    return (
      <div className="py-3 px-6">
        <p style={{ textAlign: alignment, color }}>{text}</p>
      </div>
    );
  },
};

export interface ButtonProps {
  text: string;
  link: string;
  variant: "primary" | "secondary" | "outline";
  size: "sm" | "md" | "lg";
  fullWidth: boolean;
}

export const Button: ComponentConfig<ButtonProps> = {
  label: "按钮",
  defaultProps: {
    text: "点击这里",
    link: "#",
    variant: "primary",
    size: "md",
    fullWidth: false,
  },
  fields: {
    text: { type: "text" },
    link: { type: "text" },
    variant: {
      type: "radio",
      options: [
        { label: "主要", value: "primary" },
        { label: "次要", value: "secondary" },
        { label: "边框", value: "outline" },
      ],
    },
    size: {
      type: "radio",
      options: [
        { label: "小", value: "sm" },
        { label: "中", value: "md" },
        { label: "大", value: "lg" },
      ],
    },
    fullWidth: { type: "select", options: [{ label: "是", value: true }, { label: "否", value: false }] },
  },
  render: ({ text, link, variant, size, fullWidth }) => {
    const sizeClasses = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-2.5 text-base",
      lg: "px-8 py-3 text-lg",
    };

    const variantClasses = {
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-gray-600 text-white hover:bg-gray-700",
      outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    };

    return (
      <div className="py-4 px-6">
        <a
          href={link || "#"}
          className={`inline-block rounded-lg font-medium transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${fullWidth ? "w-full text-center" : ""}`}
        >
          {text}
        </a>
      </div>
    );
  },
};

export interface ImageProps {
  src: string;
  alt: string;
  width: string;
  height: string;
  borderRadius: string;
  caption: string;
}

export const Image: ComponentConfig<ImageProps> = {
  label: "图片",
  defaultProps: {
    src: "/placeholder.jpg",
    alt: "图片描述",
    width: "100%",
    height: "auto",
    borderRadius: "0.5rem",
    caption: "",
  },
  fields: {
    src: { type: "text" },
    alt: { type: "text" },
    width: { type: "text" },
    height: { type: "text" },
    borderRadius: { type: "text" },
    caption: { type: "text" },
  },
  render: ({ src, alt, width, height, borderRadius, caption }) => {
    return (
      <div className="py-4 px-6">
        <img
          src={src || "/placeholder.jpg"}
          alt={alt || ""}
          className="w-full"
          style={{ height, borderRadius }}
        />
        {caption && <p className="text-sm text-gray-500 mt-2 text-center">{caption}</p>}
      </div>
    );
  },
};

export interface ContainerProps {
  maxWidth: string;
  padding: string;
  backgroundColor: string;
  root?: React.ReactNode;
}

export const Container: ComponentConfig<ContainerProps> = {
  label: "容器",
  defaultProps: {
    maxWidth: "1200px",
    padding: "2rem",
    backgroundColor: "transparent",
  },
  fields: {
    maxWidth: { type: "text" },
    padding: { type: "text" },
    backgroundColor: { type: "text" },
  },
  render: ({ root, maxWidth, padding, backgroundColor }) => {
    return (
      <div
        className="py-6"
        style={{ maxWidth, margin: "0 auto", padding, backgroundColor }}
      >
        {root}
      </div>
    );
  },
};

export interface GridProps {
  columns: number;
  gap: string;
  root?: React.ReactNode;
}

export const Grid: ComponentConfig<GridProps> = {
  label: "网格布局",
  defaultProps: {
    columns: 3,
    gap: "1.5rem",
  },
  fields: {
    columns: { type: "number" },
    gap: { type: "text" },
  },
  render: ({ root, columns, gap }) => {
    return (
      <div
        className="py-6 px-6"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap,
        }}
      >
        {root}
      </div>
    );
  },
};

export interface SectionProps {
  padding: string;
  backgroundColor: string;
  root?: React.ReactNode;
}

export const Section: ComponentConfig<SectionProps> = {
  label: "内容区块",
  defaultProps: {
    padding: "4rem 2rem",
    backgroundColor: "#f9fafb",
  },
  fields: {
    padding: { type: "text" },
    backgroundColor: { type: "text" },
  },
  render: ({ root, padding, backgroundColor }) => {
    return (
      <div className="px-6" style={{ padding, backgroundColor }}>
        {root}
      </div>
    );
  },
};

export interface DividerProps {
  style: "solid" | "dashed" | "dotted";
  color: string;
  thickness: string;
}

export const Divider: ComponentConfig<DividerProps> = {
  label: "分隔线",
  defaultProps: {
    style: "solid",
    color: "#e5e7eb",
    thickness: "1px",
  },
  fields: {
    style: {
      type: "radio",
      options: [
        { label: "实线", value: "solid" },
        { label: "虚线", value: "dashed" },
        { label: "点线", value: "dotted" },
      ],
    },
    color: { type: "text" },
    thickness: { type: "text" },
  },
  render: ({ style, color, thickness }) => {
    return (
      <div className="py-4 px-6">
        <hr style={{ borderStyle: style, borderColor: color, borderWidth: thickness }} />
      </div>
    );
  },
};

export interface SpacerProps {
  height: string;
}

export const Spacer: ComponentConfig<SpacerProps> = {
  label: "间距",
  defaultProps: {
    height: "2rem",
  },
  fields: {
    height: { type: "text" },
  },
  render: ({ height }) => {
    return <div style={{ height }} />;
  },
};

export interface NavbarProps {
  logo: string;
  siteName: string;
  links: Array<{ label: string; href: string }>;
  sticky: boolean;
}

export const Navbar: ComponentConfig<NavbarProps> = {
  label: "导航栏",
  defaultProps: {
    logo: "/logo.png",
    siteName: "My Blog",
    links: [
      { label: "首页", href: "/" },
      { label: "文章", href: "/articles" },
      { label: "关于", href: "/about" },
    ],
    sticky: true,
  },
  render: ({ siteName, links, sticky }) => {
    return (
      <nav className={`bg-white border-b border-gray-200 ${sticky ? "sticky top-0 z-50" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-lg">{siteName}</span>
          <div className="flex items-center gap-6">
            {links.map((link, i) => (
              <a key={i} href={link.href} className="text-gray-600 hover:text-blue-600">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </nav>
    );
  },
};

export interface FooterProps {
  copyright: string;
  showSocialLinks: boolean;
}

export const Footer: ComponentConfig<FooterProps> = {
  label: "页脚",
  defaultProps: {
    copyright: "© 2024 My Blog",
    showSocialLinks: true,
  },
  render: ({ copyright }) => {
    return (
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-500">{copyright}</p>
        </div>
      </footer>
    );
  },
};

export interface ArticleListProps {
  limit: number;
  layout: "grid" | "list";
  showThumbnail: boolean;
  showExcerpt: boolean;
  showMeta: boolean;
}

export const ArticleList: ComponentConfig<ArticleListProps> = {
  label: "文章列表",
  defaultProps: {
    limit: 6,
    layout: "grid",
    showThumbnail: true,
    showExcerpt: true,
    showMeta: true,
  },
  render: ({ limit, layout, showThumbnail }) => {
    return (
      <div className="py-8 px-6">
        <h3 className="text-2xl font-bold mb-6">最新文章</h3>
        <div className={`gap-6 ${layout === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3" : "space-y-6"}`}>
          {Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {showThumbnail && (
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500" />
              )}
              <div className="p-4">
                <h4 className="font-semibold mb-2">文章标题 {i + 1}</h4>
                <div className="flex items-center text-xs text-gray-500">
                  <span>2024-01-{String(i + 1).padStart(2, "0")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export interface ContactFormProps {
  title: string;
  fields: Array<{ name: string; label: string; type: string; required: boolean }>;
  submitText: string;
}

export const ContactForm: ComponentConfig<ContactFormProps> = {
  label: "联系表单",
  defaultProps: {
    title: "联系我们",
    fields: [
      { name: "name", label: "姓名", type: "text", required: true },
      { name: "email", label: "邮箱", type: "email", required: true },
      { name: "message", label: "留言", type: "textarea", required: true },
    ],
    submitText: "发送消息",
  },
  render: ({ title, fields, submitText }) => {
    return (
      <div className="py-8 px-6 max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold mb-6">{title}</h3>
        <form className="space-y-4">
          {fields.map((field, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type || "text"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={`请输入${field.label}`}
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            {submitText}
          </button>
        </form>
      </div>
    );
  },
};

export interface FAQProps {
  questions: Array<{ question: string; answer: string }>;
}

export const FAQ: ComponentConfig<FAQProps> = {
  label: "常见问题",
  defaultProps: {
    questions: [
      { question: "如何使用？", answer: "很简单，只需..." },
      { question: "支持哪些功能？", answer: "我们支持..." },
    ],
  },
  render: ({ questions }) => {
    return (
      <div className="py-8 px-6 max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold mb-6 text-center">常见问题</h3>
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2">{q.question}</h4>
              <p className="text-gray-600 text-sm">{q.answer}</p>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export interface StatsProps {
  stats: Array<{ label: string; value: string; icon: string }>;
  columns: number;
}

export const Stats: ComponentConfig<StatsProps> = {
  label: "数据统计",
  defaultProps: {
    stats: [
      { label: "文章", value: "100+", icon: "📝" },
      { label: "读者", value: "10K+", icon: "👥" },
      { label: "评论", value: "5K+", icon: "💬" },
    ],
    columns: 3,
  },
  render: ({ stats, columns }) => {
    return (
      <div className="py-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className={`max-w-4xl mx-auto grid gap-8 text-center`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {stats.map((stat, i) => (
            <div key={i}>
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-blue-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
