import { MongoClient } from "mongodb"

const url = "mongodb://localhost:27017"
const client = new MongoClient(url)

async function main() {
  try {
    await client.connect()
    console.log("Connexion MongoDB réussie")
  } finally {
    await client.close()
  }
}

main().catch(console.error)