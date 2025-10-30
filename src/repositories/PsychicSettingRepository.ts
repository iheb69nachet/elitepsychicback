import { AppDataSource } from "../data-source";
import { PsychicSetting } from "../entities/PsychicSetting";

export const psychicSettingRepository = AppDataSource.getRepository(PsychicSetting);
