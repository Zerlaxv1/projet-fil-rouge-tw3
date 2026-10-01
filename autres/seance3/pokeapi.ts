const BASE_URL = "https://pokeapi.co/api/v2"

type Result<T, E = string> =
    | { ok: true; valeur: T }
    | { ok: false; erreur: E }

const ok = <T>(valeur: T): Result<T, never> => ({ ok: true, valeur })
const err = <E>(erreur: E): Result<never, E> => ({ ok: false, erreur })

async function getPokemons(): Promise<{
    ok: false;
    erreur: string;
} | {
    ok: boolean;
    valeur: unknown;
}> {
    try {
        let res = await fetch(BASE_URL + "/pokemon/pikachu")
        if (!res.ok) {
            throw new Error("erreur HTTP");
        }
        let resData = await res.json()
        console.log(resData)
        return { ok: true, valeur: resData }
    } catch (error) {
        throw new Error("erreur !")
    }
}

getPokemons()