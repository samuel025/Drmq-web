import { CodeBlock } from '../components/CodeBlock';

export function ClusterMode() {
  return (
    <div>
      <div className="inline-block text-xs font-mono tracking-widest text-cyan-500 border border-cyan-500/30 bg-cyan-500/10 rounded px-3 py-1 mb-4">CORE CONCEPTS</div>
      <h1 className="text-4xl font-bold text-white mb-6">Cluster Mode</h1>
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        For production workloads where a single broker outage is not acceptable, DRMQ includes a full implementation of the <strong>Raft consensus algorithm</strong>. Cluster mode replicates every write to a quorum of broker nodes before acknowledging producers, so your data survives individual node failures — including the loss of the leader itself.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">How Raft Consensus Works in DRMQ</h2>
      <div className="space-y-4 mb-8">
        {[
          ['1', 'Leader election', 'When a cluster starts (or the current leader becomes unreachable), the nodes hold an election. The candidate that receives a majority of votes becomes the new leader and begins accepting client writes.'],
          ['2', 'Quorum writes', 'Every produce request is written to the Raft log and replicated to followers. The leader returns a success response only after a majority (quorum) of nodes confirm they have persisted the entry. This makes acknowledged writes durable even if the leader crashes immediately afterward.'],
          ['3', 'Log replication', 'Followers continuously replicate entries from the leader. A follower that falls behind — due to a restart or temporary partition — catches up automatically by receiving the missing log entries.'],
          ['4', 'Snapshots and log compaction', 'DRMQ uses a two-phase compaction strategy. The broker trims its local Raft log entries that are well behind the last-applied index. A full state snapshot is only generated on demand, when a follower requests entries that have already been trimmed.'],
        ].map(([step, title, desc]) => (
          <div key={step} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0 mt-1">{step}</div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 flex-1">
              <h3 className="font-semibold text-slate-200 mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">How Many Nodes Do You Need?</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">Raft requires a <strong>majority quorum</strong> to make progress. A cluster of <code>2f + 1</code> nodes tolerates <code>f</code> simultaneous failures:</p>
      <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-8 bg-slate-800/40">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/80 text-white border-b border-slate-700">
            <tr>
              {['Cluster size', 'Failures tolerated', 'Minimum nodes for writes'].map(h => (
                <th key={h} className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {[['1 node', '0', '1'], ['3 nodes', '1', '2'], ['5 nodes', '2', '3'], ['7 nodes', '3', '4']].map(([size, fail, min]) => (
              <tr key={size} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-6 py-4 text-slate-300">{size}</td>
                <td className="px-6 py-4 text-slate-300">{fail}</td>
                <td className="px-6 py-4 text-slate-300">{min}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-l-4 border-blue-500 bg-blue-500/10 rounded-r-lg p-4 mb-8">
        <p className="text-sm text-blue-200/80">A 3-node cluster is the recommended minimum for production. It tolerates the loss of one node during a rolling upgrade or crash while still accepting writes. A 5-node cluster tolerates two simultaneous failures, appropriate for multi-availability-zone deployments.</p>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Leader Writes and Follower-Based Reads</h2>
      <ul className="list-disc list-inside text-slate-300 space-y-3 mb-8 ml-2">
        <li><strong>All writes go to the leader.</strong> If a producer or consumer sends a request to a follower, the follower responds with <code>NOT_LEADER:&lt;leaderAddress&gt;</code>. The client library redirects automatically.</li>
        <li><strong>Group-mode consumers must use the leader.</strong> When a <code>DRMQConsumer</code> is constructed with a consumer group, the broker checks <code>isLeader()</code> and returns <code>NOT_LEADER</code> if on a follower.</li>
        <li><strong>Single-mode consumers can read from followers.</strong> Consumers that use <code>setGroupMode(false)</code> skip the leader check and read directly from the local <code>MessageStore</code>.</li>
      </ul>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Client Failover and Leader Redirect</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">Pass a comma-separated bootstrap server list to <code>DRMQProducer</code> or <code>DRMQConsumer</code>. The client picks a random server on startup and cycles through the list on failure.</p>
      <CodeBlock language="java" code={`// Producer connecting to a 3-node cluster
try (DRMQProducer producer = new DRMQProducer("localhost:9092,localhost:9093,localhost:9094")) {
    producer.connect();
    DRMQProducer.SendResult result = producer.send("orders", "{ \\"id\\": 1 }");
    if (result.isSuccess()) {
        System.out.println("Stored at offset " + result.getOffset());
    }
}

// Consumer connecting to the same cluster
DRMQConsumer consumer = new DRMQConsumer(
    "localhost:9092,localhost:9093,localhost:9094",
    "order-processors"
);
consumer.setAutoCommit(true);
consumer.connect();
consumer.subscribe("orders");`} />

      <div className="space-y-3 mt-6 mb-8">
        {[
          ['Client picks a random bootstrap server', 'On connect(), the client picks a random entry from the bootstrap list using ThreadLocalRandom to spread initial connection load across all nodes.'],
          ['Broker returns NOT_LEADER if needed', 'If the connected node is a follower and cannot serve the request, it responds with NOT_LEADER:<leaderHost>:<leaderPort>. The client immediately reconnects to the indicated leader.'],
          ['Client rotates on connection failure', 'If the TCP connection drops entirely, the client rotates to the next server in the bootstrap list and retries up to MAX_RETRIES × bootstrap-server-count times.'],
        ].map(([title, desc]) => (
          <div key={title} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-200 mb-2">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Quorum-Loss Stepdown: Preventing Split-Brain</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        If the current leader loses contact with enough followers that it can no longer form a quorum, it <strong>steps down voluntarily</strong> rather than continuing to accept writes. This prevents split-brain scenarios where two nodes simultaneously believe they are the leader.
      </p>
      <ol className="list-decimal list-inside text-slate-300 space-y-2 mb-8 ml-2">
        <li>It stops accepting new produce requests and returns <code>NOT_LEADER</code> to clients.</li>
        <li>The remaining reachable nodes hold a new election.</li>
        <li>The new leader resumes writes once it secures a majority vote.</li>
      </ol>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Single-Node Mode: No Raft Overhead</h2>
      <div className="border-l-4 border-blue-500 bg-blue-500/10 rounded-r-lg p-4 mb-6">
        <p className="text-sm text-blue-200/80">If you start a broker with <strong>no <code>--peers</code> argument</strong>, it runs in <strong>single-node mode</strong> with all Raft consensus logic disabled. There is no election overhead, no replication latency, and no quorum requirement. Single-node mode is ideal for local development, CI pipelines, and integration testing.</p>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Configuring a Cluster</h2>
      <CodeBlock language="bash" code={`# Node 1
./mvnw -pl drmq-broker exec:java \\
  -Dexec.args="--node-id 1 --port 9092 --data-dir ./data-1 \\
               --peers 2:localhost:9093,3:localhost:9094"

# Node 2
./mvnw -pl drmq-broker exec:java \\
  -Dexec.args="--node-id 2 --port 9093 --data-dir ./data-2 \\
               --peers 1:localhost:9092,3:localhost:9094"

# Node 3
./mvnw -pl drmq-broker exec:java \\
  -Dexec.args="--node-id 3 --port 9094 --data-dir ./data-3 \\
               --peers 1:localhost:9092,2:localhost:9093"`} />

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Observability in Cluster Mode</h2>
      <p className="text-slate-300 mb-4">DRMQ exposes Prometheus metrics on port <code>9096</code> (configurable via <code>--metrics-port</code>). Particularly useful cluster health metrics:</p>
      <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-8 bg-slate-800/40">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/80 border-b border-slate-700">
            <tr>
              {['Metric', 'Type', 'Description'].map(h => (
                <th key={h} className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {[
              ['drmq_broker_raft_is_leader', 'Gauge', '1.0 if this node is the current leader, 0.0 otherwise'],
              ['drmq_broker_raft_commit_index', 'Gauge', 'The highest log index known to be committed across the cluster'],
              ['drmq_broker_raft_last_applied', 'Gauge', "The highest log index applied to this node's state machine"],
              ['drmq_broker_raft_replication_lag', 'Gauge', 'Per-peer replication lag (tagged peer_id); non-zero only on the leader'],
              ['drmq_broker_request_total', 'Counter', 'Total requests tagged by type (produce/consume) and outcome'],
            ].map(([m, t, d]) => (
              <tr key={m} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-6 py-4 font-mono text-cyan-400 text-xs">{m}</td>
                <td className="px-6 py-4 text-slate-400 text-xs">{t}</td>
                <td className="px-6 py-4 text-slate-300">{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
