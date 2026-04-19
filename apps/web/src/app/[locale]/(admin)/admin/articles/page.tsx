"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Eye, Edit, Trash, EyeOff, Loader2 } from "lucide-react";

interface Article {
  id: string;
  slug: string;
  status: string;
  viewCount: number;
  createdAt: string;
  isPremium: boolean;
  premiumPrice: number | null;
  translations: {
    title: string;
    excerpt?: string;
  }[];
  author: {
    username: string;
    profile?: {
      displayName?: string;
    };
  };
}

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      params.append("limit", "100");

      const response = await fetch(`/api/articles?${params.toString()}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setArticles(data.articles);
      } else {
        console.error("Failed to fetch articles:", data.message);
      }
    } catch (error) {
      console.error("Fetch articles error:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchArticles]);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这篇文章吗？")) return;

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setArticles(articles.filter((a) => a.id !== id));
        alert("删除成功");
      } else {
        alert("删除失败");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("删除失败");
    }
  };

  const filteredArticles = articles.filter((article) => {
    const title = article.translations?.[0]?.title || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
            已发布
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
            草稿
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#13151a] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">文章管理</h2>
          <p className="text-gray-500 mt-1">管理您的所有文章</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          新建文章
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1e2228] shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索文章..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#2a2e37] transition-all outline-none"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            <option value="">所有状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>
          <button className="flex items-center px-4 py-2.5 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#22262e] rounded-xl hover:bg-gray-100 dark:hover:bg-[#2a2e37] transition-all">
            <Filter className="h-4 w-4 mr-2" />
            更多筛选
          </button>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white dark:bg-[#1e2228] shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-[#22262e]/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    文章
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    阅读
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-4">
                          <EyeOff className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">暂无文章</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">点击下方按钮创建第一篇文章</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article, index) => (
                    <tr key={article.id} className={`group hover:bg-gray-50/50 dark:hover:bg-[#22262e]/50 transition-colors ${index > 0 ? "border-t border-gray-100 dark:border-gray-700/30" : ""}`}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {article.translations?.[0]?.title || "无标题"}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">/{article.slug}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(article.status)}
                      </td>
                      <td className="px-6 py-4">
                        {article.isPremium ? (
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                            ¥{article.premiumPrice}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            免费
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Eye className="h-4 w-4 mr-1.5" />
                          {article.viewCount?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(article.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-xl transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 dark:hover:text-green-400 rounded-xl transition-all">
                            <EyeOff className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-all"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-[#22262e]/30">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            共 <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredArticles.length}</span> 篇文章
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 text-sm bg-white dark:bg-[#1e2228] text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2e37] shadow-sm disabled:opacity-50 disabled:shadow-none transition-all" disabled>
              上一页
            </button>
            <button className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/25">
              1
            </button>
            <button className="px-4 py-2 text-sm bg-white dark:bg-[#1e2228] text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2e37] shadow-sm disabled:opacity-50 disabled:shadow-none transition-all" disabled>
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
