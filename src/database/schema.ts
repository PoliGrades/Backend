import {
  decimal,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["PROFESSOR", "STUDENT"]);

export const user = pgTable("user", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("STUDENT"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().$onUpdate(() => new Date()),
});

export const salt = pgTable("salt", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => user.id),
  salt: text("salt").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().$onUpdate(() => new Date()),
});

export const password = pgTable("password", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => user.id),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().$onUpdate(() => new Date()),
});

export const classTable = pgTable("class", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  ownerId: serial("owner_id").references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().$onUpdate(() => new Date()),
});

export const enrollment = pgTable("enrollment", {
  id: serial("id").primaryKey(),
  studentId: serial("student_id").references(() => user.id),
  classId: serial("class_id").references(() => classTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().$onUpdate(() => new Date()),
});

export const task = pgTable("task", {
  id: serial("id").primaryKey(),
  classId: serial("class_id").references(() => classTable.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().$onUpdate(() => new Date()),
});

export const grade = pgTable("grade", {
  id: serial("id").primaryKey(),
  taskId: serial("task_id").references(() => task.id),
  studentId: serial("student_id").references(() => user.id),
  grade: decimal("grade").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().$onUpdate(() => new Date()),
});
