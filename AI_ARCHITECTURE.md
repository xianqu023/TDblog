# AI 功能架构设计

## 概述

本文档描述博客平台的 AI 功能架构设计，包括自动写作、AI 配图、自动摘要、SEO 优化、搜索引擎推送和内部链接优化等功能。

## 架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              前端层 (Frontend)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ AI 配置页面   │  │ 文章编辑器    │  │ AI 任务面板   │  │ 批量操作     │    │
│  │  (Admin)     │  │ (Rich Text)  │  │  (Sidebar)   │  │  (Articles)  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────────┘
          │                 │                 │                 │
          └─────────────────┴─────────────────┴─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API 路由层 (API Routes)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      AI 服务路由 (/api/ai/*)                         │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  POST /api/ai/config          - 保存 AI 配置                        │   │
│  │  GET  /api/ai/config          - 获取 AI 配置                        │   │
│  │  POST /api/ai/generate        - 生成文章                            │   │
│  │  POST /api/ai/optimize        - 优化文章                            │   │
│  │  POST /api/ai/image           - 生成图片                            │   │
│  │  POST /api/ai/summary         - 生成摘要和标签                      │   │
│  │  POST /api/ai/seo             - SEO 优化                            │   │
│  │  POST /api/ai/internal-links  - 内部链接建议                        │   │
│  │  POST /api/ai/push            - 搜索引擎推送                        │   │
│  │  GET  /api/ai/tasks           - 获取任务列表                        │   │
│  │  GET  /api/ai/tasks/:id       - 获取任务状态                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          服务层 (Service Layer)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ AIConfig    │  │ AIWriter    │  │ AIImage     │  │ AISEO       │        │
│  │ Service     │  │ Service     │  │ Service     │  │ Service     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ AITask      │  │ SearchPush  │  │ InternalLink│  │ Provider    │        │
│  │ Service     │  │ Service     │  │ Service     │  │ Factory     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI 提供商层 (AI Providers)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   OpenAI    │  │  Anthropic  │  │   Google    │  │   Azure     │        │
│  │  (GPT-4)    │  │  (Claude)   │  │  (Gemini)   │  │  (OpenAI)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                         │
│  │  DeepSeek   │  │   Custom    │  │   Ollama    │  (本地模型)              │
│  │             │  │             │  │  (本地部署)  │                         │
│  └─────────────┘  └─────────────┘  └─────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          数据层 (Data Layer)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Prisma ORM                                   │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  AIConfig (设置存储)  │  AITask (任务记录)  │  Article (文章数据)   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 核心模块设计

### 1. AI 配置管理

**功能**: 管理 AI 提供商、API 密钥、功能开关等配置

**数据模型**:
```typescript
// 扩展 Setting 模型存储 AI 配置
// 使用 Setting 表存储 JSON 格式的 AIConfig
```

**配置项**:
- 基础配置: 提供商、API Key、模型、温度、最大 token
- 图片配置: 图片提供商、API Key、模型
- 功能开关: 自动写作、配图、摘要、标签、SEO、内部链接、推送
- 写作配置: 默认语言、语气、字数范围、代码示例、图片、目录
- SEO 配置: 元描述、关键词、标题优化、结构化数据
- 推送配置: 百度、必应、谷歌、Yandex、IndexNow

### 2. AI 写作服务

**功能**: 自动生成文章内容和结构

**核心能力**:
- 根据主题生成完整文章
- 支持多种写作语气（专业、 casual、技术、友好）
- 自动生成分层标题结构
- 支持代码示例插入
- 支持图片占位符插入
- 生成目录 (TOC)

**流程**:
1. 接收写作请求（主题、关键词、分类等）
2. 构建系统提示词（包含写作风格、字数要求等）
3. 调用 AI 提供商生成内容
4. 解析返回结果（标题、内容、摘要、标签等）
5. 保存到数据库并返回结果

### 3. AI 配图服务

**功能**: 为文章生成或推荐配图

**核心能力**:
- 根据文章主题生成封面图
- 根据内容生成插图
- 支持多种图片尺寸
- 图片自动上传和存储

**流程**:
1. 提取文章主题/关键词
2. 构建图片生成提示词
3. 调用图片生成 API
4. 下载图片并上传到存储
5. 返回图片 URL

**支持的提供商**:
- DALL-E (OpenAI)
- Midjourney (通过 API)
- Stable Diffusion (本地/云端)
- Pollinations.ai (免费)

### 4. 自动摘要和标签

**功能**: 为文章生成摘要和标签

**核心能力**:
- 提取文章核心内容生成摘要
- 自动识别关键词生成标签
- 支持多语言

**流程**:
1. 接收文章内容
2. 构建摘要生成提示词
3. 调用 AI 生成摘要和标签
4. 返回结构化结果

### 5. SEO 优化服务

**功能**: 优化文章的 SEO 元素

**核心能力**:
- 生成优化的元描述
- 生成关键词
- 优化标题
- 生成结构化数据 (JSON-LD)
- 提供 SEO 改进建议

**流程**:
1. 接收文章标题和内容
2. 分别调用优化各 SEO 元素
3. 生成结构化数据
4. 返回优化结果和建议

### 6. 搜索引擎推送服务

**功能**: 自动推送文章到搜索引擎

**核心能力**:
- 百度推送 (主动推送、自动推送)
- 必应推送 (IndexNow)
- 谷歌推送 (Indexing API)
- Yandex 推送

**流程**:
1. 文章发布后触发推送
2. 根据配置选择推送渠道
3. 调用各搜索引擎 API
4. 记录推送结果

### 7. 内部链接优化服务

**功能**: 为文章推荐内部链接

**核心能力**:
- 分析文章内容识别链接机会
- 从现有文章中匹配相关内容
- 计算相关性分数
- 自动插入链接或提供建议

**流程**:
1. 接收文章内容
2. 提取关键概念和实体
3. 查询数据库匹配相关文章
4. 计算相关性并排序
5. 返回链接建议列表

## 数据库设计

### AI 配置存储

使用现有的 `Setting` 表存储 AI 配置，key 为 `ai_config`，value 为 JSON 字符串。

### AI 任务表 (新增)

```prisma
model AITask {
  id          String     @id @default(uuid())
  type        AITaskType
  status      AITaskStatus @default(PENDING)
  progress    Int        @default(0)
  params      Json       // 任务参数
  result      Json?      // 任务结果
  error       String?    // 错误信息
  articleId   String?    @map("article_id")
  userId      String     @map("user_id")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  completedAt DateTime?  @map("completed_at")

  article     Article?   @relation(fields: [articleId], references: [id])
  user        User       @relation(fields: [userId], references: [id])

  @@map("ai_tasks")
}

enum AITaskType {
  WRITE
  IMAGE
  SUMMARY
  TAGS
  SEO
  INTERNAL_LINK
  PUSH
}

enum AITaskStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}
```

### 扩展现有模型

```prisma
// Article 模型扩展
model Article {
  // ... 现有字段
  aiGenerated   Boolean   @default(false) @map("ai_generated")
  aiTaskId      String?   @map("ai_task_id")
  aiTasks       AITask[]
}
```

## API 设计

### AI 配置 API

```typescript
// GET /api/ai/config
// 获取 AI 配置

// POST /api/ai/config
// 保存 AI 配置
interface SaveAIConfigRequest {
  config: AIConfig;
}

// POST /api/ai/config/validate
// 验证 AI 配置
interface ValidateAIConfigResponse {
  valid: boolean;
  errors: string[];
}
```

### AI 生成 API

```typescript
// POST /api/ai/generate
// 生成文章
interface GenerateArticleRequest {
  topic: string;
  keywords?: string[];
  categoryId?: string;
  language?: string;
  tone?: string;
  wordCount?: number;
  includeImages?: boolean;
  includeCode?: boolean;
}

interface GenerateArticleResponse {
  taskId: string;
  status: string;
}

// GET /api/ai/tasks/:id
// 获取任务状态和结果
interface AITaskResponse {
  id: string;
  type: string;
  status: string;
  progress: number;
  result?: ArticleGenerateResult;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 内容优化 API

```typescript
// POST /api/ai/optimize
// 优化现有文章
interface OptimizeArticleRequest {
  articleId: string;
  options: {
    improveContent?: boolean;
    generateSummary?: boolean;
    generateTags?: boolean;
    optimizeSEO?: boolean;
  };
}

// POST /api/ai/summary
// 生成摘要和标签
interface GenerateSummaryRequest {
  content: string;
  maxLength?: number;
}

// POST /api/ai/image
// 生成图片
interface GenerateImageRequest {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'vivid' | 'natural';
}

// POST /api/ai/seo
// SEO 优化
interface SEOOptimizeRequest {
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
}

// POST /api/ai/internal-links
// 内部链接建议
interface InternalLinkRequest {
  articleId: string;
  content: string;
  maxLinks?: number;
}

// POST /api/ai/push
// 搜索引擎推送
interface SearchPushRequest {
  articleId: string;
  engines?: ('baidu' | 'bing' | 'google' | 'yandex')[];
}
```

## 前端组件设计

### 1. AI 配置页面 (`/admin/ai-config`)

**功能**: 配置 AI 提供商、功能开关、写作风格等

**组件结构**:
```
AIConfigPage
├── AIProviderConfig      // AI 提供商配置
├── AIFeatureToggle       // 功能开关
├── AIWritingConfig       // 写作配置
├── AIImageConfig         // 图片配置
├── AISEOConfig           // SEO 配置
└── AIPushConfig          // 推送配置
```

### 2. 文章编辑器 AI 助手

**功能**: 在文章编辑器中集成 AI 功能

**组件结构**:
```
RichTextEditor
└── AISidebar
    ├── AIGenerateButton    // 生成文章按钮
    ├── AIImproveButton     // 优化内容按钮
    ├── AISummaryButton     // 生成摘要按钮
    ├── AITagButton         // 生成标签按钮
    ├── AIImageButton       // 生成图片按钮
    └── AITaskList          // 任务列表
```

### 3. AI 任务面板

**功能**: 显示 AI 任务状态和进度

**特性**:
- 实时显示任务进度
- 支持取消任务
- 显示任务历史
- 错误重试

## 错误处理和监控

### 错误类型

1. **配置错误**: API Key 无效、配置不完整
2. **网络错误**: 连接 AI 提供商失败
3. **限流错误**: API 调用频率限制
4. **内容错误**: 生成的内容不符合要求

### 处理策略

1. **重试机制**: 指数退避重试
2. **降级策略**: 主提供商失败时切换到备用
3. **错误通知**: 向用户显示友好错误信息
4. **日志记录**: 记录详细错误日志

## 安全考虑

1. **API Key 安全**: 服务器端存储，不暴露给前端
2. **内容过滤**: 过滤不当内容
3. **速率限制**: 防止 API 滥用
4. **权限控制**: 仅管理员可配置 AI

## 性能优化

1. **流式响应**: 支持 SSE 流式返回生成内容
2. **缓存机制**: 缓存常用提示词和结果
3. **并发控制**: 限制同时进行的 AI 任务数
4. **后台处理**: 长时间任务使用后台队列

## 部署考虑

### 环境变量

```bash
# AI 基础配置
AI_ENABLED=true
AI_PROVIDER=openai
AI_API_KEY=sk-...
AI_API_ENDPOINT=https://api.openai.com/v1
AI_MODEL=gpt-4
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=4000

# 图片生成配置
AI_IMAGE_PROVIDER=dall-e
AI_IMAGE_API_KEY=sk-...
AI_IMAGE_MODEL=dall-e-3

# 功能开关
AI_FEATURE_WRITE=true
AI_FEATURE_IMAGE=true
AI_FEATURE_SUMMARY=true
AI_FEATURE_TAGS=true
AI_FEATURE_SEO=true
AI_FEATURE_INTERNAL_LINK=true
AI_FEATURE_SEARCH_PUSH=true

# 推送配置
AI_PUSH_BAIDU_TOKEN=...
AI_PUSH_BING_API_KEY=...
AI_PUSH_GOOGLE_CREDENTIALS=...
AI_PUSH_INDEXNOW_KEY=...
```

## 实现路线图

### 第一阶段: 基础架构
1. 创建 AI 配置页面
2. 实现 AI 提供商工厂
3. 实现基础 API 路由
4. 添加数据库模型

### 第二阶段: 核心功能
1. 实现自动写作
2. 实现 AI 配图
3. 实现摘要和标签生成

### 第三阶段: 优化功能
1. 实现 SEO 优化
2. 实现搜索引擎推送
3. 实现内部链接优化

### 第四阶段: 增强功能
1. 批量操作支持
2. 任务队列系统
3. 使用分析和统计
