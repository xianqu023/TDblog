"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, Package, Plus, Pencil, Trash2, X, Search, TrendingUp, DollarSign } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  filePath: string | null;
  fileSize: number | null;
  downloadLimit: number;
  isActive: boolean;
  createdAt: string;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  filePath: string;
  downloadLimit: string;
  isActive: boolean;
}

const initialFormData: FormData = {
  name: "",
  slug: "",
  description: "",
  price: "",
  filePath: "",
  downloadLimit: "0",
  isActive: true,
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
    setError("");
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price.toString(),
      filePath: product.filePath || "",
      downloadLimit: product.downloadLimit.toString(),
      isActive: product.isActive,
    });
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此商品吗？")) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "删除失败");

      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      const method = editingProduct ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "保存失败");

      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-slate-100">
      {/* 装饰性背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-amber-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-red-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/30">
                    <ShoppingBag className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
                      商城管理
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm">管理您的数字商品</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleAdd}
                className="group flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
                <span className="font-medium">添加商品</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Search */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 p-6 mb-8 border border-gray-100">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索商品名称或标识..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-medium"
              >
                搜索
              </button>
            </form>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">商品总数</div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                    {total}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">上架中</div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                    {products.filter((p) => p.isActive).length}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">商品总价值</div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                    ¥{products.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
            {loading ? (
              <div className="p-20 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent" />
                <p className="text-gray-500 mt-4">加载中...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="p-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <ShoppingBag className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">暂无商品</p>
                <p className="text-gray-400 text-sm mt-2">点击上方按钮添加第一个商品</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          商品信息
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          价格
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          下载限制
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-gradient-to-r hover:from-red-50/50 hover:to-transparent transition-all duration-200"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-md">
                                  <Package className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    {product.name}
                                  </div>
                                  <div className="text-xs text-gray-500 font-mono">
                                    /{product.slug}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                                ¥{product.price.toFixed(2)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Package className="h-4 w-4 text-gray-400" />
                              {product.downloadLimit > 0 ? (
                                <span>{product.downloadLimit} 次</span>
                              ) : (
                                <span className="text-gray-400">无限制</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${
                                product.isActive
                                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-500/30"
                                  : "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md shadow-gray-500/30"
                              }`}
                            >
                              {product.isActive ? (
                                <>
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  上架中
                                </>
                              ) : (
                                "已下架"
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(product)}
                                className="group p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:shadow-md"
                                title="编辑"
                              >
                                <Pencil className="h-4 w-4 group-hover:scale-110 transition-transform" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="group p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:shadow-md"
                                title="删除"
                              >
                                <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      共 <span className="font-semibold text-gray-900">{total}</span> 条记录，
                      第 <span className="font-semibold text-gray-900">{page}</span>/{totalPages} 页
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all font-medium shadow-sm"
                      >
                        上一页
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md shadow-red-500/30"
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-3xl">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                {editingProduct ? "编辑商品" : "添加商品"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
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
                    商品名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    placeholder="输入商品名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    商品标识 *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-mono text-sm"
                    placeholder="product-slug"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  商品描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                  placeholder="商品详细描述..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    价格 (¥) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    下载限制 (次)
                  </label>
                  <input
                    type="number"
                    value={formData.downloadLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, downloadLimit: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    placeholder="0 表示无限制"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  文件路径
                </label>
                <input
                  type="text"
                  value={formData.filePath}
                  onChange={(e) =>
                    setFormData({ ...formData, filePath: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-mono text-sm"
                  placeholder="/path/to/file.zip"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                  上架此商品
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-8 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
