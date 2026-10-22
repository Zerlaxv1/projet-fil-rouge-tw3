FROM oven/bun:alpine AS build
WORKDIR /app

# Le manifeste ET le lock : --frozen-lockfile exige la présence du lock
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copier le reste du code
COPY . .

# Compiler AVANT de supprimer les devDependencies
RUN bun run build

# Alléger le stage de build
RUN bun prune --prod

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]