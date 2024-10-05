import { EsbRespPlural, EsbRespSingle, Guides } from "./esbTypes";
import axios, { AxiosRequestConfig } from "axios";
import { appConfig } from "../../utils/appConfig";
import { EsbRespPluralZod, EsbRespSingleZod } from "./esbParser";
import { log } from "../loggerService";

/**
 * Сервис для взаимодействия с шиной данных
 */
export const esbService = {
  getFromRev,
  getFromRevRecurs,
  getByEsbId,
};

// #region service methods

/**
 * Получает записи из указанного справочника в
 * шине данных начиная с указанной ревизии. Количество
 * записей ограничено размером страницы.
 *
 * @param guide номер справочника в шине данных
 * @param fromRevision ревизия начиная с которой нужно получить записи
 * @param page номера страницы для пагинатора
 * @param perPage записей на страницу
 * @param joinDepth при использовании этого параметра все внешние ключи
 *                  будут расшифрованы (преобразованы в соответствующие объекты)
 * @returns объект с ответом от шины, в поле rows будут записи
 */
async function getFromRev(
  guide: Guides,
  fromRevision: number,
  page = 1,
  perPage = 500,
  joinDepth = 0,
): Promise<EsbRespPlural> {
  log.debug(
    `getFromRev(guide=${guide}, fromRevision=${fromRevision}, page=${page}, perPage=${perPage}, joinDepth=${joinDepth})`,
  );
  const config: AxiosRequestConfig = {
    params: {
      page: page,
      per_page: perPage,
      from_revision: fromRevision,
      join_depth: joinDepth,
    },
    headers: {
      Token: appConfig.ESB_TOKEN,
    },
  };

  const responseRaw = await axios.get(
    `${appConfig.ESB_API_URL}/guide${guide}/changes`,
    config,
  );

  const esbResponse = EsbRespPluralZod.parse(responseRaw.data);
  return esbResponse;
}

/**
 * Рекурсивный вызов функции getFromRev для получения
 * данных со всех страниц. Использовать с осторожностью,
 * может вызывать Heap out of memory
 * при попытке получить слишком много записи.
 */
async function getFromRevRecurs(
  guide: Guides,
  fromRevision: number,
  page = 1,
  perPage = 500,
  joinDepth = 0,
): Promise<EsbRespPlural> {
  log.debug(
    `getFromRevRecurs(guide=${guide}, fromRevision=${fromRevision}, page=${page}, perPage=${perPage}, joinDepth=${joinDepth})`,
  );

  const response = await getFromRev(
    guide,
    fromRevision,
    page,
    perPage,
    joinDepth,
  );

  if (response.current_page < response.total_pages) {
    const subResponse = await getFromRevRecurs(
      guide,
      fromRevision,
      page + 1,
      perPage,
      joinDepth,
    );
    response.rows.push(...subResponse.rows);
    response.current_page = subResponse.current_page;
    return response;
  } else {
    return response;
  }
}

/**
 * Получает запись по id из справочника в шине данных
 *
 * @param guide номер справочника в шине данных
 * @param esbId id записи в шине данных
 * @returns
 */
async function getByEsbId(
  guide: Guides,
  esbId: number,
): Promise<EsbRespSingle> {
  log.debug(`getByEsbId(guide=${guide}, esbId=${esbId})`);

  const config: AxiosRequestConfig = {
    params: {
      join_depth: 1,
    },
    headers: {
      Token: appConfig.ESB_TOKEN,
    },
  };

  const responseRaw = await axios.get(
    `${appConfig.ESB_API_URL}/guide${guide}/${esbId}`,
    config,
  );

  const esbResponse = EsbRespSingleZod.parse(responseRaw.data);
  return esbResponse;
}
// #endregion service methods
