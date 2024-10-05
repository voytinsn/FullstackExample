import { Router, Response } from "express";
import { Company, CompanyModel } from "../models/companyModel";
import { appConfig } from "../utils/appConfig";

export const companiesRouter = Router();

/**
 * Получения списка разрешенных предприятий из БД приложения
 */
companiesRouter.get("/", async (_req, res: Response<Company[]>, next) => {
  try {
    const companies: Company[] = await CompanyModel.find({
      esbId: { $in: appConfig.ALLOWED_COMPANIES },
    }).lean();
    res.json(companies);
  } catch (e: unknown) {
    next(e);
  }
});
