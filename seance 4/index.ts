import http from "node:http"
import type { IncomingMessage, ServerResponse } from "node:http"
import { readFile } from "node:fs/promises"

const PORT = 3000
const BASE_URL = "https://pokeapi.co/api/v2"

function lireCorps(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let corps = ""
    req.on("data", (chunk: string) => { corps += chunk })
    req.on("end", () => resolve(corps))
    req.on("error", (err) => reject(err))
  })
}

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = req.url
  const method = req.method

  // Route POST /api/pokemon
  if (url === "/api/pokemon" && method === "POST") {
    try {
      const corps = await lireCorps(req)
      const nomPokemon = new URLSearchParams(corps).get("search")
      if (!nomPokemon) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "Missing search parameter" }))
        return
      }

      try {
        const reponseApi = await fetch(`${BASE_URL}/pokemon/${encodeURIComponent(nomPokemon.toLowerCase())}`)

        if (!reponseApi.ok && reponseApi.status === 404) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: "Pokemon not found" }))
          return
        }

        const resData = await reponseApi.json();

        res.writeHead(200, { "Content-Type": "application/json" })
        return res.end(JSON.stringify(resData))
      } catch (e) {
        console.error(e)
        res.writeHead(500, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ error: "PokeAPI unavailable" }))
      }
    } catch (error: unknown) {
      console.error(error)
    }
  }

  // Route serv html
  if (url === "/" && method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html" })
    const data = await readFile("seance 4/index.html", "utf8")
    res.end(data)
  }

  // Route inconnue
  console.log(`Route inconnue: ${method} ${url}`)
  res.writeHead(404, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ error: "Not found" }))
})


server.listen(PORT, () => {
  console.log(`Serveur écoute sur http://localhost:${PORT}`)
})