import numpy as np

class SwarmAggregator:
    def __init__(self):
        self.aggregation_history = []
    
    def aggregate_weights(self, nodes_list):
        """Average weights from all nodes"""
        all_coefs = []
        all_intercepts = []
        
        for node in nodes_list:
            weights = node.get_latest_weights()
            if weights:
                all_coefs.append(weights['coef'])
                all_intercepts.append(weights['intercept'])
        
        if not all_coefs:
            return {'coef': [0] * 50, 'intercept': 0.0}
        
        avg_coef = np.mean(all_coefs, axis=0).tolist()
        avg_intercept = float(np.mean(all_intercepts))
        
        return {
            'coef': avg_coef,
            'intercept': avg_intercept
        }
    
    def run_swarm_round(self, nodes_list, round_num):
        """Run one round of swarm learning"""
        print(f"\n=== ROUND {round_num} ===")
        
        # Each node trains locally
        for node in nodes_list:
            weights, acc = node.train_local()
            print(f"{node.node_id}: {acc:.2%}")
        
        # Aggregate weights
        global_weights = self.aggregate_weights(nodes_list)
        
        # Broadcast back to all nodes
        for node in nodes_list:
            node.update_weights(global_weights)
        
        self.aggregation_history.append(round_num)
        return global_weights
    
    def run_full_swarm(self, nodes_list, num_rounds=5):
        """Run complete swarm learning for N rounds"""
        print(f"\nStarting swarm learning ({num_rounds} rounds)...")
        
        for round_num in range(1, num_rounds + 1):
            self.run_swarm_round(nodes_list, round_num)
        
        if nodes_list and nodes_list[0].accuracy_history:
            avg_accuracies = []
            
            num_rounds = len(nodes_list[0].accuracy_history)
            
            for i in range(num_rounds):
                round_acc = np.mean([
                    node.accuracy_history[i] for node in nodes_list
                ])
                avg_accuracies.append(round_acc)
            
            return avg_accuracies
        return [0.5] * num_rounds

if __name__ == "__main__":
    print("✓ aggregation.py loaded")