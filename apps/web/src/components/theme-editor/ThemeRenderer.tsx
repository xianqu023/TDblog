"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ThemeComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  styles?: Record<string, any>;
}

interface ThemeRendererProps {
  components: ThemeComponent[];
}

export default function ThemeRenderer({ components }: ThemeRendererProps) {
  const renderComponent = (component: ThemeComponent) => {
    const { type, props } = component;

    switch (type) {
      case "hero":
        return (
          <div
            className="relative py-20 px-8 text-center"
            style={{
              background: props.backgroundGradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              minHeight: props.height || "600px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: props.alignment === "center" ? "center" : props.alignment === "left" ? "flex-start" : "flex-end",
            }}
          >
            {props.backgroundImage && (
              <img
                src={props.backgroundImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: props.overlayOpacity || 0.5 }}
              />
            )}
            <div className="relative z-10 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: props.textColor || "#ffffff" }}>
                {props.title}
              </h1>
              <p className="text-xl mb-8" style={{ color: props.textColor || "#ffffff", opacity: 0.9 }}>
                {props.subtitle}
              </p>
              {props.ctaText && (
                <a
                  href={props.ctaLink || "#"}
                  className="inline-block px-8 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  {props.ctaText}
                </a>
              )}
            </div>
          </div>
        );

      case "heading":
        const HeadingTag = `h${props.level || 2}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
        return (
          <div className="py-4 px-6">
            <HeadingTag
              className="font-bold"
              style={{
                textAlign: props.alignment || "left",
                color: props.color || "var(--text)",
                fontSize: props.level === 1 ? "2.5rem" : props.level === 2 ? "2rem" : props.level === 3 ? "1.5rem" : "1.25rem",
              }}
            >
              {props.text}
            </HeadingTag>
          </div>
        );

      case "text":
        return (
          <div className="py-3 px-6">
            <p
              style={{
                textAlign: props.alignment || "left",
                color: props.color || "var(--text-muted)",
                fontSize: props.fontSize || "1rem",
                lineHeight: props.lineHeight || "1.75",
              }}
            >
              {props.text}
            </p>
          </div>
        );

      case "button":
        const variants: Record<string, string> = {
          primary: "bg-blue-600 text-white hover:bg-blue-700",
          secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
          outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
          ghost: "text-blue-600 hover:bg-blue-50",
        };
        const sizes: Record<string, string> = {
          sm: "px-4 py-2 text-sm",
          md: "px-6 py-2.5 text-base",
          lg: "px-8 py-3 text-lg",
        };
        return (
          <div className="py-4 px-6">
            <a
              href={props.link || "#"}
              className={`inline-block rounded-lg font-medium transition-colors ${variants[props.variant || "primary"]} ${sizes[props.size || "md"]} ${props.fullWidth ? "w-full text-center" : ""}`}
            >
              {props.text}
            </a>
          </div>
        );

      case "image":
        return (
          <div className="py-4 px-6">
            <img
              src={props.src || "/placeholder.jpg"}
              alt={props.alt || ""}
              className="w-full"
              style={{
                height: props.height || "auto",
                objectFit: props.objectFit || "cover",
                borderRadius: props.borderRadius || "0.5rem",
              }}
            />
            {props.caption && (
              <p className="text-sm text-gray-500 mt-2 text-center">{props.caption}</p>
            )}
          </div>
        );

      case "divider":
        return (
          <div className="py-4 px-6">
            <hr
              style={{
                borderTop: `${props.thickness || "1px"} ${props.style || "solid"} ${props.color || "var(--border)"}`,
                margin: props.margin || "2rem 0",
              }}
            />
          </div>
        );

      case "spacer":
        return <div style={{ height: props.height || "2rem" }} />;

      case "container":
        return (
          <div
            className="py-6"
            style={{
              maxWidth: props.maxWidth || "1200px",
              margin: "0 auto",
              padding: props.padding || "2rem",
              backgroundColor: props.backgroundColor || "transparent",
            }}
          />
        );

      case "grid":
        return (
          <div
            className="py-6 px-6"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${props.columns || 3}, 1fr)`,
              gap: props.gap || "1.5rem",
            }}
          />
        );

      case "columns":
        return (
          <div className="py-6 px-6 flex gap-4">
            {Array.from({ length: props.columns || 2 }).map((_, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ flex: props.columnWidths?.[i] || "1fr" }}
              />
            ))}
          </div>
        );

      case "section":
        return (
          <div
            className="py-12 px-6"
            style={{
              padding: props.padding || "4rem 2rem",
              backgroundColor: props.backgroundColor || "var(--bg)",
              backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : undefined,
            }}
          />
        );

      case "articleList":
        return (
          <div className="py-8 px-6">
            <div className={`grid gap-6 ${props.layout === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {Array.from({ length: Math.min(props.limit || 6, 6) }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {props.showThumbnail && (
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500" />
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold mb-2">文章标题 {i + 1}</h4>
                    {props.showExcerpt && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">这是一段文章摘要...</p>
                    )}
                    {props.showMeta && (
                      <div className="flex items-center text-xs text-gray-500">
                        <span>2024-01-{String(i + 1).padStart(2, "0")}</span>
                        <span className="mx-2">•</span>
                        <span>{100 * (i + 1)} 阅读</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "navbar":
        return (
          <nav className={`sticky top-0 z-50 bg-white border-b border-gray-200 ${props.sticky ? "sticky" : ""}`}>
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {props.logo && <img src={props.logo} alt="Logo" className="h-8 w-8" />}
                <span className="font-bold text-lg">My Blog</span>
              </div>
              <div className="flex items-center gap-6">
                {(props.links || []).map((link: any, i: number) => (
                  <a key={i} href={link.href} className="text-gray-600 hover:text-blue-600 transition-colors">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        );

      case "footer":
        return (
          <footer className="bg-gray-900 text-gray-300 py-12 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-white font-semibold mb-4">关于我们</h4>
                <p className="text-sm text-gray-400">这是一个博客平台</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">快速链接</h4>
                <ul className="space-y-2">
                  {(props.links || []).map((link: any, i: number) => (
                    <li key={i}>
                      <a href={link.href} className="text-sm hover:text-white transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">关注我们</h4>
                <p className="text-sm text-gray-400">社交媒体链接</p>
              </div>
            </div>
            <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
              {props.copyright || "© 2024 My Blog"}
            </div>
          </footer>
        );

      case "contactForm":
        return (
          <div className="py-8 px-6 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">{props.title || "联系我们"}</h3>
            <form className="space-y-4">
              {(props.fields || []).map((field: any, i: number) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={4} />
                  ) : (
                    <input type={field.type || "text"} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  )}
                </div>
              ))}
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
                {props.submitText || "发送消息"}
              </button>
            </form>
          </div>
        );

      case "newsletterForm":
        return (
          <div className="py-8 px-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="max-w-xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-2">{props.title || "订阅我们的通讯"}</h3>
              <p className="text-gray-600 mb-6">{props.description || "获取最新文章和更新"}</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder={props.placeholder || "输入你的邮箱"}
                />
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                  {props.buttonText || "订阅"}
                </button>
              </div>
            </div>
          </div>
        );

      case "searchBox":
        return (
          <div className="py-4 px-6">
            <div className="flex gap-2 max-w-xl mx-auto">
              <input
                type="text"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={props.placeholder || "搜索文章..."}
              />
              {props.showButton && (
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {props.buttonText || "搜索"}
                </button>
              )}
            </div>
          </div>
        );

      case "faq":
        return (
          <div className="py-8 px-6 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">常见问题</h3>
            <div className="space-y-4">
              {(props.questions || []).map((q: any, i: number) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{q.question}</h4>
                  <p className="text-gray-600 text-sm">{q.answer}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "stats":
        return (
          <div className="py-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {(props.stats || []).map((stat: any, i: number) => (
                <div key={i}>
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case "testimonial":
        return (
          <div className="py-12 px-6">
            <h3 className="text-2xl font-bold mb-8 text-center">客户评价</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {(props.testimonials || []).map((t: any, i: number) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-gray-600 mb-4 italic">"{t.content}"</p>
                  <div className="flex items-center gap-3">
                    {t.avatar && <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full" />}
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-sm text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "pricing":
        return (
          <div className="py-12 px-6">
            <h3 className="text-2xl font-bold mb-8 text-center">价格方案</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {(props.plans || []).map((plan: any, i: number) => (
                <div
                  key={i}
                  className={`p-6 rounded-lg border-2 ${plan.popular ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}
                >
                  {plan.popular && (
                    <span className="inline-block px-3 py-1 bg-blue-500 text-white text-xs rounded-full mb-3">推荐</span>
                  )}
                  <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                  <div className="text-3xl font-bold mb-4">
                    {props.currency || "¥"}{plan.price}
                    <span className="text-sm font-normal text-gray-500">/{props.billingPeriod || "月"}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {(plan.features || []).map((f: string, j: number) => (
                      <li key={j} className="text-sm text-gray-600">✓ {f}</li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-2 rounded-lg font-medium ${
                      plan.popular ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    选择方案
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "carousel":
        return (
          <div className="py-6 px-6">
            <div className="relative rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: props.aspectRatio || "16/9" }}>
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎠</div>
                  <p>轮播图组件</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "video":
        return (
          <div className="py-6 px-6">
            <div className="max-w-3xl mx-auto rounded-lg overflow-hidden bg-gray-900" style={{ aspectRatio: props.aspectRatio || "16/9" }}>
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-6xl mb-2">▶</div>
                  <p>视频播放器</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "imageGallery":
        return (
          <div className="py-6 px-6">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${props.columns || 3}, 1fr)` }}
            >
              {(props.images || []).map((img: any, i: number) => (
                <div key={i} className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg" />
              ))}
            </div>
          </div>
        );

      case "list":
        const ListTag = props.ordered ? "ol" : "ul";
        return (
          <div className="py-4 px-6">
            <ListTag className="list-disc pl-6 space-y-2">
              {(props.items || []).map((item: string, i: number) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ListTag>
          </div>
        );

      default:
        return null;
    }
  };

  if (!components || components.length === 0) {
    return null;
  }

  return (
    <div className="theme-renderer">
      {components.map((component) => (
        <motion.div
          key={component.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          suppressHydrationWarning
        >
          {renderComponent(component)}
        </motion.div>
      ))}
    </div>
  );
}
