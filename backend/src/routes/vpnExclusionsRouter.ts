import { Response, Router } from "express";
import { log } from "../services/loggerService";
import { Company, CompanyModel } from "../models/companyModel";
import {
  NewVpnExclusion,
  VpnExclusionModel,
  VpnExclusionTypes,
  NewVpnExclusionZod,
  VpnExclusion,
  VpnExclusionPopulated,
} from "../models/vpnExclusionModel";
import { z } from "zod";
import { HydratedDocument } from "mongoose";
import { ValidationError, NotFoundError } from "../utils/customErrors";
import { ThreadMessage, ThreadMessageTypes } from "../types";
import { worker } from "../worker/initWorker";

export const vpnExclusionsRouter = Router();

/**
 * Получение списка исключений из правил VPN
 */
vpnExclusionsRouter.get(
  "/",
  async (req, res: Response<VpnExclusionPopulated[]>, next) => {
    try {
      const filter = VpnExclusionFilterZod.parse(req.query);
      const result: VpnExclusionPopulated[] = await VpnExclusionModel.find(
        filter,
      )
        .populate<{ company: Company }>({
          path: "company",
          model: CompanyModel,
        })
        .lean();
      return res.json(result);
    } catch (e) {
      next(e);
    }
  },
);

/**
 * Добавление исключения VPN
 */
vpnExclusionsRouter.post(
  "/",
  async (req, res: Response<VpnExclusion>, next) => {
    log.debug(
      "Получен POST запрос на добавление исключения в правила обработки VPN",
      req.body,
    );

    try {
      // Валидация запроса
      const exclusion: NewVpnExclusion = NewVpnExclusionZod.parse(req.body);
      const dbCompany: Company | null = await CompanyModel.findById(
        exclusion.company,
      );
      if (!dbCompany) {
        throw new ValidationError(
          `Company with id ${exclusion.company} not found`,
        );
      }

      // Сохранение исключения в БД
      const dbExclusion: HydratedDocument<VpnExclusion> = new VpnExclusionModel(
        exclusion,
      );
      await dbExclusion.save();
      log.info(
        `Добавлено исключение в правила обработки VPN: ${JSON.stringify(dbExclusion)}`,
      );
      res.json(dbExclusion);

      // Отправка сообщения в фоновый поток
      const message: ThreadMessage = {
        type: ThreadMessageTypes.OnExclusionsChanged,
      };
      worker.postMessage(message);
    } catch (e) {
      next(e);
    }
  },
);

/**
 * Удаления исключения из правил VPN
 */
vpnExclusionsRouter.delete(
  "/:id",
  async (req, res: Response<{ success: boolean }>, next) => {
    log.debug(
      "Получен запрос на удаление исключения из правил обработки VPN",
      req.params,
    );

    try {
      const result = await VpnExclusionModel.findByIdAndDelete(req.params.id);

      if (!result) throw new NotFoundError("Exclusion not found");

      res.json({ success: true });

      // Отправка сообщения в фоновый поток
      const message: ThreadMessage = {
        type: ThreadMessageTypes.OnExclusionsChanged,
      };
      worker.postMessage(message);
    } catch (e) {
      next(e);
    }
  },
);

const VpnExclusionFilterZod = z.object({
  login: z.string().min(1).optional(),
  type: z.nativeEnum(VpnExclusionTypes).optional(),
  company: z.string().optional().optional(),
});
