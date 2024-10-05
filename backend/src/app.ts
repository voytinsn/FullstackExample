import express from "express";
import { esbRouter } from "./routes/esbRouter";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorHandler";
import { vpnExclusionsRouter } from "./routes/vpnExclusionsRouter";
import { vpnPassesRouter } from "./routes/vpnPassesRouter";
import { companiesRouter } from "./routes/companiesRouter";
import { adUsersRouter } from "./routes/adUsersRouter";
import { loginRouter } from "./routes/loginRouter";
import { requireAuth } from "./middlewares/requireAuth";

const app = express();
app.use(express.json());
app.use(morgan("tiny"));

app.use(express.static(__dirname + "/dist"));
app.use("/api/login", loginRouter);
app.use("/api/esb", esbRouter);
app.use("/api/vpn_exclusions", requireAuth, vpnExclusionsRouter);
app.use("/api/vpn_passes", requireAuth, vpnPassesRouter);
app.use("/api/companies", requireAuth, companiesRouter);
app.use("/api/ad_users", requireAuth, adUsersRouter);

// Для всех остальных адресов отдается SPA, роутинг на стороне клиента
app.get("*", (_req, res) => res.sendFile(__dirname + "/dist/index.html"));

app.use(errorHandler);

export { app };
