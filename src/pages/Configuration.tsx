import { CodeBlock } from '../components/CodeBlock';

export function Configuration() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-6">Broker Configuration Reference</h1>
      
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        The broker can be configured either through a <code>.properties</code> file (recommended) or entirely via command-line arguments. 
        Command-line flags will always override values set in the properties file.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Using a configuration file</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        For production deployments, it is highly recommended to use a configuration file instead of a long list of CLI arguments.
      </p>
      <CodeBlock language="properties" code={`node.id=broker1
port=9092
data.dir=./data-1
peers=broker2:localhost:9093,broker3:localhost:9094
log.segment.bytes=104857600
log.retention.ms=604800000
raft.compact.threshold=5000`} />

      <h2 className="text-2xl font-semibold text-slate-100 mb-6 mt-10">Startup Arguments</h2>
      <div className="rounded-lg border border-slate-700/50 overflow-hidden my-6 bg-slate-800/40">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap md:whitespace-normal">
            <thead className="bg-slate-800/80 text-white border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold w-36 uppercase tracking-wider text-xs text-slate-400">Argument</th>
                <th className="px-6 py-4 font-semibold w-28 uppercase tracking-wider text-xs text-slate-400">Type</th>
                <th className="px-6 py-4 font-semibold w-24 uppercase tracking-wider text-xs text-slate-400">Default</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-slate-400">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {[
                ['config', 'String', 'none', 'Path to a standard Java .properties file containing broker configuration.'],
                ['node-id / id', 'String', 'standalone', 'Unique identifier for this broker within the Raft cluster. Use --id as an alias. Must be stable across restarts.'],
                ['port', 'Integer', '9092', 'TCP port on which the Netty server listens for both client connections and inbound Raft RPC traffic.'],
                ['data-dir', 'String', './data', 'Root directory for all persistent state. Each node must have its own dedicated directory.'],
                ['peers', 'String', 'none', 'Comma-separated list of peer addresses (e.g. 2:host:9093,3:host:9094). Omit for single-node mode.'],
                ['s3-archive-bucket', 'String', 'none', 'The name of the S3 or MinIO bucket for InfinityLog Tiered Storage.'],
                ['s3-archive-region', 'String', 'us-east-1', 'The AWS region for the InfinityLog S3 bucket.'],
                ['s3-archive-endpoint', 'String', 'none', 'Optional custom endpoint URL for the S3 API (e.g. for MinIO).'],
                ['max-deliveries', 'Integer', '5', 'Max attempts before routing to the Dead-Letter Queue.'],
                ['dlq-topic-prefix', 'String', 'dlq.', 'String prefix for DLQ topics (e.g. dlq.payments-group.orders).'],
                ['log-segment-bytes', 'Long', '100MB', 'Max size (bytes) of a log segment before rolling (default: 104857600).'],
                ['log-retention-ms', 'Long', '7 Days', 'Time (ms) to keep inactive log segments before deletion (default: 604800000).'],
                ['raft-compact-threshold', 'Long', '5000', 'Number of committed Raft log entries that triggers an asynchronous snapshot.'],
                ['metrics-enabled', 'Boolean', 'true', 'Set to false to disable the Prometheus metrics HTTP endpoint.'],
                ['metrics-disabled', 'Flag', 'none', 'A standalone flag (no value required) equivalent to --metrics-enabled false.'],
                ['metrics-port', 'Integer', '9096', 'The TCP port on which the broker exposes Prometheus metrics over HTTP.'],
                ['metrics-path', 'String', '/metrics', 'The HTTP path at which Prometheus metrics are served.'],
                ['log-segment-fsync', 'Boolean', 'true', 'Whether to force sync log entries to disk before returning success. Disabling improves throughput but risks data loss on power failure.']
              ].map(([arg, type, def, desc]) => (
                <tr key={arg} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-cyan-400 font-semibold align-top">{arg}</td>
                  <td className="px-6 py-4 text-slate-400 align-top font-mono text-xs">{type}</td>
                  <td className="px-6 py-4 align-top">
                    <span className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-xs text-slate-300 whitespace-nowrap">
                      {def}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 leading-relaxed align-top">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 p-5 bg-cyan-900/10 border border-cyan-800/30 rounded-lg">
        <h3 className="text-cyan-400 font-semibold mb-2">Example Usage</h3>
        <code className="text-sm text-slate-300 font-mono bg-slate-900/50 px-3 py-2 rounded block whitespace-pre-wrap">
          mvn exec:java -Dexec.args="--config server.properties"
        </code>
      </div>
    </div>
  );
}
