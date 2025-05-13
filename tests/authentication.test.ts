import { JWSInvalid } from "jose/errors";
import { expect } from "jsr:@std/expect";
import { describe, it } from "jsr:@std/testing/bdd";
import { MockDatabase } from "../src/database/MockDatabase.ts";
import { generateMockPassword, generateMockUser } from "../src/mocks/User.ts";
import { AuthenticationService } from "../src/services/AuthenticationService.ts";

describe("User authentication", () => {
  it("should register a new user", async () => {
    const db = new MockDatabase();
    const authService = new AuthenticationService(db);

    const user = generateMockUser();
    const password = generateMockPassword();

    const userId = await authService.registerUser(user, password);
    const registeredUser = await authService.getUserById(userId);

    expect(registeredUser).toBeDefined();
    expect(registeredUser?.name).toBe(user.name);
    expect(registeredUser?.email).toBe(user.email);
    expect(registeredUser?.document).toBe(user.document);
    expect(registeredUser?.createdAt).toBeDefined();
    expect(registeredUser?.updatedAt).toBeDefined();
  });

  it("should not register a user with an existing email", async () => {
    const db = new MockDatabase();
    const authService = new AuthenticationService(db);

    const user = generateMockUser();
    const password = generateMockPassword();

    await authService.registerUser(user, password);

    try {
      await authService.registerUser(user, password);
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }
      expect(error.message).toBe("User already exists");
    }
  });

  it("should login a user with valid credentials", async () => {
    const db = new MockDatabase();
    const authService = new AuthenticationService(db);

    const user = generateMockUser();
    const password = generateMockPassword();

    await authService.registerUser(user, password);

    const loggedInUser = await authService.loginUser(user.email, password);

    expect(loggedInUser).toBeDefined();
    expect(loggedInUser?.email).toBe(user.email);
  });

  it("should not login a user with invalid credentials", async () => {
    const db = new MockDatabase();
    const authService = new AuthenticationService(db);

    const user = generateMockUser();
    const password = generateMockPassword();

    await authService.registerUser(user, password);

    try {
      await authService.loginUser(user.email, "wrongpassword");
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }
      expect(error.message).toBe("Invalid password");
    }
  });

  it("should update an existing user", async () => {
    const db = new MockDatabase();
    const authService = new AuthenticationService(db);

    const user = generateMockUser();
    const password = generateMockPassword();

    const userId = await authService.registerUser(user, password);

    const updatedUser = { ...user, name: "Updated Name" };
    await authService.updateUser(updatedUser, userId);

    const fetchedUser = await authService.getUserById(userId);

    expect(fetchedUser).toBeDefined();
    expect(fetchedUser?.name).toBe(updatedUser.name);
  });

  it("should delete an existing user", async () => {
    const db = new MockDatabase();
    const authService = new AuthenticationService(db);

    const user = generateMockUser();
    const password = generateMockPassword();

    const userId = await authService.registerUser(user, password);

    const deleted = await authService.deleteUser(userId);

    expect(deleted).toBe(true);

    const fetchedUser = await authService.getUserById(userId);

    expect(fetchedUser).toBeNull();
  });

  it("should generate a JWT token for a user", async () => {
    const db = new MockDatabase();
    const authService = new AuthenticationService(db);

    const user = generateMockUser();
    const password = generateMockPassword();

    const userId = await authService.registerUser(user, password);

    const token = await authService.createJWT(userId);

    expect(token).toBeDefined();
  });

  it("should verify a valid JWT token", async () => {
    const db = new MockDatabase();
    const authService = new AuthenticationService(db);

    const user = generateMockUser();
    const password = generateMockPassword();

    const userId = await authService.registerUser(user, password);

    const token = await authService.createJWT(userId);

    const payload = await authService.verifyJWT(token);

    expect(payload).toBeDefined();
    expect(payload?.id).toBe(userId);
  });

  it("should not verify an invalid JWT token", async () => {
    const db = new MockDatabase();
    const authService = new AuthenticationService(db);

    const invalidToken = "invalidtoken";

    try {
      await authService.verifyJWT(invalidToken);
    } catch (error: unknown) {
      if (!(error instanceof JWSInvalid)) {
        throw error;
      }
      expect(error.code).toBe("ERR_JWS_INVALID");
    }
  });
});
