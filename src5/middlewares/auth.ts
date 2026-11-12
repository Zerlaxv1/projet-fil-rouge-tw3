import type { NextFunction, Request, Response } from "express";
import { utilisateurs } from "../db.ts";

interface Utilisateur {
    id: number;
    role: string;
}

export interface RequeteAuthentifiee extends Request {
    utilisateur: Utilisateur;
}

export async function authentifier(req: Request, res: Response, next: NextFunction) {
    const entete = req.headers.authorization;

    if (!entete?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Jeton manquant" });
    }

    try {
        const utilisateur = await utilisateurs.findOne(
            { jeton: entete.slice(7) },
            { projection: { _id: 1, role: 1 } }
        );

        if (!utilisateur) {
            return res.status(401).json({ error: "Jeton invalide" });
        }

        (req as RequeteAuthentifiee).utilisateur = {
            id: utilisateur._id,
            role: utilisateur.role
        };
        next();
    } catch (error) {
        next(error);
    }
}

export function exigerRole(role: string) {
    return (req: RequeteAuthentifiee, res: Response, next: NextFunction) => {
        if (req.utilisateur?.role !== role) {
            return res.status(403).json({ error: "Accès refusé" });
        }
        next();
    };
}
