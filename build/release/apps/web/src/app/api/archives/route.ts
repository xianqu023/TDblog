import { NextResponse } from "next/server";
import { prisma } from "@blog/database";

/**
 * GET /api/archives
 * 获取文章归档数据（按年月分组）
 */
export async function GET() {
  try {
    // 获取所有已发布的文章
    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: {
          not: null,
        },
      },
      select: {
        id: true,
        publishedAt: true,
        translations: {
          where: {
            locale: "zh",
          },
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    // 按年月分组
    const archivesByYearMonth: Record<string, any[]> = {};

    articles.forEach((article) => {
      if (!article.publishedAt) return;

      const date = new Date(article.publishedAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const key = `${year}-${month}`;

      if (!archivesByYearMonth[key]) {
        archivesByYearMonth[key] = [];
      }

      archivesByYearMonth[key].push({
        id: article.id,
        title: article.translations?.[0]?.title || "无标题",
        publishedAt: article.publishedAt,
      });
    });

    // 转换为数组格式并按时间排序
    const archives = Object.entries(archivesByYearMonth)
      .map(([key, articles]) => {
        const [year, month] = key.split("-");
        return {
          year: parseInt(year),
          month: parseInt(month),
          yearMonth: key,
          label: `${year}年${parseInt(month)}月`,
          count: articles.length,
          articles: articles.sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() -
              new Date(a.publishedAt).getTime()
          ),
        };
      })
      .sort((a, b) => {
        // 按年月降序排序
        return b.yearMonth.localeCompare(a.yearMonth);
      });

    // 按年分组统计
    const archivesByYear: Record<number, any> = {};
    archives.forEach((archive) => {
      if (!archivesByYear[archive.year]) {
        archivesByYear[archive.year] = {
          year: archive.year,
          count: 0,
          months: [],
        };
      }
      archivesByYear[archive.year].count += archive.count;
      archivesByYear[archive.year].months.push({
        month: archive.month,
        label: archive.label,
        count: archive.count,
        articles: archive.articles,
      });
    });

    const yearArchives = Object.values(archivesByYear).sort(
      (a, b) => b.year - a.year
    );

    return NextResponse.json({
      success: true,
      data: {
        archives,
        yearArchives,
        total: articles.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch archives:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch archives",
      },
      { status: 500 }
    );
  }
}
