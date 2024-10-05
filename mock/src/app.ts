import express from "express";
import { esbRouter } from "./routes/esbRouter";
// import { adRouter } from "./routes/adRouter";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorHandler";
import { adRouter } from "./routes/adRouter";

const app = express();
app.use(express.json());
app.use(morgan("tiny"));

app.use("/api/esb", esbRouter);
app.use("/api/ad", adRouter);
app.use(errorHandler);

export { app };
