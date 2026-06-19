import { CodeBlock } from '../components/CodeBlock';

export function Deployment() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-6">Deployment & Quick Start</h1>
      
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        This guide covers compiling from source, starting a single-node standalone broker, 
        spinning up a local 3-node Raft cluster, and connecting the telemetry dashboard.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Prerequisites</h2>
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg divide-y divide-slate-700/50 mb-8 overflow-hidden">
        {[
          ['Java', '17+', 'The broker and client are written in Java 17.'],
          ['Maven', '3.8+', 'Used to build all modules.'],
          ['Node.js', '18+', 'Required only for the dashboard.'],
        ].map(([dep, ver, note]) => (
          <div key={dep} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-6 py-4 text-sm">
            <span className="text-cyan-400 font-mono w-24 shrink-0 font-semibold">{dep}</span>
            <span className="text-white w-16 shrink-0 bg-slate-800 px-2 py-1 rounded inline-block text-center">{ver}</span>
            <span className="text-slate-400">{note}</span>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Build from Source</h2>
      <p className="text-slate-300 mb-4">Clone the repository and build all Maven modules from the project root:</p>
      <CodeBlock 
        language="bash"
        code={`git clone https://github.com/samuel025/DRMQ.git\ncd DRMQ\n\n# Build all modules (broker + client + protocol)\nmvn clean install -DskipTests`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Start a Single-Node Broker</h2>
      <p className="text-slate-300 mb-4">
        The fastest way to get running. The broker starts on port 9092 and stores data in <code>./data</code> by default.
      </p>
      <CodeBlock 
        language="bash"
        code={`cd drmq-broker\n\n# Default: node-id=1, port=9092, data-dir=./data, no peers (standalone)\nmvn exec:java`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Start a 3-Node Cluster (Local)</h2>
      <p className="text-slate-300 mb-4">
        Open three separate terminals. Each node must know the addresses of its peers.
        The cluster will elect a leader once a quorum (2 of 3) establishes connectivity.
      </p>
      <CodeBlock 
        language="bash"
        code={`# Terminal 1 — Node 1
cd drmq-broker
mvn exec:java -Dexec.args="--node-id 1 --port 9092 --data-dir ./data-1 --peers 2:localhost:9093,3:localhost:9094"

# Terminal 2 — Node 2
cd drmq-broker
mvn exec:java -Dexec.args="--node-id 2 --port 9093 --data-dir ./data-2 --peers 1:localhost:9092,3:localhost:9094"

# Terminal 3 — Node 3
cd drmq-broker
mvn exec:java -Dexec.args="--node-id 3 --port 9094 --data-dir ./data-3 --peers 1:localhost:9092,2:localhost:9093"`}
      />

      <div className="border-l-4 border-yellow-500 bg-yellow-500/10 rounded-r-lg p-5 my-8">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-400 uppercase tracking-wide mb-1">Important</h3>
            <div className="text-sm text-yellow-200/80 leading-relaxed">
              Peers must be specified as a comma-separated list of <code>host:port</code> pairs
              excluding the current node's own address. Providing the node's own address in the peer
              list is harmless but generates a connection warning on startup.
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Verify the Cluster</h2>
      <p className="text-slate-300 mb-4">
        Watch the logs. Within 2-3 seconds you should see one node win the election and print:
      </p>
      <CodeBlock 
        language="bash"
        code={`[raft-timer] INFO  RaftNode - [1] Became LEADER for term 1\n[raft-timer] INFO  RaftNode - [1] Sending heartbeats to 2 peers`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Start the Telemetry Dashboard</h2>
      <CodeBlock 
        language="bash"
        code={`cd drmq-dashboard\nnpm install\n\n# Connect to all three broker nodes\nVITE_USE_WEBSOCKET=true npm run dev`}
      />
      <p className="text-slate-300 mt-4 leading-relaxed">
        Open <code>http://localhost:5173</code> in your browser.
        The dashboard connects to all broker nodes simultaneously via WebSocket and merges their
        telemetry into a single unified view.
      </p>
    </div>
  );
}
