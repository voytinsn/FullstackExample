import { Router, Response } from "express";
import { AdUser } from "../services/adService";
import { adService } from "../services/adService";
import { NotFoundError } from "../utils/customErrors";

export const adUsersRouter = Router();

/**
 * Получение информации о пользователе в AD по логину
 */
adUsersRouter.get("/:login", async (req, res: Response<AdUser>, next) => {
  try {
    const adUser: AdUser | null = await adService.getAdUser(req.params.login);

    if (adUser) {
      res.json(adUser);
    } else {
      throw new NotFoundError("User not found");
    }
  } catch (e: unknown) {
    next(e);
  }
});
