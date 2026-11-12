import { Router } from "express";
import { authentifier } from "../middlewares/auth.ts";
import type { RequeteAuthentifiee } from "../middlewares/auth.ts";
import { prochainId, taches } from "../db.ts";

const router = Router();

function identifiant(value: string | string[] | undefined): number {
    return typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;
}

function representerTache(tache: {
    _id: number;
    nom: string;
    faite: boolean;
    user_id: number;
}) {
    return {
        id: tache._id,
        nom: tache.nom,
        faite: tache.faite,
        userID: tache.user_id
    };
}

router.get("/taches/", authentifier, async (req, res, next) => {
    const reqWithUser = req as RequeteAuthentifiee;
    try {
        const resultat = await taches
            .find({ faite: false, user_id: reqWithUser.utilisateur.id })
            .sort({ _id: 1 })
            .toArray();
        res.json(resultat.map(representerTache));
    } catch (error) {
        next(error);
    }
});

router.get("/taches/:id", authentifier, async (req, res, next) => {
    const reqWithUser = req as RequeteAuthentifiee;
    try {
        const tache = await taches.findOne({
            _id: identifiant(reqWithUser.params.id),
            user_id: reqWithUser.utilisateur.id
        });
        if (!tache) {
            res.status(404).json({ message: "Tâche non trouvée" });
            return;
        }
        res.json(representerTache(tache));
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
        await taches.insertOne({
            _id: await prochainId(taches),
            nom: req.body.nom,
            faite: false,
            user_id: reqWithUser.utilisateur.id
        });
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
        const resultat = await taches.updateOne(
            { _id: identifiant(reqWithUser.params.id), user_id: reqWithUser.utilisateur.id },
            { $set: { faite: req.body.faite } }
        );
        if (resultat.matchedCount === 0) {
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
        const resultat = await taches.deleteOne({
            _id: identifiant(reqWithUser.params.id),
            user_id: reqWithUser.utilisateur.id
        });
        if (resultat.deletedCount === 0) {
            res.status(404).json({ message: "Tâche non trouvée" });
            return;
        }
        res.json({ message: "Tâche supprimée avec succès" });
    } catch (error) {
        next(error);
    }
});

export default router;
