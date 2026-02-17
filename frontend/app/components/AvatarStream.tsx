'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AvatarStreamProps {
  streamUrl: string;
  sessionId: string;
  onStreamReady?: () => void;
  onStreamError?: (error: Error) => void;
}

export default function AvatarStream({ 
  streamUrl, 
  sessionId,
  onStreamReady, 
  onStreamError 
}: AvatarStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;

    let mediaStream: MediaStream | null = null;

    const initializeStream = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // For WebRTC stream
        if (streamUrl.startsWith('wss://') || streamUrl.startsWith('ws://')) {
          // Handle WebSocket/WebRTC connection
          const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
          });

          pc.ontrack = (event) => {
            if (videoRef.current && event.streams[0]) {
              videoRef.current.srcObject = event.streams[0];
              setIsLoading(false);
              onStreamReady?.();
            }
          };

          // Create and send offer
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          // Connect to WebSocket server
          const ws = new WebSocket(streamUrl);
          
          ws.onopen = () => {
            ws.send(JSON.stringify({
              type: 'webrtc_offer',
              sdp: pc.localDescription,
              session_id: sessionId
            }));
          };

          ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'webrtc_answer') {
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            }
          };

          ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setError('Connection failed');
            onStreamError?.(new Error('WebSocket connection failed'));
          };
        } 
        // For direct media stream
        else if (streamUrl.startsWith('https://')) {
          const response = await fetch(streamUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          
          if (videoRef.current) {
            videoRef.current.src = url;
            videoRef.current.onloadeddata = () => {
              setIsLoading(false);
              onStreamReady?.();
            };
          }
        }

      } catch (err) {
        console.error('Stream initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize stream');
        onStreamError?.(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      }
    };

    initializeStream();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [streamUrl, sessionId, onStreamReady, onStreamError]);

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-20 z-10">
          <p className="text-red-500 text-center px-4">{error}</p>
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className="w-full h-full object-cover"
      />
    </div>
  );
}