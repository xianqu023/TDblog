"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Loader2, User, Clock, Smile } from "lucide-react";
import { useSession } from "next-auth/react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  status: string;
  user: {
    id: string;
    username: string;
    profile: {
      displayName: string | null;
      avatarUrl: string | null;
    } | null;
  } | null;
  replies: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      profile: {
        displayName: string | null;
        avatarUrl: string | null;
      } | null;
    } | null;
  }>;
}

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 静态和动态emoji表情
  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "�", "�",
    "😡", "🤬", "😢", "😭", "😱", "😨", "😰", "😥", "😓", "🤗",
    "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯",
    "😦", "😧", "😮", "😲", "😵", "😳", "🥵", "🥶", "😴", "🤤",
    "�", "🤢", "🤮", "🤧", "🥳", "🎉", "🎊", "🎈", "🎁", "🎂"
  ];

  // 加载评论
  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/comments?articleId=${articleId}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments);
        }
      } catch (error) {
        console.error("Failed to load comments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [articleId]);

  // 提交评论
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleId,
          content: commentContent.trim(),
          userId: session?.user?.id,
        }),
      });

      if (response.ok) {
        setCommentContent("");
        setSuccess("您的评论正在审核中");
        // 重新加载评论
        const loadComments = async () => {
          const response = await fetch(`/api/comments?articleId=${articleId}`);
          if (response.ok) {
            const data = await response.json();
            setComments(data.comments);
          }
        };
        loadComments();
      } else {
        const data = await response.json();
        setError(data.error || "评论提交失败，请重试");
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      setError("评论提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 获取用户名
  const getUserName = (user: Comment["user"]) => {
    if (!user) return "匿名用户";
    return user.profile?.displayName || user.username || "匿名用户";
  };

  // 获取用户头像
  const getUserAvatar = (user: Comment["user"]) => {
    if (!user || !user.profile?.avatarUrl) {
      return undefined;
    }
    return user.profile.avatarUrl;
  };

  // 处理emoji选择
  const handleEmojiClick = (emoji: string) => {
    setCommentContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        评论 ({comments.length})
      </h2>

      {/* 评论表单 */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">写下你的评论</h3>
        {!session && (
          <p className="text-sm text-gray-600 mb-4">
            请先登录后再评论
          </p>
        )}
        <form onSubmit={handleSubmitComment}>
          <div className="mb-4">
            <textarea
              ref={textareaRef}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="分享你的想法..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
              rows={4}
              disabled={!session || submitting}
            />
            {/* Emoji选择器 */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={!session || submitting}
                className="flex items-center gap-1 text-gray-600 hover:text-[#C41E3A] disabled:opacity-50"
              >
                <Smile className="h-4 w-4" />
                表情
              </button>
              {showEmojiPicker && (
                <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 shadow-md">
                  <div className="grid grid-cols-10 gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-xl hover:bg-gray-100 rounded p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {error && (
            <div className="mb-4 text-red-600 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 text-green-600 text-sm">
              {success}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              评论提交后需要审核，审核通过后将显示
            </span>
            <button
              type="submit"
              disabled={!session || !commentContent.trim() || submitting}
              className="flex items-center gap-2 px-6 py-2 bg-[#C41E3A] text-white rounded-lg hover:bg-[#B01B34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              提交评论
            </button>
          </div>
        </form>
      </div>

      {/* 评论列表 */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#C41E3A]" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">暂无评论，快来发表你的看法吧！</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                {/* 用户头像 */}
                <div className="flex-shrink-0">
                  {getUserAvatar(comment.user) ? (
                    <img
                      src={getUserAvatar(comment.user)}
                      alt={getUserName(comment.user)}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#C41E3A] to-[#B87333] flex items-center justify-center text-white font-bold text-lg">
                      {getUserName(comment.user).charAt(0)?.toUpperCase() || "匿"}
                    </div>
                  )}
                </div>

                {/* 评论内容 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      {getUserName(comment.user)}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  
                  {/* 检查评论状态 */}
                  {comment.status === 'PENDING' ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
                      <p className="text-green-600 text-sm">您的评论正在审核中，审核通过后将显示</p>
                    </div>
                  ) : comment.status === 'REJECTED' || comment.status === 'SPAM' ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
                      <p className="text-red-600 text-sm">您的评论未通过审核</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 mb-4">
                        {comment.content}
                      </p>

                      {/* 回复 */}
                      {comment.replies.length > 0 && (
                        <div className="ml-6 mt-4 space-y-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-3">
                              {/* 回复用户头像 */}
                              <div className="flex-shrink-0">
                                {reply.user ? (
                                  reply.user.profile?.avatarUrl ? (
                                    <img
                                      src={reply.user.profile.avatarUrl}
                                      alt={getUserName(reply.user)}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#C41E3A] to-[#B87333] flex items-center justify-center text-white font-bold text-sm">
                                      {getUserName(reply.user).charAt(0)?.toUpperCase() || "匿"}
                                    </div>
                                  )
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                                    匿
                                  </div>
                                )}
                              </div>

                              {/* 回复内容 */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900 text-sm">
                                    {getUserName(reply.user)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatTime(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
