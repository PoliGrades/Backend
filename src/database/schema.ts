import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    document: text("document").notNull().unique(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", {
        withTimezone: true,
    }).notNull().$onUpdate(() => new Date()),
})