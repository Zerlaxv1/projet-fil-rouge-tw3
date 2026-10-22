import express from "express";
import tachesRouter from "./routes/taches.routes.ts";
// import { gestionnaireErreurs } from "./middlewares/erreurs.ts";

const app = express();

app.use(express.json());
app.use("/v1", tachesRouter);  // ← préfixe /v1

// 404 attrape-tout
app.use((req, _, next) => {
  const err = new Error("Route inconnue : " + req.method + " " + req.originalUrl);
  err.status = 404;
  next(err);
});

// app.use(gestionnaireErreurs);

export default app;