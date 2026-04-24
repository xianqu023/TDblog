"use client";

import { useDroppable } from "@dnd-kit/core";
import { useThemeEditorStore } from "@/lib/theme-editor/store";
import ComponentRenderer from "./ComponentRenderer";
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { componentRegistry } from "@/lib/theme-editor/components";

function SortableComponent({ component, index }: { component: any; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
  });

  const { selectComponent, selectedComponent } = useThemeEditorStore();
  const isSelected = selectedComponent?.id === component.id;

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component);
      }}
    >
      {!isDragging && (
        <div
          className="absolute -top-3 -right-3 hidden group-hover:flex items-center gap-1 z-10 bg-white rounded-full shadow-md border border-gray-200 p-1"
          {...listeners}
          {...attributes}
        >
          <span className="text-xs cursor-move">⋮⋮</span>
        </div>
      )}
      <ComponentRenderer component={component} />
    </div>
  );
}

export default function Canvas() {
  const { components, moveComponent, isPreviewMode, viewport } = useThemeEditorStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const { setNodeRef } = useDroppable({
    id: "canvas-drop-zone",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = components.findIndex((c) => c.id === active.id);
      const newIndex = components.findIndex((c) => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        moveComponent(oldIndex, newIndex);
      }
    }
  };

  const viewportWidth = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  }[viewport];

  if (isPreviewMode) {
    return (
      <div className="max-w-5xl mx-auto">
        <div
          className="bg-white shadow-lg rounded-lg overflow-hidden min-h-[600px]"
          style={{ width: viewportWidth }}
        >
          {components.length === 0 ? (
            <div className="flex items-center justify-center h-[600px] text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg">预览模式</p>
                <p className="text-sm mt-2">添加组件后预览效果</p>
              </div>
            </div>
          ) : (
            components.map((component) => (
              <ComponentRenderer key={component.id} component={component} />
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div
        ref={setNodeRef}
        className="bg-white shadow-lg rounded-lg overflow-hidden min-h-[600px]"
        style={{ width: viewportWidth }}
      >
        {components.length === 0 ? (
          <div className="flex items-center justify-center h-[600px] text-gray-400 border-2 border-dashed border-gray-300 m-4 rounded-lg">
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-lg">拖拽组件到此处</p>
              <p className="text-sm mt-2">从左侧组件库选择并拖拽组件</p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="p-4 space-y-2">
                {components.map((component, index) => (
                  <SortableComponent key={component.id} component={component} index={index} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
