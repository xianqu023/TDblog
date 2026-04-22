import { prisma } from "./src/index";

const puckThemes = [
  {
    name: "Puck 博客示例",
    slug: "puck-blog-example",
    description: "基于 Puck 编辑器的博客主题示例",
    isDefault: false,
    isActive: true,
    sortOrder: 3,
    config: {
      puckData: {
        content: [
          {
            type: "navbar",
            props: {
              siteName: "我的博客",
              links: [
                { label: "首页", href: "/" },
                { label: "文章", href: "/articles" },
                { label: "关于", href: "/about" },
              ],
              sticky: true,
            },
          },
          {
            type: "hero",
            props: {
              title: "欢迎来到我的博客",
              subtitle: "分享技术与生活的点点滴滴",
              backgroundImage: "",
              overlayOpacity: 0.5,
              ctaText: "开始阅读",
              ctaLink: "/articles",
              alignment: "center",
              height: "600px",
            },
          },
          {
            type: "section",
            props: {
              padding: "4rem 2rem",
              backgroundColor: "#f9fafb",
            },
            children: [
              {
                type: "heading",
                props: {
                  level: 2,
                  text: "最新文章",
                  alignment: "center",
                  color: "#111827",
                },
              },
              {
                type: "articleList",
                props: {
                  limit: 6,
                  layout: "grid",
                  showThumbnail: true,
                  showExcerpt: true,
                  showMeta: true,
                },
              },
            ],
          },
          {
            type: "footer",
            props: {
              copyright: "© 2024 我的博客",
              showSocialLinks: true,
            },
          },
        ],
        root: {},
      },
    },
  },
  {
    name: "Puck 作品集示例",
    slug: "puck-portfolio-example",
    description: "基于 Puck 编辑器的作品集主题示例",
    isDefault: false,
    isActive: true,
    sortOrder: 4,
    config: {
      puckData: {
        content: [
          {
            type: "navbar",
            props: {
              siteName: "作品集",
              links: [
                { label: "首页", href: "/" },
                { label: "作品", href: "/works" },
                { label: "联系", href: "/contact" },
              ],
              sticky: true,
            },
          },
          {
            type: "hero",
            props: {
              title: "创意设计师作品集",
              subtitle: "用设计改变世界",
              ctaText: "查看作品",
              ctaLink: "/works",
              alignment: "center",
              height: "500px",
            },
          },
          {
            type: "stats",
            props: {
              stats: [
                { label: "项目", value: "50+", icon: "📁" },
                { label: "客户", value: "30+", icon: "👥" },
                { label: "奖项", value: "10+", icon: "🏆" },
              ],
              columns: 3,
            },
          },
          {
            type: "section",
            props: {
              padding: "4rem 2rem",
              backgroundColor: "#ffffff",
            },
            children: [
              {
                type: "heading",
                props: {
                  level: 2,
                  text: "精选作品",
                  alignment: "center",
                  color: "#111827",
                },
              },
              {
                type: "grid",
                props: {
                  columns: 3,
                  gap: "1.5rem",
                },
                children: [
                  {
                    type: "image",
                    props: {
                      src: "/placeholder.jpg",
                      alt: "作品 1",
                      width: "100%",
                      height: "300px",
                      borderRadius: "0.5rem",
                      caption: "作品标题 1",
                    },
                  },
                  {
                    type: "image",
                    props: {
                      src: "/placeholder.jpg",
                      alt: "作品 2",
                      width: "100%",
                      height: "300px",
                      borderRadius: "0.5rem",
                      caption: "作品标题 2",
                    },
                  },
                  {
                    type: "image",
                    props: {
                      src: "/placeholder.jpg",
                      alt: "作品 3",
                      width: "100%",
                      height: "300px",
                      borderRadius: "0.5rem",
                      caption: "作品标题 3",
                    },
                  },
                ],
              },
            ],
          },
          {
            type: "footer",
            props: {
              copyright: "© 2024 作品集",
              showSocialLinks: true,
            },
          },
        ],
        root: {},
      },
    },
  },
  {
    name: "Puck 企业官网示例",
    slug: "puck-corporate-example",
    description: "基于 Puck 编辑器的企业官网主题示例",
    isDefault: false,
    isActive: true,
    sortOrder: 5,
    config: {
      puckData: {
        content: [
          {
            type: "navbar",
            props: {
              siteName: "企业官网",
              links: [
                { label: "首页", href: "/" },
                { label: "产品", href: "/products" },
                { label: "关于", href: "/about" },
                { label: "联系", href: "/contact" },
              ],
              sticky: true,
            },
          },
          {
            type: "hero",
            props: {
              title: "创新科技，引领未来",
              subtitle: "为企业提供专业的技术解决方案",
              ctaText: "了解更多",
              ctaLink: "/products",
              alignment: "center",
              height: "500px",
            },
          },
          {
            type: "stats",
            props: {
              stats: [
                { label: "客户", value: "500+", icon: "👥" },
                { label: "项目", value: "1000+", icon: "📁" },
                { label: "团队", value: "100+", icon: "👨‍💻" },
              ],
              columns: 3,
            },
          },
          {
            type: "section",
            props: {
              padding: "4rem 2rem",
              backgroundColor: "#f9fafb",
            },
            children: [
              {
                type: "heading",
                props: {
                  level: 2,
                  text: "核心产品",
                  alignment: "center",
                  color: "#111827",
                },
              },
              {
                type: "grid",
                props: {
                  columns: 3,
                  gap: "2rem",
                },
                children: [
                  {
                    type: "container",
                    props: {
                      maxWidth: "100%",
                      padding: "2rem",
                      backgroundColor: "#ffffff",
                    },
                    children: [
                      {
                        type: "heading",
                        props: {
                          level: 3,
                          text: "产品 A",
                          alignment: "left",
                          color: "#111827",
                        },
                      },
                      {
                        type: "text",
                        props: {
                          text: "产品 A 的详细介绍，帮助企业提升效率。",
                          fontSize: "1rem",
                          lineHeight: "1.75",
                          color: "#666666",
                          alignment: "left",
                        },
                      },
                    ],
                  },
                  {
                    type: "container",
                    props: {
                      maxWidth: "100%",
                      padding: "2rem",
                      backgroundColor: "#ffffff",
                    },
                    children: [
                      {
                        type: "heading",
                        props: {
                          level: 3,
                          text: "产品 B",
                          alignment: "left",
                          color: "#111827",
                        },
                      },
                      {
                        type: "text",
                        props: {
                          text: "产品 B 的详细介绍，帮助企业降低成本。",
                          fontSize: "1rem",
                          lineHeight: "1.75",
                          color: "#666666",
                          alignment: "left",
                        },
                      },
                    ],
                  },
                  {
                    type: "container",
                    props: {
                      maxWidth: "100%",
                      padding: "2rem",
                      backgroundColor: "#ffffff",
                    },
                    children: [
                      {
                        type: "heading",
                        props: {
                          level: 3,
                          text: "产品 C",
                          alignment: "left",
                          color: "#111827",
                        },
                      },
                      {
                        type: "text",
                        props: {
                          text: "产品 C 的详细介绍，助力企业数字化转型。",
                          fontSize: "1rem",
                          lineHeight: "1.75",
                          color: "#666666",
                          alignment: "left",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "section",
            props: {
              padding: "4rem 2rem",
              backgroundColor: "#ffffff",
            },
            children: [
              {
                type: "heading",
                props: {
                  level: 2,
                  text: "联系我们",
                  alignment: "center",
                  color: "#111827",
                },
              },
              {
                type: "contactForm",
                props: {
                  title: "发送消息",
                  fields: [
                    { name: "name", label: "姓名", type: "text", required: true },
                    { name: "email", label: "邮箱", type: "email", required: true },
                    { name: "message", label: "消息", type: "textarea", required: true },
                  ],
                  submitText: "发送",
                },
              },
            ],
          },
          {
            type: "footer",
            props: {
              copyright: "© 2024 企业官网",
              showSocialLinks: true,
            },
          },
        ],
        root: {},
      },
    },
  },
];

async function seedPuckThemes() {
  console.log("Seeding Puck themes...");

  for (const theme of puckThemes) {
    const existing = await prisma.theme.findUnique({
      where: { slug: theme.slug },
    });

    if (existing) {
      console.log(`Theme "${theme.name}" already exists, skipping...`);
      continue;
    }

    await prisma.theme.create({
      data: theme,
    });

    console.log(`Created Puck theme: ${theme.name}`);
  }

  console.log("Puck themes seeded successfully!");
}

seedPuckThemes()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
