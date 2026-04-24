"use client";

import Link from "next/link";
import {
  Users, Eye, FileText, MessageSquare, Calendar, BarChart3,
  PenLine, Upload, MessageCircle, FolderTree, Link as LinkIcon,
  Settings, ChevronRight, Clock, TrendingUp, TrendingDown,
  LayoutGrid, Tag, MessageCircleReply, FileMinus,
  Monitor, Smartphone,
} from "lucide-react";
import { useState } from "react";
import { useDarkMode } from "@/components/admin/DarkModeProvider";

const statsCards = [
  {
    title: "今日访客",
    value: "2",
    change: "-33%",
    changeType: "down" as const,
    sub: "独立访客数",
    icon: Users,
  },
  {
    title: "今日浏览",
    value: "4",
    change: "-97%",
    changeType: "down" as const,
    sub: "页面浏览量",
    icon: Eye,
  },
  {
    title: "文章总数",
    value: "0",
    sub: "0 已发布 · 0 草稿",
    icon: FileText,
  },
  {
    title: "评论总数",
    value: "2",
    sub: "全部已审核",
    icon: MessageSquare,
  },
  {
    title: "本月浏览",
    value: "141",
    sub: "累计浏览量",
    icon: Calendar,
  },
  {
    title: "年度浏览",
    value: "141",
    sub: "年度累计",
    icon: BarChart3,
  },
];

const quickActions = [
  { icon: PenLine, label: "写文章", href: "/admin/articles/new", bg: "bg-blue-50", hover: "hover:bg-blue-100", text: "text-blue-600", darkBg: "dark:bg-blue-900/20", darkHover: "dark:hover:bg-blue-900/30", darkText: "dark:text-blue-400" },
  { icon: Upload, label: "上传文件", href: "/admin/files", bg: "bg-purple-50", hover: "hover:bg-purple-100", text: "text-purple-600", darkBg: "dark:bg-purple-900/20", darkHover: "dark:hover:bg-purple-900/30", darkText: "dark:text-purple-400" },
  { icon: MessageCircle, label: "管理评论", href: "/admin/comments", bg: "bg-green-50", hover: "hover:bg-green-100", text: "text-green-600", darkBg: "dark:bg-green-900/20", darkHover: "dark:hover:bg-green-900/30", darkText: "dark:text-green-400" },
  { icon: FolderTree, label: "文档系列", href: "/admin/categories", bg: "bg-orange-50", hover: "hover:bg-orange-100", text: "text-orange-600", darkBg: "dark:bg-orange-900/20", darkHover: "dark:hover:bg-orange-900/30", darkText: "dark:text-orange-400" },
  { icon: LinkIcon, label: "友链管理", href: "/admin/links", bg: "bg-cyan-50", hover: "hover:bg-cyan-100", text: "text-cyan-600", darkBg: "dark:bg-cyan-900/20", darkHover: "dark:hover:bg-cyan-900/30", darkText: "dark:text-cyan-400" },
  { icon: Settings, label: "系统设置", href: "/admin/settings", bg: "bg-gray-50", hover: "hover:bg-gray-100", text: "text-gray-600", darkBg: "dark:bg-gray-700/50", darkHover: "dark:hover:bg-gray-700/70", darkText: "dark:text-gray-400" },
];

const trafficData = [
  { date: "04-04", value: 12 },
  { date: "04-05", value: 10 },
  { date: "04-06", value: 8 },
  { date: "04-07", value: 15 },
  { date: "04-08", value: 20 },
  { date: "04-09", value: 70 },
  { date: "04-10", value: 10 },
];

const sourceData = [
  { name: "tangdi.eu.org", value: 92, color: "bg-blue-600" },
  { name: "直接访问", value: 8, color: "bg-green-500" },
];

const deviceData = [
  { name: "移动端", value: 1, icon: Smartphone },
  { name: "桌面端", value: 99, icon: Monitor },
];

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"7" | "30">("7");
  const { darkMode } = useDarkMode();

  const maxTraffic = Math.max(...trafficData.map((d) => d.value));

  const cardStyle = darkMode
    ? "bg-[#1e2228]"
    : "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]";
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-500" : "text-gray-400";
  const textSubtle = darkMode ? "text-gray-500" : "text-gray-500";
  const separatorColor = darkMode ? "bg-gray-700/30" : "bg-gray-100";

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#13151a]" : "bg-[#f5f6f8]"} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-xl font-bold ${textPrimary}`}>晚上好，lfp1991</h1>
          <p className={`text-sm ${textSubtle} mt-1`}>这是您的网站数据概览</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5"
        >
          <PenLine className="h-4 w-4 mr-2" />
          写文章
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className={`${cardStyle} rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-medium ${textSecondary}`}>{card.title}</span>
                <div className={`w-8 h-8 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gradient-to-br from-gray-50 to-gray-100"} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                </div>
              </div>
              <div className={`text-2xl font-bold ${textPrimary} mb-1`}>{card.value}</div>
              <div className="flex items-center justify-between">
                {card.change ? (
                  <div className="flex items-center">
                    <span className={`flex items-center text-xs font-medium ${
                      card.changeType === "down" ? "text-red-500" : "text-green-500"
                    }`}>
                      {card.changeType === "down" ? (
                        <TrendingDown className="h-3 w-3 mr-0.5" />
                      ) : (
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                      )}
                      {card.change}
                    </span>
                  </div>
                ) : (
                  <div />
                )}
                <span className={`text-xs ${textMuted}`}>{card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className={`${cardStyle} rounded-2xl p-5 mb-6`}>
        <h2 className={`text-base font-semibold ${textPrimary} mb-4`}>快速操作</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl ${action.bg} ${action.hover} ${action.darkBg} ${action.darkHover} transition-all duration-300 hover:scale-105 hover:shadow-md`}
              >
                <Icon className={`h-5 w-5 mb-2 ${action.text} ${action.darkText}`} />
                <span className={`text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Traffic Trend + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Traffic Trend */}
        <div className={`lg:col-span-2 ${cardStyle} rounded-2xl p-5`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-base font-semibold ${textPrimary}`}>访问趋势</h2>
              <p className={`text-xs ${textSubtle} mt-0.5`}>网站流量数据统计</p>
            </div>
            <div className={`flex rounded-xl p-1 ${darkMode ? "bg-[#22262e]" : "bg-gray-100"}`}>
              <button
                onClick={() => setTimeRange("7")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  timeRange === "7"
                    ? darkMode
                      ? "bg-[#2a2e37] text-gray-100 shadow-sm"
                      : "bg-white text-gray-900 shadow-sm"
                    : darkMode
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                7 天
              </button>
              <button
                onClick={() => setTimeRange("30")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  timeRange === "30"
                    ? darkMode
                      ? "bg-[#2a2e37] text-gray-100 shadow-sm"
                      : "bg-white text-gray-900 shadow-sm"
                    : darkMode
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                30 天
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center space-x-12 mb-6">
            <div>
              <div className={`text-2xl font-bold ${textPrimary}`}>145</div>
              <div className={`flex items-center text-xs ${textSubtle} mt-0.5`}>
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block mr-1.5" />
                浏览量
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${textPrimary}`}>5</div>
              <div className={`flex items-center text-xs ${textSubtle} mt-0.5`}>
                <span className="w-2 h-2 rounded-full bg-blue-700 inline-block mr-1.5" />
                访客数
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${textPrimary}`}>21</div>
              <div className={`text-xs ${textSubtle} mt-0.5`}>日均浏览</div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end space-x-2 h-32">
            {trafficData.map((item, i) => {
              const height = maxTraffic > 0 ? (item.value / maxTraffic) * 100 : 0;
              return (
                <div key={item.date} className="flex-1 flex flex-col items-center group">
                  <div className="w-full flex items-end justify-center" style={{ height: "100px" }}>
                    <div
                      className={`w-full max-w-8 rounded-lg transition-all duration-500 group-hover:opacity-80 ${
                        item.value === maxTraffic
                          ? "bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg shadow-blue-500/30"
                          : darkMode
                          ? "bg-gradient-to-t from-blue-800/50 to-blue-700/30"
                          : "bg-gradient-to-t from-blue-200 to-blue-100"
                      }`}
                      style={{ height: `${Math.max(height, 6)}%` }}
                    />
                  </div>
                  <span className={`text-xs ${textMuted} mt-2`}>{item.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className={`${cardStyle} rounded-2xl p-5`}>
          <h2 className={`text-base font-semibold ${textPrimary} mb-6`}>访问来源</h2>

          {/* Donut Chart */}
          <div className="flex justify-center mb-6">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle
                  cx="18" cy="18" r="15.915"
                  fill="none"
                  stroke={darkMode ? "#2a2e37" : "#f3f4f6"}
                  strokeWidth="4"
                />
                <circle
                  cx="18" cy="18" r="15.915"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeDasharray="92 100"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                <circle
                  cx="18" cy="18" r="15.915"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="4"
                  strokeDasharray="8 100"
                  strokeDashoffset="-92"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-lg font-bold ${textPrimary}`}>145</span>
                <span className={`text-xs ${textSubtle}`}>新访问</span>
              </div>
            </div>
          </div>

          {/* Source List */}
          <div className="space-y-3">
            {sourceData.map((source) => (
              <div key={source.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`w-2.5 h-2.5 rounded-full ${source.color} mr-2`} />
                  <span className={`text-sm ${textSecondary}`}>{source.name}</span>
                </div>
                <span className={`text-sm font-semibold ${textPrimary}`}>{source.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device Distribution */}
      <div className={`${cardStyle} rounded-2xl p-5 mb-6`}>
        <h2 className={`text-base font-semibold ${textPrimary} mb-4`}>设备分布</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {deviceData.map((device) => {
            const Icon = device.icon;
            return (
              <div key={device.name} className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gradient-to-br from-gray-50 to-gray-100"} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${textSecondary}`}>{device.name}</span>
                    <span className={`text-sm font-bold ${textPrimary}`}>{device.value}%</span>
                  </div>
                  <div className={`w-full ${darkMode ? "bg-gray-700/30" : "bg-gray-100"} rounded-full h-2.5`}>
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${device.value}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className={`flex items-center justify-between mt-5 pt-4 ${separatorColor} rounded-t-xl`}>
          <span className={`text-sm font-medium ${textSecondary}`}>总访问</span>
          <span className={`text-sm font-bold ${textPrimary}`}>145</span>
        </div>
      </div>

      {/* Bottom Stats + Articles + Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Small Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: LayoutGrid, label: "分类", value: "0", iconBg: "bg-orange-50", iconColor: "text-orange-500", darkIconBg: "dark:bg-orange-900/20", darkIconColor: "dark:text-orange-400" },
            { icon: Tag, label: "标签", value: "0", iconBg: "bg-purple-50", iconColor: "text-purple-500", darkIconBg: "dark:bg-purple-900/20", darkIconColor: "dark:text-purple-400" },
            { icon: MessageCircleReply, label: "待审核评论", value: "0", iconBg: "bg-yellow-50", iconColor: "text-yellow-500", darkIconBg: "dark:bg-yellow-900/20", darkIconColor: "dark:text-yellow-400" },
            { icon: FileMinus, label: "草稿", value: "0", iconBg: "bg-blue-50", iconColor: "text-blue-500", darkIconBg: "dark:bg-blue-900/20", darkIconColor: "dark:text-blue-400" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`${cardStyle} rounded-2xl p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl ${item.iconBg} ${item.darkIconBg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${item.iconColor} ${item.darkIconColor}`} />
                  </div>
                  <div>
                    <div className={`text-xl font-bold ${textPrimary}`}>{item.value}</div>
                    <div className={`text-xs ${textSubtle}`}>{item.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Popular Articles */}
        <div className={`${cardStyle} rounded-2xl p-5`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-base font-semibold ${textPrimary}`}>热门文章</h2>
              <p className={`text-xs ${textSubtle} mt-0.5`}>浏览量最高的文章</p>
            </div>
            <Link href="/admin/articles" className={`flex items-center text-xs ${textSubtle} hover:text-blue-500 transition-colors`}>
              查看全部
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {[
              { title: "/posts/hlxx", views: 12, comments: 0, time: "0秒" },
              { title: "/posts/PLKl", views: 7, comments: 0, time: "0秒" },
            ].map((article, i) => (
              <div key={article.title} className={`flex items-center space-x-3 py-3 ${i > 0 ? `${separatorColor} rounded-t-xl` : ""} ${i > 0 ? "pt-4" : ""}`}>
                <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                  i === 0
                    ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md shadow-orange-500/25"
                    : darkMode
                    ? "bg-gray-700/50 text-gray-400"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"} truncate`}>{article.title}</p>
                  <div className={`flex items-center text-xs ${textMuted} mt-1`}>
                    <Eye className="h-3 w-3 mr-1" />
                    <span>{article.views}</span>
                    <MessageSquare className="h-3 w-3 ml-2 mr-1" />
                    <span>{article.comments}</span>
                    <Clock className="h-3 w-3 ml-2 mr-1" />
                    <span>{article.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Comments */}
        <div className={`${cardStyle} rounded-2xl p-5`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-base font-semibold ${textPrimary}`}>最近评论</h2>
              <p className={`text-xs ${textSubtle} mt-0.5`}>最新的用户评论</p>
            </div>
            <Link href="/admin/comments" className={`flex items-center text-xs ${textSubtle} hover:text-blue-500 transition-colors`}>
              查看全部
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {[
              { user: "lfp1991", status: "已通过", content: "欢迎使用 Anheyu~App!", time: "23小时前" },
              { user: "lfp1991", status: "已通过", content: "欢迎使用 Anheyu~App!", time: "23小时前" },
            ].map((comment, i) => (
              <div key={`${comment.user}-${i}-${comment.time}`} className={`flex items-start space-x-3 py-3 ${i > 0 ? `${separatorColor} rounded-t-xl` : ""} ${i > 0 ? "pt-4" : ""}`}>
                <div className={`w-9 h-9 rounded-xl ${darkMode ? "bg-gradient-to-br from-gray-600 to-gray-700" : "bg-gradient-to-br from-gray-200 to-gray-300"} flex items-center justify-center text-xs font-bold ${darkMode ? "text-gray-200" : "text-gray-600"} flex-shrink-0`}>
                  {comment.user[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${textPrimary}`}>{comment.user}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md font-medium">
                      {comment.status}
                    </span>
                  </div>
                  <p className={`text-xs ${textSubtle} mt-1 truncate`}>{comment.content}</p>
                  <p className={`text-xs ${textMuted} mt-1`}>{comment.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
