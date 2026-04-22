# 中式主题组件使用指南

## 目录

1. [主题配置](#主题配置)
2. [全局状态管理](#全局状态管理)
3. [布局组件](#布局组件)
4. [侧边栏组件](#侧边栏组件)
5. [广告组件](#广告组件)

---

## 主题配置

### 配置文件位置
`apps/web/src/config/theme-chinese-full.config.ts`

### 配置结构

```typescript
{
  version: "1.0.0",
  global: ThemeGlobalSettings,           // 主题全局开关
  sidebarWidgets: SidebarWidgetsConfig,  // 侧边栏 13 个小组件
  homeView: HomeViewConfig,              // 首页视图配置
  adPositions: AdPositionsConfig,        // 5 个广告位
  animations: AnimationConfig,           // 动画配置
  seo: SEOConfig                         // SEO 配置
}
```

### 配置路径示例

```typescript
// 导入配置路径常量
import { CONFIG_PATHS } from "@/config/theme-chinese-full.config";

// 使用示例
CONFIG_PATHS.global.enabled          // "global.enabled"
CONFIG_PATHS.sidebarWidgets.searchBox // "sidebarWidgets.searchBox.enabled"
CONFIG_PATHS.adPositions.contentTop   // "adPositions.contentTop.enabled"
```

---

## 全局状态管理

### ThemeProvider

在页面根组件或 layout 中包裹：

```tsx
// app/[locale]/page.tsx
import { ThemeProvider } from "@/context/ThemeContext";
import { getServerSideThemeConfig } from "@/context/ThemeContext";

export default async function Page() {
  // 服务端获取初始配置
  const initialConfig = await getServerSideThemeConfig("chinese-style");
  
  return (
    <ThemeProvider initialConfig={initialConfig} themeSlug="chinese-style">
      {/* 页面内容 */}
    </ThemeProvider>
  );
}
```

### Hooks

```tsx
"use client";

import { useTheme, useThemeConfig, useThemeConfigUpdater } from "@/context/ThemeContext";

export function MyComponent() {
  // 1. 完整上下文
  const { config, isLoading, saveConfig, updateConfig } = useTheme();
  
  // 2. 直接获取配置值
  const searchEnabled = useThemeConfig<boolean>("sidebarWidgets.searchBox.enabled");
  
  // 3. 更新配置
  const updateConfig = useThemeConfigUpdater();
  
  const handleToggle = async () => {
    await updateConfig("sidebarWidgets.searchBox.enabled", !searchEnabled);
  };
  
  return (
    <button onClick={handleToggle}>
      {searchEnabled ? "启用" : "禁用"}
    </button>
  );
}
```

### 条件渲染组件

```tsx
import { IfWidgetEnabled, IfAdEnabled, IfAnimationEnabled } from "@/context/ThemeContext";

export function MyComponent() {
  return (
    <>
      {/* 根据后台配置显示小组件 */}
      <IfWidgetEnabled widgetName="searchBox">
        <SearchBox />
      </IfWidgetEnabled>
      
      {/* 根据后台配置显示广告 */}
      <IfAdEnabled position="contentTop">
        <AdBanner />
      </IfAdEnabled>
      
      {/* 根据后台配置显示动画 */}
      <IfAnimationEnabled animationName="scrollReveal">
        <ScrollRevealComponent />
      </IfAnimationEnabled>
    </>
  );
}
```

---

## 布局组件

### TwoColumnFullLayout

桌面 7:3 双栏布局，移动端自动单栏：

```tsx
import { TwoColumnFullLayout } from "@/components/layout/TwoColumnFullLayout";
import { SidebarFullWidgets } from "@/components/sidebar";

export default function BlogPage() {
  return (
    <TwoColumnFullLayout
      sidebar={<SidebarFullWidgets />}
      articles={articles}
    >
      {/* 文章列表 */}
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </TwoColumnFullLayout>
  );
}
```

### 特性

- ✅ 自动视图切换（卡片/列表/混合）
- ✅ 顶部视图切换按钮
- ✅ 强制显示封面图和完整摘要
- ✅ 自动插入文章间隔广告
- ✅ 响应式设计

### ArticleCard

```tsx
import { ArticleCard } from "@/components/layout/TwoColumnFullLayout";

<ArticleCard
  article={article}
  viewMode="card"  // "card" | "list" | "mixed"
  isFirst={true}
/>
```

---

## 侧边栏组件

### SidebarFullWidgets

完整侧边栏，包含 13 个小组件：

```tsx
import { SidebarFullWidgets } from "@/components/sidebar";

export function BlogLayout() {
  return (
    <aside>
      <SidebarFullWidgets />
    </aside>
  );
}
```

### 组件列表

1. **SearchBoxWidget** - 搜索框
2. **AuthorInfoWidget** - 博主信息
3. **CategoriesWidget** - 分类目录
4. **TagCloudWidget** - 标签云
5. **HotArticlesWidget** - 热门文章
6. **LatestArticlesWidget** - 最新文章
7. **RandomArticlesWidget** - 随机推荐
8. **ArchivesWidget** - 文章归档（日历）
9. **FriendLinksWidget** - 友情链接
10. **SiteStatsWidget** - 站点统计
11. **SubscribeWidget** - 订阅关注
12. **GoogleAdSide (sidebarTop)** - 顶部广告
13. **GoogleAdSide (sidebarBottom)** - 底部广告

---

## 广告组件

### GoogleAdSide

兼容谷歌 AdSense 和自定义图片广告：

```tsx
import { GoogleAdSide } from "@/components/sidebar/widgets/GoogleAdSide";

// 侧边栏顶部广告
<GoogleAdSide position="sidebarTop" />

// 侧边栏底部广告
<GoogleAdSide position="sidebarBottom" />

// 内容区域广告
<GoogleAdSide position="contentMiddle" showBorder={false} />
```

### 特性

- ✅ 懒加载（Intersection Observer）
- ✅ SEO 优化（aria-hidden）
- ✅ 国风边框适配
- ✅ 骨架屏加载状态
- ✅ 独立开关控制

### GoogleAdSenseScript

注入谷歌广告脚本：

```tsx
import { GoogleAdSenseScript } from "@/components/sidebar/widgets/GoogleAdSide";

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <GoogleAdSenseScript clientId="ca-pub-xxxxxxxxxxxxxx" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### ResponsiveAdUnit

响应式广告单元：

```tsx
import { ResponsiveAdUnit } from "@/components/sidebar/widgets/GoogleAdSide";

<ResponsiveAdUnit
  slot="1234567890"
  format="auto"
  position="contentTop"
/>
```

### AdWrapper

广告位包装器：

```tsx
import { AdWrapper } from "@/components/sidebar/widgets/GoogleAdSide";

<AdWrapper position="contentMiddle">
  {/* 自定义广告内容 */}
</AdWrapper>
```

---

## API 请求函数

### 读取配置

```tsx
import { fetchThemeConfig, getThemeConfigServer } from "@/api/theme-config";

// 客户端
const config = await fetchThemeConfig("chinese-style");

// 服务端
const config = await getThemeConfigServer("chinese-style");
```

### 保存配置

```tsx
import { saveThemeConfig, updateThemeConfigPartial } from "@/api/theme-config";

// 保存完整配置
await saveThemeConfig("chinese-style", fullConfig);

// 更新部分配置
await updateThemeConfigPartial(
  "chinese-style",
  "sidebarWidgets.searchBox.enabled",
  false
);
```

---

## 样式定制

### CSS 文件位置
`apps/web/src/styles/chinese-theme.css`

### 国风配色

```css
:root {
  --chinese-red: #c41e3a;
  --navy-blue: #1e3a5f;
  --rice-white: #f5f0e8;
  --bamboo-green: #5a7a5a;
  --ink-black: #1a1a1a;
}
```

### 动画类名

```tsx
<div className="scroll-reveal">滚动渐入</div>
<div className="chinese-card-hover">卡片悬浮</div>
<div className="btn-ripple">按钮涟漪</div>
<div className="stagger-animation">交错动画</div>
```

### 布局类名

```tsx
<div className="two-column-layout">7:3 双栏</div>
<div className="sidebar-sticky">粘性侧边栏</div>
<div className="card-view-large">卡片大图模式</div>
<div className="list-view-compact">列表紧凑模式</div>
```

---

## 完整示例

```tsx
// app/[locale]/blog/page.tsx
import { ThemeProvider, getServerSideThemeConfig } from "@/context/ThemeContext";
import { TwoColumnFullLayout } from "@/components/layout/TwoColumnFullLayout";
import { SidebarFullWidgets } from "@/components/sidebar";
import { fetchArticles } from "@/lib/articles";

export default async function BlogPage() {
  const initialConfig = await getServerSideThemeConfig("chinese-style");
  const articles = await fetchArticles();
  
  return (
    <ThemeProvider initialConfig={initialConfig}>
      <TwoColumnFullLayout
        sidebar={<SidebarFullWidgets />}
        articles={articles}
      >
        {articles.map((article, index) => (
          <ArticleCard
            key={article.id}
            article={article}
            viewMode="mixed"
            isFirst={index === 0}
          />
        ))}
      </TwoColumnFullLayout>
    </ThemeProvider>
  );
}
```

---

## 注意事项

1. **SSR 兼容**：所有组件支持服务端渲染
2. **客户端组件**：使用 Hook 的组件需添加 `"use client"`
3. **配置同步**：修改配置后调用 `refreshConfig()` 刷新
4. **广告 SEO**：广告使用 `aria-hidden="true"` 避免爬虫抓取
5. **懒加载**：广告和图片使用懒加载优化性能

---

## 常见问题

### Q: 如何禁用某个小组件？
A: 在后台配置中设置 `sidebarWidgets.{widgetName}.enabled = false`

### Q: 如何切换视图模式？
A: 使用 TwoColumnFullLayout 自带的视图切换按钮，或编程调用：
```tsx
const { updateConfig } = useTheme();
await updateConfig("homeView.defaultView", "card");
```

### Q: 广告不显示？
A: 检查后台配置 `adPositions.{position}.enabled = true` 且 `adType` 不为 `"none"`

### Q: 如何自定义侧边栏顺序？
A: 修改 `sidebarWidgets.{widgetName}.sortOrder` 值，从小到大排序
