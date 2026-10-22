import { Router } from "express";
import { authentifier } from "../middlewares/auth";
import type { RequeteAuthentifiee } from "../middlewares/auth";

const router = Router();

const taches: { id: number; nom: string; faite: boolean, userID: number }[] = [];

router.get("/taches/", authentifier, (req, res) => {
    const reqwithuser = req as RequeteAuthentifiee;
    if (reqwithuser.utilisateur !== undefined && reqwithuser?.utilisateur?.id !== undefined) {
        const tachesNonFaites = taches.filter((t) => !t.faite && t.userID === reqwithuser?.utilisateur?.id);
        res.json(tachesNonFaites);
    }
});

router.get("/taches/:id", authentifier, (req, res) => {
    const reqWithUser = req as RequeteAuthentifiee;

    const tache = taches.find((t) => t.id === parseInt(reqWithUser.params.id));
    if (tache) {
        res.json(tache)
    } else {
        res.status(404).json({ message: "Tâche non trouvée" })
    }
})

router.post("/taches/", authentifier, (req, res) => {
    const reqWithUser = req as RequeteAuthentifiee;

    if (typeof req.body === "object" && "nom" in req.body && typeof req.body.nom === "string") {
        taches.push({
            id: Date.now(),
            nom: req.body.nom,
            faite: false,
            userID: reqWithUser.utilisateur.id
        })
        res.json({
            message: "Tâche ajoutée avec succès"
        })
    } else {
        res.status(400).json({ message: "Le nom de la tâche est requis" })
    }
})

router.patch("/taches/:id", authentifier, (req, res) => {
    const reqWithUser = req as RequeteAuthentifiee;
    if (typeof req.body === "object" && "faite" in req.body && typeof req.body.faite === "boolean") {
        const tache = taches.find((t) => t.id === parseInt(reqWithUser.params.id) && t.userID === reqWithUser.utilisateur.id);
        if (tache) {
            tache.faite = req.body.faite;
            res.json({ message: "Tâche mise à jour avec succès" })
        } else {
            res.status(404).json({ message: "Tâche non trouvée" })
        }
    } else {
        res.status(400).json({ message: "Le statut de la tâche est requis" })
    }
})

router.delete("/taches/:id", authentifier, (req, res) => {
    const reqWithUser = req as RequeteAuthentifiee;
    const tache = taches.find((t) => t.id === parseInt(reqWithUser.params.id) && t.userID === reqWithUser.utilisateur.id);
    if (tache) {
        const index = taches.indexOf(tache);
        taches.splice(index, 1);
        res.json({ message: "Tâche supprimée avec succès" })
    } else {
        res.status(404).json({ message: "Tâche non trouvée" })
    }
})

export default router;