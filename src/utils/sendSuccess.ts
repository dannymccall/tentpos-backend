import { Response } from "express";

export const sendSuccess = (
  res: Response,
  message: string,
  data?: any,
  status: number = 200
) => {
  const safeData = Array.isArray(data)
    ? data.map((d) => (d?.toJSON ? d.toJSON() : d))
    : data?.toJSON
    ? data.toJSON()
    : data;

  return res.status(status).json({
    success: true,
    message,
    data: safeData,
  });
};
