
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { In } from "typeorm";

export const userRepository = AppDataSource.getRepository(User).extend({
  findByRoleNames(roleNames: string[]) {
    return this.find({
      where: {
        role: {
          name: In(roleNames),
        },
      },
      relations: ["role"],
    });
  },
});
