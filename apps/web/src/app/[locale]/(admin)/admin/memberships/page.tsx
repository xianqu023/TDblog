import { CreditCard, Users, TrendingUp } from "lucide-react";

const memberships = [
  { id: "free", name: "免费版", price: 0, users: 1580, features: ["阅读公开文章", "基础评论"] },
  { id: "pro", name: "专业版", price: 99, users: 320, features: ["阅读所有文章", "付费下载", "专属内容", "优先支持"] },
];

export default function MembershipsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">会员管理</h2>
        <p className="text-gray-600 mt-1">管理会员计划和订阅用户</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">1,900</div>
            <div className="text-sm text-gray-500">总会员数</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">320</div>
            <div className="text-sm text-gray-500">付费会员</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">¥31,680</div>
            <div className="text-sm text-gray-500">会员收入</div>
          </div>
        </div>
      </div>

      {/* Membership Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {memberships.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <span className="text-2xl font-bold text-blue-600">
                {plan.price === 0 ? "免费" : `¥${plan.price}/年`}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-4">{plan.users} 位用户</div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, i) => (
                <li key={`feature-${plan.id}-${i}`} className="flex items-center text-sm text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              编辑计划
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
