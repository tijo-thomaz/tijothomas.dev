"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Command, X, Shield } from 'lucide-react';
import { simpleAnalytics } from '@/lib/simple-analytics';

const SimpleAnalyticsDisplay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && !analyticsData) {
      refreshData();
    }
  }, [isOpen, analyticsData]);

  const refreshData = () => {
    const data = simpleAnalytics.getStats();
    const topCommands = simpleAnalytics.getTopCommands(5);
    
    setAnalyticsData({
      ...data,
      topCommands
    });
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="bg-gray-800 border-green-400 text-green-300 hover:bg-gray-700 p-2 h-8 w-8"
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
          className="max-w-2xl mx-auto border transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--theme-card)', 
            borderColor: 'var(--theme-border)' 
          }}
        >
          <CardHeader 
            className="border-b flex flex-row items-center justify-between transition-colors duration-300"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <CardTitle 
              className="font-mono flex items-center gap-2"
              style={{ color: 'var(--theme-accent)' }}
            >
              <Shield className="w-5 h-5" />
              Anonymous Analytics
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                className="border-green-400 text-green-300 hover:bg-green-400/10"
              >
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-green-300 hover:bg-green-400/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {analyticsData && (
              <>
                {/* Privacy Notice */}
                <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-400 font-mono font-bold mb-2">
                    <Shield className="w-4 h-4" />
                    Truly Anonymous
                  </div>
                  <p className="text-green-300 text-sm font-mono">
                    {analyticsData.privacy}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 font-mono text-sm">Daily Visits</span>
                    </div>
                    <div className="text-white text-2xl font-bold font-mono">
                      {analyticsData.dailyVisits}
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Command className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-mono text-sm">Total Commands</span>
                    </div>
                    <div className="text-white text-2xl font-bold font-mono">
                      {Object.values(analyticsData.popularCommands || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0)}
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400 font-mono text-sm">Device Types</span>
                    </div>
                    <div className="text-white text-sm font-mono space-y-1">
                      <div>📱 Mobile: {analyticsData.deviceTypes.mobile}</div>
                      <div>💻 Desktop: {analyticsData.deviceTypes.desktop}</div>
                      <div>📟 Tablet: {analyticsData.deviceTypes.tablet}</div>
                    </div>
                  </div>
                </div>

                {/* Popular Commands */}
                {analyticsData.topCommands.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h3 className="text-green-400 font-mono font-bold mb-3 flex items-center gap-2">
                      <Command className="w-4 h-4" />
                      Popular Commands
                    </h3>
                    <div className="space-y-2">
                      {analyticsData.topCommands.map((cmd: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-300 font-mono text-sm">{cmd.command}</span>
                          <span className="text-green-400 font-mono text-sm">{cmd.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data Info */}
                <div className="text-center text-gray-400 text-xs font-mono border-t border-gray-700 pt-4">
                  Last updated: {new Date(analyticsData.lastUpdated).toLocaleString()}
                  <br />
                  <span className="text-green-400">No personal data • No tracking • No behavioral profiling</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SimpleAnalyticsDisplay;
