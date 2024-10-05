import { Schema, Types, model } from "mongoose";
import { Guides } from "../services/esbService/esbTypes";
import { log } from "../services/loggerService";

/**
 * Ревизия справочника в шине данных
 */
interface GuideRevision {
  _id: Types.ObjectId;
  number: number;
  revision: number;
}

const guideRevisionSchema = new Schema<GuideRevision>({
  number: { type: Number, required: true, unique: true },
  revision: { type: Number, required: true },
});

/**
 * Mongoose модель ревизии справочника
 */
const GuideRevisionModel = model<GuideRevision>(
  "GuideRevision",
  guideRevisionSchema,
);

/**
 * Получает ревизию справочника в БД приложения
 */
async function getGuideRevision(guideNumber: Guides): Promise<number> {
  log.debug(`getGuideRevision(guideNumber= ${guideNumber})`);
  const row = await GuideRevisionModel.findOne({ number: guideNumber });
  return row ? row.revision : 0;
}

/**
 * Записывает ревизию указанного справочника в БД приложения
 */
async function setGuideRevision(guideNumber: Guides, revision: number) {
  log.debug(
    `setGuideRevision(guideNumber= ${guideNumber}, revision= ${revision})`,
  );

  await GuideRevisionModel.findOneAndUpdate(
    { number: guideNumber },
    { revision: revision },
    { upsert: true },
  );
}

export {
  GuideRevisionModel,
  GuideRevision,
  getGuideRevision,
  setGuideRevision,
};
