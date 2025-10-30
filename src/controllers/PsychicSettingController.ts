import { Request, Response } from "express";
import { PsychicSettingService } from "../services/PsychicSettingService";

const psychicSettingService = new PsychicSettingService();

export class PsychicSettingController {
    async getPsychicSettings(req: Request, res: Response) {
        try {
            const psychicId = parseInt(req.params.psychicId);
            const settings = await psychicSettingService.getPsychicSettings(psychicId);
            res.json(settings);
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
        }
    }

    async updatePsychicSettings(req: Request, res: Response) {
        console.log(req.file);
        try {
            const psychicId = parseInt(req.params.psychicId);
            const { bio, minuteRate } = req.body;
            const image = req.file ? req.file.path : req.body.image;
            const settings = await psychicSettingService.updatePsychicSettings(psychicId, bio, image, minuteRate);
            res.json(settings);
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
        }
    }
}
