import express from "express";
import { Router } from "express";
import TachesRoutes from "./routes/taches.routes.ts";

const app = express();
const router = Router();

let PORT = process.env.PORT

if (PORT === undefined) {
    PORT = 3000
}

router.use("/api/taches", TachesRoutes);

app.use(router)

app.listen(PORT, () => console.log(`API sur http://localhost:${PORT}`));