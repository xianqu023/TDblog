"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Tags, Folder, FileText } from "lucide-react";
import Link from "next/link";

export default function NewDocumentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    categoryId: "",
    status: "DRAFT",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("标题和内容为必填项");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          categoryId: formData.categoryId || null,
        }),
      });

      if (response.ok) {
        alert("文档创建成功");
        router.push("/admin/documents");
      } else {
        const data = await response.json();
        alert(data.message || "创建失败");
      }
    } catch (error) {
      console.error("Create document error:", error);
      alert("创建失败");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    if (!formData.title) return;
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setFormData({ ...formData, slug });
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#13151a] p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link
          href="/admin/documents"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">新建文档</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">创建新的知识库文档</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Slug */}
            <div className="bg-white dark:bg-[#1e2228] shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="inline w-4 h-4 mr-1" />
                    标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    onBlur={generateSlug}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#2a2e37] transition-all outline-none"
                    placeholder="输入文档标题"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    别名
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-2.5 bg-gray-100 dark:bg-[#2a2e37] text-gray-500 dark:text-gray-400 rounded-l-xl border-y border-l border-gray-200 dark:border-gray-700">
                      /documents/
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#2a2e37] transition-all outline-none border-y border-r border-gray-200 dark:border-gray-700"
                      placeholder="my-document"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-[#1e2228] shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={20}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#2a2e37] transition-all outline-none resize-none font-mono text-sm"
                placeholder="使用 Markdown 语法编写文档内容..."
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                支持 Markdown 语法：# 标题、**粗体**、*斜体*、- 列表、[链接](url) 等
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="bg-white dark:bg-[#1e2228] shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">发布设置</h3>
              <div className="space-y-4">
                <div>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      创建文档
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white dark:bg-[#1e2228] shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Folder className="inline w-4 h-4 mr-1" />
                分类
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">无分类</option>
                {/* TODO: 加载分类列表 */}
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
                placeholder="文档简短描述（可选）"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
