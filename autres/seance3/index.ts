type Result<T, E = string> = { ok: true; valeur: T } | { ok: false; erreur: E };

function diviser(a: number, b: number): Result<number> {
    if (b === 0) return { ok: false, erreur: "division par 0" };
    return { ok: true, valeur: a / b };
}

const r = diviser(10, 2);
if (r.ok) {
    console.log(r.valeur)
}