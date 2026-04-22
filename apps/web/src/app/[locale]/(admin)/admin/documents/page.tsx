"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  FileText,
  Loader2,
  Edit,
  Trash,
  Eye,
  Calendar,
  User,
  Folder,
  Tag,
  Filter,
} from "lucide-react";
import Link from "next/link";

interface Document {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  isPublished: boolean;
  viewCount: number;
  version: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  author: {
    id: string;
    username: string;
    profile: {
      displayName: string | null;
      avatarUrl: string | null;
    };
  };
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const cardStyle = "bg-white dark:bg-[#1e2228] shadow-[0_2px_12px_rgba(0,0,0,0.04)]";

  // 加载文档列表
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('categoryId', categoryFilter);

      const response = await fetch(`/api/documents?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setDocuments(result.data.documents);
        setTotalPages(result.data.totalPages);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, categoryFilter]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // 删除文档
  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个文档吗？")) return;

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      } else {
        alert("删除失败");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("删除失败");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "已发布";
      case "DRAFT":
        return "草稿";
      case "ARCHIVED":
        return "已归档";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#13151a] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">文档管理</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理知识库文档，共 {total} 篇
          </p>
        </div>
        <Link
          href="/admin/documents/new"
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
        >
          <Plus className="w-5 h-5 mr-2" />
          新建文档
        </Link>
      </div>

      {/* Filters */}
      <div className={`${cardStyle} rounded-xl p-4 mb-6`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索文档..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">所有状态</option>
            <option value="DRAFT">草稿</option>
            <option value="PUBLISHED">已发布</option>
            <option value="ARCHIVED">已归档</option>
          </select>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            第 {page} 页，共 {totalPages} 页
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
        </div>
      )}

      {/* Documents List */}
      {!loading && documents.length === 0 ? (
        <div className={`${cardStyle} rounded-xl p-12 text-center`}>
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">暂无文档</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            点击上方按钮创建第一个文档
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`${cardStyle} rounded-xl p-4 hover:shadow-lg transition-all`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {doc.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(
                        doc.status
                      )}`}
                    >
                      {getStatusText(doc.status)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      v{doc.version}
                    </span>
                  </div>
                  {doc.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {doc.excerpt}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(doc.updatedAt).toLocaleDateString("zh-CN")}
                    </span>
                    {doc.category && (
                      <span className="flex items-center">
                        <Folder className="h-4 w-4 mr-1" />
                        {doc.category.name}
                      </span>
                    )}
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {doc.author.profile.displayName || doc.author.username}
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {doc.viewCount}
                    </span>
                    {doc.tags.length > 0 && (
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        {doc.tags.map((tag) => tag.name).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/documents/${doc.id}/edit`}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/documents/${doc.slug}`}
                    target="_blank"
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white dark:bg-[#1e2228] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#2a2e37] transition-colors"
          >
            上一页
          </button>
          <span className="text-gray-600 dark:text-gray-400">
            第 {page} / {totalPages} 页
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white dark:bg-[#1e2228] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#2a2e37] transition-colors"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
