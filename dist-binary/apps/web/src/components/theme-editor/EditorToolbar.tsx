"use client";

import { useThemeEditorStore } from "@/lib/theme-editor/store";
import { useState, useEffect } from "react";

export default function EditorToolbar() {
  const { themeName, themeSlug, setThemeName, togglePreviewMode, isPreviewMode, components, loadConfig } = useThemeEditorStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(themeName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [themeId, setThemeId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("themeId");
    if (id) setThemeId(id);
  }, []);

  const handleSaveName = () => {
    setThemeName(tempName);
    setIsEditingName(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    
    try {
      const config = { components: useThemeEditorStore.getState().exportConfig() };
      
      const url = themeId 
        ? `/api/admin/themes?id=${themeId}`
        : "/api/admin/themes";
      
      const method = themeId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: themeName,
          slug: themeSlug || themeName.toLowerCase().replace(/\s+/g, "-"),
          config,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ 主题已保存");
        if (!themeId && data.data?.id) {
          setThemeId(data.data.id);
          const newUrl = `${window.location.pathname}?themeId=${data.data.id}`;
          window.history.replaceState({}, "", newUrl);
        }
      } else {
        setMessage(`❌ ${data.error || "保存失败"}`);
      }
    } catch (error) {
      setMessage("❌ 保存失败，请重试");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleSaveVersion = async () => {
    if (!themeId) {
      setMessage("❌ 请先保存主题后再创建版本");
      return;
    }

    try {
      const res = await fetch(`/api/admin/themes/versions?themeId=${themeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "手动保存" }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ 版本已创建");
      } else {
        setMessage(`❌ ${data.error || "创建版本失败"}`);
      }
    } catch {
      setMessage("❌ 创建版本失败");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleLoad = () => {
    const demoConfig = [
      {
        id: "hero-demo",
        type: "hero",
        props: {
          title: "欢迎来到我的博客",
          subtitle: "分享技术与生活的点点滴滴",
          ctaText: "开始阅读",
          ctaLink: "/articles",
          alignment: "center",
          height: "500px",
        },
        styles: {
          backgroundGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        },
      },
      {
        id: "article-list-demo",
        type: "articleList",
        props: {
          limit: 6,
          layout: "grid",
          showThumbnail: true,
          showExcerpt: true,
          showMeta: true,
        },
      },
      {
        id: "footer-demo",
        type: "footer",
        props: {
          columns: 3,
          showSocialLinks: true,
          showNewsletter: true,
          copyright: "© 2024 My Blog",
          links: [
            { label: "关于我们", href: "/about" },
            { label: "联系方式", href: "/contact" },
            { label: "隐私政策", href: "/privacy" },
          ],
        },
      },
    ];
    loadConfig(demoConfig);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            />
            <button
              onClick={handleSaveName}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
            <button
              onClick={() => setIsEditingName(false)}
              className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-800">{themeName}</h1>
            <button
              onClick={() => setIsEditingName(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✏️
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {message && (
          <span className="text-sm">{message}</span>
        )}
        <button
          onClick={handleLoad}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          📥 加载示例
        </button>
        {themeId && (
          <button
            onClick={handleSaveVersion}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            📦 创建版本
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? "保存中..." : "💾 保存主题"}
        </button>
        <button
          onClick={togglePreviewMode}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            isPreviewMode
              ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {isPreviewMode ? "✏️ 编辑" : "👁 预览"}
        </button>
      </div>
    </div>
  );
}
