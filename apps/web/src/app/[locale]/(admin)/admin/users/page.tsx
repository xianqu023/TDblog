"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash, Shield, UserCheck, UserX, X, Save, Users, UserPlus } from "lucide-react";

interface Role {
  id: string;
  name: string;
  displayName: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  status: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  roles: Role[];
  articleCount: number;
  lastLoginAt: string | null;
  createdAt: string;
}

interface AllRole {
  id: string;
  name: string;
  displayName: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [allRoles, setAllRoles] = useState<AllRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    status: "ACTIVE",
    displayName: "",
    avatarUrl: "",
    bio: "",
    roleIds: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [page, search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setTotal(data.data.pagination.total);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/admin/roles");
      const data = await response.json();
      if (data.success) {
        setAllRoles(data.data);
      }
    } catch (error) {
      setAllRoles([
        { id: "admin", name: "admin", displayName: "管理员" },
        { id: "editor", name: "editor", displayName: "编辑" },
        { id: "member", name: "member", displayName: "会员" },
        { id: "visitor", name: "visitor", displayName: "访客" },
      ]);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      status: user.status,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      roleIds: user.roles.map((r) => r.id),
    });
    setShowEditModal(true);
    setError("");
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      status: "ACTIVE",
      displayName: "",
      avatarUrl: "",
      bio: "",
      roleIds: ["visitor"],
    });
    setShowEditModal(true);
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : "/api/admin/users";

      const method = editingUser ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "保存失败");
      }

      setShowEditModal(false);
      fetchUsers();
      
      window.dispatchEvent(new CustomEvent('avatar-updated'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("确定要删除此用户吗？此操作不可恢复。")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "删除失败");
      }

      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("更新状态失败");
      }

      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "从未登录";
    return new Date(dateStr).toLocaleDateString("zh-CN");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
      {/* 装饰性背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-pink-100 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                      用户管理
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm">管理系统的所有用户</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleAdd}
                className="group flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5"
              >
                <UserPlus className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                <span className="font-medium">添加用户</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Filters */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 p-6 mb-8 border border-gray-100">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[280px]">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="搜索用户名称或邮箱..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                  />
                </div>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium cursor-pointer"
              >
                <option value="">所有角色</option>
                {allRoles.map((role) => (
                  <option key={role.name} value={role.name}>
                    {role.displayName}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium cursor-pointer"
              >
                <option value="">所有状态</option>
                <option value="ACTIVE">✅ 正常</option>
                <option value="SUSPENDED">⛔ 已停用</option>
                <option value="PENDING">⏳ 待审核</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
                <span className="ml-3 text-gray-600 font-medium">加载中...</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          用户信息
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          角色
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          文章数
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          最后登录
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent transition-all duration-200"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-transparent flex items-center justify-center text-gray-700 font-bold overflow-hidden">
                                {user.avatarUrl ? (
                                  <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center text-lg">
                                    {user.displayName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{user.displayName}</div>
                                <div className="text-xs text-gray-500 font-mono">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {user.roles.map((role) => (
                                <span
                                  key={role.id}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md shadow-purple-500/30"
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  {role.displayName}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full shadow-md ${
                                user.status === "ACTIVE"
                                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30"
                                  : user.status === "SUSPENDED"
                                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/30"
                                  : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-500/30"
                              }`}
                            >
                              {user.status === "ACTIVE" ? (
                                <>
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  正常
                                </>
                              ) : user.status === "SUSPENDED" ? (
                                <>
                                  <UserX className="h-3 w-3 mr-1" />
                                  已停用
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  待审核
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-purple-600">
                            {user.articleCount}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(user.lastLoginAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(user)}
                                className="group p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:shadow-md"
                                title="编辑"
                              >
                                <Edit className="h-4 w-4 group-hover:scale-110 transition-transform" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className="group p-2.5 text-orange-600 hover:bg-orange-50 rounded-xl transition-all hover:shadow-md"
                                title={user.status === "ACTIVE" ? "停用" : "启用"}
                              >
                                {user.status === "ACTIVE" ? (
                                  <UserX className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                ) : (
                                  <UserCheck className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
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

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    共 <span className="font-semibold text-gray-900">{total}</span> 个用户
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all font-medium shadow-sm"
                    >
                      上一页
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-5 py-2.5 rounded-xl transition-all font-medium shadow-md ${
                            page === pageNum
                              ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-purple-500/30"
                              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all font-medium shadow-sm"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  {editingUser ? "编辑用户" : "添加用户"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingUser ? "修改用户信息" : "创建新的用户账户"}
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    用户名 *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    placeholder="输入用户名"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    邮箱 *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  密码 {editingUser && <span className="text-gray-400 font-normal">(留空则不修改)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  placeholder="输入密码"
                  required={!editingUser}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    显示名称
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    placeholder="用户昵称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    状态
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                  >
                    <option value="ACTIVE">✅ 正常</option>
                    <option value="SUSPENDED">⛔ 已停用</option>
                    <option value="PENDING">⏳ 待审核</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  头像 URL
                </label>
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, avatarUrl: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono text-sm"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  个人简介
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                  placeholder="介绍一下自己..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  角色分配
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {allRoles.map((role) => (
                    <label
                      key={role.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={formData.roleIds.includes(role.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              roleIds: [...formData.roleIds, role.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              roleIds: formData.roleIds.filter((id) => id !== role.id),
                            });
                          }
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{role.displayName}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-8 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.username || !formData.email}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    保存
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
