'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTyping } from '../contexts/typing-context';
import { useReadStatus } from '../contexts/read-status-context';
import { useCall } from '../contexts/call-context';
import EmojiPicker from './emoji-picker';
import CallInterface from './call-interface';
import IncomingCallModal from './incoming-call-modal';
import ChatHeader from './chat-header';
import {
  PhoneIcon,
  VideoCameraIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isOwn: boolean;
  type: 'text' | 'file' | 'image';
  reactions?: { emoji: string; count: number; users: string[] }[];
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  isPinned?: boolean;
  isDeleted?: boolean;
}

interface DirectChatProps {
  conversationId: string | null;
  pinnedConversations?: Set<string>;
  setPinnedConversations?: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const conversationsData: { [key: string]: { name: string; messages: Message[]; type: 'direct' | 'group'; participants?: string[] } } = {
  '1': {
    name: 'Alice Dubois',
    type: 'direct',
    messages: [
      {
        id: '1',
        content: 'Salut ! Comment ça va aujourd\'hui ?',
        sender: 'Alice Dubois',
        timestamp: '14:15',
        isOwn: false,
        type: 'text',
        reactions: [{ emoji: '👋', count: 1, users: ['Moi'] }]
      },
      {
        id: '2',
        content: 'Bonjour Alice ! Ça va bien, merci. Et toi ?',
        sender: 'Moi',
        timestamp: '14:20',
        isOwn: true,
        type: 'text',
        reactions: [{ emoji: '😊', count: 1, users: ['Alice Dubois'] }]
      },
      {
        id: '3',
        content: 'Super ! On se voit cet après-midi ?',
        sender: 'Alice Dubois',
        timestamp: '14:30',
        isOwn: false,
        type: 'text'
      }
    ]
  },
  '2': {
    name: 'Équipe Projet',
    type: 'group',
    participants: ['Alice', 'Bob', 'Charlie', 'David'],
    messages: [
      {
        id: '1',
        content: 'Bonjour équipe ! Réunion à 15h aujourd\'hui',
        sender: 'Bob',
        timestamp: '13:30',
        isOwn: false,
        type: 'text',
        reactions: [
          { emoji: '👍', count: 3, users: ['Moi', 'Alice', 'Charlie'] },
          { emoji: '📅', count: 2, users: ['David', 'Bob'] }
        ]
      },
      {
        id: '2',
        content: 'Présent !',
        sender: 'Moi',
        timestamp: '13:35',
        isOwn: true,
        type: 'text'
      },
      {
        id: '3',
        content: 'La réunion est confirmée pour 15h',
        sender: 'Bob',
        timestamp: '13:45',
        isOwn: false,
        type: 'text'
      }
    ]
  },
  '3': {
    name: 'Charlie Martin',
    type: 'direct',
    messages: [
      {
        id: '1',
        content: 'Salut ! Peux-tu regarder le rapport que je t\'ai envoyé ?',
        sender: 'Charlie Martin',
        timestamp: 'Hier',
        isOwn: false,
        type: 'text'
      },
      {
        id: '2',
        content: 'rapport.pdf',
        sender: 'Charlie Martin',
        timestamp: 'Hier',
        isOwn: false,
        type: 'file',
        fileName: 'rapport.pdf',
        fileSize: '2.4 MB'
      }
    ]
  }
};

export default function DirectChat({ conversationId, pinnedConversations = new Set(), setPinnedConversations }: DirectChatProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
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
  const { startCall, currentCall, incomingCall } = useCall();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (conversationId) {
      setMessages(conversationsData[conversationId]?.messages || []);
    } else {
      setMessages([]);
    }
    
    if (conversationId) {
      clearConversation(conversationId);
    }
    
    setCallStatus('idle');
    setCallDuration(0);
  }, [conversationId, clearConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachedFile) && conversationId) {
      const messageType = attachedFile ? 
        (attachedFile.type.startsWith('image/') ? 'image' : 'file') : 'text';
      
      const newMessage: Message = {
        id: Date.now().toString(),
        content: message.trim() || (attachedFile ? `Fichier joint : ${attachedFile.name}` : ''),
        sender: 'Moi',
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
      stopTyping('current-user', conversationId);
    }
  }, [message, attachedFile, conversationId, stopTyping]);

  const handleTogglePinConversation = useCallback(() => {
    if (conversationId && setPinnedConversations) {
      setPinnedConversations(prev => {
        const newSet = new Set(prev);
        if (newSet.has(conversationId)) {
          newSet.delete(conversationId);
        } else {
          newSet.add(conversationId);
        }
        return newSet;
      });
    }
  }, [conversationId, setPinnedConversations]);

  const handleDeleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isDeleted: true, content: '', fileName: undefined, fileSize: undefined, fileType: undefined, reactions: [] }
        : msg
    ));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    if (newValue.trim() && conversationId) {
      if (Math.random() > 0.8) {
        const conversation = conversationsData[conversationId as string];
        if (conversation?.type === 'direct') {
          startTyping('other-user', conversation.name, conversationId);
        } else if (conversation?.type === 'group' && conversation.participants) {
          const randomParticipant = conversation.participants[Math.floor(Math.random() * conversation.participants.length)];
          startTyping(randomParticipant, randomParticipant, conversationId);
        }
      }
    }
  }, [conversationId, startTyping]);

  const handleReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
          if (existingReaction) {
            if (existingReaction.users.includes('Moi')) {
              return {
                ...msg,
                reactions: msg.reactions?.map(r => 
                  r.emoji === emoji 
                    ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== 'Moi') }
                    : r
                ).filter(r => r.count > 0)
              };
            } else {
              return {
                ...msg,
                reactions: msg.reactions?.map(r => 
                  r.emoji === emoji 
                    ? { ...r, count: r.count + 1, users: [...r.users, 'Moi'] }
                    : r
                )
              };
            }
          } else {
            return {
              ...msg,
              reactions: [...(msg.reactions || []), { emoji, count: 1, users: ['Moi'] }]
            };
          }
        }
        return msg;
      })
    );
    setHoveredMessage(null);
  }, []);

  const availableEmojis = useMemo(() => ['👍', '❤️', '😊', '😂', '😮', '😢', '👎', '👋', '🎉', '🔥', '✅', '📅'], []);

  const handleEmojiPickerOpen = useCallback(() => {
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
  }, []);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  }, []);

  const handleCallStart = useCallback(async (type: 'audio' | 'video') => {
    if (!conversationId) return;
    
    setCallStatus('connecting');
    startCall(type, conversationsData[conversationId as string]?.name || '', conversationId || '');
  }, [conversationId, startCall]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximale : 10MB');
        return;
      }
      
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'application/pdf', 'text/plain', 'application/json',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'video/mp4', 'audio/mpeg', 'application/zip'
      ];
      
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|gif|webp|svg|pdf|txt|json|doc|docx|xls|xlsx|mp4|mp3|zip)$/i)) {
        alert('Type de fichier non supporté');
        return;
      }
      
      setAttachedFile(file);
    }
  }, []);

  const handleFileRemove = useCallback(() => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getFileIcon = useCallback((fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return '🖼️';
    if (['pdf'].includes(extension || '')) return '📄';
    if (['doc', 'docx'].includes(extension || '')) return '📝';
    if (['xls', 'xlsx'].includes(extension || '')) return '📊';
    if (['txt'].includes(extension || '')) return '📃';
    if (['json'].includes(extension || '')) return '📦';
    if (['mp4'].includes(extension || '')) return '🎬';
    if (['mp3'].includes(extension || '')) return '🎵';
    if (['zip'].includes(extension || '')) return '🗜️';
    
    return '📎';
  }, []);

  const formatCallDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }, []);

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface h-full overflow-hidden">
        <div className="text-center">
          <div className="w-24 h-24 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneIcon className="h-12 w-12 text-secondary" />
          </div>
          <h3 className="text-lg font-medium text-primary mb-2">Sélectionnez une conversation</h3>
          <p className="text-secondary">Choisissez une conversation pour commencer à discuter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-surface h-full overflow-hidden">
      {/* Chat Header */}
      <div className="h-16 bg-surface-elevated border-b border-theme flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-10 h-10 relative">
              {conversationsData[conversationId as string]?.type === 'group' ? (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.448 0A5.002 5.002 0 0112 14.586m0 0a5.002 5.002 0 019.448 0" />
                  </svg>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm relative overflow-hidden">
                  <span className="text-white font-semibold text-sm">
                    {getInitials(conversationsData[conversationId as string]?.name || '??')}
                  </span>
                  <div className="absolute inset-0 bg-white/10"></div>
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-surface shadow-sm"></div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-primary truncate">
                {conversationsData[conversationId as string]?.name || 'Conversation'}
              </h3>
              {callStatus !== 'idle' && (
                <div className="flex items-center space-x-1.5 px-2 py-1 bg-surface rounded-full">
                  {callStatus === 'ringing' && (
                    <>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-yellow-600 font-medium">Sonnerie...</span>
                    </>
                  )}
                  {callStatus === 'connecting' && (
                    <>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-spin"></div>
                      <span className="text-xs text-blue-600 font-medium">Connexion...</span>
                    </>
                  )}
                  {callStatus === 'connected' && (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">{formatCallDuration(callDuration)}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-secondary">
              {conversationsData[conversationId as string]?.type === 'group' 
                ? `${conversationsData[conversationId as string]?.participants?.length || 0} participants`
                : callStatus === 'connected' ? 'En appel' : 'En ligne'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleCallStart('audio')}
            disabled={callStatus !== 'idle'}
            className={`p-3 rounded-full transition-all duration-200 ${
              callStatus === 'idle' 
                ? 'hover:bg-surface-elevated' 
                : 'opacity-50 cursor-not-allowed'
            }`}
            title="Appel audio"
          >
            <PhoneIcon className={`h-5 w-5 ${
              callStatus === 'idle' ? 'text-secondary' : 'text-secondary/50'
            }`} />
          </button>
          <button 
            onClick={() => handleCallStart('video')}
            disabled={callStatus !== 'idle'}
            className={`p-3 rounded-full transition-all duration-200 ${
              callStatus === 'idle' 
                ? 'hover:bg-surface-elevated' 
                : 'opacity-50 cursor-not-allowed'
            }`}
            title="Appel vidéo"
          >
            <VideoCameraIcon className={`h-5 w-5 ${
              callStatus === 'idle' ? 'text-secondary' : 'text-secondary/50'
            }`} />
          </button>
          <button 
            onClick={handleTogglePinConversation}
            className={`p-2 rounded-lg hover:bg-surface transition-colors ${
              pinnedConversations.has(conversationId || '') ? 'text-accent' : 'text-secondary'
            }`}
            title={pinnedConversations.has(conversationId || '') ? 'Désépingler' : 'Épingler'}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`relative group max-w-xs lg:max-w-md px-4 py-3 rounded-2xl transition-all duration-200 ${
                msg.isOwn
                  ? 'bg-accent text-white rounded-br-none'
                  : 'bg-surface-elevated text-primary border border-theme/50 rounded-bl-none'
              }`}
              onMouseEnter={() => {
                setHoveredMessage(msg.id);
                if (!msg.isOwn && conversationId) {
                  markAsRead(conversationId, msg.id);
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
                        onClick={() => console.log('Open image:', msg.fileName)}
                      />
                    </div>
                  )}
                  
                  <p className={`text-xs mt-1 ${msg.isOwn ? 'text-blue-100' : 'text-secondary'}`}>
                    {msg.timestamp}
                  </p>

                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {msg.reactions.map((reaction, index) => (
                        <button
                          key={index}
                          onClick={() => handleReaction(msg.id, reaction.emoji)}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                            reaction.users.includes('Moi')
                              ? msg.isOwn 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-accent text-white'
                              : msg.isOwn
                                ? 'bg-blue-800 text-blue-100'
                                : 'bg-surface text-secondary'
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
                      {availableEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface transition-colors text-lg hover:scale-125"
                          title={`Réagir avec ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
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
                      {msg.isOwn && !msg.isDeleted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
                              handleDeleteMessage(msg.id);
                            }
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-100 transition-colors text-xs"
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
              <div className="px-6 py-2">
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
      <div className="border-t border-theme p-4">
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
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.json,.zip,.mp4,.mp3"
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
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
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