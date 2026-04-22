"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FullMarkdownEditor from "@/components/admin/FullMarkdownEditor";
import FileSelector from "@/components/admin/FileSelector";
import {
  Save,
  Eye,
  ArrowLeft,
  Image as ImageIcon,
  Download,
  FileText,
  Lock,
  Unlock,
  DollarSign,
  Upload,
  X,
  Link,
  FolderOpen,
} from "lucide-react";

export default function ArticleEditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isPremium, setIsPremium] = useState(false);
  const [premiumPrice, setPremiumPrice] = useState("");
  const [tags, setTags] = useState("");

  const [downloadEnabled, setDownloadEnabled] = useState(false);
  const [downloadFile, setDownloadFile] = useState("");
  const [downloadFileName, setDownloadFileName] = useState("");
  const [downloadFileSize, setDownloadFileSize] = useState<number | null>(null);
  const [downloadLink, setDownloadLink] = useState("");
  const [downloadIsFree, setDownloadIsFree] = useState(true);
  const [downloadPrice, setDownloadPrice] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [showCoverSelector, setShowCoverSelector] = useState(false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^\u4e00-\u9fa5a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .substring(0, 50)
      );
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.url) {
          setCoverImage(data.data.url);
        } else {
          alert(data.message || "封面图上传失败");
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || "封面图上传失败");
      }
    } catch (error) {
      console.error("Cover upload error:", error);
      alert("封面图上传失败");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.url) {
          setDownloadFile(data.data.url);
          setDownloadFileName(file.name);
          setDownloadFileSize(file.size);
        } else {
          alert(data.message || "文件上传失败");
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || "文件上传失败");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("文件上传失败");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setDownloadFile("");
    setDownloadFileName("");
    setDownloadFileSize(null);
  };

  const handleSelectFile = (file: any) => {
    setDownloadFile(file.url);
    setDownloadFileName(file.originalName);
    setDownloadFileSize(file.size);
  };

  const handleSelectCover = (file: any) => {
    setCoverImage(file.url);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleSave = async (publish: boolean = false) => {
    try {
      const articleStatus = publish ? "published" : status;

      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          coverImage,
          status: articleStatus,
          isPremium,
          premiumPrice: isPremium ? premiumPrice : null,
          tagNames: tags.split(",").map((t) => t.trim()).filter(Boolean),
          categoryIds: [],
          locale: "zh",
          downloadEnabled,
          downloadFile: downloadEnabled ? downloadFile : null,
          downloadFileName: downloadEnabled ? downloadFileName : null,
          downloadFileSize: downloadEnabled ? downloadFileSize : null,
          downloadLink: downloadEnabled ? downloadLink : null,
          downloadIsFree: downloadEnabled ? downloadIsFree : true,
          downloadPrice: downloadEnabled && !downloadIsFree ? downloadPrice : null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(publish ? "文章发布成功！" : "保存成功！");
        if (publish) {
          router.push("/admin/articles");
        }
      } else {
        alert(data.message || "保存失败");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("保存失败");
    }
  };

  const cardStyle = "bg-white dark:bg-[#1e2228] shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl p-5";

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#13151a] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {title || "新文章"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {status === "draft" ? "草稿" : "已发布"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2.5 text-gray-600 dark:text-gray-400 bg-white dark:bg-[#1e2228] shadow-sm rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2e37] transition-all">
            <Eye className="h-4 w-4 mr-2" />
            预览
          </button>
          <button
            onClick={() => handleSave(true)}
            className="flex items-center px-5 py-2.5 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            <Save className="h-4 w-4 mr-2" />
            发布
          </button>
          <button
            onClick={() => handleSave(false)}
            className="flex items-center px-5 py-2.5 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25 transition-all hover:shadow-green-500/40 hover:-translate-y-0.5"
          >
            <Save className="h-4 w-4 mr-2" />
            保存草稿
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="请输入文章标题"
              className="w-full px-5 py-4 text-xl font-medium bg-white dark:bg-[#1e2228] dark:text-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl focus:ring-2 focus:ring-blue-500 focus:shadow-lg focus:shadow-blue-500/10 outline-none transition-all"
            />
          </div>

          {/* Markdown Editor */}
          <div className="bg-white dark:bg-[#1e2228] shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden">
            <FullMarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="开始写作..."
              height={1100}
            />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className={cardStyle}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">发布设置</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  文章状态
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  URL 别名
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="article-slug"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className={cardStyle}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">封面图片</h3>

            <div className="space-y-4">
              {coverImage ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={coverImage}
                    alt="封面"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    onClick={() => setCoverImage("")}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-xl hover:bg-black/70 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label className="flex-1 h-40 bg-gray-50 dark:bg-[#22262e] border-2 border-dashed border-gray-200 dark:border-gray-700/50 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all cursor-pointer">
                    {uploadingCover ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-sm">点击上传</span>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                    />
                  </label>
                  <button
                    onClick={() => setShowCoverSelector(true)}
                    className="w-16 h-40 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                    title="从文件库选择"
                  >
                    <FolderOpen className="h-6 w-6" />
                  </button>
                </div>
              )}

              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className={cardStyle}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">文章摘要</h3>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="简短描述文章内容..."
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
            />
          </div>

          {/* Tags */}
          <div className={cardStyle}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">标签</h3>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="用逗号分隔，如: React, Next.js, TypeScript"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* Download Settings */}
          <div className={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-500" />
                下载设置
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={downloadEnabled}
                  onChange={(e) => setDownloadEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {downloadEnabled && (
              <div className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    上传文件
                  </label>
                  {downloadFile ? (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#22262e] rounded-xl">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {downloadFileName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatFileSize(downloadFileSize)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <label className="flex-1 flex flex-col items-center justify-center w-full h-32 bg-gray-50 dark:bg-[#22262e] border-2 border-dashed border-gray-200 dark:border-gray-700/50 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploadingFile ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                点击上传
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={uploadingFile}
                        />
                      </label>
                      <button
                        onClick={() => setShowFileSelector(true)}
                        className="w-16 h-32 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                        title="从文件库选择"
                      >
                        <FolderOpen className="h-6 w-6" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Download Link */}
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    网盘链接
                  </label>
                  <input
                    type="text"
                    value={downloadLink}
                    onChange={(e) => setDownloadLink(e.target.value)}
                    placeholder="https://pan.baidu.com/s/xxx 或 https://drive.google.com/xxx"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    支持百度网盘、Google Drive、OneDrive 等网盘链接
                  </p>
                </div>

                {/* Permission Settings */}
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    下载权限
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#22262e] rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
                      <input
                        type="radio"
                        checked={downloadIsFree}
                        onChange={() => setDownloadIsFree(true)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <Unlock className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">免费下载</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">所有用户均可免费下载</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#22262e] rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
                      <input
                        type="radio"
                        checked={!downloadIsFree}
                        onChange={() => setDownloadIsFree(false)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <Lock className="h-5 w-5 text-orange-500 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">付费下载</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">需要支付后下载</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Paid Price */}
                {!downloadIsFree && (
                  <div className="pt-4">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      下载价格 (¥)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={downloadPrice}
                        onChange={(e) => setDownloadPrice(e.target.value)}
                        placeholder="9.9"
                        step="0.1"
                        min="0"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Premium Settings */}
          <div className={cardStyle}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">付费阅读</h3>

            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  开启付费阅读
                </span>
              </label>

              {isPremium && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    价格 (¥)
                  </label>
                  <input
                    type="number"
                    value={premiumPrice}
                    onChange={(e) => setPremiumPrice(e.target.value)}
                    placeholder="9.9"
                    step="0.1"
                    min="0"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#22262e] dark:text-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 文件选择器 */}
      <FileSelector
        isOpen={showFileSelector}
        onClose={() => setShowFileSelector(false)}
        onSelect={handleSelectFile}
        type="file"
      />

      {/* 封面选择器 */}
      <FileSelector
        isOpen={showCoverSelector}
        onClose={() => setShowCoverSelector(false)}
        onSelect={handleSelectCover}
        type="image"
      />
    </div>
  );
}
