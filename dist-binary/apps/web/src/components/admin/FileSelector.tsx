"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Search, FileImage, FileText, FileVideo, Download, Loader2, Check } from "lucide-react";

interface FileItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

interface FileSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: FileItem) => void;
  type?: "image" | "file" | "all";
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

export default function FileSelector({ isOpen, onClose, onSelect, type = "all" }: FileSelectorProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type === "image") params.append("type", "image");
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
  }, [type, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, loadFiles]);

  const handleSelect = (file: FileItem) => {
    setSelectedFile(file.id);
    onSelect(file);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold">选择文件</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索文件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Files Grid */}
        <div className="overflow-y-auto max-h-[50vh] p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">加载中...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p>暂无文件</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleSelect(file)}
                  className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedFile === file.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center justify-center h-24 mb-3">
                    {file.mimeType.startsWith("image/") ? (
                      <img
                        src={file.url}
                        alt={file.originalName}
                        className="h-full object-contain rounded"
                      />
                    ) : (
                      getFileIcon(file.mimeType)
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                    {file.originalName}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                  </div>
                  {selectedFile === file.id && (
                    <div className="mt-2 flex items-center justify-center text-blue-600 text-sm">
                      <Check className="h-4 w-4 mr-1" />
                      已选择
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            共 {files.length} 个文件
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
