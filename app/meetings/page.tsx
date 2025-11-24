'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Users, Video, Plus, ChevronLeft, ChevronRight, Search, Filter, MoreVertical, Bell, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { cn } from '../lib/utils';

interface Meeting {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  participants: Array<{ id: string; name: string; avatar?: string; status: 'confirmed' | 'pending' | 'declined' }>;
  type: 'video' | 'audio' | 'in-person';
  description?: string;
  location?: string;
  isRecurring?: boolean;
  recording?: boolean;
}

interface NewMeeting {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  type: 'video' | 'audio' | 'in-person';
  location: string;
  participants: Array<{ id: string; name: string; email: string; status: 'pending' }>;
  isRecurring: boolean;
  recurringPattern: 'daily' | 'weekly' | 'monthly' | 'none';
  reminder: boolean;
  reminderTime: number;
}

type ViewMode = 'day' | 'week' | 'month' | 'list';

export default function MeetingsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Mock data for meetings
  const mockMeetings: Meeting[] = [
    {
      id: '1',
      title: 'Réunion d\'équipe - Sprint Planning',
      startTime: new Date(2025, 10, 24, 10, 0),
      endTime: new Date(2025, 10, 24, 11, 30),
      participants: [
        { id: '1', name: 'Alice Martin', status: 'confirmed' },
        { id: '2', name: 'Bob Dupont', status: 'confirmed' },
        { id: '3', name: 'Claire Durand', status: 'pending' }
      ],
      type: 'video',
      description: 'Planification du prochain sprint',
      isRecurring: true
    },
    {
      id: '2',
      title: 'Appel client - Projet Aether',
      startTime: new Date(2025, 10, 24, 14, 0),
      endTime: new Date(2025, 10, 24, 15, 0),
      participants: [
        { id: '4', name: 'David Bernard', status: 'confirmed' },
        { id: '5', name: 'Eva Petit', status: 'confirmed' }
      ],
      type: 'video',
      description: 'Discussion des besoins client'
    },
    {
      id: '3',
      title: 'Révision code - Module Auth',
      startTime: new Date(2025, 10, 25, 9, 0),
      endTime: new Date(2025, 10, 25, 10, 0),
      participants: [
        { id: '6', name: 'Frank Lemoine', status: 'confirmed' }
      ],
      type: 'audio',
      description: 'Code review du module d\'authentification'
    }
  ];

  const [newMeeting, setNewMeeting] = useState<NewMeeting>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    type: 'video',
    location: '',
    participants: [],
    isRecurring: false,
    recurringPattern: 'none',
    reminder: true,
    reminderTime: 15
  });
  const [participantInput, setParticipantInput] = useState('');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'reminder' | 'meeting_start' | 'invitation';
    title: string;
    message: string;
    time: Date;
    read: boolean;
  }>>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'video' | 'audio' | 'in-person',
    status: 'all' as 'all' | 'upcoming' | 'past' | 'today',
    participant: ''
  });
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);

  const getWeekDays = () => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime);
      const matchesDate = meetingDate.toDateString() === date.toDateString();
      
      if (!matchesDate) return false;
      
      // Apply filters
      if (filters.type !== 'all' && meeting.type !== filters.type) return false;
      
      const now = new Date();
      if (filters.status === 'upcoming' && meeting.endTime < now) return false;
      if (filters.status === 'past' && meeting.startTime > now) return false;
      if (filters.status === 'today' && meetingDate.toDateString() !== now.toDateString()) return false;
      
      if (filters.participant && !meeting.participants.some(p => 
        p.name.toLowerCase().includes(filters.participant.toLowerCase())
      )) return false;
      
      return true;
    });
  };

  const getFilteredMeetings = () => {
    return meetings.filter(meeting => {
      // Apply search
      if (searchQuery && !meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !meeting.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply filters
      if (filters.type !== 'all' && meeting.type !== filters.type) return false;
      
      const now = new Date();
      if (filters.status === 'upcoming' && meeting.endTime < now) return false;
      if (filters.status === 'past' && meeting.startTime > now) return false;
      if (filters.status === 'today' && new Date(meeting.startTime).toDateString() !== now.toDateString()) return false;
      
      if (filters.participant && !meeting.participants.some(p => 
        p.name.toLowerCase().includes(filters.participant.toLowerCase())
      )) return false;
      
      return true;
    });
  };

  const MeetingCard = ({ meeting, compact = false }: { meeting: Meeting; compact?: boolean }) => (
    <div 
      className={cn(
        "bg-surface-elevated border border-theme rounded-lg p-3 cursor-pointer hover:border-accent transition-all duration-200",
        compact ? "mb-2" : "mb-3"
      )}
      onClick={() => setSelectedMeeting(meeting)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className={cn("font-medium text-primary", compact ? "text-sm" : "text-base")}>
            {meeting.title}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-secondary flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
            </span>
            <span className="text-xs text-secondary flex items-center gap-1">
              <Users className="h-3 w-3" />
              {meeting.participants.length}
            </span>
            {meeting.type === 'video' && (
              <Video className="h-3 w-3 text-accent" />
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" className="h-6 w-6">
          <MoreVertical className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Zone principale - Calendrier */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-theme p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-primary">Réunions</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
                  Aujourd'hui
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
                <Input
                  placeholder="Rechercher une réunion..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
                
                {showFilters && (
                  <div className="absolute top-full mt-2 w-64 bg-surface-elevated border border-theme rounded-lg shadow-lg p-4 z-50">
                    <h4 className="font-medium text-primary mb-3">Filtrer les réunions</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-primary">Type</label>
                        <Select value={filters.type} onValueChange={(value: 'all' | 'video' | 'audio' | 'in-person') => setFilters({...filters, type: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous les types</SelectItem>
                            <SelectItem value="video">Visioconférence</SelectItem>
                            <SelectItem value="audio">Audio uniquement</SelectItem>
                            <SelectItem value="in-person">En personne</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-primary">Statut</label>
                        <Select value={filters.status} onValueChange={(value: 'all' | 'upcoming' | 'past' | 'today') => setFilters({...filters, status: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Toutes</SelectItem>
                            <SelectItem value="upcoming">À venir</SelectItem>
                            <SelectItem value="past">Passées</SelectItem>
                            <SelectItem value="today">Aujourd'hui</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-primary">Participant</label>
                        <Input
                          placeholder="Nom ou email..."
                          value={filters.participant}
                          onChange={(e) => setFilters({...filters, participant: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setFilters({ type: 'all', status: 'all', participant: '' })}
                        >
                          Réinitialiser
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setShowFilters(false)}
                        >
                          Appliquer
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Button>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle réunion
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle réunion</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Informations de base</TabsTrigger>
                      <TabsTrigger value="participants">Participants</TabsTrigger>
                      <TabsTrigger value="advanced">Options avancées</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-primary">Titre de la réunion</label>
                          <Input
                            placeholder="Entrez le titre de la réunion"
                            value={newMeeting.title}
                            onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-primary">Date</label>
                          <Input
                            type="date"
                            value={newMeeting.date}
                            onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-primary">Type</label>
                          <Select value={newMeeting.type} onValueChange={(value: 'video' | 'audio' | 'in-person') => setNewMeeting({...newMeeting, type: value})}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">Visioconférence</SelectItem>
                              <SelectItem value="audio">Audio uniquement</SelectItem>
                              <SelectItem value="in-person">En personne</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-primary">Heure de début</label>
                          <Input
                            type="time"
                            value={newMeeting.startTime}
                            onChange={(e) => setNewMeeting({...newMeeting, startTime: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-primary">Heure de fin</label>
                          <Input
                            type="time"
                            value={newMeeting.endTime}
                            onChange={(e) => setNewMeeting({...newMeeting, endTime: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        
                        {newMeeting.type === 'in-person' && (
                          <div className="col-span-2">
                            <label className="text-sm font-medium text-primary">Lieu</label>
                            <Input
                              placeholder="Entrez le lieu de la réunion"
                              value={newMeeting.location}
                              onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                        )}
                        
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-primary">Description</label>
                          <Textarea
                            placeholder="Décrivez l'objet et les objectifs de la réunion"
                            value={newMeeting.description}
                            onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="participants" className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-primary">Ajouter des participants</label>
                        <div className="mt-2 flex gap-2">
                          <Input
                            placeholder="Entrez l'email ou le nom du participant"
                            value={participantInput}
                            onChange={(e) => setParticipantInput(e.target.value)}
                            className="flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && participantInput.trim()) {
                                const newParticipant = {
                                  id: Date.now().toString(),
                                  name: participantInput.includes('@') ? participantInput.split('@')[0] : participantInput,
                                  email: participantInput.includes('@') ? participantInput : `${participantInput}@example.com`,
                                  status: 'pending' as const
                                };
                                setNewMeeting({
                                  ...newMeeting,
                                  participants: [...newMeeting.participants, newParticipant]
                                });
                                setParticipantInput('');
                              }
                            }}
                          />
                          <Button 
                            variant="outline"
                            onClick={() => {
                              if (participantInput.trim()) {
                                const newParticipant = {
                                  id: Date.now().toString(),
                                  name: participantInput.includes('@') ? participantInput.split('@')[0] : participantInput,
                                  email: participantInput.includes('@') ? participantInput : `${participantInput}@example.com`,
                                  status: 'pending' as const
                                };
                                setNewMeeting({
                                  ...newMeeting,
                                  participants: [...newMeeting.participants, newParticipant]
                                });
                                setParticipantInput('');
                              }
                            }}
                          >
                            Ajouter
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-primary mb-2">Participants invités ({newMeeting.participants.length})</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {newMeeting.participants.length === 0 ? (
                            <div className="text-center py-4 text-secondary text-sm">
                              Aucun participant ajouté
                            </div>
                          ) : (
                            newMeeting.participants.map((participant) => (
                              <div key={participant.id} className="flex items-center justify-between p-2 bg-surface rounded-lg">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-accent">
                                      {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-sm text-primary block">{participant.name}</span>
                                    <span className="text-xs text-secondary">{participant.email}</span>
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setNewMeeting({
                                      ...newMeeting,
                                      participants: newMeeting.participants.filter(p => p.id !== participant.id)
                                    });
                                  }}
                                >
                                  Retirer
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="advanced" className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="recurring"
                            checked={newMeeting.isRecurring}
                            onCheckedChange={(checked) => setNewMeeting({...newMeeting, isRecurring: checked as boolean})}
                          />
                          <label htmlFor="recurring" className="text-sm font-medium text-primary">
                            Réunion récurrente
                          </label>
                        </div>
                        
                        {newMeeting.isRecurring && (
                          <div>
                            <label className="text-sm font-medium text-primary">Fréquence</label>
                            <Select value={newMeeting.recurringPattern} onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'none') => setNewMeeting({...newMeeting, recurringPattern: value})}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Quotidienne</SelectItem>
                                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                <SelectItem value="monthly">Mensuelle</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="reminder"
                            checked={newMeeting.reminder}
                            onCheckedChange={(checked) => setNewMeeting({...newMeeting, reminder: checked as boolean})}
                          />
                          <label htmlFor="reminder" className="text-sm font-medium text-primary">
                            Envoyer un rappel
                          </label>
                        </div>
                        
                        {newMeeting.reminder && (
                          <div>
                            <label className="text-sm font-medium text-primary">Temps avant le rappel</label>
                            <Select value={newMeeting.reminderTime.toString()} onValueChange={(value) => setNewMeeting({...newMeeting, reminderTime: parseInt(value)})}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 minutes</SelectItem>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 heure</SelectItem>
                                <SelectItem value="1440">1 jour</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end gap-2 pt-4 border-t border-theme">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Annuler
                    </Button>
                    <Button onClick={() => {
                      const createdMeeting: Meeting = {
                        id: Date.now().toString(),
                        title: newMeeting.title,
                        startTime: new Date(`${newMeeting.date}T${newMeeting.startTime}`),
                        endTime: new Date(`${newMeeting.date}T${newMeeting.endTime}`),
                        participants: newMeeting.participants.map(p => ({
                          id: p.id,
                          name: p.name,
                          status: 'pending' as const
                        })),
                        type: newMeeting.type,
                        description: newMeeting.description,
                        location: newMeeting.location,
                        isRecurring: newMeeting.isRecurring
                      };
                      
                      setMeetings([...meetings, createdMeeting]);
                      
                      // Add notification for new meeting
                      const notification = {
                        id: Date.now().toString(),
                        type: 'invitation' as const,
                        title: 'Nouvelle réunion créée',
                        message: `${createdMeeting.title} - ${formatDate(createdMeeting.startTime)}`,
                        time: new Date(),
                        read: false
                      };
                      setNotifications([...notifications, notification]);
                      
                      setShowCreateDialog(false);
                      
                      // Reset form
                      setNewMeeting({
                        title: '',
                        date: new Date().toISOString().split('T')[0],
                        startTime: '09:00',
                        endTime: '10:00',
                        description: '',
                        type: 'video',
                        location: '',
                        participants: [],
                        isRecurring: false,
                        recurringPattern: 'none',
                        reminder: true,
                        reminderTime: 15
                      });
                    }}>
                      Créer la réunion
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Sélecteur de vue */}
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Jour</SelectItem>
                <SelectItem value="week">Semaine</SelectItem>
                <SelectItem value="month">Mois</SelectItem>
                <SelectItem value="list">Liste</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-secondary">
              {formatDate(selectedDate)}
            </span>
          </div>
        </div>

        {/* Contenu du calendrier */}
        <div className="flex-1 overflow-auto p-4">
          {viewMode === 'week' && (
            <div className="grid grid-cols-8 gap-0 border border-theme rounded-lg overflow-hidden">
              {/* En-tête des jours */}
              <div className="bg-surface-elevated border-r border-theme p-2 text-center">
                <span className="text-xs text-secondary">Heure</span>
              </div>
              {getWeekDays().map((day, index) => (
                <div key={index} className="bg-surface-elevated border-r border-theme p-2 text-center">
                  <div className="text-xs text-secondary">
                    {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </div>
                  <div className={cn(
                    "text-sm font-medium",
                    day.toDateString() === new Date().toDateString() ? "text-accent" : "text-primary"
                  )}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
              
              {/* Grille horaire */}
              {getTimeSlots().map((time, timeIndex) => (
                <React.Fragment key={timeIndex}>
                  <div className="border-r border-b border-theme p-2 text-xs text-secondary">
                    {time}
                  </div>
                  {getWeekDays().map((day, dayIndex) => {
                    const dayMeetings = getMeetingsForDate(day);
                    const hourMeetings = dayMeetings.filter(m => {
                      const meetingHour = new Date(m.startTime).getHours();
                      return meetingHour === parseInt(time.split(':')[0]);
                    });
                    
                    return (
                      <div key={dayIndex} className="border-r border-b border-theme p-1 min-h-[60px] hover:bg-surface-elevated/50 cursor-pointer">
                        {hourMeetings.map(meeting => (
                          <div key={meeting.id} className="bg-accent/10 border border-accent/30 rounded p-1 mb-1">
                            <div className="text-xs font-medium text-primary truncate">
                              {meeting.title}
                            </div>
                            <div className="text-xs text-secondary">
                              {formatTime(meeting.startTime)}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          )}

          {viewMode === 'day' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-medium text-primary mb-4">
                {formatDate(selectedDate)}
              </h2>
              <div className="space-y-2">
                {getMeetingsForDate(selectedDate).map(meeting => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
                {getMeetingsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8 text-secondary">
                    Aucune réunion prévue pour ce jour
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === 'month' && (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-7 gap-0 border border-theme rounded-lg overflow-hidden">
                {/* En-tête des jours de la semaine */}
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                  <div key={index} className="bg-surface-elevated border-r border-theme p-3 text-center">
                    <span className="text-sm font-medium text-primary">{day}</span>
                  </div>
                ))}
                
                {/* Jours du mois */}
                {(() => {
                  const year = selectedDate.getFullYear();
                  const month = selectedDate.getMonth();
                  const firstDay = new Date(year, month, 1);
                  const lastDay = new Date(year, month + 1, 0);
                  const startDate = new Date(firstDay);
                  const dayOfWeek = firstDay.getDay() || 7;
                  startDate.setDate(startDate.getDate() - (dayOfWeek - 1));
                  
                  const days = [];
                  const today = new Date();
                  
                  for (let i = 0; i < 42; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);
                    
                    const isCurrentMonth = currentDate.getMonth() === month;
                    const isToday = currentDate.toDateString() === today.toDateString();
                    const dayMeetings = getMeetingsForDate(currentDate);
                    
                    days.push(
                      <div
                        key={i}
                        className={cn(
                          "border-r border-b border-theme p-2 min-h-[100px] cursor-pointer hover:bg-surface-elevated/50",
                          !isCurrentMonth && "bg-surface/50",
                          isToday && "bg-accent/5"
                        )}
                        onClick={() => {
                          setSelectedDate(currentDate);
                          setViewMode('day');
                        }}
                      >
                        <div className={cn(
                          "text-sm font-medium mb-1",
                          isCurrentMonth ? "text-primary" : "text-secondary",
                          isToday && "text-accent"
                        )}>
                          {currentDate.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayMeetings.slice(0, 3).map(meeting => (
                            <div
                              key={meeting.id}
                              className="text-xs bg-accent/10 border border-accent/30 rounded p-1 truncate"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMeeting(meeting);
                              }}
                            >
                              {meeting.title}
                            </div>
                          ))}
                          {dayMeetings.length > 3 && (
                            <div className="text-xs text-secondary">
                              +{dayMeetings.length - 3} autre{dayMeetings.length - 3 > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
            </div>
          )}

          {viewMode === 'list' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-medium text-primary mb-4">
                Toutes les réunions
              </h2>
              <div className="space-y-2">
                {getFilteredMeetings().map(meeting => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
                {getFilteredMeetings().length === 0 && (
                  <div className="text-center py-8 text-secondary">
                    Aucune réunion trouvée avec les filtres actuels
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panneau droit - Détails */}
      <div className="w-96 border-l border-theme bg-surface-elevated">
        {selectedMeeting ? (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-theme">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold text-primary">
                  {selectedMeeting.title}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedMeeting(null)}
                >
                  ×
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* Informations générales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-secondary" />
                    <span className="text-primary">
                      {formatDate(selectedMeeting.startTime)}
                    </span>
                    <span className="text-secondary">
                      {formatTime(selectedMeeting.startTime)} - {formatTime(selectedMeeting.endTime)}
                    </span>
                  </div>
                  
                  {selectedMeeting.location && (
                    <div className="text-sm">
                      <span className="text-secondary">Lieu: </span>
                      <span className="text-primary">{selectedMeeting.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {selectedMeeting.type === 'video' ? (
                      <Video className="h-4 w-4 text-accent" />
                    ) : (
                      <Users className="h-4 w-4 text-secondary" />
                    )}
                    <span className="text-sm text-primary">
                      {selectedMeeting.type === 'video' ? 'Visioconférence' : 'Audio'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Participants */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Participants ({selectedMeeting.participants.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedMeeting.participants.map(participant => (
                      <div key={participant.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-accent">
                              {participant.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-sm text-primary">{participant.name}</span>
                        </div>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          participant.status === 'confirmed' ? "bg-green-500" :
                          participant.status === 'pending' ? "bg-yellow-500" : "bg-red-500"
                        )} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {selectedMeeting.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-secondary">{selectedMeeting.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <Button className="w-full">
                  <Video className="h-4 w-4 mr-2" />
                  Rejoindre la réunion
                </Button>
                <Button variant="outline" className="w-full">
                  Modifier
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-primary mb-2">
                Sélectionnez une réunion
              </h3>
              <p className="text-sm text-secondary">
                Cliquez sur une réunion pour voir ses détails
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for filters */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-transparent z-40"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 w-80 max-h-96 bg-surface-elevated border border-theme rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-theme flex items-center justify-between">
            <h3 className="font-medium text-primary">Notifications</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setNotifications([])}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map(notification => (
              <div 
                key={notification.id}
                className={cn(
                  "p-3 border-b border-theme cursor-pointer hover:bg-surface transition-colors",
                  !notification.read && "bg-accent/5"
                )}
                onClick={() => {
                  setNotifications(notifications.map(n => 
                    n.id === notification.id ? {...n, read: true} : n
                  ));
                }}
              >
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                    notification.type === 'reminder' ? "bg-yellow-500" :
                    notification.type === 'meeting_start' ? "bg-green-500" : "bg-blue-500"
                  )} />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-primary">{notification.title}</h4>
                    <p className="text-xs text-secondary mt-1">{notification.message}</p>
                    <p className="text-xs text-secondary mt-1">
                      {notification.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}