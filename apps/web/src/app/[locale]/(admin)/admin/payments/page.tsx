import { CreditCard, DollarSign, TrendingUp } from "lucide-react";

const payments = [
  { id: "PAY001", user: "member01", amount: 99, method: "Stripe", status: "completed", date: "2026-04-15", type: "会员" },
  { id: "PAY002", user: "visitor02", amount: 9.9, method: "支付宝", status: "completed", date: "2026-04-14", type: "付费文章" },
  { id: "PAY003", user: "member02", amount: 19.9, method: "微信支付", status: "pending", date: "2026-04-13", type: "付费文章" },
  { id: "PAY004", user: "member03", amount: 99, method: "PayPal", status: "completed", date: "2026-04-12", type: "会员" },
];

export default function PaymentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">支付管理</h2>
        <p className="text-gray-600 mt-1">查看所有支付记录和交易详情</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600 w-fit">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">¥9,980</div>
            <div className="text-sm text-gray-500">总收入</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 w-fit">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">156</div>
            <div className="text-sm text-gray-500">交易笔数</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 w-fit">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">+23%</div>
            <div className="text-sm text-gray-500">环比增长</div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">支付方式</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.id}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{payment.user}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{payment.type}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">¥{payment.amount}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{payment.method}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    payment.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {payment.status === "completed" ? "已完成" : "待处理"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{payment.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
