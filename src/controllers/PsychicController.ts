
import { Request, Response } from "express";
import { PsychicService } from "../services/PsychicService";

const psychicService = new PsychicService();

export class PsychicController {
  async getAllPsychics(req: Request, res: Response): Promise<void> {
    try {
      const psychics = await psychicService.getAllPsychics();
      res.json(psychics);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getPsychicById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const psychic = await psychicService.getPsychicById(Number(id));
      if (psychic) {
        res.json(psychic);
      } else {
        res.status(404).json({ message: "Psychic not found" });
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}
