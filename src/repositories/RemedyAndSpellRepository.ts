
import { AppDataSource } from "../data-source";
import { RemedyAndSpell } from "../entities/RemedyAndSpell";

export const remedyAndSpellRepository = AppDataSource.getRepository(RemedyAndSpell);
