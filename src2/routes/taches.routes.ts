import { Router } from "express";

const router = Router();

const taches: { id: number; nom: string; faite: boolean }[] = [];

router.get("/", (_, res) => {
    const tachesNonFaites = taches.filter((t) => !t.faite);
    res.json(tachesNonFaites);
});
router.get("/:id", (req, res) => {
    const tache = taches.find((t) => t.id === parseInt(req.params.id));
    if (tache) {
        res.json(tache)
    } else {
        res.status(404).json({ message: "Tâche non trouvée" })
    }
})
router.post("/", (req, res) => {
    if (typeof req.body === "object" && "nom" in req.body && typeof req.body.nom === "string") {
        taches.push({
            id: Date.now(),
            nom: req.body.nom,
            faite: false
        })
        res.json({
            message: "Tâche ajoutée avec succès"
        })
    } else {
        res.status(400).json({ message: "Le nom de la tâche est requis" })
    }
})
router.patch("/:id", (req, res) => {
    if (typeof req.body === "object" && "faite" in req.body && typeof req.body.fait === "boolean") {
        const tache = taches.find((t) => t.id === parseInt(req.params.id));
        if (tache) {
            tache.faite = req.body.fait;
            res.json({ message: "Tâche mise à jour avec succès" })
        } else {
            res.status(404).json({ message: "Tâche non trouvée" })
        }
    } else {
        res.status(400).json({ message: "Le statut de la tâche est requis" })
    }
})
router.delete("/:id", (req, res) => {
    const tache = taches.find((t) => t.id === parseInt(req.params.id));
    if (tache) {
        const index = taches.indexOf(tache);
        taches.splice(index, 1);
        res.json({ message: "Tâche supprimée avec succès" })
    } else {
        res.status(404).json({ message: "Tâche non trouvée" })
    }
})

export default router;