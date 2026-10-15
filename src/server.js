import express from "express";
import articlesRouter from "./routes/articles.js";

const app = express();
app.use(express.json());

app.get("/api/ping", (req, res) => res.json({ message: "pong" }));
app.use("/api/articles", articlesRouter);

app.listen(3000, () => console.log("API sur http://localhost:3000"));