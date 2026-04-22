"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Eye, Edit, Trash, EyeOff, Loader2, Pin, PinOff, Calendar, ChevronRight, ChevronDown } from "lucide-react";

interface Article {
  id: string;
  slug: string;
  status: string;
  viewCount: number;
  createdAt: string;
  publishedAt?: string;
  isPremium: boolean;
  premiumPrice: number | null;
  isPinned: boolean;
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

interface ArchiveArticle {
  id: string;
  title: string;
  publishedAt: string;
}

interface ArchiveMonth {
  month: number;
  label: string;
  count: number;
  articles: ArchiveArticle[];
}

interface ArchiveYear {
  year: number;
  count: number;
  months: ArchiveMonth[];
}

interface ArchiveData {
  archives: Array<{
    year: number;
    month: number;
    yearMonth: string;
    label: string;
    count: number;
    articles: ArchiveArticle[];
  }>;
  yearArchives: ArchiveYear[];
  total: number;
}

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "archive">("list");
  const [archiveData, setArchiveData] = useState<ArchiveData | null>(null);
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const itemsPerPage = 20;

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());

      const response = await fetch(`/api/articles?${params.toString()}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setArticles(data.articles);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      } else {
        console.error("Failed to fetch articles:", data.message);
      }
    } catch (error) {
      console.error("Fetch articles error:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage]);

  const fetchArchives = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/archives");
      const data = await response.json();

      if (response.ok && data.success) {
        setArchiveData(data.data);
        // 默认展开所有年份
        const initialExpanded: Record<number, boolean> = {};
        data.data.yearArchives.forEach((year: ArchiveYear) => {
          initialExpanded[year.year] = true;
        });
        setExpandedYears(initialExpanded);
      } else {
        console.error("Failed to fetch archives:", data.message);
      }
    } catch (error) {
      console.error("Fetch archives error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (viewMode === "list") {
        fetchArticles();
      } else {
        fetchArchives();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchArticles, fetchArchives, viewMode]);

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

  const handlePin = async (id: string, isPinned: boolean) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPinned: !isPinned }),
      });

      if (response.ok) {
        setArticles(articles.map((article) => 
          article.id === id ? { ...article, isPinned: !isPinned } : article
        ));
        alert(isPinned ? "取消置顶成功" : "置顶成功");
      } else {
        alert("操作失败");
      }
    } catch (error) {
      console.error("Pin error:", error);
      alert("操作失败");
    }
  };

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  const toggleMonth = (yearMonth: string) => {
    setExpandedMonths((prev) => ({ ...prev, [yearMonth]: !prev[yearMonth] }));
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
        <div className="flex items-center space-x-3">
          {/* 视图切换 */}
          <div className="flex items-center bg-white dark:bg-[#1e2228] rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2e37]"
              }`}
            >
              列表视图
            </button>
            <button
              onClick={() => setViewMode("archive")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                viewMode === "archive"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2e37]"
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              归档视图
            </button>
          </div>
          <Link
            href="/admin/articles/new"
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5 mr-2" />
            新建文章
          </Link>
        </div>
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
                          <button
                            onClick={() => handlePin(article.id, article.isPinned)}
                            className={`p-2 ${article.isPinned ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : 'text-gray-400 hover:text-yellow-600 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400'} rounded-xl transition-all`}
                            title={article.isPinned ? "取消置顶" : "置顶"}
                          >
                            {article.isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                          </button>
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

        {/* 归档视图 */}
        {viewMode === "archive" && (
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : !archiveData || archiveData.yearArchives.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无归档数据</p>
              </div>
            ) : (
              <div className="space-y-4">
                {archiveData.yearArchives.map((yearArchive) => (
                  <div
                    key={yearArchive.year}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-[#1e2228]"
                  >
                    {/* 年份标题 */}
                    <button
                      onClick={() => toggleYear(yearArchive.year)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#22262e] hover:bg-gray-100 dark:hover:bg-[#2a2e37] flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {expandedYears[yearArchive.year] ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {yearArchive.year}年
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          共 {yearArchive.count} 篇
                        </span>
                      </div>
                    </button>

                    {/* 月份列表 */}
                    {expandedYears[yearArchive.year] && (
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {yearArchive.months.map((month) => (
                          <div key={month.month}>
                            {/* 月份标题 */}
                            <button
                              onClick={() => toggleMonth(`${yearArchive.year}-${String(month.month).padStart(2, '0')}`)}
                              className="w-full px-4 py-2.5 bg-white dark:bg-[#1e2228] hover:bg-gray-50 dark:hover:bg-[#22262e] flex items-center justify-between transition-colors border-l-4 border-transparent hover:border-blue-500"
                            >
                              <div className="flex items-center space-x-3">
                                {expandedMonths[`${yearArchive.year}-${String(month.month).padStart(2, '0')}`] ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-gray-700 dark:text-gray-300">{month.label}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {month.count}篇
                                </span>
                              </div>
                            </button>

                            {/* 文章列表 */}
                            {expandedMonths[`${yearArchive.year}-${String(month.month).padStart(2, '0')}`] && (
                              <div className="px-4 py-2 bg-gray-50 dark:bg-[#181a1f]">
                                <ul className="space-y-2">
                                  {month.articles.map((article) => (
                                    <li
                                      key={article.id}
                                      className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#1e2228] rounded hover:bg-gray-50 dark:hover:bg-[#22262e] transition-colors"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                        <Link
                                          href={`/admin/articles/${article.id}/edit`}
                                          className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                          {article.title}
                                        </Link>
                                      </div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(article.publishedAt).toLocaleDateString('zh-CN')}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 统计信息 */}
            {archiveData && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#1e2228] rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">总文章数</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {archiveData.total}
                  </div>
                </div>
                <div className="bg-white dark:bg-[#1e2228] rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">年份数</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {archiveData.yearArchives.length}
                  </div>
                </div>
                <div className="bg-white dark:bg-[#1e2228] rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">月份数</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {archiveData.archives.length}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {viewMode === "list" && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-[#22262e]/30">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              共 <span className="font-semibold text-gray-900 dark:text-gray-100">{totalCount}</span> 篇文章
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm bg-white dark:bg-[#1e2228] text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2e37] shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
              >
                上一页
              </button>
              
              {/* 页码显示 */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 text-sm rounded-xl transition-all ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                          : "bg-white dark:bg-[#1e2228] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2a2e37] shadow-sm"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 text-sm bg-white dark:bg-[#1e2228] text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2e37] shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
