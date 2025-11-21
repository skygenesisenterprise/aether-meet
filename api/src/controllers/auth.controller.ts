import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse, CreateUserDto, LoginDto, AuthenticatedRequest } from '../types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      
      // Validation
      if (!userData.email || !userData.username || !userData.password) {
        res.status(400).json({
          success: false,
          error: 'Email, username, and password are required',
        } as ApiResponse);
        return;
      }

      const result = await this.authService.register(userData);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully',
      } as ApiResponse);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginData: LoginDto = req.body;
      
      if (!loginData.email || !loginData.password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required',
        } as ApiResponse);
        return;
      }

      const result = await this.authService.login(loginData);
      
      res.json({
        success: true,
        data: result,
        message: 'Login successful',
      } as ApiResponse);
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token is required',
        } as ApiResponse);
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);
      
      res.json({
        success: true,
        data: result,
        message: 'Token refreshed successfully',
      } as ApiResponse);
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (token) {
        await this.authService.logout(token);
      }
      
      res.json({
        success: true,
        message: 'Logout successful',
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        } as ApiResponse);
        return;
      }

      const user = await this.authService.getProfile(userId);
      
      res.json({
        success: true,
        data: user,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  };
}