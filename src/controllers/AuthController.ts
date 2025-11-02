
import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { AuthRequest } from "../middleware/authMiddleware";
import jwt from "jsonwebtoken";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const { name, email, password, birthdate, role } = req.body;
    try {
      const newUser = await authService.register(name, email, password, birthdate, role);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    if (result) {
      const { accessToken, refreshToken, user } = result;
      res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' });
      res.json({ accessToken, user });
    } else {
      res.status(401).send("Invalid credentials");
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(401).send("Refresh token not found");
      return;
    }

    const result = await authService.refreshAccessToken(refreshToken);
    if (result) {
      res.json(result);
    } else {
      res.status(401).send("Invalid refresh token");
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('refreshToken');
    res.status(200).send("Logged out");
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    await authService.sendPasswordResetEmail(email);
    res.status(200).send("Password reset email sent");
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    const id = req.user?.id;
    if (!id) {
      res.status(400).send("User ID not found in token");
      return;
    }
    const { name, email } = req.body;
    const updatedUser = await authService.updateUser(id, name, email);
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).send("User not found");
    }
  }
  async socialLogin(req: Request, res: Response): Promise<void> {
    const { email, name, avatar } = req.body;
    const user = await authService.socialLogin(email, name, avatar);
    console.log(user);

    const token = jwt.sign({ id: user.id, email: user.email }, "your_jwt_secret", { 
      expiresIn: "1h",
    });

    res.json ({ token ,user});
    
  }

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      return;
    }

    try {
      const { user, token } = await authService.getMe(userId);
      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}
