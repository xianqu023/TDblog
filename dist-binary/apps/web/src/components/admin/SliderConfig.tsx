"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";
import FileSelector from "./FileSelector";

interface SliderConfigProps {
  sliderEnable: boolean;
  sliderArticleCount: number;
  adSliderRightImgUrl?: string;
  adSliderRightLink?: string;
  adSliderRightEnabled: boolean;
  onChange: (config: {
    sliderEnable: boolean;
    sliderArticleCount: number;
    adSliderRightImgUrl?: string;
    adSliderRightLink?: string;
    adSliderRightEnabled: boolean;
  }) => void;
}

export default function SliderConfig({
  sliderEnable,
  sliderArticleCount,
  adSliderRightImgUrl,
  adSliderRightLink,
  adSliderRightEnabled,
  onChange,
}: SliderConfigProps) {
  const [localSliderEnable, setLocalSliderEnable] = useState(sliderEnable);
  const [localSliderArticleCount, setLocalSliderArticleCount] = useState(sliderArticleCount);
  const [localAdImgUrl, setLocalAdImgUrl] = useState(adSliderRightImgUrl || "");
  const [localAdLink, setLocalAdLink] = useState(adSliderRightLink || "");
  const [localAdEnabled, setLocalAdEnabled] = useState(adSliderRightEnabled);
  const [uploading, setUploading] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onChange({
      sliderEnable: localSliderEnable,
      sliderArticleCount: localSliderArticleCount,
      adSliderRightImgUrl: localAdImgUrl || undefined,
      adSliderRightLink: localAdLink || undefined,
      adSliderRightEnabled: localAdEnabled,
    });
  };

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert("图片大小不能超过 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setLocalAdImgUrl(result.data.url);
      } else {
        alert(result.message || "上传失败");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("上传失败，请重试");
    } finally {
      setUploading(false);
      // 清空 input，允许重复上传同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 从文件选择器选择
  const handleSelectFromLibrary = (file: any) => {
    setLocalAdImgUrl(file.url);
  };

  // 移除图片
  const handleRemoveImage = () => {
    setLocalAdImgUrl("");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-bold text-gray-900">分区幻灯片配置</h3>
        <p className="text-sm text-gray-600 mt-1">
          配置首页顶部轮播图和广告位
        </p>
      </div>

      {/* 轮播图设置 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">启用轮播图</label>
            <p className="text-xs text-gray-500 mt-1">控制是否显示首页轮播图</p>
          </div>
          <button
            onClick={() => setLocalSliderEnable(!localSliderEnable)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localSliderEnable ? "bg-[#C41E3A]" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localSliderEnable ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {localSliderEnable && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              轮播文章数量
            </label>
            <select
              value={localSliderArticleCount}
              onChange={(e) => setLocalSliderArticleCount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
            >
              <option value={3}>3 篇</option>
              <option value={6}>6 篇</option>
              <option value={9}>9 篇</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              从最新文章中选取指定数量进行轮播
            </p>
          </div>
        )}
      </div>

      {/* 右侧广告设置 */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">启用右侧广告</label>
            <p className="text-xs text-gray-500 mt-1">控制是否显示右侧广告位</p>
          </div>
          <button
            onClick={() => setLocalAdEnabled(!localAdEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localAdEnabled ? "bg-[#C41E3A]" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localAdEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {localAdEnabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                广告图片
              </label>
              
              {/* 上传区域 */}
              {!localAdImgUrl ? (
                <div className="space-y-3">
                  {/* 拖拽上传区域 */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#C41E3A] transition-colors cursor-pointer bg-gray-50"
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-[#C41E3A] animate-spin mx-auto mb-3" />
                        <p className="text-sm text-gray-600">上传中...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 mb-1">
                          点击选择图片或拖拽图片到此处
                        </p>
                        <p className="text-xs text-gray-500">
                          支持 JPG、PNG、GIF 格式，最大 5MB
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* 隐藏的文件输入 */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />

                  {/* 或从库中选择 */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">或</span>
                    </div>
                  </div>

                  {/* 从文件库选择按钮 */}
                  <button
                    type="button"
                    onClick={() => setShowFileSelector(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <ImageIcon className="w-4 h-4" />
                    从文件库选择
                  </button>
                </div>
              ) : (
                /* 已选择图片预览 */
                <div className="space-y-3">
                  <div className="relative border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={localAdImgUrl}
                      alt="广告预览"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-red-500 hover:text-white rounded-full transition-colors shadow-lg"
                      title="移除图片"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    点击图片右上角的 ✕ 可移除并重新上传
                  </p>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                建议尺寸：300x450px 或相近比例（宽：高 ≈ 2:3）
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                广告跳转链接
              </label>
              <input
                type="text"
                value={localAdLink}
                onChange={(e) => setLocalAdLink(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
              />
              <p className="text-xs text-gray-500 mt-1">
                点击广告后跳转的链接（新窗口打开）
              </p>
            </div>
          </>
        )}
      </div>

      {/* 文件选择器弹窗 */}
      {showFileSelector && (
        <FileSelector
          isOpen={showFileSelector}
          onClose={() => setShowFileSelector(false)}
          onSelect={handleSelectFromLibrary}
          type="image"
        />
      )}

      {/* 保存按钮 */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          className="w-full bg-[#C41E3A] text-white py-2 px-4 rounded-md hover:bg-[#B01B34] transition-colors font-medium text-sm"
        >
          保存幻灯片配置
        </button>
      </div>
    </div>
  );
}
