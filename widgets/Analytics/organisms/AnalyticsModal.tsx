"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Shield } from "lucide-react";
import { PrivacyNotice } from '../atoms/PrivacyNotice';
import { StatGrid } from '../molecules/StatGrid';

interface AnalyticsModalProps {
  localStats: {
    visits: number;
    commands: number;
    questions: number;
    sessionTime: string;
    lastCommand: string;
  };
  globalStats: {
    totalVisits: number;
    totalCommands: number;
    totalQuestions: number;
    error: string | null;
  };
  onClose: () => void;
}

export const AnalyticsModal = ({ localStats, globalStats, onClose }: AnalyticsModalProps) => {
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

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
              onClick={onClose}
              className="transition-colors hover:opacity-80"
              style={{ color: "var(--theme-accent)" }}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <PrivacyNotice />

            <div>
              <div
                className="font-mono text-sm font-bold mb-2"
                style={{ color: "var(--theme-accent)" }}
              >
                📱 Your Session
              </div>
              <StatGrid
                stats={{
                  Visits: localStats.visits,
                  Commands: localStats.commands,
                  Questions: localStats.questions,
                  Time: localStats.sessionTime,
                }}
                columns={2}
              />

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
                <StatGrid
                  stats={{
                    'Total Visits': globalStats.totalVisits,
                    Commands: globalStats.totalCommands,
                    Questions: globalStats.totalQuestions,
                  }}
                  columns={3}
                />
              )}
            </div>

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
