"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SiteSettings {
  siteName: string;
  logoUrl: string;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || "zh";
  
  const [mode, setMode] = useState<"login" | "register">("login");
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "My Blog",
    logoUrl: "",
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/site-info');
        const data = await response.json();
        if (data.success && data.data.site) {
          setSettings({
            siteName: data.data.site.siteName || "My Blog",
            logoUrl: data.data.site.logoUrl || "",
          });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        setLoginError("邮箱或密码错误");
      } else {
        router.refresh();
        onClose();
      }
    } catch {
      setLoginError("登录失败，请稍后重试");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (regPassword !== regConfirmPassword) {
      setRegError("两次输入的密码不一致");
      return;
    }

    if (regPassword.length < 6) {
      setRegError("密码长度至少6位");
      return;
    }

    setRegLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRegError(data.error || "注册失败");
        return;
      }

      // 注册成功后自动登录
      const result = await signIn("credentials", {
        email: regEmail,
        password: regPassword,
        redirect: false,
      });

      if (result?.error) {
        setRegError("注册成功，请手动登录");
        setMode("login");
        setLoginEmail(regEmail);
      } else {
        router.refresh();
        onClose();
      }
    } catch {
      setRegError("注册失败，请稍后重试");
    } finally {
      setRegLoading(false);
    }
  };

  const resetForms = () => {
    setMode("login");
    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");
    setRegUsername("");
    setRegEmail("");
    setRegPassword("");
    setRegConfirmPassword("");
    setRegError("");
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header with Logo */}
        <div className="relative p-6 pb-4 border-b bg-gradient-to-br from-blue-50 to-purple-50">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/80 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          <div className="flex items-center space-x-3">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.siteName}
                className="h-12 w-12 object-contain rounded-xl shadow-sm"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm" />
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{settings.siteName}</h2>
              <p className="text-sm text-gray-500">
                {mode === "login" ? "欢迎回来" : "创建新账户"}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mode === "login"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            登录
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mode === "register"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            注册
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  邮箱
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
              >
                {loginLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                    登录中...
                  </>
                ) : (
                  "登录"
                )}
              </button>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-medium mb-1">测试账户:</p>
                <p className="text-xs text-blue-600">邮箱: admin@example.com</p>
                <p className="text-xs text-blue-600">密码: admin123</p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {regError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {regError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="2-20个字符"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    minLength={2}
                    maxLength={20}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  邮箱
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="至少6位"
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  确认密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
              >
                {regLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                    注册中...
                  </>
                ) : (
                  "注册"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-center text-sm text-gray-500">
          {mode === "login" ? (
            <span>
              还没有账户？{" "}
              <button
                onClick={() => setMode("register")}
                className="text-blue-600 hover:underline font-medium"
              >
                立即注册
              </button>
            </span>
          ) : (
            <span>
              已有账户？{" "}
              <button
                onClick={() => setMode("login")}
                className="text-blue-600 hover:underline font-medium"
              >
                立即登录
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
