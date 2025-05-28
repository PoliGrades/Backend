import { product as productTable } from "../database/schema.ts";
import { IDatabase } from "../interfaces/IDatabase.ts";
import { productSchema } from "../schemas/zodSchema.ts";
import { validateData } from "./decorators.ts";

export class ProductService {
  private db: IDatabase;

  constructor(db: IDatabase) {
    this.db = db;
  }

  async getAllProducts() {
    const products = await this.db.selectAll(productTable);
    if (!products) {
      throw new Error("There was an error getting the products");
    }
    return products;
  }

  async getProductById(id: number) {
    const product = await this.db.select(productTable, id);
    if (!product) {
      throw new Error("There was an error getting the product");
    }
    return product;
  }

  @validateData(productSchema)
  async createProduct(product: Partial<typeof productTable.$inferInsert>) {
    const newProduct = await this.db.insert(
      productTable,
      {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as typeof productTable.$inferInsert,
    );
    if (!newProduct) {
      throw new Error("There was an error creating the product");
    }
    return newProduct;
  }

  async deleteProduct(id: number) {
    const deletedProduct = await this.db.delete(productTable, id);
    if (!deletedProduct) {
      throw new Error("There was an error deleting the product");
    }
    return deletedProduct;
  }
}
