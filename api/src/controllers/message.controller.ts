import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';
import { ApiResponse, CreateMessageDto, AuthenticatedRequest, PaginationParams } from '../types';

export class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  getMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        } as ApiResponse);
        return;
      }

      const { conversationId, groupId } = req.params;
      const pagination: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await this.messageService.getMessages(
        conversationId || groupId,
        conversationId ? 'direct' : 'group',
        userId,
        pagination
      );
      
      res.json({
        success: true,
        ...result,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  };

  sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        } as ApiResponse);
        return;
      }

      const messageData: CreateMessageDto = {
        ...req.body,
        senderId: userId,
      };

      const message = await this.messageService.sendMessage(messageData, userId);
      
      res.status(201).json({
        success: true,
        data: message,
        message: 'Message sent successfully',
      } as ApiResponse);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  };

  editMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { messageId } = req.params;
      const { content } = req.body;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        } as ApiResponse);
        return;
      }

      const message = await this.messageService.editMessage(messageId, content, userId);
      
      res.json({
        success: true,
        data: message,
        message: 'Message updated successfully',
      } as ApiResponse);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  };

  deleteMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { messageId } = req.params;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        } as ApiResponse);
        return;
      }

      await this.messageService.deleteMessage(messageId, userId);
      
      res.json({
        success: true,
        message: 'Message deleted successfully',
      } as ApiResponse);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  };

  addReaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { messageId } = req.params;
      const { emoji } = req.body;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        } as ApiResponse);
        return;
      }

      const reaction = await this.messageService.addReaction(messageId, userId, emoji);
      
      res.status(201).json({
        success: true,
        data: reaction,
        message: 'Reaction added successfully',
      } as ApiResponse);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  };

  removeReaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { messageId, emoji } = req.params;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        } as ApiResponse);
        return;
      }

      await this.messageService.removeReaction(messageId, userId, emoji);
      
      res.json({
        success: true,
        message: 'Reaction removed successfully',
      } as ApiResponse);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  };

  markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { messageId } = req.params;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        } as ApiResponse);
        return;
      }

      await this.messageService.markAsRead(messageId, userId);
      
      res.json({
        success: true,
        message: 'Message marked as read',
      } as ApiResponse);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  };

  pinMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { messageId } = req.params;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        } as ApiResponse);
        return;
      }

      const message = await this.messageService.pinMessage(messageId, userId);
      
      res.json({
        success: true,
        data: message,
        message: 'Message pinned successfully',
      } as ApiResponse);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  };
}