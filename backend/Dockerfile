FROM denoland/deno:2.7.14

WORKDIR /app

COPY deno.json deno.lock ./
COPY main.ts env.ts ws.ts ./
COPY routers/ ./routers/
COPY agent/ ./agent/
COPY db/ ./db/

RUN deno cache main.ts db/migrate.ts db/seed.ts

EXPOSE 8000

CMD deno run -A db/migrate.ts && deno run -A db/seed.ts && deno run -A main.ts
