"use client";

import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Mail, Calendar, LayoutDashboard, ShoppingBag, Download, Crown, Settings, ArrowLeft, Upload, Camera, X, Save } from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  locale: string;
}

export default function UserCenterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <UserCenterContent params={params} />;
}

function UserCenterContent({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState("zh");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: "", bio: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);

      // 获取用户资料
      try {
        const profileRes = await fetch("/api/user/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.data);
          setEditForm({
            displayName: profileData.data.displayName,
            bio: profileData.data.bio,
          });
        }

        // 获取会话信息检查是否管理员
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData?.user?.permissions) {
            setIsAdmin(sessionData.user.permissions.includes("user:manage"));
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      alert("请上传图片文件");
      return;
    }

    // 验证文件大小（2MB）
    if (file.size > 2 * 1024 * 1024) {
      alert("图片大小不能超过 2MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "上传失败");
      }

      const avatarUrl = data.data.url;

      // 更新用户资料中的头像
      const updateRes = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl }),
      });

      if (updateRes.ok) {
        const updateData = await updateRes.json();
        setProfile((prev) => (prev ? { ...prev, avatarUrl } : null));
        alert("头像上传成功");
      }
    } catch (error: any) {
      alert(error.message || "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: editForm.displayName,
          bio: editForm.bio,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile((prev) =>
          prev
            ? { ...prev, displayName: data.data.displayName, bio: data.data.bio }
            : null
        );
        setEditing(false);
        alert("保存成功");
      }
    } catch (error) {
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back to Home */}
        <Link
          href={`/${locale}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回首页
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border p-6 sticky top-24">
              {/* Avatar with Upload */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full overflow-hidden shadow-lg">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                        {profile.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Upload Button Overlay */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-4">{profile.displayName}</h2>
                <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
                <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {isAdmin ? "管理员" : "普通用户"}
                </span>
              </div>

              {/* User Info */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{profile.username}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                  <span>加入于 {new Date().toLocaleDateString("zh-CN")}</span>
                </div>
              </div>

              {/* Admin Panel Link */}
              {isAdmin && (
                <div className="mt-6 pt-4 border-t">
                  <Link
                    href={`/${locale}/admin/dashboard`}
                    className="flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    后台管理
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">欢迎，{profile.displayName}！</h1>
              <p className="text-blue-100">
                这里是您的个人中心，您可以管理订单、下载和账户设置。
              </p>
            </div>

            {/* Profile Edit Section */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">个人资料</h3>
                {!editing ? (
                  <button
                    onClick={() => {
                      setEditing(true);
                      setEditForm({
                        displayName: profile.displayName,
                        bio: profile.bio,
                      });
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    编辑
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditing(false)}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-1" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      保存
                    </button>
                  </div>
                )}
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      显示名称
                    </label>
                    <input
                      type="text"
                      value={editForm.displayName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, displayName: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      个人简介
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                      maxLength={500}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">{profile.bio || "暂无简介"}</p>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">快捷链接</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href={`/${locale}/user-center/orders`}
                  className="flex items-center p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="p-3 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">我的订单</p>
                    <p className="text-sm text-gray-500">查看和管理您的订单</p>
                  </div>
                </Link>

                <Link
                  href={`/${locale}/user-center/downloads`}
                  className="flex items-center p-4 border rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                >
                  <div className="p-3 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                    <Download className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">我的下载</p>
                    <p className="text-sm text-gray-500">查看已下载的资源</p>
                  </div>
                </Link>

                <Link
                  href={`/${locale}/user-center/membership`}
                  className="flex items-center p-4 border rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all group"
                >
                  <div className="p-3 rounded-lg bg-yellow-100 group-hover:bg-yellow-200 transition-colors">
                    <Crown className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">会员状态</p>
                    <p className="text-sm text-gray-500">查看会员权益</p>
                  </div>
                </Link>

                <Link
                  href={`/${locale}/user-center/settings`}
                  className="flex items-center p-4 border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
                >
                  <div className="p-3 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">账户设置</p>
                    <p className="text-sm text-gray-500">修改密码和个人信息</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
