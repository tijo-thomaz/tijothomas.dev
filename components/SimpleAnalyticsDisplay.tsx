"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Command, X, Shield } from "lucide-react";
import { getAnalyticsSummary } from "@/lib/simple-analytics";

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
    // Get local data
    const localData = getAnalyticsSummary();
    setLocalStats(localData);

    // Get global Supabase data
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
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="p-2 h-8 w-8 border transition-colors hover:opacity-80"
        style={{
          backgroundColor: "var(--theme-surface)",
          borderColor: "var(--theme-border)",
          color: "var(--theme-accent)",
        }}
        title="View Anonymous Analytics"
      >
        <BarChart3 className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-4 z-50 overflow-auto">
        <Card
          className="max-w-lg mx-auto border transition-colors duration-300"
          style={{
            backgroundColor: "var(--theme-card)",
            borderColor: "var(--theme-border)",
          }}
        >
          <CardHeader
            className="border-b flex flex-row items-center justify-between transition-colors duration-300"
            style={{ borderColor: "var(--theme-border)" }}
          >
            <CardTitle
              className="font-mono flex items-center gap-2"
              style={{ color: "var(--theme-accent)" }}
            >
              <Shield className="w-5 h-5" />
              Analytics
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="transition-colors hover:opacity-80"
              style={{ color: "var(--theme-accent)" }}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Privacy Notice */}
            <div
              className="border rounded-lg p-3"
              style={{
                backgroundColor: "var(--theme-muted)",
                borderColor: "var(--theme-border)",
              }}
            >
              <div
                className="flex items-center gap-2 font-mono font-bold text-sm"
                style={{ color: "var(--theme-accent)" }}
              >
                <Shield className="w-3 h-3" />
                Truly Anonymous
              </div>
              <p
                className="text-xs font-mono mt-1"
                style={{ color: "var(--theme-secondary)" }}
              >
                No personal data, no tracking, just basic usage patterns.
              </p>
            </div>

            {/* Your Session Stats */}
            <div>
              <div
                className="font-mono text-sm font-bold mb-2"
                style={{ color: "var(--theme-accent)" }}
              >
                📱 Your Session
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-lg p-3 border"
                  style={{
                    backgroundColor: "var(--theme-card)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <div
                    className="font-mono text-xs mb-1"
                    style={{ color: "var(--theme-accent)" }}
                  >
                    Visits
                  </div>
                  <div
                    className="text-lg font-bold font-mono"
                    style={{ color: "var(--theme-text)" }}
                  >
                    {localStats.visits}
                  </div>
                </div>

                <div
                  className="rounded-lg p-3 border"
                  style={{
                    backgroundColor: "var(--theme-card)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <div
                    className="font-mono text-xs mb-1"
                    style={{ color: "var(--theme-accent)" }}
                  >
                    Commands
                  </div>
                  <div
                    className="text-lg font-bold font-mono"
                    style={{ color: "var(--theme-text)" }}
                  >
                    {localStats.commands}
                  </div>
                </div>

                <div
                  className="rounded-lg p-3 border"
                  style={{
                    backgroundColor: "var(--theme-card)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <div
                    className="font-mono text-xs mb-1"
                    style={{ color: "var(--theme-accent)" }}
                  >
                    Questions
                  </div>
                  <div
                    className="text-lg font-bold font-mono"
                    style={{ color: "var(--theme-text)" }}
                  >
                    {localStats.questions}
                  </div>
                </div>

                <div
                  className="rounded-lg p-3 border"
                  style={{
                    backgroundColor: "var(--theme-card)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <div
                    className="font-mono text-xs mb-1"
                    style={{ color: "var(--theme-accent)" }}
                  >
                    Time
                  </div>
                  <div
                    className="text-lg font-bold font-mono"
                    style={{ color: "var(--theme-text)" }}
                  >
                    {localStats.sessionTime}
                  </div>
                </div>
              </div>

              {/* Last Command */}
              {localStats.lastCommand !== "none" && (
                <div
                  className="rounded-lg p-3 border mt-3"
                  style={{
                    backgroundColor: "var(--theme-card)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <div
                    className="font-mono text-xs mb-1"
                    style={{ color: "var(--theme-accent)" }}
                  >
                    Last Command
                  </div>
                  <div
                    className="font-mono text-sm"
                    style={{ color: "var(--theme-secondary)" }}
                  >
                    {localStats.lastCommand}
                  </div>
                </div>
              )}
            </div>

            {/* Global Portfolio Stats */}
            <div>
              <div
                className="font-mono text-sm font-bold mb-2"
                style={{ color: "var(--theme-accent)" }}
              >
                🌍 Portfolio Totals
              </div>
              {globalStats.error ? (
                <div
                  className="text-xs font-mono"
                  style={{ color: "var(--theme-error)" }}
                >
                  {globalStats.error}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div
                    className="rounded-lg p-3 border"
                    style={{
                      backgroundColor: "var(--theme-card)",
                      borderColor: "var(--theme-border)",
                    }}
                  >
                    <div
                      className="font-mono text-xs mb-1"
                      style={{ color: "var(--theme-accent)" }}
                    >
                      Total Visits
                    </div>
                    <div
                      className="text-lg font-bold font-mono"
                      style={{ color: "var(--theme-text)" }}
                    >
                      {globalStats.totalVisits}
                    </div>
                  </div>

                  <div
                    className="rounded-lg p-3 border"
                    style={{
                      backgroundColor: "var(--theme-card)",
                      borderColor: "var(--theme-border)",
                    }}
                  >
                    <div
                      className="font-mono text-xs mb-1"
                      style={{ color: "var(--theme-accent)" }}
                    >
                      Commands
                    </div>
                    <div
                      className="text-lg font-bold font-mono"
                      style={{ color: "var(--theme-text)" }}
                    >
                      {globalStats.totalCommands}
                    </div>
                  </div>

                  <div
                    className="rounded-lg p-3 border"
                    style={{
                      backgroundColor: "var(--theme-card)",
                      borderColor: "var(--theme-border)",
                    }}
                  >
                    <div
                      className="font-mono text-xs mb-1"
                      style={{ color: "var(--theme-accent)" }}
                    >
                      Questions
                    </div>
                    <div
                      className="text-lg font-bold font-mono"
                      style={{ color: "var(--theme-text)" }}
                    >
                      {globalStats.totalQuestions}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="text-center text-xs font-mono border-t pt-3"
              style={{
                color: "var(--theme-secondary)",
                borderColor: "var(--theme-border)",
              }}
            >
              <span style={{ color: "var(--theme-accent)" }}>
                Anonymous counts only • No personal data
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
