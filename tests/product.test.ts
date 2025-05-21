import { expect } from "jsr:@std/expect/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { MockDatabase } from "../src/database/MockDatabase.ts";
import { generateMockProduct } from "../src/mocks/Product.ts";
import { generateMockPassword, generateMockUser } from "../src/mocks/User.ts";
import { AuthenticationService } from "../src/services/AuthenticationService.ts";
import { ProductService } from "../src/services/ProductService.ts";

describe("Product service", () => {
  let _user: number;

  beforeAll(async () => {
    const db = new MockDatabase();
    const authenticationService = new AuthenticationService(db);

    const newUser = generateMockUser();
    const userPassword = generateMockPassword();

    _user = await authenticationService.registerUser(newUser, userPassword);
  });

  it("should create a new product", async () => {
    const db = new MockDatabase();
    const productService = new ProductService(db);

    const newProduct = generateMockProduct();
    const createdProduct = await productService.createProduct(newProduct);
    expect(createdProduct).toHaveProperty("id");
  });

  it("should get all products", async () => {
    const db = new MockDatabase();
    const productService = new ProductService(db);

    const products = await productService.getAllProducts();
    expect(products).toBeInstanceOf(Array);
  });

  it("should get a product by id", async () => {
    const db = new MockDatabase();
    const productService = new ProductService(db);

    const newProduct = generateMockProduct();
    const createdProduct = await productService.createProduct(newProduct);

    const product = await productService.getProductById(createdProduct.id);
    expect(product).toHaveProperty("id", createdProduct.id);
  });
});
