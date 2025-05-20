// deno-lint-ignore-file no-explicit-any
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";
import { IDatabase } from "../interfaces/IDatabase.ts";

export class MockDatabase implements IDatabase {
  constructor() {
    this.data = new Map<string | number, any>();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private generateNumberId(): number {
    return Math.floor(Math.random() * 1000000);
  }

  private data: Map<string | number, any>;

  insert<T extends TableConfig>(
    _table: PgTableWithColumns<T>,
    data: InferInsertModel<PgTableWithColumns<T>>,
  ): Promise<{
    id: typeof _table["id"]["_"]["data"];
  }> {
    let id;

    if (_table.id.columnType == "PgSerial") {
      id = this.generateNumberId();
    } else {
      id = this.generateId();
    }

    this.data.set(id, { ...data, id, table: _table });
    return Promise.resolve({ id });
  }

  update<T extends TableConfig>(
    _table: PgTableWithColumns<T>,
    id: string | number,
    data: PgTableWithColumns<T>["$inferInsert"],
  ): Promise<{
    id: typeof _table["id"]["_"]["data"];
  }> {
    if (this.data.has(id)) {
      this.data.set(id, { ...this.data.get(id), ...data });
      return Promise.resolve({ id });
    }
    return Promise.reject(new Error("Not found"));
  }

  delete<T extends TableConfig>(
    _table: PgTableWithColumns<T>,
    id: string | number,
  ): Promise<boolean> {
    if (this.data.has(id)) {
      this.data.delete(id);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  select<T extends TableConfig>(
    _table: PgTableWithColumns<T>,
    id: string | number,
  ): Promise<InferSelectModel<PgTableWithColumns<T>> | null> {
    if (this.data.has(id)) {
      return Promise.resolve(this.data.get(id));
    }
    return Promise.resolve(null);
  }

  selectAll<T extends TableConfig>(
    table: PgTableWithColumns<T>,
  ): Promise<InferSelectModel<PgTableWithColumns<T>>[]> {
    const results: InferSelectModel<PgTableWithColumns<T>>[] = [];
    this.data.forEach((value) => {
      if (value.table === table) {
        results.push(value);
      }
    });
    return Promise.resolve(results);
  }

  selectByField<T extends TableConfig>(
    table: PgTableWithColumns<T>,
    field: keyof InferSelectModel<PgTableWithColumns<T>>,
    value: string | number,
  ): Promise<InferSelectModel<PgTableWithColumns<T>>[]> {
    const results: InferSelectModel<PgTableWithColumns<T>>[] = [];
    this.data.forEach((record) => {
      if (record.table === table && record[field] === value) {
        results.push(record);
      }
    });

    return Promise.resolve(results);
  }
}