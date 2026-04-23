"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, History, RotateCcw, ArrowLeft } from "lucide-react";

interface Document {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: string;
  version: number;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface DocumentVersion {
  id: string;
  version: number;
  content: string;
  createdAt: string;
  author: {
    username: string;
    profile: {
      displayName: string | null;
    };
  };
}

export default function EditDocumentClient({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [document, setDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    categoryId: "",
    status: "DRAFT",
  });

  // 加载文档
  useEffect(() => {
    const loadDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`);
        const result = await response.json();

        if (result.success) {
          setDocument(result.data);
          setFormData({
            title: result.data.title,
            slug: result.data.slug,
            content: result.data.content,
            excerpt: result.data.excerpt || "",
            categoryId: result.data.categoryId || "",
            status: result.data.status,
          });
        }
      } catch (error) {
        console.error("Failed to load document:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [documentId]);

  // 加载版本历史
  const loadVersions = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/versions`);
      const result = await response.json();

      if (result.success) {
        setVersions(result.data);
      }
    } catch (error) {
      console.error("Failed to load versions:", error);
    }
  };

  // 保存文档
  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("标题和内容为必填项");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("文档已保存");
        loadVersions();
      } else {
        const data = await response.json();
        alert(data.message || "保存失败");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  };

  // 恢复到旧版本
  const handleRestoreVersion = async (version: number, content: string) => {
    if (!confirm(`确定要恢复到版本 ${version} 吗？当前内容将被覆盖。`)) return;

    setFormData({ ...formData, content });
    setShowHistory(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Title & Slug */}
        <div className="bg-white dark:bg-[#1e2228] shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                标题
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#2a2e37] transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                别名
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#2a2e37] transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-[#1e2228] shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            内容
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={20}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#2a2e37] transition-all outline-none resize-none font-mono text-sm"
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Status */}
        <div className="bg-white dark:bg-[#1e2228] shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            状态
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="DRAFT">草稿</option>
            <option value="PUBLISHED">已发布</option>
            <option value="ARCHIVED">已归档</option>
          </select>
        </div>

        {/* Excerpt */}
        <div className="bg-white dark:bg-[#1e2228] shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            摘要
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={4}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#2a2e37] transition-all outline-none resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                保存
              </>
            )}
          </button>
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              loadVersions();
            }}
            className="flex items-center justify-center px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <History className="w-4 h-4 mr-2" />
            版本历史
          </button>
        </div>
      </div>

      {/* Version History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1e2228] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                版本历史
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 rotate-180 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {versions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无版本历史
                </div>
              ) : (
                versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#22262e] rounded-xl"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          v{version.version}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(version.createdAt).toLocaleString("zh-CN")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        作者：{version.author.profile.displayName || version.author.username}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestoreVersion(version.version, version.content)}
                      className="flex items-center px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      恢复
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
