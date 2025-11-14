import bcrypt from "bcrypt";
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { JWSInvalid } from "jose/errors";
import {
  password as passwordTable,
  salt as saltTable,
  user as userTable,
} from "../database/schema.ts";
import { IDatabase } from "../interfaces/IDatabase.ts";
import { IUser } from "../interfaces/IUser.ts";
import { userSchema } from "../schemas/zodSchema.ts";
import { validateData } from "./decorators.ts";

export class AuthenticationService {
  private db: IDatabase;
  private secretKey: Uint8Array;

  constructor(db: IDatabase) {
    this.db = db;

    this.secretKey = new TextEncoder().encode("poli_grades");
  }

  @validateData(userSchema)
  async registerUser(user: Partial<IUser>, password: string): Promise<number> {
    const existingUser = await this.db.selectByField(
      userTable,
      "email",
      user.email as string,
    );
    if (existingUser.length > 0) {
      throw new Error("User already exists");
    }

    const newUser = await this.db.insert(userTable, user as IUser);

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    await this.db.insert(passwordTable, {
      userId: newUser.id,
      password: hashedPassword,
    });

    await this.db.insert(saltTable, {
      userId: newUser.id,
      salt: salt,
    });

    return newUser.id;
  }

  async createJWT(userId: number): Promise<string> {
    const user = await this.getUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const payload = {
      id: user.id,
      name: user.name,
    };

    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(this.secretKey);

    return jwt;
  }

  async verifyJWT(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey);
      const user = await this.getUserById(payload.id as number);

      if (!user) {
        return null;
      }

      return {
        ...payload,
        role: user.role,
        name: user.name,
      };
    } catch (error: unknown) {
      return error instanceof JWSInvalid ? null : Promise.reject(error);
    }
  }

  async loginUser(email: string, password: string): Promise<IUser | null> {
    const user = await this.db.selectByField(userTable, "email", email);

    if (!user) {
      throw new Error("User not found");
    }

    const userPassword = await this.db.selectByField(
      passwordTable,
      "userId",
      user[0].id,
    );
    if (!userPassword) {
      throw new Error("User password not found");
    }

    const salt = await this.db.selectByField(saltTable, "userId", user[0].id);

    if (!salt) {
      throw new Error("User salt not found");
    }

    const hashedPassword = await bcrypt.hash(password, salt[0].salt);

    if (userPassword[0].password !== hashedPassword) {
      throw new Error("Invalid password");
    }

    return user[0];
  }

  async getUsersByRole(role: "PROFESSOR" | "STUDENT"): Promise<IUser[]> {
    return await this.db.selectByField(userTable, "role", role);
  }

  @validateData(userSchema)
  async updateUser(user: IUser, id: number): Promise<number> {
    const existingUser = await this.db.select(userTable, id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const updatedUser = await this.db.update(userTable, id, user);
    return updatedUser.id;
  }

  async deleteUser(id: number): Promise<boolean> {
    const existingUser = await this.db.select(userTable, id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const deleted = await this.db.delete(userTable, id);
    return deleted;
  }

  async getUserById(id: number): Promise<IUser | null> {
    const user = await this.db.select(userTable, id);
    return user;
  }
}
