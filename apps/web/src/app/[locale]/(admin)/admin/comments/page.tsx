"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useDarkMode } from "@/components/admin/DarkModeProvider";

interface Comment {
  id: string;
  content: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SPAM";
  createdAt: string;
  article: {
    id: string;
    slug: string;
    translations: Array<{ title: string }>;
  };
  user: {
    id: string;
    username: string;
    profile: {
      displayName: string | null;
      avatarUrl: string | null;
    } | null;
  } | null;
  replies: Array<{ id: string; content: string }>;
}

const STATUS_MAP = {
  PENDING: { label: "待审核", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400", icon: AlertCircle },
  APPROVED: { label: "已通过", color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle },
  REJECTED: { label: "已拒绝", color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400", icon: XCircle },
  SPAM: { label: "垃圾评论", color: "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400", icon: AlertCircle },
};

export default function CommentsPage() {
  const { darkMode } = useDarkMode();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const res = await fetch(`/api/admin/comments?${params}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setActionLoading(id);
      const res = await fetch("/api/admin/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error("Failed to update comment:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条评论吗？此操作不可恢复。")) {
      return;
    }

    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/comments?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const getArticleTitle = (comment: Comment) => {
    return comment.article.translations[0]?.title || comment.article.slug;
  };

  const getUserName = (comment: Comment) => {
    if (!comment.user) return "匿名用户";
    return comment.user.profile?.displayName || comment.user.username;
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cardStyle = darkMode
    ? "bg-[#1e2228]"
    : "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]";
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#13151a]" : "bg-[#f5f6f8]"} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-xl font-bold ${textPrimary}`}>评论管理</h1>
          <p className={`text-sm ${textSecondary} mt-1`}>管理所有用户评论</p>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className={`h-5 w-5 ${textSecondary}`} />
          <span className={`text-sm ${textSecondary}`}>共 {total} 条评论</span>
        </div>
      </div>

      {/* Status Filter */}
      <div className={`${cardStyle} rounded-2xl p-4 mb-6`}>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setStatusFilter("");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !statusFilter
                ? "bg-blue-600 text-white"
                : darkMode
                ? "bg-[#22262e] text-gray-400 hover:text-gray-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全部
          </button>
          {Object.entries(STATUS_MAP).map(([key, value]) => {
            const Icon = value.icon;
            return (
              <button
                key={key}
                onClick={() => {
                  setStatusFilter(key);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === key
                    ? "bg-blue-600 text-white"
                    : darkMode
                    ? "bg-[#22262e] text-gray-400 hover:text-gray-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {value.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : comments.length === 0 ? (
        <div className={`${cardStyle} rounded-2xl p-12 text-center`}>
          <MessageSquare className={`h-12 w-12 mx-auto mb-3 ${textSecondary}`} />
          <p className={textSecondary}>暂无评论</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const statusInfo = STATUS_MAP[comment.status];
            const StatusIcon = statusInfo.icon;
            return (
              <div key={comment.id} className={`${cardStyle} rounded-2xl p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-600"
                    }`}>
                      {getUserName(comment).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${textPrimary}`}>{getUserName(comment)}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className={`text-sm ${textSecondary} mb-2`}>
                        评论于：
                        <a
                          href={`/articles/${comment.article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          {getArticleTitle(comment)}
                        </a>
                      </p>
                      <p className={`text-sm ${textPrimary} whitespace-pre-wrap`}>{comment.content}</p>
                      {comment.replies.length > 0 && (
                        <p className={`text-xs ${textSecondary} mt-2`}>
                          {comment.replies.length} 条回复
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs ${textSecondary} flex-shrink-0 ml-4`}>
                    {formatTime(comment.createdAt)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700/30">
                  {comment.status !== "APPROVED" && (
                    <button
                      onClick={() => handleStatusChange(comment.id, "APPROVED")}
                      disabled={actionLoading === comment.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {actionLoading === comment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      通过
                    </button>
                  )}
                  {comment.status !== "REJECTED" && (
                    <button
                      onClick={() => handleStatusChange(comment.id, "REJECTED")}
                      disabled={actionLoading === comment.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {actionLoading === comment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      拒绝
                    </button>
                  )}
                  {comment.status !== "SPAM" && (
                    <button
                      onClick={() => handleStatusChange(comment.id, "SPAM")}
                      disabled={actionLoading === comment.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {actionLoading === comment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      标记垃圾
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={actionLoading === comment.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                  >
                    {actionLoading === comment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    删除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className={`text-sm ${textSecondary}`}>
            第 {page} 页，共 {totalPages} 页
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? "bg-[#22262e] text-gray-400 hover:text-gray-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? "bg-[#22262e] text-gray-400 hover:text-gray-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
