"""
deploy.py — Run this ONCE before starting api.py

Requirements:
    pip install web3 py-solc-x

Usage:
    python deploy.py

It compiles SwarmChain.sol, deploys it to Ganache at localhost:8545,
and writes the contract address to contract_address.txt so api.py can load it.
"""

from solcx import compile_standard, install_solc
from web3 import Web3
import json, os

GANACHE_URL  = 'http://127.0.0.1:8545'
SOL_FILE     = 'SwarmChain.sol'
ADDRESS_FILE = 'contract_address.txt'
ABI_FILE     = 'contract_abi.json'

# ── 1. Connect ───────────────────────────────────────────────────────────────
w3 = Web3(Web3.HTTPProvider(GANACHE_URL))
if not w3.is_connected():
    raise ConnectionError("Cannot connect to Ganache. Make sure it's running on port 8545.")

print(f"Connected to Ganache  |  {len(w3.eth.accounts)} accounts found")
deployer = w3.eth.accounts[0]
print(f"Deploying from:       {deployer}")

# ── 2. Install & compile ─────────────────────────────────────────────────────
install_solc('0.8.20')
print("Solidity 0.8.20 ready")

with open(SOL_FILE, 'r') as f:
    source = f.read()

compiled = compile_standard({
    "language": "Solidity",
    "sources": { SOL_FILE: { "content": source } },
    "settings": {
        "outputSelection": {
            "*": { "*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"] }
        }
    }
}, solc_version='0.8.20')

contract_data = compiled['contracts'][SOL_FILE]['SwarmChain']
abi      = contract_data['abi']
bytecode = contract_data['evm']['bytecode']['object']

print("Compiled successfully")

# ── 3. Deploy ────────────────────────────────────────────────────────────────
Contract = w3.eth.contract(abi=abi, bytecode=bytecode)
tx_hash  = Contract.constructor().transact({'from': deployer, 'gas': 3_000_000})
receipt  = w3.eth.wait_for_transaction_receipt(tx_hash)
address  = receipt.contractAddress

print(f"\n✅  Contract deployed!")
print(f"   Address : {address}")
print(f"   Gas used: {receipt.gasUsed:,}")
print(f"   TX hash : {tx_hash.hex()}")

# ── 4. Save address + ABI so api.py can load them ────────────────────────────
with open(ADDRESS_FILE, 'w') as f:
    f.write(address)

with open(ABI_FILE, 'w') as f:
    json.dump(abi, f, indent=2)

print(f"\n   Saved address → {ADDRESS_FILE}")
print(f"   Saved ABI     → {ABI_FILE}")
print("\nYou can now start api.py  →  python api.py")
