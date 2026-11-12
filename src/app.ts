import { fileURLToPath } from "node:url";
import path from "node:path";
import express from "express";
import tachesRouter from "./routes/taches.routes.ts";
import { gestionnaireErreurs } from "./middlewares/erreurs.ts";

const app = express();

app.use(express.json());
app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), "public")));
app.use("/v1", tachesRouter);

app.use((req, _, next) => {
    const err = Object.assign(
        new Error("Route inconnue : " + req.method + " " + req.originalUrl),
        { status: 404 }
    );
    next(err);
});

app.use(gestionnaireErreurs);

export default app;
