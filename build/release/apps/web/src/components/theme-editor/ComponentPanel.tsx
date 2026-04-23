"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { componentRegistry, categories, getComponentsByCategory } from "@/lib/theme-editor/components";
import { useState } from "react";

function DraggableComponent({ type, label, icon }: { type: string; label: string; icon: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: type,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 p-2.5 bg-white border border-gray-200 rounded-lg cursor-move hover:border-blue-400 hover:shadow-sm transition-all text-sm"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-gray-700">{label}</span>
    </div>
  );
}

export default function ComponentPanel() {
  const [activeCategory, setActiveCategory] = useState<string>("layout");

  const components = getComponentsByCategory(activeCategory);

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">组件库</h2>
        <p className="text-xs text-gray-500 mt-1">拖拽组件到画布中</p>
      </div>

      <div className="flex gap-1 p-2 border-b border-gray-100 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-2 py-1.5 rounded text-xs whitespace-nowrap transition-colors ${
              activeCategory === cat.key
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {components.map((comp) => (
          <DraggableComponent
            key={comp.type}
            type={comp.type}
            label={comp.label}
            icon={comp.icon}
          />
        ))}
      </div>

      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500">
          共 {componentRegistry.length} 个组件
        </p>
      </div>
    </div>
  );
}
