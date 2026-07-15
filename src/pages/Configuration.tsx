import { CodeBlock } from '../components/CodeBlock';

const ParamField = ({ name, type, defaultValue, children }: { name: string, type: string, defaultValue?: string, children: React.ReactNode }) => (
  <div className="mb-6 p-5 bg-slate-800/40 border border-slate-700/50 rounded-lg">
    <div className="flex flex-wrap items-center gap-3 mb-3">
      <code className="text-cyan-400 font-mono font-bold text-lg">{name}</code>
      <span className="text-xs font-mono text-slate-400 border border-slate-700 bg-slate-800 px-2 py-0.5 rounded">{type}</span>
      {defaultValue && <span className="text-xs text-slate-500">Default: <code className="text-slate-300 px-1 py-0.5 bg-slate-800 rounded">{defaultValue}</code></span>}
    </div>
    <div className="text-slate-300 leading-relaxed text-sm">
      {children}
    </div>
  </div>
);

export function Configuration() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-6">Broker Configuration Reference</h1>
      
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        Every DRMQ broker option is configured through command-line arguments passed at startup, or through a properties configuration file. 
        You provide flags as the value of <code>-Dexec.args</code> when using the Maven wrapper, or directly after the jar name when running a packaged artifact. 
      </p>

      <p className="text-slate-300 mb-8 leading-relaxed">
        If both a <code>--config</code> file and CLI flags are provided, the CLI flags take precedence and override the file's values. 
        The broker validates all values at startup and exits with a descriptive error message if an argument is invalid.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Using a configuration file</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        For production deployments, it is highly recommended to use a configuration file instead of a long list of CLI arguments.
      </p>
      
      <div className="mb-6">
        <CodeBlock language="bash" code={`# Using Maven wrapper
./mvnw -pl drmq-broker exec:java -Dexec.args="--config broker.properties"

# Override properties from the CLI
./mvnw -pl drmq-broker exec:java -Dexec.args="--config cluster.properties --port 9095"`} />
      </div>

      <p className="text-slate-300 mb-4 leading-relaxed">A sample <code>broker.properties</code> file:</p>
      <div className="mb-10">
        <CodeBlock language="properties" code={`node.id=broker1
port=9092
data.dir=./data-1
peers=broker2:localhost:9093,broker3:localhost:9094
log.segment.bytes=104857600
log.retention.ms=604800000
raft.compact.threshold=5000`} />
      </div>

      <div className="h-px bg-slate-800 my-10"></div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-6">Node identity</h2>
      <ParamField name="--config" type="string" defaultValue="(none)">
        <p>Path to a <code>.properties</code> configuration file to load defaults from. Any other CLI flags provided will override the values found in this file.</p>
      </ParamField>
      <ParamField name="--node-id" type="string" defaultValue="standalone">
        <p>A unique identifier for this broker node within the cluster. Use the alias <code>--id</code> if you prefer a shorter flag. In single-node mode the default value <code>standalone</code> is sufficient. In cluster mode every node must have a distinct <code>--node-id</code> that matches exactly what the other nodes list in their <code>--peers</code> arguments.</p>
      </ParamField>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-6">Network</h2>
      <ParamField name="--port" type="int" defaultValue="9092">
        <p>The TCP port the broker binds to for client connections. Must be between 1 and 65535. All nodes in a cluster must use different ports if they run on the same host.</p>
      </ParamField>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-6">Storage</h2>
      <ParamField name="--data-dir" type="string" defaultValue="./data">
        <p>The filesystem path where the broker persists its write-ahead log, message segments, and consumer offset state. The directory is created automatically if it does not exist. Each node in a cluster must have its own dedicated data directory — sharing a directory between nodes corrupts both.</p>
      </ParamField>
      <ParamField name="--log-segment-bytes" type="long" defaultValue="104857600">
        <p>The maximum size of a single log segment file in bytes. When the active segment reaches this size the broker rolls it over to a new file. The default is 100 MB (104,857,600 bytes). Must be a positive integer.</p>
      </ParamField>
      <ParamField name="--log-retention-ms" type="long" defaultValue="604800000">
        <p>How long the broker retains message segments before deleting them, in milliseconds. The default is 7 days (604,800,000 ms). Segments are eligible for deletion once they are older than this value <strong>and</strong> no longer the active write segment. Must be a positive integer.</p>
      </ParamField>
      <ParamField name="--log-segment-fsync" type="boolean" defaultValue="true">
        <p>Whether the broker strictly flushes writes to disk (<code>fsync</code>) before acknowledging them to the client. The default is <code>true</code> for maximum durability. Set to <code>false</code> to disable synchronous flushes, vastly improving throughput at the risk of data loss during a sudden power failure.</p>
      </ParamField>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">InfinityLog (Transparent Tiered Storage)</h2>
      <p className="text-slate-300 mb-6 leading-relaxed">
        InfinityLog allows the broker to natively archive deleted <code>.log</code> segments to any S3-compatible cloud storage (AWS S3, Cloudflare R2, MinIO) and seamlessly fetch them back to local disk on demand when a consumer attempts a Time-Based replay of an old offset.
      </p>
      <ParamField name="--s3-archive-bucket" type="string" defaultValue="(none)">
        <p>The name of the S3-compatible bucket to upload segments to before they are deleted locally. If omitted, InfinityLog tiered storage is disabled and segments are permanently deleted.</p>
      </ParamField>
      <ParamField name="--s3-archive-region" type="string" defaultValue="us-east-1">
        <p>The AWS region for your bucket. If using a global provider like Cloudflare R2, set this to <code>auto</code>.</p>
      </ParamField>
      <ParamField name="--s3-archive-endpoint" type="string" defaultValue="(none)">
        <p>An optional endpoint override to connect to non-AWS S3 providers. For example: <code>https://&lt;ACCOUNT_ID&gt;.r2.cloudflarestorage.com</code> (Cloudflare R2) or <code>http://localhost:9000</code> (MinIO).</p>
      </ParamField>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-6">Cluster and Raft</h2>
      <ParamField name="--peers" type="string" defaultValue="(none)">
        <p className="mb-3">A comma-separated list of peer broker addresses used to form a Raft cluster. Omitting this flag starts the broker in single-node mode with no Raft replication. Required for cluster mode.</p>
        <p className="mb-2">Each entry follows the format <code>nodeId:host:port</code>, for example:</p>
        <div className="mb-3"><CodeBlock language="bash" code="--peers 2:localhost:9093,3:localhost:9094" /></div>
        <p>Do not include the current node's own address in the peer list.</p>
      </ParamField>
      <ParamField name="--raft-compact-threshold" type="long" defaultValue="1000">
        <p>The number of committed Raft log entries that accumulates before the broker triggers a log compaction (snapshot). Lower values reduce recovery time after a restart at the cost of more frequent compaction I/O. Must be a positive integer.</p>
      </ParamField>
      
      <div className="bg-blue-500/10 rounded-lg p-4 mb-6 mt-4">
        <p className="text-sm text-blue-200/80">
          <strong>Note:</strong> The <code>--peers</code> flag accepts two formats for each peer descriptor:
          <br/><br/>
          &bull; <strong>Standard:</strong> <code>nodeId:host:port</code> — for example, <code>2:broker-2.internal:9093</code>. The <code>nodeId</code> must match the <code>--node-id</code> of the target peer exactly.<br/>
          &bull; <strong>Legacy:</strong> <code>host:port</code> — for example, <code>broker-2.internal:9093</code>. In this format the broker uses the host string as the node ID. Prefer the standard format for new deployments.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-6">Dead-Letter Queues</h2>
      <ParamField name="--max-deliveries" type="int" defaultValue="5">
        <p>The maximum number of times the broker will attempt to deliver a message to a consumer group before routing it to the dead-letter queue (DLQ). A consumer triggers redelivery by calling <code>nack()</code>. Once this threshold is reached the message is moved to the DLQ topic and the consumer group advances past it. Must be a positive integer.</p>
      </ParamField>
      <ParamField name="--dlq-topic-prefix" type="string" defaultValue="dlq.">
        <p>The string prepended to the topic name when the broker creates a DLQ topic. For example, with the default prefix <code>dlq.</code>, poison messages from the topic <code>orders</code> in consumer group <code>processors</code> are routed to <code>dlq.processors.orders</code>. Must not be empty or contain whitespace.</p>
      </ParamField>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-6">Metrics and observability</h2>
      <ParamField name="--metrics-enabled" type="boolean" defaultValue="true">
        <p>Set to <code>false</code> to disable the Prometheus metrics HTTP endpoint entirely. Accepts <code>true</code> or <code>false</code> (case-insensitive). Use <code>--metrics-disabled</code> as a convenience flag instead of <code>--metrics-enabled false</code> if you prefer.</p>
      </ParamField>
      <ParamField name="--metrics-disabled" type="flag">
        <p className="mb-3">A standalone boolean flag (no value required) that disables the Prometheus metrics endpoint. Equivalent to <code>--metrics-enabled false</code>. Use this when you want to disable metrics with a single argument.</p>
        <CodeBlock language="bash" code="./mvnw -pl drmq-broker exec:java -Dexec.args=&quot;--port 9092 --metrics-disabled&quot;" />
      </ParamField>
      <ParamField name="--metrics-port" type="int" defaultValue="9096">
        <p>The TCP port on which the broker exposes Prometheus metrics over HTTP. Must be between 1 and 65535 and must not conflict with <code>--port</code>. Has no effect if metrics are disabled.</p>
      </ParamField>
      <ParamField name="--metrics-path" type="string" defaultValue="/metrics">
        <p>The HTTP path at which Prometheus metrics are served. Must start with <code>/</code>, must not contain whitespace, and must not end with <code>/</code> (unless it is exactly <code>/</code>). Has no effect if metrics are disabled.</p>
      </ParamField>

      <div className="h-px bg-slate-800 my-10"></div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-6">Full example: production cluster node</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        The following command starts a single node of a 3-node production cluster with custom retention, compaction, and metrics settings:
      </p>
      
      <div className="mb-4">
        <CodeBlock language="bash" code={`./mvnw -pl drmq-broker exec:java -Dexec.args="\\
  --node-id 1 \\
  --port 9092 \\
  --data-dir /var/drmq/node-1 \\
  --peers 2:broker-2.prod.internal:9092,3:broker-3.prod.internal:9092 \\
  --log-segment-bytes 209715200 \\
  --log-retention-ms 2592000000 \\
  --raft-compact-threshold 5000 \\
  --max-deliveries 3 \\
  --dlq-topic-prefix dead. \\
  --metrics-port 9096 \\
  --metrics-path /metrics"`} />
      </div>

      <p className="text-slate-300 mt-6 mb-4 leading-relaxed">
        The equivalent configuration using a <code>broker.properties</code> file would be:
      </p>

      <div className="mb-4">
        <CodeBlock language="properties" code={`node.id=1
port=9092
data.dir=/var/drmq/node-1
peers=2:broker-2.prod.internal:9092,3:broker-3.prod.internal:9092
log.segment.bytes=209715200
log.retention.ms=2592000000
raft.compact.threshold=5000
max.deliveries=3
dlq.topic.prefix=dead.
metrics.port=9096
metrics.path=/metrics`} />
      </div>

      <p className="text-slate-300 mb-6 leading-relaxed">
        This example uses:<br/>
        &bull; 200 MB log segments<br/>
        &bull; 30-day message retention<br/>
        &bull; Raft compaction every 5,000 entries<br/>
        &bull; DLQ after 3 failed deliveries<br/>
        &bull; Custom DLQ prefix <code>dead.</code>
      </p>

      <div className="bg-cyan-500/10 rounded-lg p-4 mb-10">
        <p className="text-sm text-cyan-200/80">
          <strong>Tip:</strong> Wrap each node's startup command in a <code>systemd</code> unit file or container entrypoint so that the broker restarts automatically after a crash. Because DRMQ persists all state to <code>--data-dir</code>, a restarted node recovers its log and consumer offsets from disk and rejoins the cluster without data loss.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-6">Quick-reference table</h2>
      <div className="rounded-lg border border-slate-700/50 overflow-hidden my-6 bg-slate-800/40">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap md:whitespace-normal">
            <thead className="bg-slate-800/80 text-white border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold w-48 uppercase tracking-wider text-xs text-slate-400">Flag</th>
                <th className="px-6 py-4 font-semibold w-24 uppercase tracking-wider text-xs text-slate-400">Type</th>
                <th className="px-6 py-4 font-semibold w-32 uppercase tracking-wider text-xs text-slate-400">Default</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-slate-400">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {[
                ['--config', 'string', '(none)', 'Load defaults from a properties file'],
                ['--node-id / --id', 'string', 'standalone', 'Must be unique per cluster node'],
                ['--port', 'int', '9092', 'Client TCP port'],
                ['--data-dir', 'string', './data', 'Must be unique per node'],
                ['--peers', 'string', '(none)', 'Required for cluster mode'],
                ['--log-segment-bytes', 'long', '104857600', '100 MB'],
                ['--log-retention-ms', 'long', '604800000', '7 days'],
                ['--raft-compact-threshold', 'long', '5000', 'Log entries between snapshots'],
                ['--max-deliveries', 'int', '5', 'Attempts before DLQ routing'],
                ['--dlq-topic-prefix', 'string', 'dlq.', 'Prefix for DLQ topic names'],
                ['--metrics-enabled', 'boolean', 'true', 'true or false'],
                ['--metrics-disabled', 'flag', '—', 'Shorthand for --metrics-enabled false'],
                ['--metrics-port', 'int', '9096', 'Prometheus HTTP port'],
                ['--metrics-path', 'string', '/metrics', 'Prometheus HTTP path'],
                ['--log-segment-fsync', 'boolean', 'true', 'Force disk flush per batch'],
                ['--s3-archive-bucket', 'string', '(none)', 'Enable InfinityLog tiered storage'],
                ['--s3-archive-region', 'string', 'us-east-1', 'Cloud region'],
                ['--s3-archive-endpoint', 'string', '(none)', 'Custom endpoint for R2/MinIO/Spaces']
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
      
    </div>
  );
}
