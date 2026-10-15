// middlewares/auth.js
const JETONS_VALIDES = new Map([["abc123", { id: 1, role: "admin" }]]);

export function authentifier(req, res, next) {
  const entete = req.headers.authorization; // "Bearer abc123"

  if (!entete?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Jeton manquant" });
  }

  const utilisateur = JETONS_VALIDES.get(entete.slice(7));
  if (!utilisateur) {
    return res.status(401).json({ error: "Jeton invalide" });
  }

  req.utilisateur = utilisateur; // enrichit la requête pour la suite
  next();
}

export function exigerRole(role) {
  return (req, res, next) => {
    if (req.utilisateur?.role !== role) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    next();
  };
}