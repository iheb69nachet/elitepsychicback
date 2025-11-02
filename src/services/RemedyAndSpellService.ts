
import { remedyAndSpellRepository } from "../repositories/RemedyAndSpellRepository";
import { RemedyAndSpell } from "../entities/RemedyAndSpell";

export class RemedyAndSpellService {
  async getAll(): Promise<RemedyAndSpell[]> {
    return remedyAndSpellRepository.find();
  }

  async getById(id: number): Promise<RemedyAndSpell | null> {
    return remedyAndSpellRepository.findOne({ where: { id } });
  }

  async create(data: Partial<RemedyAndSpell>): Promise<RemedyAndSpell> {
    const newRemedyAndSpell = remedyAndSpellRepository.create(data);
    return remedyAndSpellRepository.save(newRemedyAndSpell);
  }

  async update(id: number, data: Partial<RemedyAndSpell>): Promise<RemedyAndSpell | null> {
    await remedyAndSpellRepository.update(id, data);
    return this.getById(id);
  }

  async delete(id: number): Promise<void> {
    await remedyAndSpellRepository.delete(id);
  }
}
