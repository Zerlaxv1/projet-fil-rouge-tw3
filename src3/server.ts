import app from "./app.ts";

let PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.listen(PORT, () => console.log(`API sur http://localhost:${PORT}`));