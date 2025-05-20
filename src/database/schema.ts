import {
  doublePrecision,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "completed",
  "canceled",
]);

export const user = pgTable("user", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  document: text("document").notNull().unique(),
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

export const order = pgTable("order", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => user.id),
  status: orderStatusEnum("status").notNull(),
  total: doublePrecision(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().$onUpdate(() => new Date()),
});

export const product = pgTable("product", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: doublePrecision().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().$onUpdate(() => new Date()),
});

export const orderItem = pgTable("order_item", {
  id: serial("id").primaryKey(),
  orderId: serial("order_id").references(() => order.id),
  productId: serial("product_id").references(() => product.id),
  quantity: doublePrecision(),
  price: doublePrecision(),
  observation: text("observation"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().$onUpdate(() => new Date()),
});
