import { prisma } from './index';

// 10篇演示文章数据，每篇包含三种语言翻译
const demoArticles = [
  {
    slug: 'getting-started-with-nextjs-16',
    status: 'PUBLISHED',
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop',
    translations: {
      zh: {
        title: 'Next.js 16 完全入门指南',
        excerpt: '深入学习 Next.js 16 的新特性，包括 React 19 集成、Turbopack 改进和服务端组件优化。',
        content: `
          <h2>什么是 Next.js 16？</h2>
          <p>Next.js 16 是 Vercel 推出的最新版本的 React 框架，它带来了许多令人兴奋的新特性和性能改进。</p>
          
          <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop" alt="Next.js Logo" />
          
          <h2>主要新特性</h2>
          <h3>1. React 19 深度集成</h3>
          <p>Next.js 16 与 React 19 进行了深度集成，支持最新的 Server Components、Actions 和 Suspense 改进。</p>
          
          <h3>2. Turbopack 性能提升</h3>
          <p>开发服务器启动速度提升了 53%，热更新速度提升了 78%。</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Code Editor" />
          
          <h3>3. 改进的路由系统</h3>
          <p>新增并行路由和拦截路由支持，让复杂页面布局变得更加简单。</p>
          
          <h2>开始使用</h2>
          <p>运行以下命令即可创建一个新的 Next.js 16 项目：</p>
          <pre><code>npx create-next-app@latest my-app</code></pre>
          
          <p>Next.js 16 让 Web 开发变得更加高效和愉悦。无论是构建简单的博客还是复杂的企业应用，它都能提供出色的开发体验。</p>
        `,
      },
      en: {
        title: 'Getting Started with Next.js 16',
        excerpt: 'Deep dive into Next.js 16 new features including React 19 integration, Turbopack improvements, and Server Components optimization.',
        content: `
          <h2>What is Next.js 16?</h2>
          <p>Next.js 16 is the latest version of Vercel's React framework, bringing many exciting new features and performance improvements.</p>
          
          <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop" alt="Next.js Logo" />
          
          <h2>Key New Features</h2>
          <h3>1. React 19 Deep Integration</h3>
          <p>Next.js 16 features deep integration with React 19, supporting the latest Server Components, Actions, and Suspense improvements.</p>
          
          <h3>2. Turbopack Performance Boost</h3>
          <p>Development server startup time improved by 53%, and hot update speed increased by 78%.</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Code Editor" />
          
          <h3>3. Improved Routing System</h3>
          <p>New parallel routes and intercepting routes support make complex page layouts easier than ever.</p>
          
          <h2>Getting Started</h2>
          <p>Create a new Next.js 16 project with this command:</p>
          <pre><code>npx create-next-app@latest my-app</code></pre>
          
          <p>Next.js 16 makes web development more efficient and enjoyable. Whether building a simple blog or complex enterprise applications, it delivers an outstanding developer experience.</p>
        `,
      },
      ja: {
        title: 'Next.js 16 完全ガイド',
        excerpt: 'React 19 統合、Turbopack の改善、サーバーコンポーネントの最適化を含む Next.js 16 の新機能を深く学ぶ。',
        content: `
          <h2>Next.js 16 とは？</h2>
          <p>Next.js 16 は Vercel の最新 React フレームワークバージョンで、多くのエキサイティングな新機能とパフォーマンス改善をもたらします。</p>
          
          <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop" alt="Next.js Logo" />
          
          <h2>主な新機能</h2>
          <h3>1. React 19 深い統合</h3>
          <p>Next.js 16 は React 19 と深く統合され、最新のサーバーコンポーネント、アクション、サスペンスの改善をサポートします。</p>
          
          <h3>2. Turbopack パフォーマンス向上</h3>
          <p>開発サーバーの起動時間が 53% 改善され、ホットアップデート速度が 78% 向上しました。</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Code Editor" />
          
          <h3>3. 改善されたルーティングシステム</h3>
          <p>新しい並列ルートとインターセプトルートのサポートにより、複雑なページレイアウトがこれまで以上に簡単になります。</p>
          
          <h2>はじめに</h2>
          <p>このコマンドで新しい Next.js 16 プロジェクトを作成できます：</p>
          <pre><code>npx create-next-app@latest my-app</code></pre>
          
          <p>Next.js 16 は Web 開発をより効率的で楽しいものにします。シンプルなブログから複雑なエンタープライズアプリケーションまで、優れた開発者体験を提供します。</p>
        `,
      },
    },
    tags: ['Next.js', 'React', 'JavaScript'],
  },
  {
    slug: 'typescript-advanced-patterns-2026',
    status: 'PUBLISHED',
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=630&fit=crop',
    translations: {
      zh: {
        title: '2026 年 TypeScript 高级设计模式',
        excerpt: '探索 TypeScript 中的高级类型系统和设计模式，提升代码质量和开发效率。',
        content: `
          <h2>为什么学习设计模式？</h2>
          <p>设计模式是解决常见软件设计问题的可复用方案。掌握它们能让你写出更优雅、可维护的代码。</p>
          
          <img src="https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop" alt="TypeScript" />
          
          <h2>1. 泛型约束与条件类型</h2>
          <p>TypeScript 的泛型系统非常强大，通过条件类型可以实现复杂的类型推导逻辑。</p>
          <pre><code>type IsString<T> = T extends string ? true : false;</code></pre>
          
          <h2>2. 模板字面量类型</h2>
          <p>模板字面量类型让你可以基于字符串创建类型安全的 API。</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Coding" />
          
          <h2>3. 装饰器模式</h2>
          <p>使用 TypeScript 装饰器可以实现 AOP（面向切面编程），在方法执行前后添加逻辑。</p>
          
          <h2>4. 建造者模式</h2>
          <p>通过泛型和链式调用，可以创建类型安全的建造者模式。</p>
          
          <p>掌握这些模式后，你的 TypeScript 代码将变得更加健壮和易于维护。</p>
        `,
      },
      en: {
        title: 'Advanced TypeScript Design Patterns in 2026',
        excerpt: 'Explore advanced type system features and design patterns in TypeScript to improve code quality and development efficiency.',
        content: `
          <h2>Why Learn Design Patterns?</h2>
          <p>Design patterns are reusable solutions to common software design problems. Mastering them helps you write more elegant and maintainable code.</p>
          
          <img src="https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop" alt="TypeScript" />
          
          <h2>1. Generic Constraints and Conditional Types</h2>
          <p>TypeScript's generic system is powerful. Conditional types enable complex type inference logic.</p>
          <pre><code>type IsString<T> = T extends string ? true : false;</code></pre>
          
          <h2>2. Template Literal Types</h2>
          <p>Template literal types let you create type-safe APIs based on strings.</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Coding" />
          
          <h2>3. Decorator Pattern</h2>
          <p>Using TypeScript decorators, you can implement AOP (Aspect-Oriented Programming) to add logic before and after method execution.</p>
          
          <h2>4. Builder Pattern</h2>
          <p>With generics and method chaining, you can create type-safe builder patterns.</p>
          
          <p>After mastering these patterns, your TypeScript code will become more robust and maintainable.</p>
        `,
      },
      ja: {
        title: '2026 年 TypeScript 高度なデザインパターン',
        excerpt: 'TypeScript の高度な型システムとデザインパターンを探索し、コード品質と開発効率を向上させる。',
        content: `
          <h2>なぜデザインパターンを学ぶのか？</h2>
          <p>デザインパターンは一般的なソフトウェア設計問題に対する再利用可能な解決策です。それらを習得することで、よりエレガントで保守性の高いコードを書くことができます。</p>
          
          <img src="https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop" alt="TypeScript" />
          
          <h2>1. ジェネリック制約と条件付き型</h2>
          <p>TypeScript のジェネリックシステムは非常に強力で、条件付き型を使用することで複雑な型推論ロジックを実現できます。</p>
          <pre><code>type IsString<T> = T extends string ? true : false;</code></pre>
          
          <h2>2. テンプレートリテラル型</h2>
          <p>テンプレートリテラル型を使用すると、文字列に基づいて型安全な API を作成できます。</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Coding" />
          
          <h2>3. デコレーターパターン</h2>
          <p>TypeScript デコレーターを使用して AOP（アスペクト指向プログラミング）を実装し、メソッドの実行前後にロジックを追加できます。</p>
          
          <h2>4. ビルダーパターン</h2>
          <p>ジェネリックとメソッドチェーンを使用して、型安全なビルダーパターンを作成できます。</p>
          
          <p>これらのパターンを習得した後、TypeScript コードはより堅牢で保守しやすくなります。</p>
        `,
      },
    },
    tags: ['TypeScript', 'Programming', 'Design Patterns'],
  },
  {
    slug: 'react-server-components-deep-dive',
    status: 'PUBLISHED',
    isPremium: true,
    premiumPrice: 9.99,
    coverImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1200&h=630&fit=crop',
    translations: {
      zh: {
        title: 'React 服务端组件深入解析',
        excerpt: '全面理解 React Server Components 的工作原理、最佳实践和性能优化技巧。',
        content: `
          <h2>什么是 Server Components？</h2>
          <p>React Server Components（RSC）是一种全新的组件模型，允许在服务器上直接渲染组件。</p>
          
          <img src="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&h=400&fit=crop" alt="React" />
          
          <h2>工作原理</h2>
          <p>Server Components 在服务器上执行，可以直接访问数据库和文件系统，无需额外的 API 层。</p>
          
          <h3>关键优势</h3>
          <ul>
            <li>零Bundle Size：服务端代码不会发送到客户端</li>
            <li>自动代码分割：客户端组件自动分割</li>
            <li>流式 SSR：支持 Suspense 边界</li>
          </ul>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Server Architecture" />
          
          <h2>最佳实践</h2>
          <p>1. 尽可能使用服务端组件</p>
          <p>2. 只在需要交互时使用客户端组件</p>
          <p>3. 使用 Suspense 处理加载状态</p>
          
          <h2>性能优化</h2>
          <p>通过合理使用缓存和重新验证策略，可以实现极致的性能表现。</p>
          
          <p>掌握 Server Components 将让你的 React 应用性能飞跃提升！</p>
        `,
      },
      en: {
        title: 'Deep Dive into React Server Components',
        excerpt: 'Comprehensive understanding of React Server Components工作原理, best practices, and performance optimization techniques.',
        content: `
          <h2>What are Server Components?</h2>
          <p>React Server Components (RSC) are a completely new component model that allows components to be rendered directly on the server.</p>
          
          <img src="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&h=400&fit=crop" alt="React" />
          
          <h2>How It Works</h2>
          <p>Server Components execute on the server, allowing direct access to databases and file systems without an additional API layer.</p>
          
          <h3>Key Advantages</h3>
          <ul>
            <li>Zero Bundle Size: Server code is never sent to the client</li>
            <li>Automatic Code Splitting: Client components are automatically split</li>
            <li>Streaming SSR: Supports Suspense boundaries</li>
          </ul>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Server Architecture" />
          
          <h2>Best Practices</h2>
          <p>1. Use Server Components whenever possible</p>
          <p>2. Only use Client Components when interactivity is needed</p>
          <p>3. Use Suspense to handle loading states</p>
          
          <h2>Performance Optimization</h2>
          <p>By properly using caching and revalidation strategies, you can achieve extreme performance.</p>
          
          <p>Mastering Server Components will give your React app a massive performance boost!</p>
        `,
      },
      ja: {
        title: 'React サーバーコンポーネント徹底解説',
        excerpt: 'React Server Components の動作原理、ベストプラクティス、パフォーマンス最適化技術を包括的に理解する。',
        content: `
          <h2>サーバーコンポーネントとは？</h2>
          <p>React Server Components（RSC）は、コンポーネントをサーバー上で直接レンダリングできる新しいコンポーネントモデルです。</p>
          
          <img src="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&h=400&fit=crop" alt="React" />
          
          <h2>動作原理</h2>
          <p>サーバーコンポーネントはサーバー上で実行され、追加の API レイヤーなしでデータベースやファイルシステムに直接アクセスできます。</p>
          
          <h3>主な利点</h3>
          <ul>
            <li>ゼロバンドルサイズ：サーバーコードはクライアントに送信されません</li>
            <li>自動コード分割：クライアントコンポーネントは自動的に分割されます</li>
            <li>ストリーミング SSR：サスペンス境界をサポート</li>
          </ul>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Server Architecture" />
          
          <h2>ベストプラクティス</h2>
          <p>1. 可能な限りサーバーコンポーネントを使用</p>
          <p>2. 対話性が必要な場合にのみクライアントコンポーネントを使用</p>
          <p>3. サスペンスを使用してローディング状態を処理</p>
          
          <h2>パフォーマンス最適化</h2>
          <p>キャッシュと再検証戦略を適切に使用することで、極限のパフォーマンスを達成できます。</p>
          
          <p>サーバーコンポーネントを習得することで、React アプリのパフォーマンスが大幅に向上します！</p>
        `,
      },
    },
    tags: ['React', 'Server Components', 'Performance'],
  },
  {
    slug: 'database-optimization-mysql',
    status: 'PUBLISHED',
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&h=630&fit=crop',
    translations: {
      zh: {
        title: 'MySQL 数据库性能优化实战',
        excerpt: '从索引优化、查询优化到架构设计，全面掌握 MySQL 性能调优技巧。',
        content: `
          <h2>为什么需要优化数据库？</h2>
          <p>数据库性能直接影响应用的响应速度。一个慢查询可能导致整个页面加载缓慢。</p>
          
          <img src="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=400&fit=crop" alt="Database" />
          
          <h2>1. 索引优化</h2>
          <p>索引是提升查询速度最有效的手段。正确使用索引可以让查询速度提升数十倍。</p>
          <pre><code>CREATE INDEX idx_user_email ON users(email);</code></pre>
          
          <h2>2. 查询优化</h2>
          <p>避免 SELECT *，只查询需要的列。使用 EXPLAIN 分析查询计划。</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="SQL Query" />
          
          <h2>3. 连接池配置</h2>
          <p>合理配置连接池可以避免频繁的数据库连接建立和断开。</p>
          
          <h2>4. 读写分离</h2>
          <p>对于高并发场景，读写分离可以显著提升数据库性能。</p>
          
          <p>掌握这些优化技巧，你的数据库将能够轻松应对百万级数据！</p>
        `,
      },
      en: {
        title: 'MySQL Database Performance Optimization in Practice',
        excerpt: 'Master MySQL performance tuning from index optimization, query optimization to architecture design.',
        content: `
          <h2>Why Optimize Databases?</h2>
          <p>Database performance directly affects application response time. A slow query can cause the entire page to load slowly.</p>
          
          <img src="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=400&fit=crop" alt="Database" />
          
          <h2>1. Index Optimization</h2>
          <p>Indexes are the most effective way to improve query speed. Proper use of indexes can improve query performance by dozens of times.</p>
          <pre><code>CREATE INDEX idx_user_email ON users(email);</code></pre>
          
          <h2>2. Query Optimization</h2>
          <p>Avoid SELECT *, only query the columns you need. Use EXPLAIN to analyze query plans.</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="SQL Query" />
          
          <h2>3. Connection Pool Configuration</h2>
          <p>Properly configuring connection pools avoids frequent database connection establishment and termination.</p>
          
          <h2>4. Read-Write Separation</h2>
          <p>For high-concurrency scenarios, read-write separation can significantly improve database performance.</p>
          
          <p>Master these optimization techniques and your database will easily handle millions of records!</p>
        `,
      },
      ja: {
        title: 'MySQL データベースパフォーマンス最適化実践',
        excerpt: 'インデックス最適化、クエリ最適化からアーキテクチャ設計まで、MySQL パフォーマンスチューニング技術を完全に習得。',
        content: `
          <h2>なぜデータベースを最適化するのか？</h2>
          <p>データベースのパフォーマンスはアプリケーションの応答速度に直接影響します。遅いクエリはページ全体の読み込みを遅くする可能性があります。</p>
          
          <img src="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=400&fit=crop" alt="Database" />
          
          <h2>1. インデックス最適化</h2>
          <p>インデックスはクエリ速度を向上させる最も効果的な手段です。インデックスを正しく使用することで、クエリ速度を数十倍向上させることができます。</p>
          <pre><code>CREATE INDEX idx_user_email ON users(email);</code></pre>
          
          <h2>2. クエリ最適化</h2>
          <p>SELECT * を避け、必要な列のみをクエリします。EXPLAIN を使用してクエリプランを分析します。</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="SQL Query" />
          
          <h2>3. コネクションプール設定</h2>
          <p>コネクションプールを適切に設定することで、頻繁なデータベース接続の確立と切断を回避できます。</p>
          
          <h2>4. 読み書き分離</h2>
          <p>高同時実行シナリオでは、読み書き分離によりデータベースのパフォーマンスを大幅に向上させることができます。</p>
          
          <p>これらの最適化テクニックを習得することで、データベースは数百万件のデータを簡単に処理できます！</p>
        `,
      },
    },
    tags: ['MySQL', 'Database', 'Performance'],
  },
  {
    slug: 'tailwind-css-master-guide',
    status: 'PUBLISHED',
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=1200&h=630&fit=crop',
    translations: {
      zh: {
        title: 'Tailwind CSS 大师级教程',
        excerpt: '从零开始学习 Tailwind CSS，掌握现代 CSS 开发的终极指南。',
        content: `
          <h2>什么是 Tailwind CSS？</h2>
          <p>Tailwind CSS 是一个功能类优先的 CSS 框架，它提供了数百个实用的工具类。</p>
          
          <img src="https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=400&fit=crop" alt="CSS Design" />
          
          <h2>核心优势</h2>
          <h3>1. 快速开发</h3>
          <p>不需要离开 HTML 文件就能完成样式设计。</p>
          
          <h3>2. 高度可定制</h3>
          <p>通过配置文件可以轻松自定义设计系统。</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Web Design" />
          
          <h3>3. 生产优化</h3>
          <p>自动移除未使用的 CSS，保持最小的文件体积。</p>
          
          <h2>实战示例</h2>
          <pre><code>&lt;div class="flex items-center justify-center p-8"&gt;
  &lt;button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"&gt;
    点击我
  &lt;/button&gt;
&lt;/div&gt;</code></pre>
          
          <p>Tailwind CSS 让 CSS 开发变得简单而高效！</p>
        `,
      },
      en: {
        title: 'Tailwind CSS Master Guide',
        excerpt: 'Learn Tailwind CSS from scratch - the ultimate guide to modern CSS development.',
        content: `
          <h2>What is Tailwind CSS?</h2>
          <p>Tailwind CSS is a utility-first CSS framework that provides hundreds of practical utility classes.</p>
          
          <img src="https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=400&fit=crop" alt="CSS Design" />
          
          <h2>Core Advantages</h2>
          <h3>1. Rapid Development</h3>
          <p>No need to leave your HTML files to complete styling.</p>
          
          <h3>2. Highly Customizable</h3>
          <p>Easily customize your design system through configuration files.</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Web Design" />
          
          <h3>3. Production Optimized</h3>
          <p>Automatically removes unused CSS, keeping file sizes minimal.</p>
          
          <h2>Practical Example</h2>
          <pre><code>&lt;div class="flex items-center justify-center p-8"&gt;
  &lt;button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"&gt;
    Click Me
  &lt;/button&gt;
&lt;/div&gt;</code></pre>
          
          <p>Tailwind CSS makes CSS development simple and efficient!</p>
        `,
      },
      ja: {
        title: 'Tailwind CSS マスターガイド',
        excerpt: 'Tailwind CSS をゼロから学ぶ - モダン CSS 開発の究極ガイド。',
        content: `
          <h2>Tailwind CSS とは？</h2>
          <p>Tailwind CSS はユーティリティファーストの CSS フレームワークで、数百の実用的なユーティリティクラスを提供します。</p>
          
          <img src="https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=400&fit=crop" alt="CSS Design" />
          
          <h2>主な利点</h2>
          <h3>1. 高速開発</h3>
          <p>HTML ファイルから離れることなくスタイリングを完了できます。</p>
          
          <h3>2. 高度にカスタマイズ可能</h3>
          <p>設定ファイルを通じてデザインシステムを簡単にカスタマイズできます。</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Web Design" />
          
          <h3>3. 本番最適化</h3>
          <p>未使用の CSS を自動的に削除し、最小限のファイルサイズを維持します。</p>
          
          <h2>実例</h2>
          <pre><code>&lt;div class="flex items-center justify-center p-8"&gt;
  &lt;button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"&gt;
            クリック
  &lt;/button&gt;
&lt;/div&gt;</code></pre>
          
          <p>Tailwind CSS は CSS 開発をシンプルかつ効率的にします！</p>
        `,
      },
    },
    tags: ['CSS', 'Tailwind', 'Frontend'],
  },
  {
    slug: 'docker-kubernetes-devops-2026',
    status: 'PUBLISHED',
    isPremium: true,
    premiumPrice: 19.99,
    coverImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1200&h=630&fit=crop',
    translations: {
      zh: {
        title: 'Docker 与 Kubernetes 云原生实践',
        excerpt: '从容器化基础到 K8s 集群管理，全面掌握现代 DevOps 工具链。',
        content: `
          <h2>容器化革命</h2>
          <p>Docker 和 Kubernetes 正在改变我们部署和管理应用的方式。</p>
          
          <img src="https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=400&fit=crop" alt="Docker" />
          
          <h2>Docker 基础</h2>
          <p>Docker 让应用的打包和部署变得标准化。一个 Dockerfile 就能定义整个应用环境。</p>
          <pre><code>FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]</code></pre>
          
          <h2>Kubernetes 核心概念</h2>
          <ul>
            <li>Pod：最小部署单元</li>
            <li>Service：服务发现和负载均衡</li>
            <li>Deployment：声明式更新</li>
          </ul>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Kubernetes" />
          
          <h2>CI/CD 流水线</h2>
          <p>结合 GitHub Actions 和 K8s，可以实现自动化部署。</p>
          
          <p>掌握容器技术，你的应用将具备极高的可扩展性和可靠性！</p>
        `,
      },
      en: {
        title: 'Docker and Kubernetes Cloud Native Practice',
        excerpt: 'Master modern DevOps toolchain from containerization basics to K8s cluster management.',
        content: `
          <h2>Containerization Revolution</h2>
          <p>Docker and Kubernetes are changing how we deploy and manage applications.</p>
          
          <img src="https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=400&fit=crop" alt="Docker" />
          
          <h2>Docker Basics</h2>
          <p>Docker makes application packaging and deployment standardized. A single Dockerfile can define the entire application environment.</p>
          <pre><code>FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]</code></pre>
          
          <h2>Kubernetes Core Concepts</h2>
          <ul>
            <li>Pod: Smallest deployable unit</li>
            <li>Service: Service discovery and load balancing</li>
            <li>Deployment: Declarative updates</li>
          </ul>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Kubernetes" />
          
          <h2>CI/CD Pipeline</h2>
          <p>Combining GitHub Actions and K8s enables automated deployments.</p>
          
          <p>Master container technology and your applications will achieve high scalability and reliability!</p>
        `,
      },
      ja: {
        title: 'Docker と Kubernetes クラウドネイティブ実践',
        excerpt: 'コンテナ化の基本から K8s クラスタ管理まで、モダン DevOps ツールチェーンを完全に習得。',
        content: `
          <h2>コンテナ化革命</h2>
          <p>Docker と Kubernetes は、アプリケーションのデプロイと管理の方法を変えつつあります。</p>
          
          <img src="https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=400&fit=crop" alt="Docker" />
          
          <h2>Docker 基本</h2>
          <p>Docker はアプリケーションのパッケージ化とデプロイを標準化します。1 つの Dockerfile でアプリケーション環境全体を定義できます。</p>
          <pre><code>FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]</code></pre>
          
          <h2>Kubernetes 核心概念</h2>
          <ul>
            <li>Pod：最小デプロイユニット</li>
            <li>Service：サービスディスカバリとロードバランシング</li>
            <li>Deployment：宣言的更新</li>
          </ul>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Kubernetes" />
          
          <h2>CI/CD パイプライン</h2>
          <p>GitHub Actions と K8s を組み合わせることで、自動デプロイを実現できます。</p>
          
          <p>コンテナ技術を習得することで、アプリケーションは高いスケーラビリティと信頼性を実現できます！</p>
        `,
      },
    },
    tags: ['Docker', 'Kubernetes', 'DevOps'],
  },
  {
    slug: 'python-ai-machine-learning',
    status: 'PUBLISHED',
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=630&fit=crop',
    translations: {
      zh: {
        title: 'Python AI 与机器学习入门',
        excerpt: '使用 Python 探索人工智能世界，从数据处理到模型训练。',
        content: `
          <h2>AI 时代已来</h2>
          <p>人工智能正在改变各行各业，Python 是 AI 开发的首选语言。</p>
          
          <img src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop" alt="AI" />
          
          <h2>数据处理基础</h2>
          <p>使用 Pandas 和 NumPy 进行数据清洗和分析。</p>
          <pre><code>import pandas as pd
df = pd.read_csv('data.csv')
print(df.describe())</code></pre>
          
          <h2>机器学习流程</h2>
          <ol>
            <li>数据收集与预处理</li>
            <li>特征工程</li>
            <li>模型选择与训练</li>
            <li>模型评估与优化</li>
          </ol>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Machine Learning" />
          
          <h2>深度学习简介</h2>
          <p>使用 TensorFlow 或 PyTorch 构建神经网络。</p>
          
          <p>开始你的 AI 之旅，探索无限可能！</p>
        `,
      },
      en: {
        title: 'Python AI and Machine Learning for Beginners',
        excerpt: 'Explore artificial intelligence with Python, from data processing to model training.',
        content: `
          <h2>The AI Era is Here</h2>
          <p>Artificial intelligence is transforming every industry, and Python is the premier language for AI development.</p>
          
          <img src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop" alt="AI" />
          
          <h2>Data Processing Basics</h2>
          <p>Use Pandas and NumPy for data cleaning and analysis.</p>
          <pre><code>import pandas as pd
df = pd.read_csv('data.csv')
print(df.describe())</code></pre>
          
          <h2>Machine Learning Workflow</h2>
          <ol>
            <li>Data collection and preprocessing</li>
            <li>Feature engineering</li>
            <li>Model selection and training</li>
            <li>Model evaluation and optimization</li>
          </ol>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Machine Learning" />
          
          <h2>Deep Learning Introduction</h2>
          <p>Build neural networks with TensorFlow or PyTorch.</p>
          
          <p>Start your AI journey and explore infinite possibilities!</p>
        `,
      },
      ja: {
        title: 'Python AI と機械学習入門',
        excerpt: 'Python で人工知能の世界を探索。データ処理からモデルトレーニングまで。',
        content: `
          <h2>AI 時代の到来</h2>
          <p>人工知能はあらゆる業界を変革しつつあり、Python は AI 開発の首选言語です。</p>
          
          <img src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop" alt="AI" />
          
          <h2>データ処理基礎</h2>
          <p>Pandas と NumPy を使用してデータクリーニングと分析を行います。</p>
          <pre><code>import pandas as pd
df = pd.read_csv('data.csv')
print(df.describe())</code></pre>
          
          <h2>機械学習ワークフロー</h2>
          <ol>
            <li>データ収集と前処理</li>
            <li>特徴量エンジニアリング</li>
            <li>モデル選択とトレーニング</li>
            <li>モデル評価と最適化</li>
          </ol>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Machine Learning" />
          
          <h2>ディープラーニング簡介</h2>
          <p>TensorFlow または PyTorch を使用してニューラルネットワークを構築します。</p>
          
          <p>AI の旅を開始して、無限の可能性を探索してください！</p>
        `,
      },
    },
    tags: ['Python', 'AI', 'Machine Learning'],
  },
  {
    slug: 'graphql-api-design-best-practices',
    status: 'PUBLISHED',
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop',
    translations: {
      zh: {
        title: 'GraphQL API 设计最佳实践',
        excerpt: '学习如何设计高效、灵活的 GraphQL API，超越传统 REST。',
        content: `
          <h2>为什么选择 GraphQL？</h2>
          <p>GraphQL 让客户端可以精确请求所需数据，避免过度获取和请求不足。</p>
          
          <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop" alt="GraphQL" />
          
          <h2>Schema 设计</h2>
          <p>良好的 Schema 是成功 GraphQL API 的关键。</p>
          <pre><code>type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}</code></pre>
          
          <h2>Resolver 优化</h2>
          <p>使用 DataLoader 避免 N+1 查询问题。</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="API" />
          
          <h2>安全最佳实践</h2>
          <ul>
            <li>查询深度限制</li>
            <li>复杂度分析</li>
            <li>速率限制</li>
          </ul>
          
          <p>掌握 GraphQL，你的 API 将变得无比灵活和高效！</p>
        `,
      },
      en: {
        title: 'GraphQL API Design Best Practices',
        excerpt: 'Learn how to design efficient, flexible GraphQL APIs that go beyond traditional REST.',
        content: `
          <h2>Why Choose GraphQL?</h2>
          <p>GraphQL lets clients request exactly the data they need, avoiding over-fetching and under-fetching.</p>
          
          <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop" alt="GraphQL" />
          
          <h2>Schema Design</h2>
          <p>A good Schema is the key to a successful GraphQL API.</p>
          <pre><code>type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}</code></pre>
          
          <h2>Resolver Optimization</h2>
          <p>Use DataLoader to avoid N+1 query problems.</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="API" />
          
          <h2>Security Best Practices</h2>
          <ul>
            <li>Query depth limiting</li>
            <li>Complexity analysis</li>
            <li>Rate limiting</li>
          </ul>
          
          <p>Master GraphQL and your API will become incredibly flexible and efficient!</p>
        `,
      },
      ja: {
        title: 'GraphQL API デザインベストプラクティス',
        excerpt: '従来の REST を超える効率的で柔軟な GraphQL API の設計方法を学ぶ。',
        content: `
          <h2>なぜ GraphQL を選ぶのか？</h2>
          <p>GraphQL を使用することで、クライアントは必要なデータだけをリクエストでき、過剰取得と取得不足を回避できます。</p>
          
          <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop" alt="GraphQL" />
          
          <h2>スキーマ設計</h2>
          <p>良いスキーマは成功する GraphQL API の鍵です。</p>
          <pre><code>type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}</code></pre>
          
          <h2>リゾルバー最適化</h2>
          <p>DataLoader を使用して N+1 クエリ問題を回避します。</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="API" />
          
          <h2>セキュリティベストプラクティス</h2>
          <ul>
            <li>クエリ深度制限</li>
            <li>複雑度分析</li>
            <li>レート制限</li>
          </ul>
          
          <p>GraphQL を習得することで、API は信じられないほど柔軟かつ効率的になります！</p>
        `,
      },
    },
    tags: ['GraphQL', 'API', 'Backend'],
  },
  {
    slug: 'web-security-owasp-top10',
    status: 'PUBLISHED',
    isPremium: true,
    premiumPrice: 14.99,
    coverImage: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=1200&h=630&fit=crop',
    translations: {
      zh: {
        title: 'Web 安全：OWASP Top 10 防护指南',
        excerpt: '全面了解 Web 应用常见安全威胁，学习有效防护措施。',
        content: `
          <h2>安全至关重要</h2>
          <p>Web 应用安全问题可能导致数据泄露、财务损失和声誉损害。</p>
          
          <img src="https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=400&fit=crop" alt="Security" />
          
          <h2>OWASP Top 10</h2>
          <ol>
            <li>注入攻击（SQL 注入、命令注入）</li>
            <li>身份认证失效</li>
            <li>敏感数据泄露</li>
            <li>XML 外部实体（XXE）</li>
            <li>失效的访问控制</li>
          </ol>
          
          <h2>防护策略</h2>
          <p>1. 使用参数化查询防止 SQL 注入</p>
          <p>2. 实施强密码策略和多因素认证</p>
          <p>3. 加密敏感数据</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Cybersecurity" />
          
          <h2>安全测试</h2>
          <p>定期进行渗透测试和代码审计。</p>
          
          <p>保护你的应用，就是保护你的用户！</p>
        `,
      },
      en: {
        title: 'Web Security: OWASP Top 10 Protection Guide',
        excerpt: 'Comprehensive understanding of common web application security threats and effective protection measures.',
        content: `
          <h2>Security is Critical</h2>
          <p>Web application security issues can lead to data breaches, financial losses, and reputation damage.</p>
          
          <img src="https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=400&fit=crop" alt="Security" />
          
          <h2>OWASP Top 10</h2>
          <ol>
            <li>Injection (SQL injection, command injection)</li>
            <li>Broken Authentication</li>
            <li>Sensitive Data Exposure</li>
            <li>XML External Entities (XXE)</li>
            <li>Broken Access Control</li>
          </ol>
          
          <h2>Protection Strategies</h2>
          <p>1. Use parameterized queries to prevent SQL injection</p>
          <p>2. Implement strong password policies and multi-factor authentication</p>
          <p>3. Encrypt sensitive data</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Cybersecurity" />
          
          <h2>Security Testing</h2>
          <p>Conduct regular penetration testing and code audits.</p>
          
          <p>Protecting your application means protecting your users!</p>
        `,
      },
      ja: {
        title: 'Web セキュリティ：OWASP Top 10 防護ガイド',
        excerpt: 'Web アプリケーションの一般的なセキュリティ脅威を全面的に理解し、効果的な防護措置を学ぶ。',
        content: `
          <h2>セキュリティは重要</h2>
          <p>Web アプリケーションのセキュリティ問題は、データ漏洩、財務損失、評判の損害につながる可能性があります。</p>
          
          <img src="https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=400&fit=crop" alt="Security" />
          
          <h2>OWASP Top 10</h2>
          <ol>
            <li>インジェクション（SQL インジェクション、コマンドインジェクション）</li>
            <li>認証の失敗</li>
            <li>機密データの露出</li>
            <li>XML 外部エンティティ（XXE）</li>
            <li>アクセス制御の失敗</li>
          </ol>
          
          <h2>防護戦略</h2>
          <p>1. パラメータ化クエリを使用して SQL インジェクションを防止</p>
          <p>2. 強力なパスワードポリシーと多要素認証を実装</p>
          <p>3. 機密データを暗号化</p>
          
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop" alt="Cybersecurity" />
          
          <h2>セキュリティテスト</h2>
          <p>定期的なペネトレーションテストとコード監査を実施します。</p>
          
          <p>アプリケーションを保護することは、ユーザーを保護することです！</p>
        `,
      },
    },
    tags: ['Security', 'OWASP', 'Web'],
  },
];

// 插入演示文章到数据库
async function main() {
  console.log('🌱 开始插入10篇演示文章...');

  // 获取第一个用户作为作者（如果没有则创建）
  let author = await prisma.user.findFirst();
  
  if (!author) {
    console.log('⚠️  未找到用户，创建演示用户...');
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash('demo123', 12);
    
    author = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        username: 'demo',
        passwordHash,
        profile: {
          create: {
            displayName: '演示用户',
            locale: 'zh',
          },
        },
      },
    });
    console.log('✅ 演示用户创建完成');
  }

  // 创建标签
  const allTags = new Set<string>();
  demoArticles.forEach(article => {
    article.tags.forEach(tag => allTags.add(tag));
  });

  console.log(`📝 创建 ${allTags.size} 个标签...`);
  
  const tagMap: Record<string, any> = {};
  for (const tagName of allTags) {
    const slug = tagName.toLowerCase().replace(/\s+/g, '-');
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: {
        name: tagName,
        slug,
        color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      },
    });
    tagMap[tagName] = tag;
  }

  console.log('✅ 标签创建完成');

  // 插入文章
  let successCount = 0;
  let skipCount = 0;

  for (const articleData of demoArticles) {
    // 检查文章是否已存在
    const existing = await prisma.article.findUnique({
      where: { slug: articleData.slug },
    });

    if (existing) {
      console.log(`⏭️  文章已存在，跳过: ${articleData.slug}`);
      skipCount++;
      continue;
    }

    // 创建文章及其翻译
    const article = await prisma.article.create({
      data: {
        slug: articleData.slug,
        authorId: author.id,
        status: articleData.status,
        isPremium: articleData.isPremium,
        premiumPrice: articleData.premiumPrice,
        coverImage: articleData.coverImage,
        publishedAt: new Date(),
        translations: {
          create: [
            {
              locale: 'zh',
              title: articleData.translations.zh.title,
              excerpt: articleData.translations.zh.excerpt,
              content: articleData.translations.zh.content.trim(),
            },
            {
              locale: 'en',
              title: articleData.translations.en.title,
              excerpt: articleData.translations.en.excerpt,
              content: articleData.translations.en.content.trim(),
            },
            {
              locale: 'ja',
              title: articleData.translations.ja.title,
              excerpt: articleData.translations.ja.excerpt,
              content: articleData.translations.ja.content.trim(),
            },
          ],
        },
        tags: {
          create: articleData.tags.map(tagName => ({
            tag: {
              connect: { id: tagMap[tagName].id },
            },
          })),
        },
      },
      include: {
        translations: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    console.log(`✅ 文章创建成功: ${article.slug} (${article.translations.length} 个语言)`);
    successCount++;
  }

  console.log('\\n🎉 演示文章插入完成!');
  console.log(`   成功: ${successCount} 篇`);
  console.log(`   跳过: ${skipCount} 篇`);
  console.log(`   总计: ${demoArticles.length} 篇`);
}

main()
  .catch((e) => {
    console.error('❌ 插入演示文章失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
