import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";

export interface IDatabase {
  /**
   * Inserts a new record into the specified table.
   * @param table - The table to insert the record into.
   * @param data - The data to insert.
   * @returns The inserted record's ID.
   */
  insert<T extends TableConfig>(
    table: PgTableWithColumns<T>,
    data: InferInsertModel<PgTableWithColumns<T>>,
  ): Promise<{
    id: typeof table["id"]["_"]["data"];
  }>;

  /**
   * Updates an existing record in the specified table.
   * @param table - The table to update the record in.
   * @param id - The ID of the record to update.
   * @param data - The data to update.
   * @returns The updated record's ID.
   */
  update<T extends TableConfig>(
    table: PgTableWithColumns<T>,
    id: string | number,
    data: PgTableWithColumns<T>["$inferInsert"],
  ): Promise<{
    id: typeof table["id"]["_"]["data"];
  }>;

  /**
   * Deletes a record from the specified table.
   * @param table - The table to delete the record from.
   * @param id - The ID of the record to delete.
   * @returns A boolean indicating whether the deletion was successful.
   */
  delete<T extends TableConfig>(
    table: PgTableWithColumns<T>,
    id: string | number,
  ): Promise<boolean>;

  /**
   * Selects a record from the specified table by its ID.
   * @param table - The table to select the record from.
   * @param id - The ID of the record to select.
   * @returns The selected record or null if not found.
   */
  select<T extends TableConfig>(
    table: PgTableWithColumns<T>,
    id: string | number,
  ): Promise<InferSelectModel<PgTableWithColumns<T>> | null>;

  /**
   * Selects all records from the specified table.
   * @param table - The table to select records from.
   * @returns An array of selected records.
   */
  selectAll<T extends TableConfig>(
    table: PgTableWithColumns<T>,
  ): Promise<InferSelectModel<PgTableWithColumns<T>>[]>;

  /**
   * Selects records from the specified table by a specific field and value.
   * @param table - The table to select records from.
   * @param field - The field to filter by.
   * @param value - The value to filter by.
   * @returns An array of selected records.
   */
  selectByField<T extends TableConfig>(
    table: PgTableWithColumns<T>,
    field: keyof InferSelectModel<PgTableWithColumns<T>>,
    value: string | number,
  ): Promise<InferSelectModel<PgTableWithColumns<T>>[]>;
}