"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("请输入分类名称");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("分类创建成功");
        router.push("/admin/categories");
      } else {
        const data = await response.json();
        alert(data.message || "创建失败");
      }
    } catch (error) {
      console.error("Create category error:", error);
      alert("创建失败");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    if (!formData.name) return;
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setFormData({ ...formData, slug });
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#13151a] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/categories"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">新建分类</h2>
            <p className="text-gray-500 mt-1">创建新的文档系列分类</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="max-w-3xl bg-white dark:bg-[#1e2228] shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl p-6">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                分类名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={generateSlug}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#2a2e37] transition-all outline-none"
                placeholder="例如：技术文档、产品手册"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                别名
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2.5 bg-gray-100 dark:bg-[#2a2e37] text-gray-500 dark:text-gray-400 rounded-l-xl border-y border-l border-gray-200 dark:border-gray-700">
                  /admin/categories/
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#2a2e37] transition-all outline-none border-y border-r border-gray-200 dark:border-gray-700"
                  placeholder="technology-docs"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                用于 URL 的简短标识，留空将根据名称自动生成
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#2a2e37] transition-all outline-none resize-none"
                placeholder="描述这个分类的用途和范围..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/admin/categories"
              className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2e37] rounded-xl transition-all"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  创建分类
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
