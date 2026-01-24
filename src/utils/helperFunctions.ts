import { Op, Sequelize, WhereOptions } from "sequelize";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import cloudinary from "../config/cloudinary.config.js";
import type { UploadApiResponse } from "cloudinary";
import mime from "mime-types";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
export function buildSearchQuery(
  fields: string[],
  search: string,
  useRegex = false,
): WhereOptions {
  if (!search) return {};

  return {
    [Op.or]: fields.map((field) => {
      if (field.includes(".") || field.includes("->")) {
        // nested include (use Sequelize.col)
        return Sequelize.where(Sequelize.col(field), {
          [useRegex ? Op.iRegexp : Op.like]: useRegex ? search : `%${search}%`,
        });
      }

      // direct field
      return {
        [field]: {
          [useRegex ? Op.iRegexp : Op.like]: useRegex ? search : `%${search}%`,
        },
      };
    }),
  };
}

export function generateBranchCode(lastCode?: string): string {
  if (!lastCode) return "001"; // first branch

  const next = parseInt(lastCode, 10) + 1;

  return String(next).padStart(3, "0");
}

export type UploadType = "logo" | "avatar" | "gallery" | "document";
interface UploadStrategy {
  isImage: boolean;
  outputExt: string;
  process(filePath: string, outputPath: string): Promise<void>;
  cloudinaryOptions(folder: string, publicId: string): Record<string, any>;
}

const logoStrategy: UploadStrategy = {
  isImage: true,
  outputExt: ".webp",

  async process(input, output) {
    await sharp(input)
      .rotate()
      .resize({
        width: 600,
        height: 300,
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFormat("webp", { quality: 90 })
      .toFile(output);
  },

  cloudinaryOptions(folder, publicId) {
    return {
      folder,
      resource_type: "image",
      public_id: publicId,
    };
  },
};

const avatarStrategy: UploadStrategy = {
  isImage: true,
  outputExt: ".webp",

  async process(input, output) {
    await sharp(input)
      .rotate()
      .resize({ width: 600, height: 300, fit: "inside" })
      .toFormat("webp", { quality: 80 })
      .toFile(output);
  },

  cloudinaryOptions(folder, publicId) {
    return {
      folder,
      resource_type: "image",
      public_id: publicId,
    };
  },
};

const galleryStrategy: UploadStrategy = {
  isImage: true,
  outputExt: ".webp",

  async process(input, output) {
    await sharp(input)
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFormat("webp", { quality: 82 })
      .toFile(output);
  },

  cloudinaryOptions(folder, publicId) {
    return {
      folder,
      resource_type: "image",
      public_id: publicId,
    };
  },
};

const documentStrategy: UploadStrategy = {
  isImage: false,
  outputExt: "",

  async process(input, output) {
    fs.copyFileSync(input, output);
  },

  cloudinaryOptions(folder, publicId) {
    return {
      folder,
      resource_type: "raw",
      public_id: publicId,
    };
  },
};
const strategies: Record<UploadType, UploadStrategy> = {
  logo: logoStrategy,
  avatar: avatarStrategy,
  gallery: galleryStrategy,
  document: documentStrategy,
};

export async function processFile({
  filePath,
  tenantId,
  folder,
  originalName,
  type,
}: {
  filePath: string;
  tenantId: string;
  folder: string;
  originalName: string;
  type: UploadType;
}) {
  try{

    const strategy = strategies[type];
    if (!strategy) throw new Error(`Unsupported upload type: ${type}`);
  
    const ext = path.extname(originalName).toLowerCase();
    const mimeType = mime.lookup(originalName) || "";
  
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".doc", ".docx"];
  
    if (!allowed.includes(ext)) {
      fs.existsSync(filePath) && fs.unlinkSync(filePath);
      throw new Error("Invalid file type");
    }
  
    const uploadDir = path.join("uploads", folder);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  
    const outputName = `${tenantId}-${Date.now()}${strategy.outputExt || ext}`;
    const outputPath = path.join(uploadDir, outputName);
  
    if (!fs.existsSync(filePath)) {
      throw new Error("Source file missing");
    }
  
 console.log("🟡 processFile start", filePath);
await strategy.process(filePath, outputPath);
console.log("🟢 processing done");

  
    fs.unlinkSync(filePath);
  
    const cloudResult = (await cloudinary.uploader.upload(
      outputPath,
      strategy.cloudinaryOptions(folder, path.parse(outputName).name),
    )) as UploadApiResponse;
  
    if (!cloudResult?.secure_url) {
      throw new Error("Cloudinary upload failed");
    }
  
    fs.unlinkSync(outputPath);
  
    return {
      url: cloudResult.secure_url,
      publicId: cloudResult.public_id,
      resourceType: cloudResult.resource_type,
      bytes: cloudResult.bytes,
    };
  }catch(error){
    console.log(error);
      throw error;

  }
}

export const toMoney = (n: number) =>
  Math.round((n + Number.EPSILON) * 100) / 100;

export const signServiceJWT = (
  appId: string,
  tenantId: string,
  userId: number,
  scopes: string[],
) => {
  return jwt.sign(
    { type: "service", appId, tenantId, userId, scope: scopes },
    ENV.SERVICE_JWT_SECRET,
    { expiresIn: "15m" },
  );
};
