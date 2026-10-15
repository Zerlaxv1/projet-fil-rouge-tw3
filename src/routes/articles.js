import { Router } from "express";
import { authentifier, exigerRole } from "../middlewares/auth.js";

const router = Router();

const articles = [{ id: 1, titre: "Hello" }];

router.get("/", (req, res) => res.json(articles));
router.get("/:id", (req, res) => {
    const article = articles.find((a) => a.id === Number(req.params.id));
    if (!article) return res.status(404).json({ error: "Introuvable" });
    res.json(article);
});

router.post("/", authentifier, exigerRole("admin"), (req, res) => {
  const article = { id: Date.now(), ...req.body };
  articles.push(article);
  res.status(201).json(article);
});

export default router;