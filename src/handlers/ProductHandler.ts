import { ZodError } from "zod";
import { IDatabase } from "../interfaces/IDatabase.ts";
import { IHandlerReturn } from "../interfaces/IHandlerReturn.ts";
import { IProduct } from "../interfaces/IProduct.ts";
import { ProductService } from "../services/ProductService.ts";

export class ProductHandler {
  private productService: ProductService;

  constructor(db: IDatabase) {
    this.productService = new ProductService(db);
  }

  async createProduct(product: Partial<IProduct>): Promise<IHandlerReturn> {
    try {
      product.createdAt = new Date();
      product.updatedAt = new Date();
      const newProduct = await this.productService.createProduct(product);
      if (!newProduct) {
        return {
          status: 500,
          message: "There was an error creating the product",
        };
      }

      return {
        status: 201,
        message: "Product created successfully",
        data: newProduct,
      };
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      if (error instanceof ZodError) {
        return {
          status: 400,
          message: "Invalid product data",
          error: error.errors.map((e) => e.message).join(", "),
        };
      }

      return {
        status: 500,
        message: "Error creating product",
        error: error.message,
      };
    }
  }

  async getProducts(): Promise<IHandlerReturn> {
    try {
      const products = await this.productService.getAllProducts();
      if (!products) {
        return {
          status: 500,
          message: "There was an error getting the products",
        };
      }

      return {
        status: 200,
        message: "Products retrieved successfully",
        data: products,
      };
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      return {
        status: 500,
        message: "Error creating product",
        error: error.message,
      };
    }
  }

  async getProductById(id: number): Promise<IHandlerReturn> {
    try {
      const product = await this.productService.getProductById(id);
      if (!product) {
        return {
          status: 404,
          message: "Product not found",
        };
      }

      return {
        status: 200,
        message: "Product retrieved successfully",
        data: product,
      };
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      return {
        status: 500,
        message: "Error creating product",
        error: error.message,
      };
    }
  }
}
