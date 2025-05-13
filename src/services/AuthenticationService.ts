import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { user as userTable } from "../database/schema.ts";
import { IDatabase } from "../interfaces/IDatabase.ts";
import { IUser } from "../interfaces/IUser.ts";

export class AuthenticationService {
    private db: IDatabase;
    private secretKey: Uint8Array;

    constructor(db: IDatabase) {
        this.db = db;

        this.secretKey = new TextEncoder().encode("poli_eats");
    }

    async registerUser(user: IUser): Promise<number> {
        const existingUser = await this.db.selectByField(userTable, "email", user.email);
        if (existingUser.length > 0) {
            throw new Error("User already exists");
        }

        const newUser = await this.db.insert(userTable, user);
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
            return payload;
        } catch (error) {
            console.error("JWT verification failed:", error);
            return null;
        }
    }

    async loginUser(email: string, password: string): Promise<IUser | null> {
        const user = await this.db.selectByField(userTable, "email", email);
        if (!user) {
            throw new Error("User not found");
        }

        if (user[0].password !== password) {
            throw new Error("Invalid password");
        }

        return user[0];
    }

    async updateUser(id: number, user: IUser): Promise<number> {
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