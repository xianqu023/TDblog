"use client";

import { useState, useEffect, useMemo } from "react";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

interface CountdownCardProps {
  targetDate?: Date;
  title?: string;
  description?: string;
}

export default function CountdownCard({
  targetDate = new Date(new Date().getFullYear() + 1, 0, 1),
  title,
  description,
}: CountdownCardProps) {
  const t = useTranslations("sidebar.countdown");
  
  const displayTitle = title || t("defaultTitle");
  const displayDescription = description || t("defaultDescription");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // 使用 useMemo 稳定化 targetDate，避免每次渲染都创建新对象
  const stableTargetDate = useMemo(() => {
    return targetDate instanceof Date ? new Date(targetDate.getTime()) : new Date();
  }, [targetDate.getTime()]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = stableTargetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [stableTargetDate]);

  const timeUnits = [
    { label: t("days"), value: timeLeft.days },
    { label: t("hours"), value: timeLeft.hours },
    { label: t("minutes"), value: timeLeft.minutes },
    { label: t("seconds"), value: timeLeft.seconds },
  ];

  return (
    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-5 text-white">
      <div className="flex items-center mb-3">
        <Clock className="h-5 w-5 mr-2" />
        <h3 className="text-lg font-bold">{displayTitle}</h3>
      </div>

      <p className="text-sm text-white/80 mb-4">{displayDescription}</p>

      <div className="grid grid-cols-4 gap-2">
        {timeUnits.map((unit) => (
          <div
            key={unit.label}
            className="bg-white/20 backdrop-blur rounded-lg p-3 text-center"
          >
            <div className="text-2xl font-bold">
              {String(unit.value).padStart(2, "0")}
            </div>
            <div className="text-xs text-white/70">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
