"use client";

import { useThemeEditorStore } from "@/lib/theme-editor/store";
import { getComponentByType } from "@/lib/theme-editor/components";
import { useState } from "react";

export default function PropertyPanel() {
  const { selectedComponent, updateComponent, removeComponent } = useThemeEditorStore();
  const [activeTab, setActiveTab] = useState<"props" | "styles">("props");

  if (!selectedComponent) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">属性面板</h2>
          <p className="text-xs text-gray-500 mt-1">选择组件以编辑属性</p>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-sm">点击画布中的组件</p>
            <p className="text-xs mt-1">开始编辑属性</p>
          </div>
        </div>
      </div>
    );
  }

  const componentDef = getComponentByType(selectedComponent.type);
  const props = selectedComponent.props || {};

  const handlePropChange = (key: string, value: any) => {
    updateComponent(selectedComponent.id, {
      props: { ...props, [key]: value },
    });
  };

  const renderPropField = (key: string, value: any) => {
    if (typeof value === "boolean") {
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handlePropChange(key, e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 capitalize">{key}</span>
        </label>
      );
    }

    if (typeof value === "number") {
      return (
        <div>
          <label className="block text-xs text-gray-600 mb-1 capitalize">{key}</label>
          <input
            type="number"
            value={value}
            onChange={(e) => handlePropChange(key, Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      );
    }

    if (typeof value === "string" && (value.startsWith("#") || value.startsWith("rgb") || value.startsWith("linear"))) {
      return (
        <div>
          <label className="block text-xs text-gray-600 mb-1 capitalize">{key}</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={value.startsWith("#") ? value : "#000000"}
              onChange={(e) => handlePropChange(key, e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handlePropChange(key, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div>
          <label className="block text-xs text-gray-600 mb-1 capitalize">{key}</label>
          <textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                handlePropChange(key, JSON.parse(e.target.value));
              } catch {}
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div>
          <label className="block text-xs text-gray-600 mb-1 capitalize">{key}</label>
          <textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                handlePropChange(key, JSON.parse(e.target.value));
              } catch {}
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        </div>
      );
    }

    if (key === "text" || key === "description" || key === "content") {
      return (
        <div>
          <label className="block text-xs text-gray-600 mb-1 capitalize">{key}</label>
          <textarea
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>
      );
    }

    return (
      <div>
        <label className="block text-xs text-gray-600 mb-1 capitalize">{key}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => handlePropChange(key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    );
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">属性面板</h2>
          <button
            onClick={() => removeComponent(selectedComponent.id)}
            className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            🗑 删除
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {componentDef?.icon} {componentDef?.label}
        </p>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("props")}
          className={`flex-1 px-4 py-2 text-sm transition-colors ${
            activeTab === "props"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          属性
        </button>
        <button
          onClick={() => setActiveTab("styles")}
          className={`flex-1 px-4 py-2 text-sm transition-colors ${
            activeTab === "styles"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          样式
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "props" ? (
          Object.entries(props).map(([key, value]) => (
            <div key={key}>{renderPropField(key, value)}</div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">样式编辑</p>
            <p className="text-xs mt-1">即将支持...</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500">
          ID: {selectedComponent.id}
        </p>
      </div>
    </div>
  );
}
