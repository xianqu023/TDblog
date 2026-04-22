"use client";

import { useState } from "react";
import { 
  Home, FileText, Tag, Folder, Search, User, Mail, Phone, 
  Calendar, Star, Heart, Zap, Shield, Globe, Book, Image, 
  Video, Music, Coffee, Camera, Code, Palette, Trophy, 
  Award, Flag, Map, Compass, Rocket, Lightbulb, MessageSquare,
  Users, MessageCircle, ExternalLink, ChevronRight, Menu,
  X, Plus, Edit, Trash, Save, Settings, LogOut, LogIn,
  ArrowRight, Download, Upload, Share2, Bookmark, Eye,
  ThumbsUp, Clock, TrendingUp, Activity, Bell, Check,
  // 新增彩色图标
  Flame, Sun, Moon, Cloud, Snowflake, Wind, Droplets,
  Flower, Leaf, Flower2, Clover, Rose,
  Cherry, Apple,
  Pizza, Cake, Cookie, IceCream, Utensils,
  Gift, PartyPopper, Sparkles, Gem, Crown,
  Diamond, Footprints, Hand, Fingerprint,
  Brain, Bone, Stethoscope, Pill, Syringe,
  Car, Bus, Train, Plane, Ship, Bike, Truck,
  Gamepad, Joystick, Puzzle,
  Music2, Radio, Mic, Headphones, Drum, Guitar, Piano,
  Tv, Monitor, Laptop, Tablet, Smartphone, Watch, Calculator
} from "lucide-react";

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
}

const iconList = [
  { name: "首页", value: "Home" },
  { name: "文章", value: "FileText" },
  { name: "标签", value: "Tag" },
  { name: "分类", value: "Folder" },
  { name: "搜索", value: "Search" },
  { name: "用户", value: "User" },
  { name: "邮件", value: "Mail" },
  { name: "电话", value: "Phone" },
  { name: "日历", value: "Calendar" },
  { name: "收藏", value: "Star" },
  { name: "爱心", value: "Heart" },
  { name: "闪电", value: "Zap" },
  { name: "安全", value: "Shield" },
  { name: "地球", value: "Globe" },
  { name: "书籍", value: "Book" },
  { name: "图片", value: "Image" },
  { name: "视频", value: "Video" },
  { name: "音乐", value: "Music" },
  { name: "咖啡", value: "Coffee" },
  { name: "相机", value: "Camera" },
  { name: "代码", value: "Code" },
  { name: "调色板", value: "Palette" },
  { name: "奖杯", value: "Trophy" },
  { name: "奖项", value: "Award" },
  { name: "旗帜", value: "Flag" },
  { name: "地图", value: "Map" },
  { name: "指南针", value: "Compass" },
  { name: "火箭", value: "Rocket" },
  { name: "灯泡", value: "Lightbulb" },
  { name: "消息", value: "MessageSquare" },
  { name: "团队", value: "Users" },
  { name: "评论", value: "MessageCircle" },
  { name: "外链", value: "ExternalLink" },
  { name: "箭头", value: "ChevronRight" },
  { name: "菜单", value: "Menu" },
  { name: "关闭", value: "X" },
  { name: "添加", value: "Plus" },
  { name: "编辑", value: "Edit" },
  { name: "删除", value: "Trash" },
  { name: "保存", value: "Save" },
  { name: "设置", value: "Settings" },
  { name: "登出", value: "LogOut" },
  { name: "登录", value: "LogIn" },
  { name: "向右箭头", value: "ArrowRight" },
  { name: "下载", value: "Download" },
  { name: "上传", value: "Upload" },
  { name: "分享", value: "Share2" },
  { name: "书签", value: "Bookmark" },
  { name: "查看", value: "Eye" },
  { name: "点赞", value: "ThumbsUp" },
  { name: "时钟", value: "Clock" },
  { name: "趋势", value: "TrendingUp" },
  { name: "活动", value: "Activity" },
  { name: "通知", value: "Bell" },
  { name: "完成", value: "Check" },
  // 自然元素
  { name: "火焰", value: "Flame" },
  { name: "太阳", value: "Sun" },
  { name: "月亮", value: "Moon" },
  { name: "云朵", value: "Cloud" },
  { name: "雪花", value: "Snowflake" },
  { name: "风", value: "Wind" },
  { name: "水滴", value: "Droplets" },
  // 植物
  { name: "花朵", value: "Flower" },
  { name: "叶子", value: "Leaf" },
  { name: "花", value: "Flower2" },
  { name: "三叶草", value: "Clover" },
  { name: "玫瑰", value: "Rose" },
  // 水果
  { name: "樱桃", value: "Cherry" },
  { name: "苹果", value: "Apple" },
  // 食物
  { name: "披萨", value: "Pizza" },
  { name: "蛋糕", value: "Cake" },
  { name: "曲奇", value: "Cookie" },
  { name: "冰淇淋", value: "IceCream" },
  { name: "餐具", value: "Utensils" },
  // 礼物和庆祝
  { name: "礼物", value: "Gift" },
  { name: "派对", value: "PartyPopper" },
  { name: "火花", value: "Sparkles" },
  { name: "宝石", value: "Gem" },
  { name: "皇冠", value: "Crown" },
  { name: "钻石", value: "Diamond" },
  // 身体相关
  { name: "脚印", value: "Footprints" },
  { name: "手", value: "Hand" },
  { name: "指纹", value: "Fingerprint" },
  { name: "大脑", value: "Brain" },
  { name: "骨头", value: "Bone" },
  { name: "听诊器", value: "Stethoscope" },
  { name: "药丸", value: "Pill" },
  { name: "注射器", value: "Syringe" },
  // 交通工具
  { name: "汽车", value: "Car" },
  { name: "公交车", value: "Bus" },
  { name: "火车", value: "Train" },
  { name: "飞机", value: "Plane" },
  { name: "船", value: "Ship" },
  { name: "自行车", value: "Bike" },
  { name: "卡车", value: "Truck" },
  // 娱乐
  { name: "游戏手柄", value: "Gamepad" },
  { name: "摇杆", value: "Joystick" },
  { name: "拼图", value: "Puzzle" },
  // 音乐
  { name: "音乐", value: "Music2" },
  { name: "收音机", value: "Radio" },
  { name: "麦克风", value: "Mic" },
  { name: "耳机", value: "Headphones" },
  { name: "鼓", value: "Drum" },
  { name: "吉他", value: "Guitar" },
  { name: "钢琴", value: "Piano" },
  // 电子设备
  { name: "电视", value: "Tv" },
  { name: "显示器", value: "Monitor" },
  { name: "笔记本", value: "Laptop" },
  { name: "平板", value: "Tablet" },
  { name: "手机", value: "Smartphone" },
  { name: "手表", value: "Watch" },
  { name: "计算器", value: "Calculator" },
];

export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, FileText, Tag, Folder, Search, User, Mail, Phone,
  Calendar, Star, Heart, Zap, Shield, Globe, Book, Image,
  Video, Music, Coffee, Camera, Code, Palette, Trophy,
  Award, Flag, Map, Compass, Rocket, Lightbulb, MessageSquare,
  Users, MessageCircle, ExternalLink, ChevronRight, Menu,
  X, Plus, Edit, Trash, Save, Settings, LogOut, LogIn,
  ArrowRight, Download, Upload, Share2, Bookmark, Eye,
  ThumbsUp, Clock, TrendingUp, Activity, Bell, Check,
  // 新增彩色图标
  Flame, Sun, Moon, Cloud, Snowflake, Wind, Droplets,
  Flower, Leaf, Flower2, Clover, Rose,
  Cherry, Apple,
  Pizza, Cake, Cookie, IceCream, Utensils,
  Gift, PartyPopper, Sparkles, Gem, Crown,
  Diamond, Footprints, Hand, Fingerprint,
  Brain, Bone, Stethoscope, Pill, Syringe,
  Car, Bus, Train, Plane, Ship, Bike, Truck,
  Gamepad, Joystick, Puzzle,
  Music2, Radio, Mic, Headphones, Drum, Guitar, Piano,
  Tv, Monitor, Laptop, Tablet, Smartphone, Watch, Calculator
};

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const SelectedIcon = value && iconMap[value] ? iconMap[value] : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        {SelectedIcon ? (
          <SelectedIcon className="w-5 h-5 text-[#C41E3A]" />
        ) : (
          <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs text-gray-500">无</span>
          </div>
        )}
        <span className="text-sm text-gray-700">{value || "未选择"}</span>
        <span className="ml-auto text-gray-400">▼</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-64 max-h-80 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg z-20">
            <div className="p-2">
              <div className="grid grid-cols-6 gap-1">
                {iconList.map((icon) => {
                  const IconComponent = iconMap[icon.value];
                  return (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => {
                        onChange(icon.value);
                        setIsOpen(false);
                      }}
                      className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
                        value === icon.value ? 'bg-red-50 ring-2 ring-[#C41E3A]' : ''
                      }`}
                      title={icon.name}
                    >
                      <IconComponent className="w-5 h-5 text-gray-700" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
