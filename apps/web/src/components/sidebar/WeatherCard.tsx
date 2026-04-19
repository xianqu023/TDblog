"use client";

import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Snowflake, CloudLightning, Droplets, Wind } from "lucide-react";
import { useTranslations } from "next-intl";

interface WeatherCardProps {
  apiKey?: string;
  city?: string;
}

const weatherIcons: Record<string, React.ReactNode> = {
  Clear: <Sun className="h-12 w-12 text-yellow-500" />,
  Clouds: <Cloud className="h-12 w-12 text-gray-400" />,
  Rain: <CloudRain className="h-12 w-12 text-blue-500" />,
  Snow: <Snowflake className="h-12 w-12 text-blue-300" />,
  Thunderstorm: <CloudLightning className="h-12 w-12 text-purple-500" />,
  Drizzle: <Droplets className="h-12 w-12 text-blue-400" />,
};

// 模拟天气数据
const mockWeather = {
  temp: 22,
  feelsLike: 20,
  humidity: 65,
  windSpeed: 12,
  condition: "Clouds",
  description: "多云转晴",
  city: "上海",
};

export default function WeatherCard({ city = "上海" }: WeatherCardProps) {
  const t = useTranslations("sidebar.weather");
  const [weather, setWeather] = useState(mockWeather);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 这里可以接入真实的天气 API
    // const fetchWeather = async () => { ... }
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [city]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-5">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-24 mb-3" />
          <div className="h-12 bg-gray-200 rounded w-12 mx-auto mb-3" />
          <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">{weather.city}</h3>
          <p className="text-sm text-blue-100">{t(`condition.${weather.condition}`) || t("condition.default")}</p>
        </div>
        {weatherIcons[weather.condition] || weatherIcons.Clear}
      </div>

      <div className="text-center mb-4">
        <div className="text-5xl font-bold">{weather.temp}°C</div>
        <p className="text-sm text-blue-100 mt-1">{t("feelsLike")} {weather.feelsLike}°C</p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20">
        <div className="flex items-center space-x-2">
          <Droplets className="h-4 w-4" />
          <span className="text-sm">{t("humidity")} {weather.humidity}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <Wind className="h-4 w-4" />
          <span className="text-sm">{t("windSpeed")} {weather.windSpeed}km/h</span>
        </div>
      </div>
    </div>
  );
}
