
import { userRepository } from "../repositories/UserRepository";
import { User, UserStatus } from "../entities/User";
import { roleRepository } from "../repositories/RoleRepository";
import { Role } from "../entities/Role";
import bcrypt from 'bcryptjs';

export class UserService {
  async getPsychicSetting(psychicId: any) {
    const user = await userRepository.findOne({
      where: { id: psychicId },
      relations: ["psychicSetting"],
    });
    if (!user || !user.psychicSetting) {
      throw new Error("Psychic setting not found");
    }
    return user.psychicSetting;
  }
  async getUserBalance(userId: any): Promise<number> {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error("User not found");
    }
    return parseFloat(user.balance);
  }
  async getAllUsers(): Promise<User[]> {
    // return userRepository.find({
    //   relations: ["role"],
    // });
     const clientRole = await roleRepository.findOne({ where: { name: "client" } });
    if (!clientRole) {
      return [];
    }
    return userRepository.find({ where: { role: clientRole } });
  }

  getUserById(id: number): Promise<User | null> {
    return userRepository.findOne({
      where: { id },
      relations: ["role"],
    });
  }
  
  async getUsersByRoleNames(roleNames: string[]): Promise<User[]> {
    return userRepository.findByRoleNames(roleNames);
  }

  async createUser(name: string, email: string, roleId: number): Promise<User> {
    const role = await roleRepository.findOneBy({ id: roleId });
    if (!role) {
      throw new Error("Role not found");
    }
    const newUser = new User();
    newUser.name = name;
    newUser.email = email;
    newUser.role = role;
    return userRepository.save(newUser);
  }

  async updateUser(
    id: number,
    name?: string,
    email?: string,
    password?: string,
    status?: UserStatus,
    roleId?: number,
    balance?: number
  ): Promise<User | null> {
    const user = await userRepository.findOneBy({ id });
    if (!user) {
      return null;
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (status) user.status = status;
    if (roleId) {
      const role = await roleRepository.findOneBy({ id: roleId });
      if (!role) {
        throw new Error("Role not found");
      }
      user.role = role;
    }
    if (balance !== undefined) user.balance = balance.toString();

    return userRepository.save(user);
  }

  async setUserOnlineStatus(userId: number, isOnline: boolean): Promise<void> {
    const user = await userRepository.findOneBy({ id: userId });
    if (user) {
      user.isOnline = isOnline;
      await userRepository.save(user);
    }
  }

  async deductBalance(userId: number, amount: number): Promise<User | null> {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return null;
    }

    const currentBalance = parseFloat(user.balance);
    const newBalance = currentBalance - amount;
    user.balance = newBalance.toString();

    return userRepository.save(user);
  }
}
