import { Op, Sequelize, WhereOptions } from "sequelize";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import cloudinary from "../config/cloudinary.config.js";
import type { UploadApiResponse } from "cloudinary";
import mime from "mime-types";

export function buildSearchQuery(
  fields: string[],
  search: string,
  useRegex = false
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


export async function processFile(
  filePath: string,
  tenantId: string,
  folder: string,
  originalName: string
) {
  const ext = path.extname(originalName).toLowerCase();
  const mimeType = mime.lookup(originalName) || ""; // ✅ use originalName not filePath
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".pdf",
    ".doc",
    ".docx",
  ];

  if (!allowedExtensions.includes(ext)) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw new Error(
      `Invalid file type. Allowed: ${allowedExtensions.join(", ")}`
    );
  }

  const isImage = mimeType.startsWith("image/");
  const folderPath = path.join("uploads", folder);

  // ✅ Ensure upload directory exists
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

  let outputFileName = `${tenantId}-${Date.now()}${isImage ? ".webp" : ext}`;
  let outputPath = path.join(folderPath, outputFileName);

  // ✅ Check if original file exists before anything
  if (!fs.existsSync(filePath)) {
    throw new Error(`Source file does not exist: ${filePath}`);
  }

  if (isImage) {
    await sharp(filePath).resize(300, 300).toFormat("webp").toFile(outputPath);
  } else {
    fs.copyFileSync(filePath, outputPath);
  }

  // ✅ Clean original file AFTER successful processing
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  // ☁️ Upload to Cloudinary
  let cloudResult: UploadApiResponse;

    cloudResult = (await cloudinary.uploader.upload(outputPath, {
      folder,
      resource_type: isImage ? "image" : "raw",
      public_id: path.parse(outputFileName).name,
    })) as UploadApiResponse;
  // if (isImage) {
  //   // 🖼️ Normal image upload (returns a Promise)
  //   cloudResult = (await cloudinary.uploader.upload(outputPath, {
  //     folder,
  //     resource_type: "image",
  //     public_id: path.parse(outputFileName).name,
  //   })) as UploadApiResponse;
  // } else {
  //   // 📄 Large file upload (must wrap in a Promise)
  //   cloudResult = await new Promise<UploadApiResponse>((resolve, reject) => {
  //     cloudinary.uploader.upload_large(
  //       filePath,
  //       {
  //         folder,
  //         resource_type: "raw", // pdf, doc, etc.
  //         public_id: path.parse(outputFileName).name,
  //       },
  //       (err, result) => {
  //         if (err) return reject(err);
  //         resolve(result as UploadApiResponse);
  //       }
  //     );
  //   });
  // }
  console.log("🔥 Cloudinary upload result:", cloudResult);

  if (!cloudResult?.secure_url || !cloudResult?.public_id) {
    throw new Error(
      "Cloudinary upload failed — no secure_url or public_id returned."
    );
  }

  // ✅ Remove local processed file AFTER upload
  if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

  return {
    url: cloudResult.secure_url,
    publicId: cloudResult.public_id,
    resourceType: cloudResult.resource_type,
    format: cloudResult.format,
    bytes: cloudResult.bytes,
  };
}



  export const toMoney = (n: number) =>
  Math.round((n + Number.EPSILON) * 100) / 100;