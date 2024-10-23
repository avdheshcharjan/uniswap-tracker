from fastapi import FastAPI, HTTPException, Query
from typing import Optional
from datetime import datetime
import asyncpg
import redis
from pydantic import BaseModel
import os

app = FastAPI()


# Database connection pool
async def get_db_pool():
    return await asyncpg.create_pool(
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres"),
        database=os.getenv("DB_NAME", "uniswap_tracker"),
        host=os.getenv("DB_HOST", "localhost"),
    )


# Redis connection
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True,
)


class Transaction(BaseModel):
    hash: str
    block_number: int
    timestamp: datetime
    gas_used: int
    gas_price: int
    eth_usdt_price: float
    fee_in_eth: float
    fee_in_usdt: float


@app.get("/api/v1/transactions")
async def get_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    from_timestamp: Optional[datetime] = None,
    to_timestamp: Optional[datetime] = None,
    hash: Optional[str] = None,
):
    # Try to get from cache first
    cache_key = f"txns:{page}:{page_size}:{from_timestamp}:{to_timestamp}:{hash}"
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return cached_data

    # Build query
    query = """
        SELECT hash, block_number, timestamp, gas_used, gas_price, 
               eth_usdt_price, fee_in_eth, fee_in_usdt
        FROM transactions
        WHERE 1=1
    """
    params = []
    if from_timestamp:
        query += " AND timestamp >= $1"
        params.append(from_timestamp)
    if to_timestamp:
        query += f" AND timestamp <= ${len(params) + 1}"
        params.append(to_timestamp)
    if hash:
        query += f" AND hash = ${len(params) + 1}"
        params.append(hash)

    query += """ 
        ORDER BY timestamp DESC
        LIMIT $%d OFFSET $%d
    """ % (
        len(params) + 1,
        len(params) + 2,
    )

    params.extend([page_size, (page - 1) * page_size])

    # Execute query
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)

    transactions = [dict(row) for row in rows]

    # Cache results
    redis_client.setex(cache_key, 60, transactions)  # Cache for 1 minute

    return transactions


@app.get("/api/v1/transactions/{hash}")
async def get_transaction(hash: str):
    # Try cache first
    cache_key = f"txn:{hash}"
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return cached_data

    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT hash, block_number, timestamp, gas_used, gas_price, 
                   eth_usdt_price, fee_in_eth, fee_in_usdt
            FROM transactions
            WHERE hash = $1
            """,
            hash,
        )

    if not row:
        raise HTTPException(status_code=404, detail="Transaction not found")

    transaction = dict(row)

    # Cache result
    redis_client.setex(cache_key, 300, transaction)  # Cache for 5 minutes

    return transaction


@app.get("/api/v1/stats")
async def get_stats():
    # Try cache first
    cache_key = "stats"
    cached_stats = redis_client.get(cache_key)
    if cached_stats:
        return cached_stats

    pool = await get_db_pool()
    async with pool.acquire() as conn:
        stats = await conn.fetchrow(
            """
            SELECT 
                SUM(fee_in_usdt) as total_fee_usdt,
                SUM(fee_in_eth) as total_fee_eth,
                (SELECT eth_usdt_price 
                 FROM transactions 
                 ORDER BY timestamp DESC 
                 LIMIT 1) as current_eth_usdt_price
            FROM transactions
            """
        )

    result = dict(stats)

    # Cache stats
    redis_client.setex(cache_key, 60, result)  # Cache for 1 minute

    return result
