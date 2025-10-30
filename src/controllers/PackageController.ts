
import { Request, Response } from "express";
import { PackageService } from "../services/PackageService";
import { AuthRequest } from "../middleware/authMiddleware";

const packageService = new PackageService();

export class PackageController {
  async getAllPackages(req: Request, res: Response): Promise<void> {
    const packages = await packageService.getAllPackages();
    res.json(packages);
  }

  async createPackage(req: Request, res: Response): Promise<void> {
    const { name, price, color } = req.body;
    const newPackage = await packageService.createPackage(name, price, color);
    res.status(201).json(newPackage);
  }

  async createStripeSession(req: AuthRequest, res: Response): Promise<void> {
    const { packageId } = req.body;
    const userId = req.user?.id; // Get userId from authenticated request

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      return;
    }

    try {
      const session = await packageService.createStripeSession(packageId, userId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}
