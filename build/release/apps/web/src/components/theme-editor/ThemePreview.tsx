"use client";

import { Render } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";
import {
  Hero,
  Heading,
  Text,
  Button,
  Image,
  Container,
  Grid,
  Section,
  Divider,
  Spacer,
  Navbar,
  Footer,
  ArticleList,
  ContactForm,
  FAQ,
  Stats,
} from "@/lib/puck-components";

export default function ThemePreviewPage({ data }: { data: any }) {
  const config = {
    components: {
      hero: Hero,
      heading: Heading,
      text: Text,
      button: Button,
      image: Image,
      container: Container,
      grid: Grid,
      section: Section,
      divider: Divider,
      spacer: Spacer,
      navbar: Navbar,
      footer: Footer,
      articleList: ArticleList,
      contactForm: ContactForm,
      faq: FAQ,
      stats: Stats,
    },
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">暂无主题数据</p>
      </div>
    );
  }

  return <Render config={config} data={data} />;
}
