import { create } from 'zustand';

export interface ThemeComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: ThemeComponent[];
  styles?: Record<string, any>;
}

export interface ThemeEditorState {
  components: ThemeComponent[];
  selectedComponent: ThemeComponent | null;
  draggedComponent: string | null;
  isPreviewMode: boolean;
  themeName: string;
  themeSlug: string;
  viewport: 'desktop' | 'tablet' | 'mobile';
  dropTarget: string | null;
  
  addComponent: (component: ThemeComponent, index?: number) => void;
  addChildToContainer: (parentId: string, child: ThemeComponent) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<ThemeComponent>) => void;
  selectComponent: (component: ThemeComponent | null) => void;
  setDraggedComponent: (type: string | null) => void;
  moveComponent: (fromIndex: number, toIndex: number) => void;
  togglePreviewMode: () => void;
  setThemeName: (name: string) => void;
  setThemeSlug: (slug: string) => void;
  setViewport: (viewport: 'desktop' | 'tablet' | 'mobile') => void;
  setDropTarget: (target: string | null) => void;
  loadConfig: (config: ThemeComponent[]) => void;
  exportConfig: () => ThemeComponent[];
}

export const useThemeEditorStore = create<ThemeEditorState>((set, get) => ({
  components: [],
  selectedComponent: null,
  draggedComponent: null,
  isPreviewMode: false,
  themeName: 'My Theme',
  themeSlug: 'my-theme',
  viewport: 'desktop',
  dropTarget: null,

  addComponent: (component, index) => set((state) => {
    const newComponents = [...state.components];
    if (index !== undefined) {
      newComponents.splice(index, 0, component);
    } else {
      newComponents.push(component);
    }
    return { components: newComponents };
  }),

  addChildToContainer: (parentId, child) => set((state) => {
    const updateChildren = (components: ThemeComponent[]): ThemeComponent[] => {
      return components.map((comp) => {
        if (comp.id === parentId) {
          return {
            ...comp,
            children: [...(comp.children || []), child],
          };
        }
        if (comp.children) {
          return {
            ...comp,
            children: updateChildren(comp.children),
          };
        }
        return comp;
      });
    };
    return { components: updateChildren(state.components) };
  }),

  removeComponent: (id) => set((state) => {
    const removeFromComponents = (components: ThemeComponent[]): ThemeComponent[] => {
      return components
        .filter((c) => c.id !== id)
        .map((c) => ({
          ...c,
          children: c.children ? removeFromComponents(c.children) : undefined,
        }));
    };
    return {
      components: removeFromComponents(state.components),
      selectedComponent: state.selectedComponent?.id === id ? null : state.selectedComponent,
    };
  }),

  updateComponent: (id, updates) => set((state) => {
    const updateInComponents = (components: ThemeComponent[]): ThemeComponent[] => {
      return components.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          if (state.selectedComponent?.id === id) {
            set({ selectedComponent: updated });
          }
          return updated;
        }
        if (c.children) {
          return { ...c, children: updateInComponents(c.children) };
        }
        return c;
      });
    };
    return { components: updateInComponents(state.components) };
  }),

  selectComponent: (component) => set({ selectedComponent: component }),

  setDraggedComponent: (type) => set({ draggedComponent: type }),

  moveComponent: (fromIndex, toIndex) => set((state) => {
    const newComponents = [...state.components];
    const [removed] = newComponents.splice(fromIndex, 1);
    newComponents.splice(toIndex, 0, removed);
    return { components: newComponents };
  }),

  togglePreviewMode: () => set((state) => ({ isPreviewMode: !state.isPreviewMode })),

  setThemeName: (name) => set({ themeName: name }),

  setThemeSlug: (slug) => set({ themeSlug: slug }),

  setViewport: (viewport) => set({ viewport }),

  setDropTarget: (target) => set({ dropTarget: target }),

  loadConfig: (config) => set({ components: config }),

  exportConfig: () => get().components,
}));
