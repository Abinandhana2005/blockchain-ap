from web3 import Web3
import json

class SmartContractInterface:
    def __init__(self, contract_address, contract_abi, provider_url="http://127.0.0.1:8545"):
        self.w3 = Web3(Web3.HTTPProvider(provider_url))
        self.contract = self.w3.eth.contract(address=contract_address, abi=contract_abi)
        self.account = None
        self.private_key = None
    
    def set_account(self, account_address, private_key):
        self.account = account_address
        self.private_key = private_key
    
    def register_node(self, node_name):
        print(f"📝 Registering: {node_name}")
        try:
            tx = self.contract.functions.registerNode(node_name).buildTransaction({
                'from': self.account,
                'nonce': self.w3.eth.get_transaction_count(self.account),
                'gas': 300000,
                'gasPrice': self.w3.eth.gas_price,
            })
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            print(f"✓ Registered!")
            return receipt
        except Exception as e:
            print(f"✗ Error: {e}")
            return None
    
    def submit_update(self, accuracy, weights_hash):
        print(f"📤 Submitting: {accuracy}%")
        try:
            tx = self.contract.functions.submitUpdate(accuracy, weights_hash).buildTransaction({
                'from': self.account,
                'nonce': self.w3.eth.get_transaction_count(self.account),
                'gas': 300000,
                'gasPrice': self.w3.eth.gas_price,
            })
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            print(f"✓ Submitted!")
            return receipt
        except Exception as e:
            print(f"✗ Error: {e}")
            return None