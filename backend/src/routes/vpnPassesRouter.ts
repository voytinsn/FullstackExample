import { Router } from "express";
import { getUnexpiredVpnPasses } from "../worker/workerVpnHelper";
import { HydratedDocument } from "mongoose";
import { VpnPassPopulated } from "../models/vpnPassModel";

export const vpnPassesRouter = Router();

/**
 * Получение списка активных разрешений на VPN
 */
vpnPassesRouter.get("/", async (_req, res, next) => {
  try {
    const passes: HydratedDocument<VpnPassPopulated>[] =
      await getUnexpiredVpnPasses();
    res.json(passes);
  } catch (e: unknown) {
    next(e);
  }
});
