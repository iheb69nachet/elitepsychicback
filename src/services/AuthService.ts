
import { generateAvatar } from "../utils/avatarGenerator";
import { userRepository } from "../repositories/UserRepository";
import { roleRepository } from "../repositories/RoleRepository";
import { User, UserStatus } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

export class AuthService {
  async register(name: string, email: string, password: string, birthdate?: Date, role?: string): Promise<User> {
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("Email already in use");
    }

    let assignedRole;
    if (role) {
      assignedRole = await roleRepository.findOne({ where: { name: role } });
    } else {
      assignedRole = await roleRepository.findOne({ where: { name: "client" } });
    }

    if (!assignedRole) {
      throw new Error("Role not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User();
    newUser.name = name;
    newUser.email = email;
    newUser.password = hashedPassword;
    newUser.role = assignedRole;
    newUser.status = assignedRole.name === "client" ? UserStatus.ACTIVE : UserStatus.PENDING;
    if (birthdate) {
      newUser.birthdate = birthdate;
    }

    newUser.avatar = await generateAvatar(name);

    return userRepository.save(newUser);
  }

  async login(email: string, password: string): Promise<{ accessToken: string, refreshToken: string, user: User } | null> {
    const user = await userRepository.findOne({ where: { email }, relations: ["role"] });
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) {
      return null;
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role.name }, "your_jwt_secret", {
      expiresIn: "1m", // Short-lived access token
    });

    const refreshToken = crypto.randomBytes(40).toString('hex');
    user.refreshToken = refreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await userRepository.save(user);

    return { accessToken, refreshToken, user };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string } | null> {
    const user = await userRepository.findOne({ where: { refreshToken }, relations: ["role"] });

    if (!user || !user.refreshTokenExpires || user.refreshTokenExpires < new Date()) {
      return null;
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role.name }, "your_jwt_secret", {
      expiresIn: "15m",
    });

    return { accessToken };
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return;
    }

    // In a real application, you would generate a token, save it, and send an email.
    // For this example, we'll just log a message.
    console.log(`Sending password reset email to ${email}`);

    // Mock email sending
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: 'your_email', // Replace with your ethereal email
        pass: 'your_password', // Replace with your ethereal password
      },
    });

    const mailOptions = {
      from: '"Aura App" <noreply@aura.com>',
      to: email,
      subject: "Password Reset",
      text: "Click here to reset your password: [link]",
    };

    // await transporter.sendMail(mailOptions);
  }

  async updateUser(id: number, name: string, email: string): Promise<User | null> {
    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }

    user.name = name;
    user.email = email;

    return userRepository.save(user);
  }
  async socialLogin(email: string, name: string, avatar: string): Promise<User> {
    let user = await userRepository.findOne({ where: { email } });
    if (!user) {
      const defaultRole = await roleRepository.findOne({ where: { name: "client" } });
      if (!defaultRole) {
        throw new Error("Default role not found");
      }

      user = new User();
      user.name = name;
      user.email = email;
      user.role = defaultRole;
      user.status = UserStatus.ACTIVE;
      user.avatar = avatar;
    }

    return userRepository.save(user);
  }

  async getMe(userId: number): Promise<{ user: User, token: string }> {
    const user = await userRepository.findOne({ where: { id: userId }, relations: ["role"] });

    if (!user) {
      throw new Error("User not found");
    }

    const token = jwt.sign({ id: user.id, email: user.email ,role:user.role.name}, "your_jwt_secret", {
      expiresIn: "1h",
    });

    return { user, token };
  }
}
