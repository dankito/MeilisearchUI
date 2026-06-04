FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build


FROM nginx:stable-alpine
# copy to subfolder /meilisearch-ui to that app is reachable under example.com/meilisearch-ui
COPY --from=builder /app/dist /usr/share/nginx/html/meilisearch-ui
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
