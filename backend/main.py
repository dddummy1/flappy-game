import os
import time
from contextlib import asynccontextmanager

import psycopg
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://flappy:flappy_password@db:5432/flappy_devops"
)


class ScoreCreate(BaseModel):
    name: str
    score: int


def get_connection():
    return psycopg.connect(DATABASE_URL)


def init_db():
    for attempt in range(20):
        try:
            with get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        CREATE TABLE IF NOT EXISTS scores (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(16) NOT NULL,
                            score INTEGER NOT NULL CHECK (score >= 0),
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                        """
                    )
                conn.commit()
            print("Database initialized")
            return
        except Exception as e:
            print(f"Database is not ready yet ({attempt + 1}/20): {e}")
            time.sleep(2)

    raise RuntimeError("Could not connect to database")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok"}


@app.post("/score")
def add_score(score: ScoreCreate):
    safe_name = score.name.strip()[:16] or "anon"

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO scores (name, score) VALUES (%s, %s)",
                (safe_name, score.score)
            )
        conn.commit()

    return {"status": "added"}


@app.get("/leaderboard")
def get_leaderboard():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT name, score
                FROM scores
                ORDER BY score DESC, id ASC
                LIMIT 10
                """
            )
            rows = cur.fetchall()

    return [{"name": row[0], "score": row[1]} for row in rows]


@app.post("/reset-leaderboard")
def reset_leaderboard():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("TRUNCATE TABLE scores RESTART IDENTITY;")
        conn.commit()

    return {"status": "cleared"}