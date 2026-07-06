import { CodeBlock } from '../components/CodeBlock';

export function Monitoring() {
  return (
    <div>
      <div className="inline-block text-xs font-mono tracking-widest text-cyan-500 border border-cyan-500/30 bg-cyan-500/10 rounded px-3 py-1 mb-4">
        MONITORING
      </div>
      <h1 className="text-4xl font-bold text-white mb-6">Prometheus Metrics</h1>
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        Every DRMQ broker node ships with a built-in Prometheus metrics endpoint powered by Micrometer. Metrics are enabled by default and start serving as soon as the broker starts.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Endpoints</h2>
      <ul className="list-disc list-inside text-slate-300 space-y-2 mb-8 ml-2">
        <li><strong>Prometheus scrape:</strong> <code>http://localhost:9096/metrics</code></li>
        <li><strong>JSON summary:</strong> <code>http://localhost:9096/metrics/summary</code></li>
      </ul>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Available Metrics</h2>
      <div className="space-y-4 mb-8">
        <div className="bg-slate-800/40 p-4 rounded border border-slate-700/50">
          <h3 className="font-semibold text-slate-200 mb-2">Broker Gauges</h3>
          <p className="text-sm text-slate-400"><code>drmq_broker_active_handlers</code>, <code>drmq_broker_topics</code>, <code>drmq_broker_global_offset</code></p>
        </div>
        <div className="bg-slate-800/40 p-4 rounded border border-slate-700/50">
          <h3 className="font-semibold text-slate-200 mb-2">Raft Consensus</h3>
          <p className="text-sm text-slate-400"><code>drmq_broker_raft_is_leader</code>, <code>drmq_broker_raft_commit_index</code>, <code>drmq_broker_raft_replication_lag</code></p>
        </div>
        <div className="bg-slate-800/40 p-4 rounded border border-slate-700/50">
          <h3 className="font-semibold text-slate-200 mb-2">Request Counters</h3>
          <p className="text-sm text-slate-400"><code>drmq_broker_request_total</code>, <code>drmq_broker_request_latency</code></p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Prometheus Scrape Configuration</h2>
      <CodeBlock 
        language="yaml"
        code={`scrape_configs:\n  - job_name: 'drmq'\n    static_configs:\n      - targets: ['localhost:9096']`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Configuration Reference</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        You can customize the metrics server with the following broker startup flags:
      </p>
      <ul className="list-disc list-inside text-slate-300 space-y-2 mb-8 ml-2">
        <li><code>--metrics-port</code>: The HTTP port (default 9096)</li>
        <li><code>--metrics-path</code>: The HTTP path (default /metrics)</li>
        <li><code>--metrics-disabled</code>: Disable the metrics server</li>
      </ul>
      <CodeBlock 
        language="bash"
        code={`./mvnw -pl drmq-broker exec:java -Dexec.args="--port 9092 --data-dir ./data-1 --metrics-port 8080"`}
      />
    </div>
  );
}
