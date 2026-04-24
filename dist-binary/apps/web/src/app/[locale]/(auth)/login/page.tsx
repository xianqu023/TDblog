"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, LogIn } from "lucide-react";

interface SiteSettings {
  siteName?: string;
  logoUrl?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || "zh";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [settingsLoading, setSettingsLoading] = useState(true);

  // 加载网站设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSettings({
              siteName: data.data.siteName || 'My Blog',
              logoUrl: data.data.logoUrl || '',
            });
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setSettingsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("邮箱或密码错误");
      } else {
        router.push(`/${locale}/admin/dashboard`);
        router.refresh();
      }
    } catch {
      setError("登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 获取显示的网站名称
  const siteName = settings.siteName || 'My Blog';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="flex flex-col items-center">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={siteName}
                className="h-16 w-16 rounded-xl object-cover mb-3"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-3">
                <span className="text-white font-bold text-xl">
                  {siteName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-2xl font-bold text-gray-900">{siteName}</span>
          </Link>
          <p className="text-gray-600 mt-2">后台管理系统</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl border p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">登录</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用户名或邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="您的用户名或邮箱"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>登录中...</span>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  登录
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/" className="text-blue-600 hover:underline">
            返回前台
          </Link>
        </p>
      </div>
    </div>
  );
}
