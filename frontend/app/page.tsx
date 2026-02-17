'use client';

import { useState, useEffect } from 'react';
import AvatarStream from './components/AvatarStream';
import ChatInterface from './components/ChatInterface';
import SessionControls from './components/SessionControls';
import { avatarApi, CreateSessionResponse } from '@/lib/api';

export default function Home() {
  const [session, setSession] = useState<CreateSessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newSession = await avatarApi.createSession();
      setSession(newSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
      console.error('Session creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const stopSession = async () => {
    if (!session) return;
    
    try {
      setIsLoading(true);
      await avatarApi.stopSession(session.session_id);
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop session');
      console.error('Session stop error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!session) return;
    
    try {
      await avatarApi.speak(session.session_id, message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Send message error:', err);
    }
  };

  // Clean up session on unmount
  useEffect(() => {
    return () => {
      if (session) {
        avatarApi.stopSession(session.session_id).catch(console.error);
      }
    };
  }, [session]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🤖 HeyGen Live Avatar Demo
          </h1>
          <p className="text-gray-300">
            Interactive AI Avatar Assistant powered by HeyGen
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
            <p className="text-red-500 text-center">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Avatar Stream */}
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
            {session ? (
              <AvatarStream
                streamUrl={session.streaming_url}
                sessionId={session.session_id}
                onStreamReady={() => console.log('Stream ready')}
                onStreamError={(err) => setError(err.message)}
              />
            ) : (
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <p className="text-gray-400">
                  {isLoading ? 'Starting session...' : 'Click "Start Avatar Session" to begin'}
                </p>
              </div>
            )}
          </div>

          {/* Session Controls */}
          <div className="flex justify-center">
            <SessionControls
              onStartSession={startSession}
              onStopSession={stopSession}
              isActive={!!session}
              isLoading={isLoading}
            />
          </div>

          {/* Chat Interface */}
          {session && (
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
              <ChatInterface
                onSendMessage={sendMessage}
                disabled={!session || isLoading}
              />
            </div>
          )}
        </div>

        {/* Status Bar */}
        {session && (
          <div className="max-w-4xl mx-auto mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Session Active
              </span>
              <span className="text-gray-400">
                Session ID: {session.session_id.slice(0, 8)}...
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}