
import { Request, Response } from "express";
import { RemedyAndSpellService } from "../services/RemedyAndSpellService";

const remedyAndSpellService = new RemedyAndSpellService();

export class RemedyAndSpellController {
  async getAll(req: Request, res: Response): Promise<void> {
    const remediesAndSpells = await remedyAndSpellService.getAll();
    res.json(remediesAndSpells);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const remedyAndSpell = await remedyAndSpellService.getById(id);
    if (remedyAndSpell) {
      res.json(remedyAndSpell);
    } else {
      res.status(404).send("Remedy or spell not found");
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    const { title, description, price } = req.body;
    const image = req.file ? req.file.path : "";
    const newRemedyAndSpell = await remedyAndSpellService.create({ title, description, price, image });
    res.status(201).json(newRemedyAndSpell);
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const { title, description, price } = req.body;
    let image;
    if (req.file) {
      image = req.file.path;
    }
    const updatedRemedyAndSpell = await remedyAndSpellService.update(id, { title, description, price, image });
    if (updatedRemedyAndSpell) {
      res.json(updatedRemedyAndSpell);
    } else {
      res.status(404).send("Remedy or spell not found");
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    await remedyAndSpellService.delete(id);
    res.status(204).send();
  }
}
