"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useParams } from "next/navigation";
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
  FolderOpen,
  Image,
  Film,
  Music,
  File,
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
    return <Image className="h-8 w-8 text-blue-500" />;
  }
  if (mimeType.startsWith("video/")) {
    return <Film className="h-8 w-8 text-purple-500" />;
  }
  if (mimeType.startsWith("audio/")) {
    return <Music className="h-8 w-8 text-pink-500" />;
  }
  return <File className="h-8 w-8 text-gray-500" />;
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
  const params = useParams();
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
    : "bg-white/90 backdrop-blur-sm shadow-xl shadow-gray-200/50";
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-900";
  const inputStyle = darkMode
    ? "bg-[#22262e] border-gray-700 text-gray-100 placeholder-gray-500"
    : "bg-gray-50 border-gray-200 text-gray-900";

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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);

    const initialProgress = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: "uploading" as const,
    }));
    setUploadProgress(initialProgress);

    let duplicateCount = 0;

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("checkDuplicate", "true");

      try {
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

    await loadFiles();

    if (duplicateCount > 0) {
      setMessage({ type: "info", text: `已跳过 ${duplicateCount} 个重复文件` });
    }

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

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await fetch(`/api/files/${file.id}`, {
        method: "POST",
      });
      const result = await response.json();

      if (result.success) {
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

  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((f) => f.id)));
    }
  };

  const handleOpenShare = async (fileId: string) => {
    setCurrentFileId(fileId);
    setShowShareModal(true);
    
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

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/s/${token}`;
    navigator.clipboard.writeText(url);
    alert("链接已复制到剪贴板");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-slate-100">
      {/* 装饰性背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-amber-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-red-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/30">
                    <FolderOpen className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
                      文件管理
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm">管理所有上传的文件</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {selectedFiles.size > 0 && (
                  <button
                    onClick={handleBatchDelete}
                    className="group flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5"
                  >
                    <Trash className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">删除选中 ({selectedFiles.size})</span>
                  </button>
                )}
                <button
                  {...getRootProps()}
                  className="group flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 cursor-pointer"
                >
                  <input {...getInputProps()} />
                  <Upload className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  <span className="font-medium">上传文件</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Upload Progress */}
          {uploadProgress.length > 0 && (
            <div className={`${cardStyle} rounded-2xl p-6 mb-8 border border-gray-100`}>
              <h4 className={`font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
                <Loader2 className={`h-5 w-5 ${isUploading ? 'animate-spin' : ''} text-amber-500`} />
                上传进度
              </h4>
              <div className="space-y-3">
                {uploadProgress.map((item, index) => (
                  <div key={`upload-${item.file.name}-${index}`} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 truncate max-w-md">
                          {item.file.name}
                        </span>
                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                          {item.status === "uploading" && (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          )}
                          {item.status === "success" && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                          {item.status === "error" && (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                          {item.status === "error"
                            ? item.error
                            : `${item.progress}%`}
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            item.status === "error"
                              ? "bg-gradient-to-r from-red-500 to-red-600"
                              : item.status === "success"
                              ? "bg-gradient-to-r from-green-500 to-green-600"
                              : "bg-gradient-to-r from-amber-500 to-orange-500"
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
            className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 border-2 border-dashed p-12 mb-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? "border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 scale-[1.02]"
                : "border-gray-200 hover:border-amber-400 hover:shadow-2xl"
            }`}
          >
            <input {...getInputProps()} />
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-6">
              <Upload className="h-10 w-10 text-amber-600" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              {isDragActive ? "松开以上传文件" : "拖拽文件到这里上传"}
            </p>
            <p className="text-sm text-gray-500 mb-3">或点击选择文件</p>
            <p className="text-xs text-gray-400">
              支持图片、视频、文档等格式，单个文件最大 100MB
            </p>
          </div>

          {/* Filters */}
          <div className={`${cardStyle} rounded-2xl p-6 mb-8 border border-gray-100`}>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[280px]">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索文件名称..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 ${inputStyle} rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium`}
                  />
                </div>
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={`px-5 py-3 ${inputStyle} rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium cursor-pointer`}
              >
                <option value="">所有类型</option>
                <option value="image">🖼️ 图片</option>
                <option value="video">🎬 视频</option>
                <option value="document">📄 文档</option>
                <option value="audio">🎵 音频</option>
              </select>
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2.5 rounded-lg transition-all font-medium ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  网格
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2.5 rounded-lg transition-all font-medium ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  列表
                </button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
              <span className="ml-3 text-gray-600 font-medium">加载中...</span>
            </div>
          )}

          {/* Files Grid/List */}
          {!loading && files.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                <FolderOpen className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">暂无文件</p>
              <p className="text-sm text-gray-400 mt-2">点击上方上传按钮或拖拽文件到这里</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 p-4 border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 ${
                    selectedFiles.has(file.id) ? "ring-2 ring-amber-500 shadow-amber-500/20" : ""
                  }`}
                >
                  <div className="relative">
                    <div className="flex items-center justify-center h-40 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      {getFileCategory(file.mimeType) === "image" ? (
                        <img
                          src={file.url}
                          alt={file.originalName}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="p-6">
                          {getFileIcon(file.mimeType)}
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => toggleSelection(file.id)}
                        className="h-5 w-5 text-amber-600 rounded-lg border-gray-300 focus:ring-amber-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 truncate mb-2">
                    {file.originalName}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="font-medium text-amber-600">{formatFileSize(file.size)}</span>
                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleOpenShare(file.id)}
                      className="flex-1 p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all hover:shadow-md"
                      title="分享链接"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(file)}
                      className="flex-1 p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:shadow-md"
                      title="下载"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="flex-1 p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:shadow-md"
                      title="删除"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`${cardStyle} rounded-2xl overflow-hidden border border-gray-100`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedFiles.size === files.length && files.length > 0}
                          onChange={toggleSelectAll}
                          className="h-5 w-5 text-amber-600 rounded-lg border-gray-300 focus:ring-amber-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        文件信息
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        类型
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        大小
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        上传时间
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {files.map((file) => (
                      <tr
                        key={file.id}
                        className={`group hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-transparent transition-all duration-200 ${
                          selectedFiles.has(file.id) ? "bg-amber-50/80" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedFiles.has(file.id)}
                            onChange={() => toggleSelection(file.id)}
                            className="h-5 w-5 text-amber-600 rounded-lg border-gray-300 focus:ring-amber-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shadow-sm">
                              {getFileIcon(file.mimeType)}
                            </div>
                            <span className="text-sm font-semibold text-gray-900 truncate max-w-xs">
                              {file.originalName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${
                            getFileCategory(file.mimeType) === "image"
                              ? "bg-blue-100 text-blue-700"
                              : getFileCategory(file.mimeType) === "video"
                              ? "bg-purple-100 text-purple-700"
                              : getFileCategory(file.mimeType) === "audio"
                              ? "bg-pink-100 text-pink-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {getFileCategory(file.mimeType)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-amber-600">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenShare(file.id)}
                              className="group p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all hover:shadow-md"
                              title="分享链接"
                            >
                              <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => handleDownload(file)}
                              className="group p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:shadow-md"
                              title="下载"
                            >
                              <Download className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => handleDelete(file.id)}
                              className="group p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:shadow-md"
                              title="删除"
                            >
                              <Trash className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                  分享链接管理
                </h3>
                <p className="text-sm text-gray-500 mt-1">创建和管理文件分享链接</p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Create New Share */}
              <div className={`${cardStyle} rounded-2xl p-6 border border-gray-100`}>
                <h4 className={`font-semibold ${textPrimary} mb-5 flex items-center gap-2`}>
                  <LinkIcon className="h-5 w-5 text-amber-500" />
                  创建新分享链接
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Hash className="inline w-4 h-4 mr-1 text-amber-500" />
                      下载次数限制
                    </label>
                    <input
                      type="number"
                      value={shareSettings.maxDownloads}
                      onChange={(e) => setShareSettings({ ...shareSettings, maxDownloads: e.target.value })}
                      placeholder="留空表示无限制"
                      className={`w-full px-4 py-3 ${inputStyle} rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1 text-amber-500" />
                      有效期至
                    </label>
                    <input
                      type="datetime-local"
                      value={shareSettings.expiresAt}
                      onChange={(e) => setShareSettings({ ...shareSettings, expiresAt: e.target.value })}
                      className={`w-full px-4 py-3 ${inputStyle} rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Lock className="inline w-4 h-4 mr-1 text-amber-500" />
                      访问密码
                    </label>
                    <input
                      type="text"
                      value={shareSettings.password}
                      onChange={(e) => setShareSettings({ ...shareSettings, password: e.target.value })}
                      placeholder="留空表示无需密码"
                      className={`w-full px-4 py-3 ${inputStyle} rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all`}
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreateShare}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/30 font-semibold"
                >
                  创建分享链接
                </button>
              </div>

              {/* Share Links List */}
              <div>
                <h4 className={`font-semibold ${textPrimary} mb-5 flex items-center gap-2`}>
                  <Share2 className="h-5 w-5 text-amber-500" />
                  已有分享链接 ({shares.length})
                </h4>
                {shares.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                      <LinkIcon className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500">暂无分享链接</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shares.map((share) => (
                      <div
                        key={share.id}
                        className={`${cardStyle} rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-xl">
                              <code className="text-sm font-mono text-gray-700 flex-1">
                                {window.location.origin}/{params?.locale || 'zh'}/s/{share.token}
                              </code>
                              <button
                                onClick={() => copyShareLink(share.token)}
                                className="p-2 hover:bg-white rounded-lg transition-colors"
                              >
                                <Copy className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg">
                                <Hash className="h-4 w-4 text-amber-500" />
                                <span className="font-medium">已下载：{share.downloadCount}</span>
                                {share.maxDownloads && (
                                  <span className="text-gray-400">/{share.maxDownloads}</span>
                                )}
                              </span>
                              {share.expiresAt && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-lg">
                                  <Calendar className="h-4 w-4 text-orange-500" />
                                  <span className="font-medium">过期：{new Date(share.expiresAt).toLocaleString('zh-CN')}</span>
                                </span>
                              )}
                              {share.password && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-lg">
                                  <Lock className="h-4 w-4 text-red-500" />
                                  <span className="font-medium">需要密码</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteShare(share.id)}
                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:shadow-md"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
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
