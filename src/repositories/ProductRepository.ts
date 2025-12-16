import { Op, Transaction } from "sequelize";
import Product from "../models/Product.js";
import ProductImage from "../models/ProductImage.js";
import ProductVariant from "../models/ProductVariant.js";
import { buildSearchQuery } from "../utils/helperFunctions.js";
import { Category } from "../models/Category.js";
import { ProductBranch } from "../models/ProductBranch.js";
import { Branch } from "../models/Branch.js";
import { fn, col, literal } from "sequelize";
import sequelize from "sequelize/lib/sequelize";

export class ProductRepository {
  public async create(data: any, t?: Transaction) {
    const product = await Product.create(data, { transaction: t });
    // variants
    if (Array.isArray(data.variants) && data.variants.length) {
      const variants = data.variants.map((v: any) => ({
        ...v,
        productId: product.id,
      }));
      await ProductVariant.bulkCreate(variants, { transaction: t });
    }
    // images
    if (Array.isArray(data.images) && data.images.length) {
      const imgs = data.images.map((img: any, i: number) => ({
        productId: product.id,
        url: img.url ?? img, // accept url or object with url
        order: i,
      }));
      await ProductImage.bulkCreate(imgs, { transaction: t });
    }
    return product;
  }

  public async update(id: number, data: any, t?: Transaction) {
    const product = await Product.findByPk(id);
    if (!product) return null;
    await product.update(data, { transaction: t });

    // replace variants (simple approach: delete existing and recreate)
    if ("variants" in data) {
      await ProductVariant.destroy({
        where: { productId: id },
        transaction: t,
      });
      if (Array.isArray(data.variants) && data.variants.length) {
        const variants = data.variants.map((v: any) => ({
          ...v,
          productId: id,
        }));
        await ProductVariant.bulkCreate(variants, { transaction: t });
      }
    }

    // replace images
    if ("images" in data) {
      if (Array.isArray(data.images) && data.images.length) {
        await ProductImage.destroy({ where: { productId: id }, transaction: t });
        const imgs = data.images.map((img: any, i: number) => ({
          productId: id,
          url: img.url ?? img,
          order: i,
        }));
        await ProductImage.bulkCreate(imgs, { transaction: t });
      }
    }
    return product;
  }

  public async findById(
    id: number,
    appRole: "owner" | "user",
    tenantId: string,
    branchId?: number
  ) {
    // Base include
    const include: any[] = [
      { model: ProductVariant, as: "variants" },
      { model: ProductImage, as: "images" },
      { model: Category, as: "categoryProduct" },
    ];

    if (appRole === "user" && branchId) {
      // Staff: only show inventory for their branch
      include.push({
        model: ProductBranch,
        as: "branches",
        where: { branchId },
        required: false,
      });
    } else if (appRole === "owner") {
      // Owner: show all branch inventories
      include.push({
        model: ProductBranch,
        as: "branches",
        required: false,
        include: [{ model: Branch, as: "branch" }],
      });
    }

    const product = await Product.findOne({
      where: { id, tenantId },
      include,
    });
    console.log("hello");

    if (!product) return null;

    const p = product.toJSON();
    console.log("hello");
    // Normalize data like in findAll
    if (appRole === "user" && branchId) {
      // Staff only sees inventory for their own branch
      const branchInv = (p as any).branches?.[0];
      console.log({ branchInv });
      (p as any).branchInventory = branchInv
        ? branchInv
        : { inventory: 0, branchId };
    }

    if (appRole === "owner") {
      // Owner sees total inventory across branches
      (p as any).totalInventory = ((p as any).branches || []).reduce(
        (sum: number, b: any) => sum + (b.inventory ?? 0),
        0
      );
    }

    return p;
  }

  public async findAll(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    tenantId: string,
    appRole: "owner" | "user",
    branchId?: number // only for staff/admin viewing a specific branch
  ) {
    const searchCondition = buildSearchQuery(["title", "description"], search);

    const offset = (page - 1) * limit;

    const include: any[] = [
      { model: ProductImage, as: "images" },
      { model: ProductVariant, as: "variants" },
      { model: Category, as: "categoryProduct" },
    ];

    if (!page && !limit) {
      return await Product.findAll({ where: { tenantId }, include });
    }

    // Add branch inventory conditionally
    if (appRole === "user" && branchId) {
      // Staff only sees inventory for their branch
      console.log("user");
      include.push({
        model: ProductBranch,
        as: "branches",
        where: { branchId },
        required: false, // allow products with no record yet
      });
    } else if (appRole === "owner") {
      // Owner/Admin sees all branches (can sum inventory or see per branch)
      include.push({
        model: ProductBranch,
        as: "branches",
        required: false,
        include: [{ model: Branch, as: "branch" }],
      });
    }

    const { rows, count } = await Product.findAndCountAll({
      where: { tenantId, ...searchCondition },
      include,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // Normalize branch inventory for staff
    const normalizedRows = rows.map((p: any) => {
      const product = p.toJSON();
      console.log("inventory: ", product.branches);
      if (appRole === "user" && branchId) {
        // If no branchInventory exists, fallback to 0
        product.branchInventory = product.branches[0] ?? {
          inventory: 0,
          branchId,
          qtySold: 0,
        };
      } else if (appRole === "owner") {
        // Calculate total inventory across branches for dashboard
        product.totalInventory = (product.branches || []).reduce(
          (sum: number, b: any) => sum + (b.inventory ?? 0),
          0
        );

        product.qtySold = (product.branches || []).reduce(
          (sum: number, b: any) => sum + (b.qtySold ?? 0),
          0
        );
      }

      return product;
    });

    return {
      rows: normalizedRows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  public async delete(id: number) {
    return Product.destroy({ where: { id } });
  }

  public async bulkUpload(products: Product[], tenantId: string) {
    // Attach tenantId and createdBy
    const records = products.map((p) => ({
      ...p,
      tenantId,
    }));

    // Perform bulk insert (ignoring duplicates)
    return await Product.bulkCreate(records, { ignoreDuplicates: true });
  }

  public async fetchSaleProducts({
    tenantId,
    branchId,
    topLimit = 10,
    search = "",
    categoryId = "ALL"
  }: {
    tenantId: string;
    branchId?: number;
    topLimit?: number;
    search?: string;
    categoryId?: number | "ALL";
  }) {
    const productWhere = {
      tenantId,
      // status: "active",
    };

    const branchWhere: any = {
      isActive: true,
    };

    if (branchId) {
      branchWhere.branchId = branchId;
    }
    if (search) {
      Object.assign(productWhere, buildSearchQuery(["title", "description"], search));
    }
    if (categoryId !== "ALL") {
      Object.assign(productWhere, { categoryId });
    }

    console.log({ productWhere, branchWhere });
    /* -----------------------------
       ALL PRODUCTS
    ----------------------------- */
    const products = await Product.findAll({
      where: productWhere,
      include: [
        {
          model: ProductBranch,
          as: "branches",
          where: branchWhere,
          required: false,
        },
        { model: ProductVariant, as: "variants" },
        { model: Category, as: "categoryProduct" },
        { model: ProductImage, as: "images" },
      ],
      order: [["createdAt", "DESC"]],
    });

    /* -----------------------------
       MOST PURCHASED PRODUCTS
    ----------------------------- */
    const topProducts = await ProductBranch.findAll({
      attributes: ["productId", [fn("SUM", col("qtySold")), "totalSold"]],
      where: {
        isActive: true,
        ...(branchId && { branchId }),
        qtySold: { [Op.gt]: 0 },
      },
      group: ["productId"],
      order: [[literal("totalSold"), "DESC"]],
      limit: topLimit,
      raw: true,
    });
    const productIds = topProducts.map((p) => p.productId);
    const mostProducts = {id: productIds, tenantId};
    if(categoryId !== "ALL"){
      Object.assign(mostProducts, {categoryId});
    }
    if(search){
      Object.assign(mostProducts, buildSearchQuery(["title", "description"], search));
    }
    const mostPurchasedProducts = await Product.findAll({
      where: mostProducts,
      include: [
        { model: ProductImage, as: "images" },
        { model: ProductVariant, as: "variants" },
        { model: Category, as: "categoryProduct" },
        {
          model: ProductBranch,
          as: "branches",
          where: branchWhere,
          required: false,
        },
      ],
    });

    console.log({ mostPurchasedProducts });
    const soldMap = new Map(
      topProducts.map((p) => [p.productId, (p as any).totalSold])
    );

    const enrichedMostPurchased = mostPurchasedProducts.map((p) => ({
      ...p.toJSON(),
      totalSold: soldMap.get(p.id) ?? 0,
    }));

    return {
      products,
      mostPurchasedProducts: enrichedMostPurchased,
    };
  }

  public async fetchLowStockProducts({
  tenantId,
  branchId,
  page = 1,
  limit = 10,
  search = "",
  appRole = "user"
}: {
  tenantId: string;
  branchId?: number;
  appRole?: "owner" | "user";
  page?: number;
  limit?: number;
  search?: string;
}) {
  // Base filter for tenant
  const where: any = { tenantId };

  if (appRole === "user" && branchId) {
    where.branchId = branchId;
  }
    const searchCondition = buildSearchQuery(["title", "description"], search);
    Object.assign(where, searchCondition);
  const offset = (page - 1) * limit;

  // Include product and filter by threshold
  const {rows, count} = await ProductBranch.findAndCountAll({
    where,
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["id", "title", "threshold"],
        required: true,
        where: {
          threshold: { [Op.gte]: sequelize.col("ProductBranch.inventory") } // <-- compare correctly
        }
      },
      {model: Branch, as: "branchInfo", attributes: ["id", "name"]  }
    ],
    limit,
    offset,
  });

  return {
    rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  };
}
}
