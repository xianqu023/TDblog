"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { type ReactNode } from "react";

interface ThemeLayoutWrapperProps {
  children: ReactNode;
  defaultLayout: ReactNode;
  themeLayouts: Record<string, ReactNode>;
}

export default function ThemeLayoutWrapper({
  children,
  defaultLayout,
  themeLayouts,
}: ThemeLayoutWrapperProps) {
  const { currentTheme } = useTheme();

  const themeLayout = themeLayouts[currentTheme];

  if (themeLayout) {
    return <>{themeLayout}</>;
  }

  return <>{defaultLayout}</>;
}
