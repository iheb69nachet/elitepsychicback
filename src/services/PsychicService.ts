
import { AppDataSource } from "../data-source";
import { User, UserStatus } from "../entities/User";
import { Role } from "../entities/Role";

const userRepository = AppDataSource.getRepository(User);
const roleRepository = AppDataSource.getRepository(Role);

export class PsychicService {
  async getAllPsychics(): Promise<User[]> {
    const psychicRole = await roleRepository.findOne({ where: { name: "psychic" } });
    if (!psychicRole) {
      return [];
    }

    return userRepository
      .createQueryBuilder("user")
      .innerJoinAndSelect("user.psychicSetting", "psychicSetting")
      .where("user.roleId = :roleId", { roleId: psychicRole.id })
      .andWhere("user.status = :status", { status: UserStatus.ACTIVE })
      .getMany();
  }

  async getPsychicById(id: number): Promise<User | null> {
    const psychicRole = await roleRepository.findOne({ where: { name: "psychic" } });
    if (!psychicRole) {
      return null;
    }

    return userRepository
      .createQueryBuilder("user")
      .innerJoinAndSelect("user.psychicSetting", "psychicSetting")
      .where("user.id = :id", { id })
      .andWhere("user.roleId = :roleId", { roleId: psychicRole.id })
      .andWhere("user.status = :status", { status: UserStatus.ACTIVE })
      .getOne();
  }
}
