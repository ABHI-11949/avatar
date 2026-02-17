'use client';

import { useState } from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';

interface SessionControlsProps {
  onStartSession: () => Promise<void>;
  onStopSession: () => Promise<void>;
  isActive: boolean;
  isLoading?: boolean;
}

export default function SessionControls({ 
  onStartSession, 
  onStopSession, 
  isActive,
  isLoading 
}: SessionControlsProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const handleStart = async () => {
    try {
      setIsStarting(true);
      await onStartSession();
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    try {
      setIsStopping(true);
      await onStopSession();
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <div className="flex gap-3">
      {!isActive ? (
        <button
          onClick={handleStart}
          disabled={isStarting || isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isStarting ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          Start Avatar Session
        </button>
      ) : (
        <button
          onClick={handleStop}
          disabled={isStopping}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isStopping ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Square className="w-5 h-5" />
          )}
          Stop Session
        </button>
      )}
    </div>
  );
}