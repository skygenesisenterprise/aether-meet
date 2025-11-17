'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCall } from '../contexts/call-context';
import {
  PhoneIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  VideoCameraSlashIcon,
  ComputerDesktopIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline';

export default function CallInterface() {
  const { currentCall, isInCall, endCall, toggleMute, toggleVideo, toggleScreenShare } = useCall();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Request permissions and setup media stream
  useEffect(() => {
    if (currentCall && !localStream) {
      const setupMedia = async () => {
        try {
          const constraints = currentCall.type === 'video' 
            ? { video: true, audio: true }
            : { audio: true };
          
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          setLocalStream(stream);
          setPermissionStatus('granted');
          
          // Attach local video stream
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing media devices:', error);
          setPermissionStatus('denied');
          
          // Show user-friendly error message for call-time permission denial
          if (error instanceof Error) {
            if (error.name === 'NotAllowedError') {
              alert('Les permissions pour le microphone et/ou la caméra ont été refusées. ' +
                    'Veuillez les autoriser dans les paramètres de votre navigateur pour passer un appel.');
            } else if (error.name === 'NotFoundError') {
              alert('Aucun microphone ou caméra trouvé. Veuillez vérifier vos périphériques.');
            }
          }
        }
      };

      setupMedia();
    }

    // Cleanup
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [currentCall, localStream]);

  // Toggle speaker
  const toggleSpeaker = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsSpeakerOn(!isSpeakerOn);
    }
  };

  if (!currentCall || !isInCall) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentDuration = currentCall.startTime 
    ? Math.floor((Date.now() - currentCall.startTime) / 1000)
    : 0;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Main Video Area */}
      <div className="flex-1 relative bg-gray-900">
        {/* Remote Video (Main) */}
        <div className="w-full h-full flex items-center justify-center">
          {currentCall.type === 'video' && currentCall.isVideoOn ? (
            <div className="w-full h-full bg-gray-800 relative">
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              {/* Fallback if no remote video */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-3xl font-bold">
                      {currentCall.participant.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <p className="text-white text-lg">{currentCall.participant}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-white text-xl">{currentCall.participant}</p>
              <p className="text-gray-400 mt-2">Appel audio</p>
            </div>
          )}
        </div>

        {/* Self Video (Picture-in-Picture) */}
        {currentCall.type === 'video' && currentCall.isVideoOn && (
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg border-2 border-gray-700 overflow-hidden">
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {/* Fallback if no local video */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <span className="text-white text-lg font-bold">Moi</span>
            </div>
          </div>
        )}

        {/* Permission Status Indicator */}
        {permissionStatus === 'denied' && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <MicrophoneIcon className="h-5 w-5" />
              <span className="font-medium">Permissions refusées</span>
            </div>
          </div>
        )}

        {/* Call Info */}
        <div className="absolute top-4 left-4">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-white font-medium">{currentCall.participant}</p>
            <p className="text-gray-300 text-sm">{formatDuration(currentDuration)}</p>
          </div>
        </div>

        {/* Screen Sharing Indicator */}
        {currentCall.isScreenSharing && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <ComputerDesktopIcon className="h-5 w-5" />
              <span className="font-medium">Partage d'écran actif</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border-t border-gray-800 p-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Microphone */}
          <button
            onClick={() => {
              toggleMute();
              if (localStream) {
                const audioTracks = localStream.getAudioTracks();
                audioTracks.forEach(track => {
                  track.enabled = !track.enabled;
                });
              }
            }}
            className={`p-4 rounded-full transition-colors ${
              currentCall.isMuted 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={currentCall.isMuted ? 'Activer le micro' : 'Désactiver le micro'}
          >
            {currentCall.isMuted ? (
              <MicrophoneIcon className="h-6 w-6" />
            ) : (
              <MicrophoneIcon className="h-6 w-6" />
            )}
          </button>

          {/* Speaker */}
          <button
            onClick={toggleSpeaker}
            className={`p-4 rounded-full transition-colors ${
              !isSpeakerOn 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={!isSpeakerOn ? 'Activer le son' : 'Désactiver le son'}
          >
            {isSpeakerOn ? (
              <SpeakerWaveIcon className="h-6 w-6" />
            ) : (
              <SpeakerXMarkIcon className="h-6 w-6" />
            )}
          </button>

          {/* Video (only for video calls) */}
          {currentCall.type === 'video' && (
            <button
              onClick={() => {
                toggleVideo();
                if (localStream) {
                  const videoTracks = localStream.getVideoTracks();
                  videoTracks.forEach(track => {
                    track.enabled = !track.enabled;
                  });
                }
              }}
              className={`p-4 rounded-full transition-colors ${
                !currentCall.isVideoOn 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            title={currentCall.isVideoOn ? 'Désactiver la caméra' : 'Activer la caméra'}
            >
              {currentCall.isVideoOn ? (
                <VideoCameraIcon className="h-6 w-6" />
              ) : (
                <VideoCameraSlashIcon className="h-6 w-6" />
              )}
            </button>
          )}

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-colors ${
              currentCall.isScreenSharing 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={currentCall.isScreenSharing ? 'Arrêter le partage' : 'Partager l\'écran'}
          >
            <ComputerDesktopIcon className="h-6 w-6" />
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <PhoneIcon className="h-6 w-6 transform rotate-135" />
          </button>
        </div>
      </div>
    </div>
  );
}