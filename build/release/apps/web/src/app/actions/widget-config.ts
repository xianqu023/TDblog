"use server";

import { prisma } from "@blog/database";
import { SidebarConfig } from "@/lib/sidebar-config";
import { revalidatePath } from "next/cache";

export async function saveWidgetConfig(config: SidebarConfig) {
  try {
    await prisma.setting.upsert({
      where: {
        key: "sidebar_widgets_config",
      },
      update: {
        value: JSON.stringify(config),
        type: "JSON",
        group: "website",
        description: "侧边栏小工具配置",
      },
      create: {
        key: "sidebar_widgets_config",
        value: JSON.stringify(config),
        type: "JSON",
        group: "website",
        description: "侧边栏小工具配置",
      },
    });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to save widget config:", error);
    throw new Error("Failed to save widget config");
  }
}

export async function getWidgetConfig(): Promise<SidebarConfig | null> {
  try {
    const setting = await prisma.setting.findUnique({
      where: {
        key: "sidebar_widgets_config",
      },
    });

    if (!setting) {
      return null;
    }

    // Check if value is a valid JSON string before parsing
    if (typeof setting.value !== "string" || setting.value.startsWith("[object")) {
      // Invalid value, return null
      return null;
    }

    return JSON.parse(setting.value) as SidebarConfig;
  } catch (error) {
    console.error("Failed to get widget config:", error);
    return null;
  }
}
