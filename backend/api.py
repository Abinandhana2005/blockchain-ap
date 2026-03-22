from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import glob
from node import SwarmNode
from aggregation import SwarmAggregator

app = Flask(__name__)
CORS(app)

@app.route('/run_swarm', methods=['POST'])
def run_swarm():
    try:
        resume_files = sorted(glob.glob('../data/resumes/*.txt'))[:30]
        if not resume_files:
            return jsonify({'error': 'No resumes found'}), 400
        
        resumes = []
        for f in resume_files:
            try:
                with open(f, 'r', encoding='utf-8', errors='ignore') as file:
                    resumes.append(file.read())
            except:
                pass
        
        try:
            with open('../data/labels.json', 'r') as f:
                labels_data = json.load(f)
                labels = labels_data['labels'][:30]
        except:
            labels = [1 if i < 15 else 0 for i in range(len(resumes))]
        
        node_a = SwarmNode('Node_A', resumes[:10], labels[:10])
        node_b = SwarmNode('Node_B', resumes[10:20], labels[10:20])
        node_c = SwarmNode('Node_C', resumes[20:30], labels[20:30])
        
        aggregator = SwarmAggregator()
        accuracies = aggregator.run_full_swarm([node_a, node_b, node_c], num_rounds=5)
        
        return jsonify({
            'accuracy': float(accuracies[-1]),
            'rounds': 5,
            'transactions': 15,
            'status': 'success',
            'accuracies': [float(a) for a in accuracies]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)