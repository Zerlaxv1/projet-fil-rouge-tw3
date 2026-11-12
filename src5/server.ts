import app from "./app.ts";
import { initialiserBase } from "./db.ts";

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

initialiserBase()
    .then(() => {
        app.listen(PORT, () => console.log(`API sur http://localhost:${PORT}`));
    })
    .catch((error: unknown) => {
        console.error("Impossible d'initialiser la base de données", error);
        process.exitCode = 1;
    });
