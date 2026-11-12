import { Pool } from "pg";

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export async function initialiserBase(): Promise<void> {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS utilisateurs (
            id SERIAL PRIMARY KEY,
            role TEXT NOT NULL,
            jeton TEXT NOT NULL UNIQUE
        );

        INSERT INTO utilisateurs (id, role, jeton)
        VALUES (1, 'admin', 'abc123')
        ON CONFLICT (id) DO NOTHING;

        CREATE TABLE IF NOT EXISTS taches (
            id SERIAL PRIMARY KEY,
            nom TEXT NOT NULL,
            faite BOOLEAN NOT NULL DEFAULT FALSE,
            user_id INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_taches_user_id
            ON taches (user_id);
    `);
}