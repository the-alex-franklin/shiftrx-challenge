FROM denoland/deno:2.7.14

WORKDIR /app

COPY deno.json ./
COPY main.ts ./

RUN deno cache main.ts

EXPOSE 8000

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "main.ts"]