
import { Request, Response } from "express";
import { UserService } from "../services/UserService";

const userService = new UserService();

export class UserController {
  async getAllUsers(req: Request, res: Response): Promise<void> {
    const users = await userService.getAllUsers();
    console.log(users)
    res.json(users);
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const user = await userService.getUserById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).send("User not found");
    }
  }

  async getUsersByRoleNames(req: Request, res: Response): Promise<void> {
    const roleNames = (req.query.roles as string).split(',');
    const users = await userService.getUsersByRoleNames(roleNames);
    res.json(users);
  }

  async createUser(req: Request, res: Response): Promise<void> {
    const { name, email, roleId } = req.body;
    const newUser = await userService.createUser(name, email, roleId);
    res.status(201).json(newUser);
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const { name, email, password, status, roleId } = req.body;

    try {
      const updatedUser = await userService.updateUser(id, name, email, password, status, roleId);
      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(404).send("User not found");
      }
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  }
}
