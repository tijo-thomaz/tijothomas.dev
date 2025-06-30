"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Clock, Command, MessageSquare, X } from 'lucide-react';
import { simpleAnalytics } from '@/lib/simple-analytics';

const AnalyticsDisplay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && !analyticsData) {
      const data = simpleAnalytics.getStats();
      const topCommands = simpleAnalytics.getTopCommands(5);
      
      setAnalyticsData({
        ...data,
        topCommands
      });
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
        title="View Analytics"
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
          className="max-w-4xl mx-auto border transition-colors duration-300"
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
              <BarChart3 className="w-5 h-5" />
              Portfolio Analytics
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                className="border"
                style={{
                  backgroundColor: 'var(--theme-muted)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)'
                }}
              >
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="border"
                style={{
                  backgroundColor: 'var(--theme-muted)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)'
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {analyticsData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Overview Stats */}
                <div 
                  className="bg-opacity-50 p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--theme-muted)', 
                    borderColor: 'var(--theme-border)' 
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
                    <h3 className="font-mono font-semibold" style={{ color: 'var(--theme-text)' }}>
                      Visitors
                    </h3>
                  </div>
                  <div className="space-y-2 font-mono text-sm" style={{ color: 'var(--theme-secondary)' }}>
                    <div>Total Visitors: <span style={{ color: 'var(--theme-accent)' }}>{analyticsData.totalVisitors}</span></div>
                    <div>Total Sessions: <span style={{ color: 'var(--theme-accent)' }}>{analyticsData.totalSessions}</span></div>
                    <div>Avg Session: <span style={{ color: 'var(--theme-accent)' }}>{analyticsData.formattedDuration}</span></div>
                    <div>Database: <span style={{ color: analyticsData.supabaseStatus === 'Connected' ? 'var(--theme-accent)' : '#fbbf24' }}>{analyticsData.supabaseStatus}</span></div>
                  </div>
                </div>

                {/* Activity Stats */}
                <div 
                  className="bg-opacity-50 p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--theme-muted)', 
                    borderColor: 'var(--theme-border)' 
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Command className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
                    <h3 className="font-mono font-semibold" style={{ color: 'var(--theme-text)' }}>
                      Activity
                    </h3>
                  </div>
                  <div className="space-y-2 font-mono text-sm" style={{ color: 'var(--theme-secondary)' }}>
                    <div>Commands: <span style={{ color: 'var(--theme-accent)' }}>{analyticsData.totalCommands}</span></div>
                    <div>Questions: <span style={{ color: 'var(--theme-accent)' }}>{analyticsData.totalQuestions}</span></div>
                  </div>
                </div>

                {/* Devices */}
                <div 
                  className="bg-opacity-50 p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--theme-muted)', 
                    borderColor: 'var(--theme-border)' 
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
                    <h3 className="font-mono font-semibold" style={{ color: 'var(--theme-text)' }}>
                      Devices
                    </h3>
                  </div>
                  <div className="space-y-2 font-mono text-sm" style={{ color: 'var(--theme-secondary)' }}>
                    {Object.entries(analyticsData.devices).map(([device, count]) => (
                      <div key={device}>
                        {device}: <span style={{ color: 'var(--theme-accent)' }}>{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Commands */}
                <div 
                  className="bg-opacity-50 p-4 rounded-lg border md:col-span-1 lg:col-span-1"
                  style={{ 
                    backgroundColor: 'var(--theme-muted)', 
                    borderColor: 'var(--theme-border)' 
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Command className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
                    <h3 className="font-mono font-semibold" style={{ color: 'var(--theme-text)' }}>
                      Top Commands
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {analyticsData.topCommands.map((item: any, index: number) => (
                      <div key={item.command} className="flex justify-between font-mono text-sm">
                        <span style={{ color: 'var(--theme-secondary)' }}>{item.command}</span>
                        <span style={{ color: 'var(--theme-accent)' }}>{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Questions */}
                <div 
                  className="bg-opacity-50 p-4 rounded-lg border md:col-span-1 lg:col-span-2"
                  style={{ 
                    backgroundColor: 'var(--theme-muted)', 
                    borderColor: 'var(--theme-border)' 
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
                    <h3 className="font-mono font-semibold" style={{ color: 'var(--theme-text)' }}>
                      Popular Topics
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {analyticsData.topQuestions.map((item: any, index: number) => (
                      <div key={item.question} className="flex justify-between font-mono text-sm">
                        <span style={{ color: 'var(--theme-secondary)' }}>{item.question}</span>
                        <span style={{ color: 'var(--theme-accent)' }}>{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Themes */}
                <div 
                  className="bg-opacity-50 p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--theme-muted)', 
                    borderColor: 'var(--theme-border)' 
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
                    <h3 className="font-mono font-semibold" style={{ color: 'var(--theme-text)' }}>
                      Themes
                    </h3>
                  </div>
                  <div className="space-y-2 font-mono text-sm" style={{ color: 'var(--theme-secondary)' }}>
                    {Object.entries(analyticsData.themes).map(([theme, count]) => (
                      <div key={theme}>
                        {theme}: <span style={{ color: 'var(--theme-accent)' }}>{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AnalyticsDisplay;
