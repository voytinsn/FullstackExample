import { Router, Response, Request } from "express";
import { vpnGroup } from "../mockStorage/vpnGroup";
import { AdUser } from "./types";
import { z } from "zod";
import { adUsers } from "../mockStorage/adUsers";

export const adRouter = Router();

adRouter.get("/VpnGroupMembers", (_req, res: Response<AdUser[]>, next) => {
  try {
    res.json(vpnGroup.members);
  } catch (e) {
    next(e);
  }
});

adRouter.post(
  "/VpnGroupMembers",
  (req, res: Response<{ success: true } | { error: string }>, next) => {
    try {
      const login = z.string().parse(req.body.login);
      const adUser = adUsers.find((u) => u.samAccountName === login);

      if (!adUser) {
        res.status(404).json({ error: "User not found" });
      } else {
        const userInGroup = vpnGroup.members.find(
          (member) => member.samAccountName == adUser.samAccountName,
        );

        if (!userInGroup) {
          vpnGroup.members.push(adUser);
        }

        res.json({ success: true });
      }
    } catch (e) {
      next(e);
    }
  },
);

adRouter.delete(
  "/VpnGroupMembers/:login",
  (req, res: Response<{ success: true } | { error: string }>, next) => {
    try {
      const login = z.string().parse(req.params.login);
      const adUser = adUsers.find((u) => u.samAccountName === login);

      if (!adUser) {
        res.status(404).json({ error: "User not found" });
      } else {
        vpnGroup.members = vpnGroup.members.filter(
          (member) => member.samAccountName !== adUser.samAccountName,
        );

        res.json({ success: true });
      }
    } catch (e) {
      next(e);
    }
  },
);

adRouter.get(
  "/users/:login",
  (req, res: Response<AdUser | { error: string }>, next) => {
    try {
      const login = z.string().parse(req.params.login);
      const adUser = adUsers.find((u) => u.samAccountName === login);

      if (!adUser) {
        res.status(404).json({ error: "User not found" });
      } else {
        res.json(adUser);
      }
    } catch (e) {
      next(e);
    }
  },
);
