interface Post {
  id: number
  titre: string
  contenu: string
}

interface User {
  id: number
  nom: string
  email: string
}

interface PagePosts {
  page: number
  total: number
  resultats: Post[]
}

type Result<T, E = string> =
  | { ok: true; valeur: T }
  | { ok: false; erreur: E }

function estUser(v: unknown): v is User {
  return (
    typeof v === "object" &&
    v !== null &&
    "id" in v &&
    typeof (v as User).id === "number" &&
    "nom" in v &&
    typeof (v as User).nom === "string" &&
    "email" in v &&
    typeof (v as User).email === "string"
  )
}

function estPagePosts(v: unknown): v is PagePosts {
  return (
    typeof v === "object" &&
    v !== null &&
    "page" in v &&
    typeof (v as PagePosts).page === "number" &&
    "total" in v &&
    typeof (v as PagePosts).total === "number" &&
    "resultats" in v &&
    Array.isArray((v as PagePosts).resultats)
  )
}

async function chargerUtilisateur(id: number): Promise<Result<{ utilisateur: User; posts: PagePosts }>> {
  try {
    const resUser = await fetch(`/api/users/${id}`)
    if (!resUser.ok) return { ok: false, erreur: `HTTP ${resUser.status}` }
    const dataUser: unknown = await resUser.json()
    if (!estUser(dataUser)) return { ok: false, erreur: "Format invalide" }

    const resPosts = await fetch(`/api/users/${dataUser.id}/posts`)
    if (!resPosts.ok) return { ok: false, erreur: `HTTP ${resPosts.status}` }
    const dataPosts: unknown = await resPosts.json()
    if (!estPagePosts(dataPosts)) return { ok: false, erreur: "Format invalide" }

    return { ok: true, valeur: { utilisateur: dataUser, posts: dataPosts } }
  } catch (err) {
    return { ok: false, erreur: err instanceof Error ? err.message : "Erreur inconnue" }
  }
}

// L'appelant DOIT traiter l'erreur :
async function main(): Promise<void> {
  const result = await chargerUtilisateur(1)
  if (result.ok) {
    console.log(result.valeur.utilisateur.nom)
    console.log(result.valeur.posts.resultats.length)
  } else {
    console.error(result.erreur)
  }
}