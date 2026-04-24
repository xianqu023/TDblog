export interface ComponentDefinition {
  type: string;
  label: string;
  icon: string;
  category: 'layout' | 'content' | 'media' | 'form' | 'widget' | 'special';
  defaultProps: Record<string, any>;
  defaultStyles?: Record<string, any>;
  description: string;
}

export const componentRegistry: ComponentDefinition[] = [
  // 布局组件
  {
    type: 'hero',
    label: 'Hero 横幅',
    icon: '🎯',
    category: 'layout',
    defaultProps: {
      title: '欢迎来到我的博客',
      subtitle: '分享技术与生活的点点滴滴',
      backgroundImage: '',
      overlayOpacity: 0.5,
      ctaText: '开始阅读',
      ctaLink: '/articles',
      alignment: 'center',
      height: '600px',
    },
    defaultStyles: {
      backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
    },
    description: '页面顶部的大型横幅区域',
  },
  {
    type: 'container',
    label: '容器',
    icon: '📦',
    category: 'layout',
    defaultProps: {
      maxWidth: '1200px',
      padding: '2rem',
      backgroundColor: 'transparent',
    },
    description: '内容容器，用于包裹其他组件',
  },
  {
    type: 'grid',
    label: '网格布局',
    icon: '⊞',
    category: 'layout',
    defaultProps: {
      columns: 3,
      gap: '1.5rem',
      responsive: true,
    },
    description: '响应式网格布局',
  },
  {
    type: 'columns',
    label: '分栏布局',
    icon: '▥',
    category: 'layout',
    defaultProps: {
      columns: 2,
      gap: '2rem',
      columnWidths: ['50%', '50%'],
    },
    description: '自定义分栏布局',
  },
  {
    type: 'section',
    label: '内容区块',
    icon: '📄',
    category: 'layout',
    defaultProps: {
      padding: '4rem 2rem',
      backgroundColor: 'var(--bg)',
      backgroundImage: '',
    },
    description: '独立的内容区块',
  },

  // 内容组件
  {
    type: 'heading',
    label: '标题',
    icon: 'H',
    category: 'content',
    defaultProps: {
      level: 2,
      text: '这是一个标题',
      alignment: 'left',
      color: 'var(--text)',
    },
    description: 'H1-H6 标题组件',
  },
  {
    type: 'text',
    label: '文本段落',
    icon: '¶',
    category: 'content',
    defaultProps: {
      text: '这是一段文本内容。你可以在这里添加你的博客介绍、文章摘要或其他文字内容。',
      fontSize: '1rem',
      lineHeight: '1.75',
      color: 'var(--text-muted)',
      alignment: 'left',
    },
    description: '文本段落组件',
  },
  {
    type: 'button',
    label: '按钮',
    icon: '🔘',
    category: 'content',
    defaultProps: {
      text: '点击这里',
      link: '#',
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
    description: '可点击的按钮',
  },
  {
    type: 'divider',
    label: '分隔线',
    icon: '—',
    category: 'content',
    defaultProps: {
      style: 'solid',
      color: 'var(--border)',
      thickness: '1px',
      margin: '2rem 0',
    },
    description: '内容分隔线',
  },
  {
    type: 'spacer',
    label: '间距',
    icon: '↕',
    category: 'content',
    defaultProps: {
      height: '2rem',
    },
    description: '添加垂直间距',
  },
  {
    type: 'list',
    label: '列表',
    icon: '☰',
    category: 'content',
    defaultProps: {
      items: ['项目一', '项目二', '项目三'],
      ordered: false,
      style: 'disc',
    },
    description: '有序或无序列表',
  },

  // 媒体组件
  {
    type: 'image',
    label: '图片',
    icon: '🖼',
    category: 'media',
    defaultProps: {
      src: '/placeholder.jpg',
      alt: '图片描述',
      width: '100%',
      height: 'auto',
      objectFit: 'cover',
      borderRadius: '0.5rem',
      caption: '',
    },
    description: '图片展示组件',
  },
  {
    type: 'imageGallery',
    label: '图片画廊',
    icon: '🎨',
    category: 'media',
    defaultProps: {
      images: [
        { src: '/image1.jpg', alt: '图片1' },
        { src: '/image2.jpg', alt: '图片2' },
        { src: '/image3.jpg', alt: '图片3' },
      ],
      columns: 3,
      gap: '1rem',
      lightbox: true,
    },
    description: '多图片展示画廊',
  },
  {
    type: 'video',
    label: '视频',
    icon: '▶',
    category: 'media',
    defaultProps: {
      src: '',
      poster: '',
      autoplay: false,
      controls: true,
      aspectRatio: '16/9',
    },
    description: '视频播放器',
  },
  {
    type: 'carousel',
    label: '轮播图',
    icon: '🎠',
    category: 'media',
    defaultProps: {
      slides: [
        { image: '/slide1.jpg', title: '幻灯片1' },
        { image: '/slide2.jpg', title: '幻灯片2' },
      ],
      autoplay: true,
      interval: 5000,
      showDots: true,
      showArrows: true,
    },
    description: '图片轮播组件',
  },

  // 表单组件
  {
    type: 'contactForm',
    label: '联系表单',
    icon: '📧',
    category: 'form',
    defaultProps: {
      title: '联系我们',
      fields: [
        { name: 'name', label: '姓名', type: 'text', required: true },
        { name: 'email', label: '邮箱', type: 'email', required: true },
        { name: 'message', label: '留言', type: 'textarea', required: true },
      ],
      submitText: '发送消息',
      successMessage: '消息已发送，谢谢！',
    },
    description: '联系表单组件',
  },
  {
    type: 'newsletterForm',
    label: '订阅表单',
    icon: '📬',
    category: 'form',
    defaultProps: {
      title: '订阅我们的通讯',
      description: '获取最新文章和更新',
      placeholder: '输入你的邮箱',
      buttonText: '订阅',
      successMessage: '订阅成功！',
    },
    description: '邮件订阅表单',
  },
  {
    type: 'searchBox',
    label: '搜索框',
    icon: '🔍',
    category: 'form',
    defaultProps: {
      placeholder: '搜索文章...',
      showButton: true,
      buttonText: '搜索',
    },
    description: '搜索功能组件',
  },

  // 侧边栏小工具（已开发）
  {
    type: 'bloggerCard',
    label: '博主卡片',
    icon: '👤',
    category: 'widget',
    defaultProps: {
      showAvatar: true,
      showBio: true,
      showSocialLinks: true,
      layout: 'centered',
    },
    description: '博主信息展示卡片',
  },
  {
    type: 'categoryNav',
    label: '分类导航',
    icon: '📂',
    category: 'widget',
    defaultProps: {
      showCount: true,
      showIcons: true,
      maxItems: 10,
      layout: 'list',
    },
    description: '文章分类导航',
  },
  {
    type: 'tagCloud',
    label: '标签云',
    icon: '🏷',
    category: 'widget',
    defaultProps: {
      maxTags: 30,
      sortBy: 'count',
      showCount: false,
      minFontSize: '0.75rem',
      maxFontSize: '1.5rem',
    },
    description: '文章标签云展示',
  },
  {
    type: 'popularArticles',
    label: '热门文章',
    icon: '🔥',
    category: 'widget',
    defaultProps: {
      limit: 5,
      showThumbnail: true,
      showDate: true,
      showViews: true,
    },
    description: '热门文章列表',
  },
  {
    type: 'recentArticles',
    label: '最新文章',
    icon: '📝',
    category: 'widget',
    defaultProps: {
      limit: 5,
      showThumbnail: true,
      showExcerpt: false,
      showDate: true,
    },
    description: '最新文章列表',
  },
  {
    type: 'archiveList',
    label: '归档列表',
    icon: '📅',
    category: 'widget',
    defaultProps: {
      format: 'monthly',
      showCount: true,
      maxItems: 12,
    },
    description: '文章归档列表',
  },
  {
    type: 'socialFollow',
    label: '社交关注',
    icon: '🌐',
    category: 'widget',
    defaultProps: {
      platforms: ['twitter', 'github', 'wechat'],
      showCount: true,
      layout: 'horizontal',
    },
    description: '社交媒体关注按钮',
  },
  {
    type: 'toc',
    label: '目录导航',
    icon: '📑',
    category: 'widget',
    defaultProps: {
      showOnScroll: true,
      maxDepth: 3,
      collapse: false,
    },
    description: '文章目录导航',
  },

  // 特殊组件
  {
    type: 'articleList',
    label: '文章列表',
    icon: '📰',
    category: 'special',
    defaultProps: {
      limit: 10,
      layout: 'grid',
      showThumbnail: true,
      showExcerpt: true,
      showMeta: true,
      category: '',
      tag: '',
    },
    description: '博客文章列表',
  },
  {
    type: 'featuredArticles',
    label: '精选文章',
    icon: '⭐',
    category: 'special',
    defaultProps: {
      limit: 3,
      layout: 'carousel',
      showThumbnail: true,
    },
    description: '精选/置顶文章',
  },
  {
    type: 'footer',
    label: '页脚',
    icon: '⬇',
    category: 'special',
    defaultProps: {
      columns: 3,
      showSocialLinks: true,
      showNewsletter: true,
      copyright: '© 2024 My Blog',
      links: [
        { label: '关于我们', href: '/about' },
        { label: '联系方式', href: '/contact' },
        { label: '隐私政策', href: '/privacy' },
      ],
    },
    description: '网站页脚',
  },
  {
    type: 'navbar',
    label: '导航栏',
    icon: '☰',
    category: 'special',
    defaultProps: {
      logo: '/logo.png',
      links: [
        { label: '首页', href: '/' },
        { label: '文章', href: '/articles' },
        { label: '关于', href: '/about' },
      ],
      sticky: true,
      transparent: false,
    },
    description: '顶部导航栏',
  },
  {
    type: 'testimonial',
    label: '客户评价',
    icon: '💬',
    category: 'special',
    defaultProps: {
      testimonials: [
        { name: '张三', role: '开发者', content: '非常棒的博客！', avatar: '' },
        { name: '李四', role: '设计师', content: '内容很有价值。', avatar: '' },
      ],
      layout: 'grid',
      columns: 2,
    },
    description: '客户评价展示',
  },
  {
    type: 'pricing',
    label: '价格表',
    icon: '💰',
    category: 'special',
    defaultProps: {
      plans: [
        { name: '免费', price: '0', features: ['基础功能'], popular: false },
        { name: '专业', price: '99', features: ['全部功能', '优先支持'], popular: true },
      ],
      currency: '¥',
      billingPeriod: '月',
    },
    description: '价格方案展示',
  },
  {
    type: 'faq',
    label: '常见问题',
    icon: '❓',
    category: 'special',
    defaultProps: {
      questions: [
        { question: '如何使用？', answer: '很简单，只需...' },
        { question: '支持哪些功能？', answer: '我们支持...' },
      ],
      layout: 'accordion',
    },
    description: '常见问题解答',
  },
  {
    type: 'stats',
    label: '数据统计',
    icon: '📊',
    category: 'special',
    defaultProps: {
      stats: [
        { label: '文章', value: '100+', icon: '📝' },
        { label: '读者', value: '10K+', icon: '👥' },
        { label: '评论', value: '5K+', icon: '💬' },
      ],
      layout: 'grid',
      columns: 3,
    },
    description: '数据统计展示',
  },
];

export const categories = [
  { key: 'layout', label: '布局组件', icon: '📐' },
  { key: 'content', label: '内容组件', icon: '📝' },
  { key: 'media', label: '媒体组件', icon: '🎨' },
  { key: 'form', label: '表单组件', icon: '📋' },
  { key: 'widget', label: '侧边栏小工具', icon: '🧩' },
  { key: 'special', label: '特殊组件', icon: '✨' },
];

export function getComponentByType(type: string): ComponentDefinition | undefined {
  return componentRegistry.find((c) => c.type === type);
}

export function getComponentsByCategory(category: string): ComponentDefinition[] {
  return componentRegistry.filter((c) => c.category === category);
}
