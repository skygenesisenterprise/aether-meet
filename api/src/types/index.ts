export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export interface CreateUserDto {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  status?: 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE';
}

export interface CreateMessageDto {
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
  conversationId?: string;
  groupId?: string;
  replyToId?: string;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
  isPrivate?: boolean;
  maxMembers?: number;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  avatar?: string;
  isPrivate?: boolean;
  maxMembers?: number;
}

export interface AddGroupMemberDto {
  userId: string;
  role?: 'ADMIN' | 'MODERATOR' | 'MEMBER';
}

export interface CreateCallDto {
  type: 'AUDIO' | 'VIDEO' | 'SCREEN_SHARE';
  conversationId?: string;
  groupId?: string;
  participantIds?: string[];
}