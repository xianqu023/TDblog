"use client";

import { iconMap } from "@/components/admin/IconPicker";

export default function TestIcons() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">图标测试</h1>
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(iconMap).slice(0, 10).map(([name, IconComponent]) => (
          <div key={name} className="flex items-center gap-2 p-4 border rounded">
            <IconComponent className="w-6 h-6" />
            <span>{name}</span>
          </div>
        ))}
      </div>
      
      <h2 className="text-xl font-bold mt-8 mb-4">测试菜单图标</h2>
      <div className="flex gap-4">
        {['Home', 'FileText', 'Folder', 'Tag', 'Edit'].map((iconName) => {
          const IconComponent = iconMap[iconName];
          return (
            <div key={iconName} className="flex items-center gap-2 p-4 border rounded">
              {IconComponent ? (
                <>
                  <IconComponent className="w-6 h-6 text-blue-500" />
                  <span>{iconName} ✓</span>
                </>
              ) : (
                <span className="text-red-500">{iconName} ✗ 未找到</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
