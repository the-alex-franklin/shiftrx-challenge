# ShiftRx

An AI-powered scheduling assistant for healthcare facilities. Holly, the scheduling agent, can view shifts, handle call-offs, find coverage candidates, and assign providers — all through a chat interface that updates the calendar in real-time.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- An OpenAI API key

## Setup

1. Clone the repo

   ```sh
   git clone <repo-url>
   cd shiftrx-challenge
   ```

2. Create a `.env` file at the repo root with your OpenAI API key

   ```sh
   cp .env.example .env
   # then edit .env and fill in your key
   ```

3. Start the app

   ```sh
   docker compose up --build
   ```

The database is migrated and seeded automatically on startup. Once running, open [http://localhost:3000](http://localhost:3000).
