// deno-lint-ignore-file
//@ts-nocheck just to avoid typescript errors
import {
  and,
  eq,
  InferInsertModel,
  InferSelectModel,
  TableConfig,
} from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { PgTableWithColumns } from "drizzle-orm/pg-core/table";
import { IDatabase } from "../interfaces/IDatabase.ts";

export class PostgresDatabase implements IDatabase {
  private db: NodePgDatabase;

  constructor() {
    this.db = drizzle(
      Deno.env.get("ENVIRONMENT") === "production"
        ? Deno.env.get("DATABASE_URL")
        : Deno.env.get("TEST_DATABASE_URL"),
      {
        logger: false,
      },
    );
  }

  getDatabase(): NodePgDatabase {
    return this.db;
  }

  async insert<T extends TableConfig>(
    table: PgTableWithColumns<T>,
    data: InferInsertModel<PgTableWithColumns<T>>,
  ): Promise<{ id: (typeof table)["id"]["_"]["data"] }> {
    const res = await this.db.insert(table).values(data).returning({
      id: table.id,
    });
    return res[0];
  }

  async update<T extends TableConfig>(
    table: PgTableWithColumns<T>,
    id: string | number,
    data: PgTableWithColumns<T>["$inferInsert"],
  ): Promise<{ id: (typeof table)["id"]["_"]["data"] }> {
    const res = await this.db.update(table).set(data).where(eq(table.id, id))
      .returning();

    return res[0];
  }

  async delete<T extends TableConfig>(
    table: PgTableWithColumns<T>,
    id: string | number,
  ): Promise<boolean> {
    const res = await this.db.delete(table).where(eq(table.id, id));
    if (res.rowCount !== null && res.rowCount > 0) {
      return true;
    }

    return false;
  }

  async select<T extends TableConfig>(
    table: PgTableWithColumns<T>,
    id: string | number,
  ): Promise<InferSelectModel<PgTableWithColumns<T>> | null> {
    const res = await this.db.select().from(table).where(eq(table.id, id));
    if (res.length > 0) {
      return res[0];
    }
    return null;
  }

  selectAll<T extends TableConfig>(
    table: PgTableWithColumns<T>,
  ): Promise<InferSelectModel<PgTableWithColumns<T>>[]> {
    return this.db.select().from(table);
  }

  selectByField<T extends TableConfig>(
    table: PgTableWithColumns<T>,
    field: keyof InferSelectModel<PgTableWithColumns<T>>,
    value: string | number,
  ): Promise<InferSelectModel<PgTableWithColumns<T>>[]> {
    return this.db.select().from(table).where(eq(table[field], value));
  }

  selectByFields<T extends TableConfig>(
    table: PgTableWithColumns<T>,
    fields: Partial<
      Record<keyof InferSelectModel<PgTableWithColumns<T>>, string | number>
    >,
  ): Promise<InferSelectModel<PgTableWithColumns<T>>[] | null> {
    const query = this.db.select().from(table).where(
      and(
        ...Object.entries(fields).map(([key, value]) =>
          eq(
            table[key as keyof InferSelectModel<PgTableWithColumns<T>>],
            value,
          ) as any
        ),
      ),
    );
    return query;
  }
}
