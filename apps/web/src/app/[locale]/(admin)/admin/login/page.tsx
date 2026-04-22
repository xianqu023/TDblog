"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, LogIn, Shield } from "lucide-react";

interface SiteSettings {
  siteName?: string;
  logoUrl?: string;
}

export default function AdminLoginPage() {
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
        // 登录后检查权限
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();
        
        if (session?.user?.permissions?.includes('user:manage')) {
          // 管理员，进入后台
          router.push(`/${locale}/admin/dashboard`);
        } else {
          // 普通用户，重定向到用户中心
          setError("您没有管理员权限，无法访问后台");
          setTimeout(() => {
            router.push(`/${locale}/user-center`);
          }, 2000);
        }
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
          <Link href="/" className="inline-flex items-center justify-center space-x-2">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={siteName}
                className="h-12 w-12 rounded-xl object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            )}
            <span className="text-2xl font-bold text-gray-900">{siteName}</span>
          </Link>
          <p className="text-gray-600 mt-2">后台管理系统</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">管理员登录</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="h-5 w-5" />
              <span>{loading ? "登录中..." : "登录"}</span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link
              href={`/${locale}`}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              ← 返回首页
            </Link>
          </div>
        </div>

        {/* Admin Credentials Hint */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">测试管理员账号：</p>
          <p className="text-sm text-blue-700">邮箱：admin@example.com</p>
          <p className="text-sm text-blue-700">密码：admin123</p>
        </div>
      </div>
    </div>
  );
}
