from web3 import Web3
from eth_typing import HexStr
from typing import Optional
import asyncio
import json
import aiohttp
import logging


class LiveCollector:
    def __init__(self, web3_url: str, etherscan_api_key: str, pool_address: str):
        self.w3 = Web3(Web3.HTTPProvider(web3_url))
        self.etherscan_api_key = etherscan_api_key
        self.pool_address = pool_address
        self.logger = logging.getLogger(__name__)

    async def get_eth_usdt_price(self) -> float:
        async with aiohttp.ClientSession() as session:
            url = "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT"
            async with session.get(url) as response:
                data = await response.json()
                return float(data["price"])

    async def process_transaction(self, tx_hash: HexStr) -> Optional[dict]:
        try:
            # Get transaction details
            tx = self.w3.eth.get_transaction(tx_hash)
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)

            # Calculate fee in ETH
            fee_in_eth = receipt["gasUsed"] * tx["gasPrice"] / 1e18

            # Get ETH/USDT price
            eth_usdt_price = await self.get_eth_usdt_price()

            # Calculate fee in USDT
            fee_in_usdt = fee_in_eth * eth_usdt_price

            return {
                "hash": tx_hash.hex(),
                "block_number": tx["blockNumber"],
                "timestamp": self.w3.eth.get_block(tx["blockNumber"])["timestamp"],
                "gas_used": receipt["gasUsed"],
                "gas_price": tx["gasPrice"],
                "eth_usdt_price": eth_usdt_price,
                "fee_in_eth": fee_in_eth,
                "fee_in_usdt": fee_in_usdt,
            }
        except Exception as e:
            self.logger.error(f"Error processing transaction {tx_hash}: {str(e)}")
            return None

    async def run(self):
        latest_block = self.w3.eth.block_number

        while True:
            try:
                # Get new blocks
                current_block = self.w3.eth.block_number

                for block_number in range(latest_block + 1, current_block + 1):
                    block = self.w3.eth.get_block(block_number, full_transactions=True)

                    for tx in block.transactions:
                        if tx["to"] and tx["to"].lower() == self.pool_address.lower():
                            tx_data = await self.process_transaction(tx["hash"])
                            if tx_data:
                                # Save to database
                                pool = await get_db_pool()
                                async with pool.acquire() as conn:
                                    await conn.execute(
                                        """
                                        INSERT INTO transactions (
                                            hash, block_number, timestamp, gas_used,
                                            gas_price, eth_usdt_price, fee_in_eth, fee_in_usdt
                                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                                        ON CONFLICT (hash) DO NOTHING
                                        """,
                                        tx_data["hash"],
                                        tx_data["block_number"],
                                        tx_data["timestamp"],
                                        tx_data["gas_used"],
                                        tx_data["gas_price"],
                                        tx_data["eth_usdt_price"],
                                        tx_data["fee_in_eth"],
                                        tx_data["fee_in_usdt"],
                                    )

                latest_block = current_block

                # Sleep for a short time before checking for new blocks
                await asyncio.sleep(1)

            except Exception as e:
                self.logger.error(f"Error in live collector: {str(e)}")
                await asyncio.sleep(5)  # Wait longer on error
