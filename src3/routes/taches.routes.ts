import { Router } from "express";
import { authentifier } from "../middlewares/auth";
import type { RequeteAuthentifiee } from "../middlewares/auth";
import { pool } from "../db";

const router = Router();

router.get("/taches/", authentifier, async (req, res, next) => {
    const reqwithuser = req as RequeteAuthentifiee;
    try {
        const resultat = await pool.query(
            `SELECT id, nom, faite, user_id AS "userID"
             FROM taches
             WHERE faite = FALSE AND user_id = $1
             ORDER BY id`,
            [reqwithuser.utilisateur.id]
        );
        res.json(resultat.rows);
    } catch (error) {
        next(error);
    }
});

router.get("/taches/:id", authentifier, async (req, res, next) => {
    const reqWithUser = req as RequeteAuthentifiee;
    try {
        const resultat = await pool.query(
            `SELECT id, nom, faite, user_id AS "userID"
             FROM taches
             WHERE id = $1 AND user_id = $2`,
            [Number.parseInt(reqWithUser.params.id, 10), reqWithUser.utilisateur.id]
        );
        if (resultat.rows.length === 0) {
            res.status(404).json({ message: "Tâche non trouvée" });
            return;
        }
        res.json(resultat.rows[0]);
    } catch (error) {
        next(error);
    }
});

router.post("/taches/", authentifier, async (req, res, next) => {
    const reqWithUser = req as RequeteAuthentifiee;

    if (req.body === null || typeof req.body !== "object" || !("nom" in req.body) || typeof req.body.nom !== "string") {
        res.status(400).json({ message: "Le nom de la tâche est requis" });
        return;
    }

    try {
        await pool.query(
            "INSERT INTO taches (nom, user_id) VALUES ($1, $2)",
            [req.body.nom, reqWithUser.utilisateur.id]
        );
        res.json({ message: "Tâche ajoutée avec succès" });
    } catch (error) {
        next(error);
    }
});

router.patch("/taches/:id", authentifier, async (req, res, next) => {
    const reqWithUser = req as RequeteAuthentifiee;
    if (req.body === null || typeof req.body !== "object" || !("faite" in req.body) || typeof req.body.faite !== "boolean") {
        res.status(400).json({ message: "Le statut de la tâche est requis" });
        return;
    }

    try {
        const resultat = await pool.query(
            `UPDATE taches
             SET faite = $1
             WHERE id = $2 AND user_id = $3`,
            [req.body.faite, Number.parseInt(reqWithUser.params.id, 10), reqWithUser.utilisateur.id]
        );
        if (resultat.rowCount === 0) {
            res.status(404).json({ message: "Tâche non trouvée" });
            return;
        }
        res.json({ message: "Tâche mise à jour avec succès" });
    } catch (error) {
        next(error);
    }
});

router.delete("/taches/:id", authentifier, async (req, res, next) => {
    const reqWithUser = req as RequeteAuthentifiee;
    try {
        const resultat = await pool.query(
            "DELETE FROM taches WHERE id = $1 AND user_id = $2",
            [Number.parseInt(reqWithUser.params.id, 10), reqWithUser.utilisateur.id]
        );
        if (resultat.rowCount === 0) {
            res.status(404).json({ message: "Tâche non trouvée" });
            return;
        }
        res.json({ message: "Tâche supprimée avec succès" });
    } catch (error) {
        next(error);
    }
});

export default router;