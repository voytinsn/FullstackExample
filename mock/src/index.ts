import { app } from "./app";

const port = 3312;
app.listen(port, () => {
  console.log(`Mock-сервер запущен и прослушивает порт ${port}`);
});
