import { Router, Response, Request } from "express";
import {
  EsbCompanyRow,
  EsbEmployeeRow,
  EsbPluralResponse,
  EsbSingleResponse,
  EsbVpnRow,
  Guides,
} from "./types";
import { esbGetChangesQueryZod } from "../utils/zodSchemas";
import { vpnPasses } from "../mockStorage/vpnPasses";
import { companies } from "../mockStorage/companies";
import { employees } from "../mockStorage/employees";
import { z } from "zod";

export const esbRouter = Router();

esbRouter.get(
  `/guide${Guides.VPN}/changes`,
  (req, res: Response<EsbPluralResponse<EsbVpnRow>>, next) => {
    try {
      const query = esbGetChangesQueryZod.parse(req.query);
      const filtered = vpnPasses.filter(
        (pass) => pass.__guide_revision >= query.from_revision,
      );

      const resObj: EsbPluralResponse<EsbVpnRow> = {
        code: 200,
        rows: filtered,
        total_rows: filtered.length,
        total_pages: 1,
        current_page: 1,
        guide_revision: vpnPasses.length,
        guide_version: vpnPasses.length,
        meta: {
          next_link: null,
          prev_link: null,
        },
      };

      res.json(resObj);
    } catch (e) {
      next(e);
    }
  },
);

esbRouter.get(
  `/guide${Guides.Companies}/changes`,
  (req, res: Response<EsbPluralResponse<EsbCompanyRow>>, next) => {
    try {
      const query = esbGetChangesQueryZod.parse(req.query);
      const filtered = companies.filter(
        (pass) => pass.__guide_revision >= query.from_revision,
      );

      const resObj: EsbPluralResponse<EsbCompanyRow> = {
        code: 200,
        rows: filtered,
        total_rows: filtered.length,
        total_pages: 1,
        current_page: 1,
        guide_revision: companies.length,
        guide_version: companies.length,
        meta: {
          next_link: null,
          prev_link: null,
        },
      };

      res.json(resObj);
    } catch (e) {
      next(e);
    }
  },
);

esbRouter.get(
  `/guide${Guides.Employees}/:id`,
  (req, res: Response<EsbSingleResponse<EsbEmployeeRow>>, next) => {
    try {
      const id = z.coerce.number().parse(req.params.id);
      const employee = employees.find((emp) => emp.__id === id);

      if (!employee) {
        res.status(404);
      } else {
        const resObj: EsbSingleResponse<EsbEmployeeRow> = {
          code: 200,
          guide_revision: companies.length,
          guide_version: companies.length,
          row: employee,
          meta: {
            next_link: null,
            prev_link: null,
          },
        };

        res.json(resObj);
      }
    } catch (e) {
      next(e);
    }
  },
);
