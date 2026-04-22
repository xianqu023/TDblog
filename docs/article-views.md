# 文章视图组件使用指南

## 组件概览

文章视图组件提供三种显示模式：
- **ArticleCardView** - 大图卡片模式
- **ArticleListView** - 列表紧凑模式
- **ArticleMixedView** - 混合模式（首篇特殊 + 列表）

所有组件完全读取后台配置，支持动态切换。

---

## ArticleCardView - 大图卡片视图

### 功能特性

✅ 封面大图展示
✅ 标题 + 摘要 + 标签
✅ 阅读量、作者、发布日期
✅ Hover 上浮动画
✅ 国风设计
✅ 首篇文章特殊样式

### 使用示例

```tsx
import { ArticleCardView, ArticleCardGrid } from "@/components/article";

// 单个卡片
<ArticleCardView
  article={{
    id: "1",
    title: "文章标题",
    excerpt: "文章摘要...",
    coverImage: "/images/cover.jpg",
    publishedAt: "2024-01-01",
    views: 1234,
    tags: ["技术", "博客"],
    author: "作者名"
  }}
  isFirst={true}
  onClick={() => console.log("点击了文章")}
/>

// 卡片网格布局
<ArticleCardGrid
  articles={articles}
  className="gap-6"
/>
```

### 后台配置

```json
{
  "homeView": {
    "cardView": {
      "showCoverImage": true,
      "showExcerpt": true,
      "excerptMaxLines": 2,
      "showTags": true,
      "maxTags": 3,
      "showAuthor": true,
      "showDate": true,
      "showViews": true,
      "cardRadius": "0.75rem",
      "cardShadow": "md",
      "cardsPerRow": 2
    }
  }
}
```

---

## ArticleListView - 列表视图

### 功能特性

✅ 左侧缩略图
✅ 右侧标题 + 摘要
✅ 紧凑排版
✅ 时间、阅读量、标签
✅ Hover 效果

### 使用示例

```tsx
import { ArticleListView, ArticleListGroup } from "@/components/article";

// 单个列表项
<ArticleListView
  article={{
    id: "1",
    title: "文章标题",
    excerpt: "文章摘要...",
    coverImage: "/images/cover.jpg",
    publishedAt: "2024-01-01",
    views: 1234,
    tags: ["技术", "博客"],
    author: "作者名"
  }}
  onClick={() => console.log("点击了文章")}
/>

// 列表组
<ArticleListGroup
  articles={articles}
  className="space-y-4"
/>
```

### 后台配置

```json
{
  "homeView": {
    "listView": {
      "showThumbnail": true,
      "thumbnailWidth": 128,
      "showExcerpt": true,
      "excerptMaxLength": 100,
      "showTags": true,
      "showAuthor": true,
      "showDate": true,
      "showViews": true,
      "showDivider": true
    }
  }
}
```

---

## ArticleMixedView - 混合视图

### 功能特性

✅ 首篇文章特殊样式（大图推荐）
✅ 后续文章列表式排列
✅ 支持交错布局（每隔 N 篇显示卡片）
✅ 自动视图切换器

### 使用示例

```tsx
import { ArticleMixedView, ArticleViewSwitcher } from "@/components/article";

// 混合视图
<ArticleMixedView
  articles={articles}
  onArticleClick={(article) => console.log("点击了文章", article)}
  className="space-y-6"
/>

// 视图切换器（推荐）
<ArticleViewSwitcher
  articles={articles}
  viewMode="mixed"  // "card" | "list" | "mixed"
  onArticleClick={(article) => console.log("点击了文章", article)}
/>
```

### 后台配置

```json
{
  "homeView": {
    "mixedView": {
      "firstArticleStyle": "featured",  // "featured" | "large"
      "staggeredLayout": true,
      "specialArticleInterval": 5
    },
    "defaultView": "mixed",
    "allowViewToggle": true
  }
}
```

---

## 完整使用示例

### 在 TwoColumnFullLayout 中使用

```tsx
// app/[locale]/page.tsx
"use client";

import { TwoColumnFullLayout } from "@/components/layout/TwoColumnFullLayout";
import { SidebarFullWidgets } from "@/components/sidebar";
import { fetchArticles } from "@/lib/articles";

export default function HomePage() {
  const articles = await fetchArticles();
  
  return (
    <TwoColumnFullLayout
      sidebar={<SidebarFullWidgets />}
      articles={articles}
    >
      {/* 文章列表由 ArticleViewSwitcher 自动渲染 */}
    </TwoColumnFullLayout>
  );
}
```

### 手动使用视图组件

```tsx
"use client";

import { ArticleViewSwitcher } from "@/components/article";
import { useTheme } from "@/context/ThemeContext";

export function ArticleListSection() {
  const { config } = useTheme();
  const articles = useArticles(); // 自定义 Hook
  
  return (
    <section className="py-8">
      <ArticleViewSwitcher
        articles={articles}
        viewMode={config?.homeView?.defaultView}
        onArticleClick={(article) => {
          window.location.href = `/articles/${article.id}`;
        }}
      />
    </section>
  );
}
```

---

## 样式定制

### CSS 类名

```css
/* 卡片视图 */
.article-card {
  @apply bg-white rounded-chinese-lg shadow-chinese-md;
}

.chinese-card-hover {
  @apply hover:shadow-chinese-xl transition-all duration-300;
}

/* 首篇文章特殊样式 */
.first-article-special {
  @apply border-2 border-chinese-red;
}

/* 列表视图 */
.list-view-compact {
  @apply py-2;
}

/* 卡片视图 */
.card-view-large {
  @apply aspect-video;
}
```

### Hover 动画

```css
/* 上浮动画 */
.chinese-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* 图片缩放 */
.article-card-image img:hover {
  transform: scale(1.05);
}
```

---

## 配置路径参考

```typescript
// 卡片视图配置
CONFIG_PATHS.homeView.cardView.showCoverImage      // "homeView.cardView.showCoverImage"
CONFIG_PATHS.homeView.cardView.excerptMaxLines     // "homeView.cardView.excerptMaxLines"
CONFIG_PATHS.homeView.cardView.cardsPerRow         // "homeView.cardView.cardsPerRow"

// 列表视图配置
CONFIG_PATHS.homeView.listView.showThumbnail       // "homeView.listView.showThumbnail"
CONFIG_PATHS.homeView.listView.thumbnailWidth      // "homeView.listView.thumbnailWidth"
CONFIG_PATHS.homeView.listView.excerptMaxLength    // "homeView.listView.excerptMaxLength"

// 混合视图配置
CONFIG_PATHS.homeView.mixedView.firstArticleStyle  // "homeView.mixedView.firstArticleStyle"
CONFIG_PATHS.homeView.mixedView.staggeredLayout    // "homeView.mixedView.staggeredLayout"
CONFIG_PATHS.homeView.defaultView                  // "homeView.defaultView"
CONFIG_PATHS.homeView.allowViewToggle              // "homeView.allowViewToggle"
```

---

## 注意事项

1. **图片优化**：所有图片使用 `loading="lazy"` 懒加载
2. **SEO 友好**：使用语义化 `<article>` 标签
3. **响应式**：自动适配移动端
4. **点击区域**：整个卡片可点击
5. **标签截断**：最多显示 3 个标签
6. **摘要截断**：支持自定义行数/字符数

---

## 常见问题

### Q: 如何隐藏封面图？
A: 设置配置 `homeView.cardView.showCoverImage = false`

### Q: 如何改变每行卡片数量？
A: 修改 `homeView.cardView.cardsPerRow` 值

### Q: 如何禁用视图切换按钮？
A: 设置 `homeView.allowViewToggle = false`

### Q: 如何改变缩略图宽度？
A: 调整 `homeView.listView.thumbnailWidth` 值

### Q: 首篇文章如何特殊显示？
A: 使用 `ArticleCardView` 的 `isFirst` 属性，自动添加特殊样式
