'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  FileText, 
  Folder, 
  Users, 
  Calendar, 
  Star, 
  Trash2, 
  Upload, 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Filter,
  MoreVertical,
  Download,
  Share2,
  Edit3,
  Eye,
  Copy,
  Move,
  Archive,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  File,
  Image,
  Video,
  Music,
  Archive as ArchiveIcon,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  FileImage,
  FileCode,
  FilePlus,
  FolderPlus,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { cn } from '../lib/utils';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size?: number;
  modified: Date;
  created: Date;
  path: string;
  shared?: boolean;
  starred?: boolean;
  owner?: string;
  team?: string;
  meeting?: string;
  thumbnail?: string;
}

interface Team {
  id: string;
  name: string;
  memberCount: number;
}

interface Meeting {
  id: string;
  title: string;
  date: Date;
}

type ViewMode = 'list' | 'grid';
type Section = 'recent' | 'my-files' | 'shared' | 'teams' | 'meetings' | 'favorites' | 'trash';

export default function FilesPage() {
  const [selectedSection, setSelectedSection] = useState<Section>('my-files');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterType, setFilterType] = useState('all');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Mock data
  const mockFiles: FileItem[] = [
    {
      id: '1',
      name: 'Rapport Q4 2024',
      type: 'file',
      mimeType: 'application/pdf',
      size: 2048576,
      modified: new Date('2024-11-20'),
      created: new Date('2024-11-15'),
      path: '/Documents/Rapports',
      shared: true,
      starred: true,
      owner: 'John Doe'
    },
    {
      id: '2',
      name: 'Présentation Produit',
      type: 'file',
      mimeType: 'application/vnd.ms-powerpoint',
      size: 5242880,
      modified: new Date('2024-11-22'),
      created: new Date('2024-11-18'),
      path: '/Documents/Présentations',
      shared: true,
      owner: 'Alice Martin'
    },
    {
      id: '3',
      name: 'Budget 2025',
      type: 'file',
      mimeType: 'application/vnd.ms-excel',
      size: 1048576,
      modified: new Date('2024-11-21'),
      created: new Date('2024-11-10'),
      path: '/Documents/Finances',
      starred: true,
      owner: 'John Doe'
    },
    {
      id: '4',
      name: 'Projets',
      type: 'folder',
      modified: new Date('2024-11-23'),
      created: new Date('2024-01-01'),
      path: '/Projets',
      owner: 'John Doe'
    },
    {
      id: '5',
      name: 'Réunion - Sprint Planning',
      type: 'folder',
      modified: new Date('2024-11-24'),
      created: new Date('2024-11-20'),
      path: '/Meetings',
      meeting: 'Réunion - Sprint Planning',
      owner: 'John Doe'
    }
  ];

  const mockTeams: Team[] = [
    { id: '1', name: 'Développement', memberCount: 8 },
    { id: '2', name: 'Marketing', memberCount: 5 },
    { id: '3', name: 'Design', memberCount: 4 }
  ];

  const mockMeetings: Meeting[] = [
    { id: '1', title: 'Sprint Planning', date: new Date('2024-11-24') },
    { id: '2', title: 'Révision Code', date: new Date('2024-11-23') },
    { id: '3', title: 'Demo Client', date: new Date('2024-11-22') }
  ];

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <File className="h-4 w-4" />;
    
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4 text-green-500" />;
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <FileVideo className="h-4 w-4 text-orange-500" />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <ArchiveIcon className="h-4 w-4 text-yellow-600" />;
    if (mimeType.includes('text') || mimeType.includes('code')) return <FileCode className="h-4 w-4 text-gray-600" />;
    
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    
    return date.toLocaleDateString('fr-FR');
  };

  const getFilteredFiles = () => {
    let filtered = [...mockFiles];
    
    // Filter by section
    switch (selectedSection) {
      case 'recent':
        filtered = filtered.filter(f => {
          const diffTime = Math.abs(new Date().getTime() - f.modified.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        });
        break;
      case 'shared':
        filtered = filtered.filter(f => f.shared);
        break;
      case 'favorites':
        filtered = filtered.filter(f => f.starred);
        break;
      case 'trash':
        // Mock trash files
        filtered = [];
        break;
    }
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(f => {
        if (filterType === 'folders') return f.type === 'folder';
        if (filterType === 'documents') return f.mimeType?.includes('document') || f.mimeType?.includes('pdf');
        if (filterType === 'images') return f.mimeType?.startsWith('image/');
        if (filterType === 'videos') return f.mimeType?.startsWith('video/');
        return true;
      });
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'modified':
          return b.modified.getTime() - a.modified.getTime();
        case 'size':
          return (b.size || 0) - (a.size || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const FilesSidebar = () => (
    <div className="w-64 h-full bg-surface-elevated border-r border-theme flex flex-col">
      {/* Actions globales */}
      <div className="p-4 border-b border-theme space-y-2">
        <Button className="w-full justify-start">
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <FileText className="h-4 w-4 mr-2" />
              Document
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Feuille de calcul
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileVideo className="h-4 w-4 mr-2" />
              Présentation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <FolderPlus className="h-4 w-4 mr-2" />
              Dossier
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <button
          onClick={() => setSelectedSection('recent')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            selectedSection === 'recent' 
              ? "bg-accent text-accent-foreground" 
              : "text-secondary hover:text-primary hover:bg-surface"
          )}
        >
          <Clock className="h-4 w-4" />
          Récent
        </button>

        <button
          onClick={() => setSelectedSection('my-files')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            selectedSection === 'my-files' 
              ? "bg-accent text-accent-foreground" 
              : "text-secondary hover:text-primary hover:bg-surface"
          )}
        >
          <FileText className="h-4 w-4" />
          Mes fichiers
        </button>

        <button
          onClick={() => setSelectedSection('shared')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            selectedSection === 'shared' 
              ? "bg-accent text-accent-foreground" 
              : "text-secondary hover:text-primary hover:bg-surface"
          )}
        >
          <Users className="h-4 w-4" />
          Partagés avec moi
        </button>

        {/* Teams */}
        <div className="pt-2">
          <button
            onClick={() => setSelectedSection(selectedSection === 'teams' ? 'my-files' : 'teams')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              selectedSection === 'teams' 
                ? "bg-accent text-accent-foreground" 
                : "text-secondary hover:text-primary hover:bg-surface"
            )}
          >
            {selectedSection === 'teams' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Users className="h-4 w-4" />
            Équipes
          </button>
          
          {selectedSection === 'teams' && (
            <div className="ml-4 mt-1 space-y-1">
              {mockTeams.map(team => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors",
                    selectedTeam === team.id
                      ? "bg-accent/50 text-accent-foreground"
                      : "text-secondary hover:text-primary hover:bg-surface"
                  )}
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  {team.name}
                  <span className="ml-auto text-xs">({team.memberCount})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Meetings */}
        <div className="pt-2">
          <button
            onClick={() => setSelectedSection(selectedSection === 'meetings' ? 'my-files' : 'meetings')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              selectedSection === 'meetings' 
                ? "bg-accent text-accent-foreground" 
                : "text-secondary hover:text-primary hover:bg-surface"
            )}
          >
            {selectedSection === 'meetings' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Calendar className="h-4 w-4" />
            Réunions
          </button>
          
          {selectedSection === 'meetings' && (
            <div className="ml-4 mt-1 space-y-1">
              {mockMeetings.map(meeting => (
                <button
                  key={meeting.id}
                  onClick={() => setSelectedMeeting(meeting.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors",
                    selectedMeeting === meeting.id
                      ? "bg-accent/50 text-accent-foreground"
                      : "text-secondary hover:text-primary hover:bg-surface"
                  )}
                >
                  <Folder className="h-3 w-3" />
                  {meeting.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setSelectedSection('favorites')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            selectedSection === 'favorites' 
              ? "bg-accent text-accent-foreground" 
              : "text-secondary hover:text-primary hover:bg-surface"
          )}
        >
          <Star className="h-4 w-4" />
          Favoris
        </button>

        <button
          onClick={() => setSelectedSection('trash')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            selectedSection === 'trash' 
              ? "bg-accent text-accent-foreground" 
              : "text-secondary hover:text-primary hover:bg-surface"
          )}
        >
          <Trash2 className="h-4 w-4" />
          Corbeille
        </button>
      </nav>

      {/* Storage info */}
      <div className="p-4 border-t border-theme">
        <div className="text-xs text-secondary mb-2">Stockage utilisé</div>
        <div className="w-full bg-surface rounded-full h-2">
          <div className="bg-accent h-2 rounded-full" style={{ width: '65%' }}></div>
        </div>
        <div className="text-xs text-secondary mt-1">6.5 GB sur 10 GB</div>
      </div>
    </div>
  );

  const FileListView = () => (
    <div className="flex-1 h-full flex flex-col">
      {/* Barre d'outils intégrée */}
      <div className="p-4 border-b border-theme bg-surface-elevated">
        <div className="flex items-center gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
            <Input
              placeholder="Rechercher des fichiers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtres */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="folders">Dossiers</SelectItem>
              <SelectItem value="documents">Documents</SelectItem>
              <SelectItem value="images">Images</SelectItem>
              <SelectItem value="videos">Vidéos</SelectItem>
            </SelectContent>
          </Select>

          {/* Tri */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nom</SelectItem>
              <SelectItem value="modified">Modifié</SelectItem>
              <SelectItem value="size">Taille</SelectItem>
            </SelectContent>
          </Select>

          {/* Vue */}
          <div className="flex items-center border border-theme rounded-lg">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-l-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>

          {/* Rafraîchir */}
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Liste des fichiers */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'list' ? (
          <div className="min-w-full">
            <table className="w-full">
              <thead className="bg-surface-elevated border-b border-theme">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-secondary">Nom</th>
                  <th className="text-left p-4 text-sm font-medium text-secondary">Propriétaire</th>
                  <th className="text-left p-4 text-sm font-medium text-secondary">Modifié</th>
                  <th className="text-left p-4 text-sm font-medium text-secondary">Taille</th>
                  <th className="p-4 text-sm font-medium text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredFiles().map(file => (
                  <tr 
                    key={file.id}
                    className={cn(
                      "border-b border-theme hover:bg-surface-elevated/50 cursor-pointer",
                      selectedFile?.id === file.id && "bg-accent/10"
                    )}
                    onClick={() => setSelectedFile(file)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {file.type === 'folder' ? (
                          <Folder className="h-5 w-5 text-blue-500" />
                        ) : (
                          getFileIcon(file.mimeType)
                        )}
                        <span className="text-sm text-primary">{file.name}</span>
                        {file.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                        {file.shared && <Users className="h-3 w-3 text-blue-500" />}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-secondary">{file.owner}</td>
                    <td className="p-4 text-sm text-secondary">{formatDate(file.modified)}</td>
                    <td className="p-4 text-sm text-secondary">{formatFileSize(file.size)}</td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Ouvrir
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Partager
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Renommer
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Copier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Move className="h-4 w-4 mr-2" />
                            Déplacer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {getFilteredFiles().map(file => (
              <Card 
                key={file.id}
                className={cn(
                  "cursor-pointer hover:shadow-md transition-shadow",
                  selectedFile?.id === file.id && "ring-2 ring-accent"
                )}
                onClick={() => setSelectedFile(file)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-2">
                    {file.type === 'folder' ? (
                      <Folder className="h-12 w-12 text-blue-500" />
                    ) : (
                      <div className="h-12 w-12 flex items-center justify-center">
                        {getFileIcon(file.mimeType)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-primary truncate font-medium">{file.name}</div>
                  <div className="text-xs text-secondary mt-1">{formatFileSize(file.size)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const PreviewPanel = () => (
    <div className="w-80 h-full bg-surface-elevated border-l border-theme flex flex-col">
      {selectedFile ? (
        <>
          {/* Header */}
          <div className="p-4 border-b border-theme">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-primary">Aperçu</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* File icon and name */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {selectedFile.type === 'folder' ? (
                  <Folder className="h-16 w-16 text-blue-500" />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center">
                    {getFileIcon(selectedFile.mimeType)}
                  </div>
                )}
              </div>
              <h4 className="font-medium text-primary">{selectedFile.name}</h4>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Ouvrir
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>

            {/* Metadata */}
            <div className="space-y-3">
              <h5 className="font-medium text-primary text-sm">Propriétés</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">Type</span>
                  <span className="text-primary">
                    {selectedFile.type === 'folder' ? 'Dossier' : selectedFile.mimeType || 'Fichier'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Taille</span>
                  <span className="text-primary">{formatFileSize(selectedFile.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Modifié</span>
                  <span className="text-primary">{formatDate(selectedFile.modified)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Créé</span>
                  <span className="text-primary">{formatDate(selectedFile.created)}</span>
                </div>
                {selectedFile.owner && (
                  <div className="flex justify-between">
                    <span className="text-secondary">Propriétaire</span>
                    <span className="text-primary">{selectedFile.owner}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-secondary">Chemin</span>
                  <span className="text-primary text-xs">{selectedFile.path}</span>
                </div>
              </div>
            </div>

            {/* Sharing */}
            {selectedFile.shared && (
              <div className="space-y-3">
                <h5 className="font-medium text-primary text-sm">Partage</h5>
                <div className="bg-accent/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-accent" />
                    <span className="text-primary">Partagé</span>
                  </div>
                </div>
              </div>
            )}

            {/* Version history */}
            <div className="space-y-3">
              <h5 className="font-medium text-primary text-sm">Historique des versions</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm p-2 bg-surface rounded">
                  <div>
                    <div className="text-primary">Version actuelle</div>
                    <div className="text-xs text-secondary">Modifié {formatDate(selectedFile.modified)}</div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <File className="h-12 w-12 text-secondary mx-auto mb-4" />
            <h3 className="font-medium text-primary mb-2">Sélectionnez un fichier</h3>
            <p className="text-sm text-secondary">
              Cliquez sur un fichier pour voir ses détails et actions
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-surface">
      <FilesSidebar />
      <FileListView />
      <PreviewPanel />
    </div>
  );
}