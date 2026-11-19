import { Router } from "express";
import { authentifier } from "../middlewares/auth.ts";
import type { RequeteAuthentifiee } from "../middlewares/auth.ts";
import { prochainId, prochainePriorite, taches } from "../db.ts";
import type { TacheDocument } from "../db.ts";

const router = Router();

// ?statut=a_faire (par défaut) | terminees | toutes
const filtresStatut: Record<string, { faite?: boolean }> = {
    a_faire: { faite: false },
    terminees: { faite: true },
    toutes: {}
};

function identifiant(value: string | string[] | undefined): number {
    return typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;
}

function representerTache(tache: TacheDocument) {
    return {
        id: tache._id,
        nom: tache.nom,
        faite: tache.faite,
        priorite: tache.priorite,
        userID: tache.user_id
    };
}

router.get("/taches/", authentifier, async (req, res, next) => {
    const reqWithUser = req as RequeteAuthentifiee;
    const statut = req.query.statut ?? "a_faire";
    const filtre = typeof statut === "string" && Object.hasOwn(filtresStatut, statut)
        ? filtresStatut[statut]
        : undefined;

    if (!filtre) {
        res.status(400).json({ message: "Statut invalide (attendu : a_faire, terminees ou toutes)" });
        return;
    }

    try {
        const resultat = await taches
            .find({ ...filtre, user_id: reqWithUser.utilisateur.id })
            .sort({ priorite: 1, _id: 1 })
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
            user_id: reqWithUser.utilisateur.id,
            // Une nouvelle tâche arrive en dernière position.
            priorite: await prochainePriorite(reqWithUser.utilisateur.id)
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

// Place la tâche juste avant ou juste après une autre tâche : { "avant": id } ou { "apres": id }.
router.patch("/taches/:id/priorite", authentifier, async (req, res, next) => {
    const reqWithUser = req as RequeteAuthentifiee;
    const corps = req.body !== null && typeof req.body === "object" ? req.body : {};
    const avant: unknown = corps.avant;
    const apres: unknown = corps.apres;
    const reference = avant ?? apres;

    if ((avant === undefined) === (apres === undefined) || typeof reference !== "number" || !Number.isInteger(reference)) {
        res.status(400).json({ message: "Indiquez soit « avant », soit « apres » avec l'identifiant d'une autre tâche" });
        return;
    }

    const id = identifiant(reqWithUser.params.id);
    if (id === reference) {
        res.status(400).json({ message: "Une tâche ne peut pas être placée par rapport à elle-même" });
        return;
    }

    try {
        const userId = reqWithUser.utilisateur.id;
        const liste = await taches
            .find({ user_id: userId }, { projection: { _id: 1, priorite: 1 } })
            .sort({ priorite: 1, _id: 1 })
            .toArray();

        const indexTache = liste.findIndex((tache) => tache._id === id);
        if (indexTache === -1) {
            res.status(404).json({ message: "Tâche non trouvée" });
            return;
        }
        const [tache] = liste.splice(indexTache, 1);

        const indexReference = liste.findIndex((t) => t._id === reference);
        if (indexReference === -1) {
            res.status(404).json({ message: "Tâche de référence non trouvée" });
            return;
        }
        liste.splice(avant !== undefined ? indexReference : indexReference + 1, 0, tache!);

        // Renumérotation 1..n : on n'écrit que les tâches dont le rang change.
        const operations = liste
            .map((t, index) => ({ t, priorite: index + 1 }))
            .filter(({ t, priorite }) => t.priorite !== priorite)
            .map(({ t, priorite }) => ({
                updateOne: { filter: { _id: t._id, user_id: userId }, update: { $set: { priorite } } }
            }));
        if (operations.length > 0) {
            await taches.bulkWrite(operations);
        }
        res.json({ message: "Priorité mise à jour avec succès" });
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
