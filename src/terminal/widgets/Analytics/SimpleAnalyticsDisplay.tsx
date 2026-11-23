"use client";

import { useState, useEffect } from "react";
import { getAnalyticsSummary } from "@/lib/simple-analytics";
import { AnalyticsButton } from './atoms/AnalyticsButton';
import { AnalyticsModal } from './organisms/AnalyticsModal';

export const SimpleAnalyticsDisplay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [localStats, setLocalStats] = useState({
    visits: 0,
    commands: 0,
    questions: 0,
    sessionTime: "<1m",
    lastCommand: "none",
  });
  const [globalStats, setGlobalStats] = useState({
    totalVisits: 0,
    totalCommands: 0,
    totalQuestions: 0,
    error: null as string | null,
  });

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  const refreshData = async () => {
    const localData = getAnalyticsSummary();
    setLocalStats(localData);

    try {
      const response = await fetch("/api/analytics");
      const globalData = await response.json();
      setGlobalStats({
        totalVisits: globalData.totalVisits || 0,
        totalCommands: globalData.totalCommands || 0,
        totalQuestions: globalData.totalQuestions || 0,
        error: globalData.error || null,
      });
    } catch (error) {
      setGlobalStats((prev) => ({
        ...prev,
        error: "Failed to fetch global stats",
      }));
    }
  };

  if (!isOpen) {
    return <AnalyticsButton onClick={() => setIsOpen(true)} />;
  }

  return (
    <AnalyticsModal
      localStats={localStats}
      globalStats={globalStats}
      onClose={() => setIsOpen(false)}
    />
  );
};
