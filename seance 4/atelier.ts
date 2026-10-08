import http from "node:http"
import type { IncomingMessage, ServerResponse } from "node:http"

function lireCorps(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let corps = ""
    req.on("data", (chunk: string) => { corps += chunk })
    req.on("end", () => resolve(corps))
    req.on("error", (err) => reject(err))
  })
}

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = req.url.split("?")[0]
  const method = req.method
  const routesConnues = ["/api/ping", "/api/health", "/api/items"]

  if (!routesConnues.includes(url)) {
    // Route totalement inconnue → 404
    res.writeHead(404, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: "Not found" }))
    return
  }

  // Route connue mais méthode non gérée → 405
  if (url === "/api/items" && method !== "GET" && method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: `Method ${method} not allowed` }))
    return
  }

  if (url === "/api/ping" && method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: `Method ${method} not allowed` }))
    return
  }

  // ... gestion GET/POST normales (voir code étape 2)
  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ status: "ok" }))
})

server.listen(3000)