import { Collection, Db, MongoClient } from "mongodb";

export interface UtilisateurDocument {
    _id: number;
    role: string;
    jeton: string;
}

export interface TacheDocument {
    _id: number;
    nom: string;
    faite: boolean;
    user_id: number;
}

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const nomBase = process.env.MONGODB_DB ?? "tw3_tasks";

export const client = new MongoClient(uri);
export const base: Db = client.db(nomBase);
export const utilisateurs: Collection<UtilisateurDocument> =
    base.collection<UtilisateurDocument>("utilisateurs");
export const taches: Collection<TacheDocument> =
    base.collection<TacheDocument>("taches");

export async function initialiserBase(): Promise<void> {
    await client.connect();

    await utilisateurs.createIndexes([
        { key: { jeton: 1 }, unique: true }
    ]);
    await taches.createIndexes([
        { key: { user_id: 1, faite: 1 } }
    ]);

    await utilisateurs.updateOne(
        { _id: 1 },
        { $setOnInsert: { role: "admin", jeton: "abc123" } },
        { upsert: true }
    );
}

export async function prochainId<T extends { _id: number }>(collection: Collection<T>): Promise<number> {
    const dernier = await collection.findOne({}, { sort: { _id: -1 } });
    return (dernier?._id ?? 0) + 1;
}
