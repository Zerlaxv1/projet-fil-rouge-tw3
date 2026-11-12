import type { ErrorRequestHandler } from "express";

export const gestionnaireErreurs: ErrorRequestHandler = (error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ message: "Une erreur interne est survenue" });
};