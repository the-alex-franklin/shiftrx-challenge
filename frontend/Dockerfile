FROM denoland/deno:2.7.14 AS builder

WORKDIR /app

COPY deno.json deno.lock ./
COPY index.html ./
COPY src ./src
COPY public ./public
COPY vite.config.ts ./

RUN deno install
RUN deno task build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80