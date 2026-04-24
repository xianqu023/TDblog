"use client";

import { motion } from "framer-motion";
import { Cloud, Sun, Moon, CloudRain, CloudSnow } from "lucide-react";
import { useEffect, useState } from "react";

interface WeatherWidgetProps {
  title?: string;
  city?: string;
}

type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'night';

interface WeatherData {
  temp: number;
  type: WeatherType;
  humidity: number;
  wind: number;
}

export default function WeatherWidget({ title = "天气", city = "北京" }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    // 模拟天气数据（实际使用时可接入天气 API）
    const mockWeather: WeatherData = {
      temp: 25,
      type: 'sunny',
      humidity: 60,
      wind: 15,
    };
    setWeather(mockWeather);
  }, []);

  const getWeatherIcon = (type: WeatherType) => {
    switch (type) {
      case 'sunny': return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'snowy': return <CloudSnow className="w-8 h-8 text-blue-300" />;
      case 'night': return <Moon className="w-8 h-8 text-indigo-400" />;
      default: return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  if (!weather) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="theme-card p-6"
      suppressHydrationWarning
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[var(--theme-text)]">{title}</h3>
        <span className="text-xs text-[var(--theme-text-muted)]">{city}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {getWeatherIcon(weather.type)}
        </div>
        <div>
          <div className="text-3xl font-bold text-[var(--theme-text)]">
            {weather.temp}°C
          </div>
          <div className="text-xs text-[var(--theme-text-muted)] mt-1">
            湿度 {weather.humidity}% · 风速 {weather.wind}km/h
          </div>
        </div>
      </div>
    </motion.div>
  );
}
