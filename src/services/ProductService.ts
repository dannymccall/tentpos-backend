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
    try {
      let uploadedImages: string[] = [];

      if (Array.isArray(payload.images) && payload.images.length) {
        const files = payload.images as Express.Multer.File[];

        for (const file of files) {
          const attachment = await processFile({
            filePath: file.path,
            tenantId: payload.tenantId,
            folder: "products",
            originalName: file.originalname,
            type: "gallery",
          });
          uploadedImages.push(attachment?.url!);
        }
      }

      payload.images = uploadedImages;

      console.log("going to repo");
      const t = await sequelize.transaction();
      try {
        const created = await this.repo.create(payload, t);
        await t.commit();
        return created;
      } catch (err) {
        await t.rollback();
        throw err;
      }
    } catch (err) {
      console.error("🔥 createProduct failed", err);
      throw err;
    }
  }

  public async updateProduct(id: number, payload: any) {
    try {
      // TODO: image handling / partial patching logic
      const files = payload.images as Express.Multer.File[];
      console.log({ files });
      const uploadedImages: string[] = [];
      if (Array.isArray(payload.images) && payload.images.length) {
        console.log("before processing")
        for (let i = 0; i < files.length;i++ ) {
          const file  = files[i];
          console.log({file})
          const attachment = await processFile({
            filePath: file.path,
            tenantId: payload.tenantId,
            folder: "products",
            originalName: file.originalname,
            type: "gallery",
          });
          uploadedImages.push(attachment?.url!);
        }
      }
              console.log("after processing")

      console.log("going to repo");

      payload.images = uploadedImages;
      const updated = await this.repo.update(id, payload);

      return updated;
    } catch (err) {
      console.error("🔥 createProduct failed", err);

      throw err;
    }
  }

  public async getProduct(
    id: number,
    appRole: "owner" | "user",
    tenantId: string,
    branchId?: number,
  ) {
    return this.repo.findById(id, appRole, tenantId, branchId);
  }

  public async listProducts(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    tenantId: string,
    appRole: "owner" | "user",
    branchId?: number, // only for staff/admin viewing a specific branch
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
    tenantId: string,
  ) {
    if (!branchId) {
      return;
    }
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

  public async getInventoryBreakdown(productId: number) {
    return await this.repo.getInventoryBreakdown(productId);
  }
}
