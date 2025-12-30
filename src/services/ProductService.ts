import { Op } from "sequelize";
import sequelize from "../config/database.js";
import Product from "../models/Product.js";
import { ProductBranch } from "../models/ProductBranch.js";
import { ProductRepository } from "../repositories/ProductRepository.js";
import { AppError } from "../utils/AppError.js";
import { processFile } from "../utils/helperFunctions.js";
export default class ProductService {
  private repo: ProductRepository;

  constructor() {
    this.repo = new ProductRepository();
  }

  public async createProduct(payload: any) {
    // Step 1: upload images BEFORE transaction
    let uploadedImages: string[] = [];

    if (Array.isArray(payload.images) && payload.images.length) {
      const files = payload.images as Express.Multer.File[];

      uploadedImages = await Promise.all(
        files.map(async (file) => {
          const attachment = await processFile(
            file.path,
            payload.tenantId,
            "products",
            file.originalname
          );
          return attachment.url;
        })
      );
    }

    payload.images = uploadedImages;
    console.log({ payload });
    // Step 2: NOW start the transaction
    const t = await sequelize.transaction();
    try {
      const created = await this.repo.create(payload, t);
      await t.commit();
      return created;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  public async updateProduct(id: number, payload: any) {
    const t = await sequelize.transaction();
    try {
      // TODO: image handling / partial patching logic
      const files = payload.images as Express.Multer.File[];
      console.log({ files });
      const uploadedImages: string[] = [];
      if (files && files.length > 0) {
        await Promise.all(
          files.map(async (file) => {
            // 👇 This could fail if internet is down
            const attachment = await processFile(
              file.path,
              payload.tenantId,
              "products",
              file.originalname
            );
            uploadedImages.push(attachment.url);
          })
        );
      }

      payload.images = uploadedImages;
      const updated = await this.repo.update(id, payload, t);
      await t.commit();
      return updated;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  public async getProduct(
    id: number,
    appRole: "owner" | "user",
    tenantId: string,
    branchId?: number
  ) {
    return this.repo.findById(id, appRole, tenantId, branchId);
  }

  public async listProducts(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    tenantId: string,
    appRole: "owner" | "user",
    branchId?: number // only for staff/admin viewing a specific branch
  ) {
    return this.repo.findAll(page, limit, search, tenantId, appRole, branchId);
  }

  public async deleteProduct(id: number) {
    return this.repo.delete(id);
  }

  public bulkUpload = async (products: Product[], tenantId: string) => {
    return await this.repo.bulkUpload(products, tenantId);
  };

  public async updateBranchProduct(
    id: number,
    quantity: number,
    branchId: number,
    tenantId: string
  ) {
    let branchProduct = await ProductBranch.findOne({
      where: { productId: id, branchId },
    });

    if (branchProduct && quantity > 0) {
      // update existing inventory
      await branchProduct.update({ inventory: quantity });
    } else {
      // create new record for that branch
      branchProduct = await ProductBranch.create({
        productId: id,
        branchId,
        inventory: quantity,
        tenantId,
      });
    }

    return branchProduct;
  }
  public async fetchSaleProducts({
    tenantId,
    branchId,
    topLimit = 10,
    search = "",
    categoryId = "ALL",
  }: {
    tenantId: string;
    branchId?: number;
    topLimit?: number;
    search?: string;
    categoryId?: number | "ALL";
  }) {
    return this.repo.fetchSaleProducts({
      tenantId,
      branchId,
      topLimit,
      search,
      categoryId,
    });
  }

  public async fetchLowStockProducts({
    tenantId,
    branchId,
    page = 1,
    limit = 10,
    appRole = "user",
    search = "",
  }: {
    tenantId: string;
    branchId?: number;
    appRole?: "owner" | "user";
    page?: number;
    limit?: number;
    search?: string;
  }) {
    return this.repo.fetchLowStockProducts({
      tenantId,
      branchId,
      page,
      limit,
      search,
      appRole,
    });
  }

  public async getInventoryBreakdown (productId: number){
    return await this.repo.getInventoryBreakdown(productId)
  }
}
