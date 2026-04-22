"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Search,
  Trash,
  FileImage,
  FileText,
  FileVideo,
  Download,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  Share2,
  Link as LinkIcon,
  Copy,
  Calendar,
  Hash,
  Lock,
} from "lucide-react";

import { useDarkMode } from "@/components/admin/DarkModeProvider";

interface FileItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    profile?: {
      displayName?: string;
      avatarUrl?: string;
    };
  };
}

interface FileShare {
  id: string;
  token: string;
  maxDownloads: number | null;
  downloadCount: number;
  expiresAt: string | null;
  password: string | null;
  createdAt: string;
  creator: {
    username: string;
    profile: {
      displayName: string | null;
      avatarUrl: string | null;
    };
  };
}

interface UploadProgress {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) {
    return <FileImage className="h-8 w-8 text-blue-500" />;
  }
  if (mimeType.startsWith("video/")) {
    return <FileVideo className="h-8 w-8 text-purple-500" />;
  }
  return <FileText className="h-8 w-8 text-gray-500" />;
};

const getFileCategory = (mimeType: string): string => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("pdf") || mimeType.includes("word") || mimeType.includes("excel")) {
    return "document";
  }
  return "other";
};

export default function FilesPage() {
  const { darkMode } = useDarkMode();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [shares, setShares] = useState<FileShare[]>([]);
  const [shareSettings, setShareSettings] = useState({
    maxDownloads: "",
    expiresAt: "",
    password: "",
  });

  const cardStyle = darkMode
    ? "bg-[#1e2228]"
    : "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]";
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-900";
  const inputStyle = darkMode
    ? "bg-[#22262e] border-gray-700 text-gray-100 placeholder-gray-500"
    : "bg-white border-gray-200 text-gray-900";

  // 加载文件列表
  const loadFiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append("type", typeFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/files?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setFiles(result.data.files);
      }
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [typeFilter, searchQuery]);

  // 文件上传处理
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);

    // 初始化上传进度
    const initialProgress = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: "uploading" as const,
    }));
    setUploadProgress(initialProgress);

    let duplicateCount = 0;

    // 逐个上传文件
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("checkDuplicate", "true");

      try {
        // 更新进度为上传中
        setUploadProgress((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, progress: 50 } : p))
        );

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          if (result.data.isDuplicate) {
            duplicateCount++;
            setUploadProgress((prev) =>
              prev.map((p, idx) =>
                idx === i ? { ...p, progress: 100, status: "success", error: "文件已存在，跳过上传" } : p
              )
            );
          } else {
            setUploadProgress((prev) =>
              prev.map((p, idx) =>
                idx === i ? { ...p, progress: 100, status: "success" } : p
              )
            );
          }
        } else {
          setUploadProgress((prev) =>
            prev.map((p, idx) =>
              idx === i
                ? { ...p, status: "error", error: result.message || "上传失败" }
                : p
            )
          );
        }
      } catch (error: any) {
        setUploadProgress((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: "error", error: error.message } : p
          )
        );
      }
    }

    // 刷新文件列表
    await loadFiles();

    // 显示重复文件提示
    if (duplicateCount > 0) {
      setMessage({ type: "info", text: `已跳过 ${duplicateCount} 个重复文件` });
    }

    // 3秒后清除上传进度
    setTimeout(() => {
      setUploadProgress([]);
      setIsUploading(false);
    }, 3000);
  }, []);

  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
      "application/pdf": [],
      "text/*": [],
    },
    multiple: true,
  });

  // 删除文件
  const handleDelete = async (fileId: string) => {
    if (!confirm("确定要删除这个文件吗？")) return;

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      } else {
        alert("删除失败");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("删除失败");
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedFiles.size} 个文件吗？`)) return;

    try {
      const response = await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedFiles) }),
      });

      if (response.ok) {
        setFiles((prev) => prev.filter((f) => !selectedFiles.has(f.id)));
        setSelectedFiles(new Set());
      } else {
        alert("批量删除失败");
      }
    } catch (error) {
      console.error("Batch delete error:", error);
      alert("批量删除失败");
    }
  };

  // 下载文件
  const handleDownload = async (file: FileItem) => {
    try {
      const response = await fetch(`/api/files/${file.id}`, {
        method: "POST",
      });
      const result = await response.json();

      if (result.success) {
        // 创建临时链接下载
        const link = document.createElement("a");
        link.href = result.data.url;
        link.download = file.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("下载失败");
    }
  };

  // 切换文件选择
  const toggleSelection = (fileId: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((f) => f.id)));
    }
  };

  // 打开分享链接管理
  const handleOpenShare = async (fileId: string) => {
    setCurrentFileId(fileId);
    setShowShareModal(true);
    
    // 加载该文件的所有分享链接
    try {
      const response = await fetch(`/api/files/${fileId}/shares`);
      const result = await response.json();
      if (result.success) {
        setShares(result.data);
      }
    } catch (error) {
      console.error("Failed to load shares:", error);
    }
  };

  // 创建分享链接
  const handleCreateShare = async () => {
    if (!currentFileId) return;

    try {
      const response = await fetch(`/api/files/${currentFileId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxDownloads: shareSettings.maxDownloads || null,
          expiresAt: shareSettings.expiresAt || null,
          password: shareSettings.password || null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setShares([result.data, ...shares]);
        setShareSettings({ maxDownloads: "", expiresAt: "", password: "" });
        alert("分享链接创建成功");
      } else {
        const result = await response.json();
        alert(result.message || "创建失败");
      }
    } catch (error) {
      console.error("Create share error:", error);
      alert("创建失败");
    }
  };

  // 删除分享链接
  const handleDeleteShare = async (shareId: string) => {
    if (!currentFileId) return;

    try {
      const response = await fetch(
        `/api/files/${currentFileId}/shares?shareId=${shareId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setShares(shares.filter((s) => s.id !== shareId));
      } else {
        alert("删除失败");
      }
    } catch (error) {
      console.error("Delete share error:", error);
      alert("删除失败");
    }
  };

  // 复制链接
  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/s/${token}`;
    navigator.clipboard.writeText(url);
    alert("链接已复制到剪贴板");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">附件管理</h2>
          <p className="text-gray-600 mt-1">管理所有上传的文件</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedFiles.size > 0 && (
            <button
              onClick={handleBatchDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash className="h-5 w-5 mr-2" />
              删除选中 ({selectedFiles.size})
            </button>
          )}
          <button
            {...getRootProps()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <input {...getInputProps()} />
            <Upload className="h-5 w-5 mr-2" />
            上传文件
          </button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className={`${cardStyle} rounded-xl shadow-sm p-4 mb-6`}>
          <h4 className={`font-medium ${textPrimary} mb-3`}>上传进度</h4>
          <div className="space-y-2">
            {uploadProgress.map((item, index) => (
              <div key={`upload-${item.file.name}-${index}`} className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 truncate max-w-xs">
                      {item.file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.status === "uploading" && (
                        <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                      )}
                      {item.status === "success" && (
                        <CheckCircle className="h-4 w-4 text-green-500 inline mr-1" />
                      )}
                      {item.status === "error" && (
                        <AlertCircle className="h-4 w-4 text-red-500 inline mr-1" />
                      )}
                      {item.status === "error"
                        ? item.error
                        : `${item.progress}%`}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        item.status === "error"
                          ? "bg-red-500"
                          : item.status === "success"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`bg-white rounded-xl shadow-sm border-2 border-dashed p-8 mb-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-blue-400"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragActive ? "松开以上传文件" : "拖拽文件到这里上传"}
        </p>
        <p className="text-sm text-gray-500">或点击选择文件</p>
        <p className="text-xs text-gray-400 mt-2">
          支持图片、视频、文档等格式，单个文件最大 100MB
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索文件..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">所有类型</option>
            <option value="image">图片</option>
            <option value="video">视频</option>
            <option value="document">文档</option>
            <option value="audio">音频</option>
          </select>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600"
              }`}
            >
              网格
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 border-l ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600"
              }`}
            >
              列表
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">加载中...</span>
        </div>
      )}

      {/* Files Grid/List */}
      {!loading && files.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无文件</p>
          <p className="text-sm text-gray-400 mt-1">点击上方上传按钮添加文件</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className={`bg-white rounded-xl shadow-sm p-4 group hover:shadow-lg transition-all ${
                selectedFiles.has(file.id) ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <div className="flex items-center justify-center h-32 mb-3">
                {getFileCategory(file.mimeType) === "image" ? (
                  <img
                    src={file.url}
                    alt={file.originalName}
                    className="h-full object-cover rounded-lg"
                  />
                ) : (
                  getFileIcon(file.mimeType)
                )}
              </div>
              <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                {file.originalName}
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{formatFileSize(file.size)}</span>
                <span>{new Date(file.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.id)}
                  onChange={() => toggleSelection(file.id)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenShare(file.id)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="分享链接"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedFiles.size === files.length && files.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  文件名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  大小
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  上传时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {files.map((file) => (
                <tr
                  key={file.id}
                  className={`hover:bg-gray-50 ${
                    selectedFiles.has(file.id) ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={() => toggleSelection(file.id)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center mr-3">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {file.originalName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {getFileCategory(file.mimeType)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenShare(file.id)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="分享链接"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardStyle} rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className={`text-xl font-bold ${textPrimary}`}>分享链接管理</h3>
                <p className="text-sm text-gray-500 mt-1">创建和管理文件分享链接</p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Create New Share */}
              <div className={`${cardStyle} rounded-xl p-4 border border-gray-200 dark:border-gray-700`}>
                <h4 className={`font-medium ${textPrimary} mb-4`}>创建新分享链接</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Hash className="inline w-4 h-4 mr-1" />
                      下载次数限制
                    </label>
                    <input
                      type="number"
                      value={shareSettings.maxDownloads}
                      onChange={(e) => setShareSettings({ ...shareSettings, maxDownloads: e.target.value })}
                      placeholder="留空表示无限制"
                      className={`w-full px-3 py-2 ${inputStyle} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      有效期至
                    </label>
                    <input
                      type="datetime-local"
                      value={shareSettings.expiresAt}
                      onChange={(e) => setShareSettings({ ...shareSettings, expiresAt: e.target.value })}
                      className={`w-full px-3 py-2 ${inputStyle} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Lock className="inline w-4 h-4 mr-1" />
                      访问密码
                    </label>
                    <input
                      type="text"
                      value={shareSettings.password}
                      onChange={(e) => setShareSettings({ ...shareSettings, password: e.target.value })}
                      placeholder="留空表示无需密码"
                      className={`w-full px-3 py-2 ${inputStyle} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreateShare}
                  className="w-full py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium"
                >
                  创建分享链接
                </button>
              </div>

              {/* Share Links List */}
              <div>
                <h4 className={`font-medium ${textPrimary} mb-4`}>已有分享链接 ({shares.length})</h4>
                {shares.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <LinkIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>暂无分享链接</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shares.map((share) => (
                      <div
                        key={share.id}
                        className={`${cardStyle} rounded-xl p-4 border border-gray-200 dark:border-gray-700`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {window.location.origin}/s/{share.token}
                              </code>
                              <button
                                onClick={() => copyShareLink(share.token)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              >
                                <Copy className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Hash className="h-4 w-4 mr-1" />
                                已下载：{share.downloadCount}{share.maxDownloads ? `/${share.maxDownloads}` : ''}
                              </span>
                              {share.expiresAt && (
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  过期：{new Date(share.expiresAt).toLocaleString('zh-CN')}
                                </span>
                              )}
                              {share.password && (
                                <span className="flex items-center">
                                  <Lock className="h-4 w-4 mr-1" />
                                  需要密码
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteShare(share.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
