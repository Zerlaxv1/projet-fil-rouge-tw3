import type { NextFunction, Request, Response } from "express";

interface Utilisateur {
  id: number;
  role: string;
}

export interface RequeteAuthentifiee extends Request {
  utilisateur: Utilisateur;
}

const JETONS_VALIDES = new Map([["abc123", { id: 1, role: "admin" }]]);

export function authentifier(req: Request, res: Response, next: NextFunction) {
  const entete = req.headers.authorization; // "Bearer abc123"

  if (!entete?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Jeton manquant" });
  }

  const utilisateur = JETONS_VALIDES.get(entete.slice(7));
  if (!utilisateur) {
    return res.status(401).json({ error: "Jeton invalide" });
  }

  (req as RequeteAuthentifiee).utilisateur = utilisateur;
  next();
}

export function exigerRole(role: string) {
  return (req: RequeteAuthentifiee, res: Response, next: NextFunction) => {
    if (req.utilisateur?.role !== role) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    next();
  };
}