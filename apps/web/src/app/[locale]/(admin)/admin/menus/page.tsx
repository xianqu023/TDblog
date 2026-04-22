"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import { getMenus, saveMenu, deleteMenu, updateMenuOrder, MenuInput } from "@/app/actions/menu";
import IconPicker from "@/components/admin/IconPicker";

interface Menu {
  id: string;
  label: string;
  href: string;
  icon?: string;
  order: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [newMenu, setNewMenu] = useState(false);
  const [formData, setFormData] = useState<MenuInput & { icon?: string }>({
    label: "",
    href: "/",
    order: 0,
    enabled: true,
    icon: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    setLoading(true);
    const menuList = await getMenus();
    setMenus(menuList as unknown as Menu[]);
    setLoading(false);
  };

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      label: menu.label,
      href: menu.href,
      order: menu.order,
      enabled: menu.enabled,
      icon: menu.icon || "",
    });
    setNewMenu(false);
  };

  const handleNew = () => {
    setEditingMenu(null);
    setFormData({
      label: "",
      href: "/",
      order: menus.length,
      enabled: true,
      icon: "",
    });
    setNewMenu(true);
  };

  const handleCancel = () => {
    setEditingMenu(null);
    setNewMenu(false);
    setFormData({ label: "", href: "/", order: 0, enabled: true, icon: "" });
  };

  const handleSave = async () => {
    if (!formData.label || !formData.href) {
      alert("请填写菜单名称和链接");
      return;
    }

    setSaving(true);
    const result = await saveMenu({
      ...formData,
      id: editingMenu?.id,
    });

    if (result.success) {
      await loadMenus();
      handleCancel();
    } else {
      alert(result.error);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个菜单项吗？")) return;

    const result = await deleteMenu(id);
    if (result.success) {
      await loadMenus();
    } else {
      alert(result.error);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newMenus = [...menus];
    [newMenus[index], newMenus[index - 1]] = [newMenus[index - 1], newMenus[index]];
    
    // Update order
    const updates = newMenus.map((menu, idx) => ({ id: menu.id, order: idx }));
    const result = await updateMenuOrder(updates);
    
    if (result.success) {
      await loadMenus();
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === menus.length - 1) return;
    const newMenus = [...menus];
    [newMenus[index], newMenus[index + 1]] = [newMenus[index + 1], newMenus[index]];
    
    const updates = newMenus.map((menu, idx) => ({ id: menu.id, order: idx }));
    const result = await updateMenuOrder(updates);
    
    if (result.success) {
      await loadMenus();
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12">加载中...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">导航菜单管理</h1>
          <p className="text-gray-600 mt-1">管理前台顶部导航栏的菜单项</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>添加菜单</span>
        </button>
      </div>

      {/* Edit/New Form */}
      {(newMenu || editingMenu) && (
        <div className="mb-6 p-6 bg-white rounded-xl border-2 border-blue-200 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {newMenu ? "添加新菜单项" : "编辑菜单项"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                菜单名称 *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：首页"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                链接地址 *
              </label>
              <input
                type="text"
                value={formData.href}
                onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：/ 或 /articles"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                图标
              </label>
              <IconPicker
                value={formData.icon}
                onChange={(icon) => setFormData({ ...formData, icon })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                排序
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">启用</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              <span>{saving ? "保存中..." : "保存"}</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X size={18} />
              <span>取消</span>
            </button>
          </div>
        </div>
      )}

      {/* Menu List */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                排序
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                菜单名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                链接地址
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {menus.map((menu, index) => (
              <tr key={menu.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === menus.length - 1}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <span className="ml-2 text-sm text-gray-500">{menu.order}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {menu.icon && (
                      <span className="text-[#C41E3A]">
                        {(() => {
                          const IconComponent = require("lucide-react")[menu.icon];
                          return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
                        })()}
                      </span>
                    )}
                    <span className="text-sm font-medium text-gray-900">{menu.label}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{menu.href}</code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      menu.enabled
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {menu.enabled ? "启用" : "禁用"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(menu)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(menu.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {menus.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  暂无菜单项，请点击"添加菜单"按钮添加
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Preview */}
      {menus.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <h3 className="text-sm font-medium text-gray-700 mb-3">前台导航预览：</h3>
          <div className="flex items-center space-x-6">
            {menus
              .filter((m) => m.enabled)
              .map((menu) => (
                <span key={menu.id} className="text-sm text-gray-900">
                  {menu.label}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
