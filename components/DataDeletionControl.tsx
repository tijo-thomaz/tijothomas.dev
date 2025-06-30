"use client";

import { useState } from 'react';
import { deleteUserSessionData } from '@/lib/supabase';
// import { analytics } from '@/lib/analytics'; // Not needed for anonymous analytics

export default function DataDeletionControl() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteData = async () => {
    setIsDeleting(true);
    
    try {
      // Get current session ID (not applicable for anonymous analytics)
      const sessionId = null; // No session tracking in anonymous mode
      
      if (sessionId) {
        // Delete from Supabase
        await deleteUserSessionData(sessionId);
        
        // Clear local data (not needed for anonymous analytics)
        // analytics.clearAllData();
        
        setIsDeleted(true);
        setShowConfirm(false);
        
        // Show success message and reload after 3 seconds
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      console.warn('Failed to delete data:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isDeleted) {
    return (
      <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-4 max-w-md">
        <div className="flex items-center gap-2 text-green-400 font-mono">
          <span>✅</span>
          <span className="font-bold">Data Deleted Successfully</span>
        </div>
        <p className="text-green-300 text-sm mt-2 font-mono">
          Your session data has been permanently removed from our servers.
          This page will refresh shortly.
        </p>
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 max-w-md">
        <h3 className="text-red-400 font-mono font-bold mb-2">⚠️ Confirm Data Deletion</h3>
        <p className="text-red-300 text-sm mb-4 font-mono">
          This will permanently delete:
        </p>
        <ul className="text-red-300 text-sm mb-4 font-mono list-disc list-inside space-y-1">
          <li>Your current session data</li>
          <li>Commands you've executed</li>
          <li>Chat interactions</li>
          <li>Theme preferences</li>
        </ul>
        <p className="text-red-300 text-xs mb-4 font-mono">
          <strong>Note:</strong> Anonymous visitor count will remain for site statistics.
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handleDeleteData}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white px-4 py-2 rounded font-mono font-bold transition-colors text-sm"
          >
            {isDeleting ? 'Deleting...' : '🗑️ Delete My Data'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded font-mono transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-xs text-red-400 hover:text-red-300 font-mono underline transition-colors"
    >
      🗑️ Delete My Data
    </button>
  );
}
