'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTyping } from '../../contexts/typing-context';
import { useReadStatus } from '../../contexts/read-status-context';
import { useCall } from '../../contexts/call-context';
import EmojiPicker from '../emoji-picker';
import CallInterface from '../call-interface';
import IncomingCallModal from '../incoming-call-modal';
import {
  PhoneIcon,
  VideoCameraIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';
import {
  Message,
  ChatProps,
  ChatConfig
} from './types';

const defaultConfig: ChatConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv', 'application/json', 'text/xml', 'text/html', 'text/css',
    'text/javascript', 'application/javascript', 'text/typescript', 'application/typescript',
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    'video/mp4', 'video/avi', 'video/quicktime', 'video/webm',
    'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'
  ],
  availableEmojis: ['👍', '❤️', '😊', '😂', '😮', '😢', '👎', '👋', '🎉', '🔥', '✅', '📅'],
  enableFileUpload: true,
  enableReactions: true,
  enableCalls: true,
  enablePinning: true,
  enableDeletion: true,
  theme: 'auto'
};

export default function Chat({
  conversationId,
  conversation,
  pinnedConversations = new Set(),
  callbacks = {},
  config = {},
  className = '',
  currentUser = 'Moi',
  emptyState
}: ChatProps) {
  const finalConfig = { ...defaultConfig, ...config };
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(conversation?.messages || []);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });
  const [emojiPickerMessage, setEmojiPickerMessage] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'connecting' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getTypingUsers, startTyping, stopTyping, clearConversation } = useTyping();
  const { markAsRead } = useReadStatus();
  const { 
    startCall, 
    currentCall, 
    incomingCall
  } = useCall();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMessages(conversation?.messages || []);
    if (conversationId) {
      clearConversation(conversationId);
    }
    setCallStatus('idle');
    setCallDuration(0);
  }, [conversation, conversationId, clearConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  useEffect(() => {
    if (currentCall) {
      setCallStatus('connected');
    } else if (incomingCall) {
      setCallStatus('ringing');
    } else {
      setCallStatus('idle');
    }
  }, [currentCall, incomingCall]);

  const handleCallStart = async (type: 'audio' | 'video') => {
    if (!conversationId || !finalConfig.enableCalls) return;
    
    setCallStatus('connecting');
    startCall(type, conversation?.name || '', conversationId);
    callbacks.onCallStart?.(type, conversationId);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (conversationId && callStatus === 'idle' && finalConfig.enableCalls) {
        if (e.ctrlKey && e.key === 'a') {
          e.preventDefault();
          handleCallStart('audio');
        } else if (e.ctrlKey && e.key === 'v') {
          e.preventDefault();
          handleCallStart('video');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversationId, callStatus, finalConfig.enableCalls, handleCallStart]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'p' && conversationId && finalConfig.enablePinning) {
        e.preventDefault();
        handleTogglePinConversation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversationId, pinnedConversations, finalConfig.enablePinning]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachedFile) && conversationId) {
      const messageType = attachedFile ? 
        (attachedFile.type.startsWith('image/') ? 'image' : 'file') : 'text';
      
      const newMessage: Message = {
        id: Date.now().toString(),
        content: message.trim() || (attachedFile ? `Fichier joint : ${attachedFile.name}` : ''),
        sender: currentUser,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        type: messageType,
        fileName: attachedFile?.name,
        fileSize: attachedFile ? formatFileSize(attachedFile.size) : undefined,
        fileType: attachedFile?.type
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      setAttachedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (conversationId) {
        stopTyping('current-user', conversationId);
      }
      callbacks.onSendMessage?.({
        content: newMessage.content,
        sender: newMessage.sender,
        type: newMessage.type,
        fileName: newMessage.fileName,
        fileSize: newMessage.fileSize,
        fileType: newMessage.fileType
      });
    }
  };

  const handleTogglePinConversation = () => {
    if (conversationId && finalConfig.enablePinning) {
      callbacks.onTogglePin?.(conversationId);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!finalConfig.enableDeletion) return;
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isDeleted: true, content: '', fileName: undefined, fileSize: undefined, fileType: undefined, reactions: [] }
        : msg
    ));
    callbacks.onDeleteMessage?.(messageId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    if (newValue.trim() && conversationId) {
      if (conversationId) {
        callbacks.onTypingStart?.(conversationId);
      }
      
      if (Math.random() > 0.8 && conversation) {
        if (conversation.type === 'direct') {
          startTyping('other-user', conversation.name, conversationId);
        } else if (conversation.type === 'group' && conversation.participants) {
          const randomParticipant = conversation.participants[Math.floor(Math.random() * conversation.participants.length)];
          startTyping(randomParticipant, randomParticipant, conversationId);
        }
      }
    } else if (conversationId) {
      callbacks.onTypingStop?.(conversationId);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!finalConfig.enableReactions) return;
    
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
          if (existingReaction) {
            if (existingReaction.users.includes(currentUser)) {
              return {
                ...msg,
                reactions: msg.reactions?.map(r => 
                  r.emoji === emoji 
                    ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== currentUser) }
                    : r
                ).filter(r => r.count > 0)
              };
            } else {
              return {
                ...msg,
                reactions: msg.reactions?.map(r => 
                  r.emoji === emoji 
                    ? { ...r, count: r.count + 1, users: [...r.users, currentUser] }
                    : r
                )
              };
            }
          } else {
            return {
              ...msg,
              reactions: [...(msg.reactions || []), { emoji, count: 1, users: [currentUser] }]
            };
          }
        }
        return msg;
      })
    );
    setHoveredMessage(null);
    callbacks.onReaction?.(messageId, emoji);
  };

  const handleEmojiPickerOpen = () => {
    if (emojiButtonRef.current) {
      const rect = emojiButtonRef.current.getBoundingClientRect();
      const pickerWidth = 320;
      const pickerHeight = 400;
      
      let left = rect.left;
      let top = rect.top - pickerHeight - 10;
      
      if (left + pickerWidth > window.innerWidth) {
        left = window.innerWidth - pickerWidth - 10;
      }
      
      if (left < 10) {
        left = 10;
      }
      
      if (top < 10) {
        top = rect.bottom + 10;
      }
      
      setEmojiPickerPosition({ top, left });
      setShowEmojiPicker(true);
      setEmojiPickerMessage(null);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };



  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!finalConfig.enableFileUpload) return;
    
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > (finalConfig.maxFileSize || 10 * 1024 * 1024)) {
        alert(`Le fichier est trop volumineux. Taille maximale : ${formatFileSize(finalConfig.maxFileSize || 10 * 1024 * 1024)}`);
        return;
      }
      
      if (finalConfig.allowedFileTypes && !finalConfig.allowedFileTypes.includes(file.type)) {
        alert('Type de fichier non supporté.');
        return;
      }
      
      setAttachedFile(file);
      callbacks.onFileUpload?.(file);
    }
  };

  const handleFileRemove = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'].includes(extension || '')) {
      return '🖼️';
    } else if (['svg'].includes(extension || '')) {
      return '🎨';
    } else if (['pdf'].includes(extension || '')) {
      return '📄';
    } else if (['doc', 'docx'].includes(extension || '')) {
      return '📝';
    } else if (['xls', 'xlsx'].includes(extension || '')) {
      return '📊';
    } else if (['ppt', 'pptx'].includes(extension || '')) {
      return '📈';
    } else if (['txt'].includes(extension || '')) {
      return '📃';
    } else if (['js', 'jsx', 'ts', 'tsx'].includes(extension || '')) {
      return '⚡';
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return '🗜️';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension || '')) {
      return '🎬';
    } else if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].includes(extension || '')) {
      return '🎵';
    } else {
      return '📎';
    }
  };

  if (!conversationId) {
    return (
      <div className={`flex-1 flex items-center justify-center bg-surface h-full ${className}`}>
        {emptyState || (
          <div className="text-center">
            <div className="w-24 h-24 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneIcon className="h-12 w-12 text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">Sélectionnez une conversation</h3>
            <p className="text-secondary">Choisissez une conversation pour commencer à discuter</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col h-full bg-surface min-h-0 ${className}`}>
      {/* Chat Header */}
      <div className="flex-shrink-0 h-16 bg-surface-elevated border-b border-theme flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {conversation?.name.split(' ').map(n => n[0]).join('') || '??'}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-primary">{conversation?.name || 'Conversation'}</h3>
              {callStatus !== 'idle' && (
                <div className="flex items-center space-x-1">
                  {callStatus === 'ringing' && (
                    <>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">Sonnerie...</span>
                    </>
                  )}
                  {callStatus === 'connecting' && (
                    <>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-spin"></div>
                      <span className="text-xs text-blue-600 dark:text-blue-400">Connexion...</span>
                    </>
                  )}
                  {callStatus === 'connected' && (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 dark:text-green-400">{formatCallDuration(callDuration)}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-secondary">
              {conversation?.type === 'group' 
                ? `${conversation.participants?.length || 0} participants`
                : callStatus === 'connected' ? 'En appel' : 'En ligne'
              }
            </p>
          </div>
        </div>

        {/* VoIP Controls */}
        <div className="flex items-center space-x-2">
          {finalConfig.enableCalls && (
            <>
              <button 
                onClick={() => handleCallStart('audio')}
                disabled={callStatus !== 'idle'}
                className={`relative p-3 rounded-full transition-all duration-200 group transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${
                  callStatus === 'idle' 
                    ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700' 
                    : 'bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                }`}
                title={callStatus === 'idle' ? 'Appel audio (Ctrl+A)' : 'Appel en cours'}
              >
                <div className="absolute inset-0 rounded-full bg-gray-400 opacity-0 group-hover:opacity-20 animate-ping"></div>
                <PhoneIcon className={`h-5 w-5 relative z-10 ${
                  callStatus === 'idle' 
                    ? 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300' 
                    : 'text-gray-400'
                }`} />
              </button>
              <button 
                onClick={() => handleCallStart('video')}
                disabled={callStatus !== 'idle'}
                className={`relative p-3 rounded-full transition-all duration-200 group transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${
                  callStatus === 'idle' 
                    ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700' 
                    : 'bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                }`}
                title={callStatus === 'idle' ? 'Appel vidéo (Ctrl+V)' : 'Appel en cours'}
              >
                <div className="absolute inset-0 rounded-full bg-gray-400 opacity-0 group-hover:opacity-20 animate-ping"></div>
                <VideoCameraIcon className={`h-5 w-5 relative z-10 ${
                  callStatus === 'idle' 
                    ? 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300' 
                    : 'text-gray-400'
                }`} />
              </button>
            </>
          )}
          {finalConfig.enablePinning && (
            <button 
              onClick={handleTogglePinConversation}
              disabled={!conversationId}
              className={`p-2 rounded-lg hover:bg-surface transition-colors group disabled:opacity-50 disabled:cursor-not-allowed ${
                pinnedConversations.has(conversationId || '') ? 'text-accent' : 'text-secondary'
              }`}
              title={pinnedConversations.has(conversationId || '') ? 'Désépingler la conversation' : 'Épingler la conversation'}
            >
              <svg className="h-5 w-5 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`relative group max-w-xs lg:max-w-md px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                  msg.isOwn
                    ? 'bg-accent text-white'
                    : 'bg-surface-elevated text-primary border border-theme'
                }`}
                onMouseEnter={() => {
                  setHoveredMessage(msg.id);
                  if (!msg.isOwn && conversationId) {
                    markAsRead(conversationId, msg.id);
                    callbacks.onMessageRead?.(conversationId, msg.id);
                  }
                }}
                onMouseLeave={() => {
                  setTimeout(() => {
                    if (!showEmojiPicker || emojiPickerMessage !== msg.id) {
                      setHoveredMessage(null);
                    }
                  }, 150);
                }}
              >
                {!msg.isOwn && (
                  <p className="text-xs font-medium mb-1 opacity-70">{msg.sender}</p>
                )}
                
                {msg.isDeleted ? (
                  <div className={`flex items-center space-x-2 text-sm ${
                    msg.isOwn ? 'text-blue-100' : 'text-secondary'
                  }`}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                    </svg>
                    <span className="italic">Ce message a été supprimé</span>
                  </div>
                ) : (
                  <>
                    {msg.content && msg.content !== `Fichier joint : ${msg.fileName}` && (
                      <p className="text-sm mb-2">{msg.content}</p>
                    )}
                    
                    {msg.type === 'file' && msg.fileName && (
                      <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                        msg.isOwn ? 'bg-blue-700/30' : 'bg-surface border border-theme'
                      }`}>
                        <span className="text-2xl">{getFileIcon(msg.fileName)}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            msg.isOwn ? 'text-white' : 'text-primary'
                          }`}>{msg.fileName}</p>
                          {msg.fileSize && (
                            <p className={`text-xs ${
                              msg.isOwn ? 'text-blue-100' : 'text-secondary'
                            }`}>{msg.fileSize}</p>
                          )}
                        </div>
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            msg.isOwn 
                              ? 'hover:bg-blue-600/50 text-blue-100' 
                              : 'hover:bg-surface-elevated text-secondary'
                          }`}
                          title="Télécharger"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {msg.type === 'image' && msg.fileName && (
                      <div className="mt-2">
                        <img 
                          src={`/${msg.fileName}`} 
                          alt={msg.fileName}
                          className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            console.log('Open image:', msg.fileName);
                          }}
                        />
                      </div>
                    )}
                    
                    <p className={`text-xs mt-1 ${msg.isOwn ? 'text-blue-100' : 'text-secondary'}`}>
                      {msg.timestamp}
                    </p>

                    {finalConfig.enableReactions && msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {msg.reactions.map((reaction, index) => (
                          <button
                            key={index}
                            onClick={() => handleReaction(msg.id, reaction.emoji)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                              reaction.users.includes(currentUser)
                                ? msg.isOwn 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-accent text-white'
                                : msg.isOwn
                                  ? 'bg-blue-800 text-blue-100 hover:bg-blue-700'
                                  : 'bg-surface text-secondary hover:bg-surface-elevated'
                            }`}
                          >
                            <span>{reaction.emoji}</span>
                            <span>{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {hoveredMessage === msg.id && (
                      <div 
                        className={`absolute bottom-full mb-2 ${
                          msg.isOwn ? 'right-0' : 'left-0'
                        } bg-surface-elevated border border-theme rounded-lg shadow-lg p-2 flex space-x-1 z-20`}
                        onMouseEnter={() => setHoveredMessage(msg.id)}
                        onMouseLeave={() => {
                          setTimeout(() => {
                            if (!showEmojiPicker || emojiPickerMessage !== msg.id) {
                              setHoveredMessage(null);
                            }
                          }, 100);
                        }}
                      >
                        {finalConfig.enableReactions && finalConfig.availableEmojis?.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg.id, emoji)}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface transition-colors text-lg hover:scale-125"
                            title={`Réagir avec ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                        {finalConfig.enableReactions && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setEmojiPickerPosition({
                                top: rect.top - 320,
                                left: rect.left
                              });
                              setEmojiPickerMessage(msg.id);
                              setShowEmojiPicker(true);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface transition-colors text-xs font-bold"
                            title="Plus d'émojis"
                          >
                            +
                          </button>
                        )}
                        {msg.isOwn && !msg.isDeleted && finalConfig.enableDeletion && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
                                handleDeleteMessage(msg.id);
                              }
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-xs"
                            title="Supprimer le message"
                          >
                            <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {conversationId && (() => {
          try {
            const typingUsers = getTypingUsers(conversationId);
            if (typingUsers.length > 0) {
              return (
                <div className="px-6 py-2 animate-fadeIn">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-secondary">
                      {typingUsers.length === 1 
                        ? `${typingUsers[0].name} écrit...`
                        : typingUsers.length === 2
                        ? `${typingUsers[0].name} et ${typingUsers[1].name} écrivent...`
                        : `${typingUsers.length} personnes écrivent...`
                      }
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          } catch {
            return null;
          }
        })()}

        {/* Message Input */}
        <div className="flex-shrink-0 border-t border-theme bg-surface p-4">
          {attachedFile && (
            <div className="mb-2 flex items-center justify-between p-2 bg-surface-elevated/50 border border-theme/50 rounded-lg">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <span className="text-lg">{getFileIcon(attachedFile.name)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-primary truncate">{attachedFile.name}</p>
                  <p className="text-xs text-secondary">{formatFileSize(attachedFile.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFileRemove}
                className="p-1 rounded hover:bg-surface transition-colors flex-shrink-0"
                title="Retirer le fichier"
              >
                <svg className="h-3 w-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            {finalConfig.enableFileUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept={finalConfig.allowedFileTypes?.join(',')}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg hover:bg-surface-elevated transition-colors relative"
                  title="Joindre un fichier"
                >
                  <PaperClipIcon className="h-5 w-5 text-secondary" />
                  {attachedFile && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></div>
                  )}
                </button>
              </>
            )}
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={handleInputChange}
                placeholder="Tapez un message..."
                className="w-full px-4 py-2 pr-16 bg-surface-elevated border border-theme rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <button
                ref={emojiButtonRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEmojiPickerOpen();
                }}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-surface transition-colors z-10"
                title="Ajouter un émoji"
              >
                <FaceSmileIcon className="h-5 w-5 text-secondary" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!message.trim() && !attachedFile}
              className="p-2 rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={message.trim() || attachedFile ? 'Envoyer le message' : 'Tapez un message ou joignez un fichier'}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <EmojiPicker
              onEmojiSelect={(emoji) => {
                if (emojiPickerMessage) {
                  handleReaction(emojiPickerMessage, emoji);
                } else if (hoveredMessage) {
                  handleReaction(hoveredMessage, emoji);
                } else {
                  handleEmojiSelect(emoji);
                }
                setShowEmojiPicker(false);
                setEmojiPickerMessage(null);
              }}
              onClose={() => {
                setShowEmojiPicker(false);
                setEmojiPickerMessage(null);
                setHoveredMessage(null);
              }}
              position={emojiPickerPosition}
            />
          </div>
        </div>
      )}

      {/* Call Interface */}
      <CallInterface />

      {/* Incoming Call Modal */}
      <IncomingCallModal />
    </div>
  );
}