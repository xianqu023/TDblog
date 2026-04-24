'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Download, Lock, File, Image, Video, Music, FileText, AlertCircle, CheckCircle, Clock, User } from 'lucide-react';

interface SharedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
}

interface SharedBy {
  username: string;
  profile: {
    displayName: string;
    avatarUrl: string | null;
  };
}

interface ShareData {
  file: SharedFile;
  sharedBy: SharedBy;
  expiresAt: string | null;
  remainingDownloads: number | null;
}

export default function SharePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = (params?.token as string) || '';
  
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchShareInfo();
  }, []);

  const fetchShareInfo = async (pwd?: string) => {
    try {
      setLoading(true);
      setError(null);
      setPasswordError('');
      
      const url = pwd 
        ? `/api/shares/${token}?password=${encodeURIComponent(pwd)}`
        : `/api/shares/${token}`;
      
      console.log('请求分享 API:', url);
      const response = await fetch(url);
      console.log('响应状态:', response.status);
      
      const data = await response.json();
      console.log('响应数据:', data);

      if (!response.ok) {
        if (response.status === 404) {
          setError('分享链接不存在或已失效');
        } else if (response.status === 410) {
          setError(data.message || '分享链接已过期');
        } else if (response.status === 403) {
          setPasswordError('密码错误');
          setRequiresPassword(true);
        } else {
          setError(data.message || '加载失败');
        }
        return;
      }

      if (data.requiresPassword) {
        setRequiresPassword(true);
      } else if (data.success) {
        setShareData(data.data);
      }
    } catch (err: any) {
      console.error('验证分享链接错误:', err);
      setError(`网络错误：${err.message || '请稍后重试'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError('请输入密码');
      return;
    }
    fetchShareInfo(password);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await fetch(`/api/files/${shareData!.file.id}/shares?token=${token}`);
      
      if (!response.ok) {
        throw new Error('下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = shareData!.file.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('下载失败，请稍后重试');
    } finally {
      setDownloading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-16 w-16" />;
    if (mimeType.startsWith('video/')) return <Video className="h-16 w-16" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-16 w-16" />;
    if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('excel')) return <FileText className="h-16 w-16" />;
    return <File className="h-16 w-16" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTimeRemaining = () => {
    if (!shareData?.expiresAt) return null;
    const end = new Date(shareData.expiresAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return '已过期';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}天${hours}小时`;
    if (hours > 0) return `${hours}小时`;
    return '少于 1 小时';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">加载分享信息...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">分享失效</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  if (requiresPassword && !shareData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
              <Lock className="h-10 w-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">需要密码</h2>
            <p className="text-gray-600">此分享受密码保护</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入访问密码"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg font-medium"
            >
              验证密码
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!shareData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            文件分享
          </h1>
          <p className="text-gray-600">您收到了一份文件分享</p>
        </div>

        {/* File Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-indigo-600">
                  {getFileIcon(shareData.file.mimeType)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 truncate">
                  {shareData.file.originalName}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <File className="h-4 w-4" />
                    {formatFileSize(shareData.file.fileSize)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {getTimeRemaining() || '永久有效'}
                  </span>
                  {shareData.remainingDownloads !== null && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      剩余 {shareData.remainingDownloads} 次下载
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Share Info */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {shareData.sharedBy.profile.avatarUrl ? (
                    <img
                      src={shareData.sharedBy.profile.avatarUrl}
                      alt={shareData.sharedBy.profile.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {shareData.sharedBy.profile.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {shareData.sharedBy.profile.displayName}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">@{shareData.sharedBy.username}</p>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full group flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <Download className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" />
              {downloading ? '下载中...' : '下载文件'}
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            温馨提示
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>此分享链接可能设有下载次数或时间限制，请尽快下载</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>下载前请确保您有足够的存储空间</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>如遇到问题，请联系分享者重新分享</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
