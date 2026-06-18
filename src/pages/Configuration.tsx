import React from 'react';

export function Configuration() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-6">Broker Configuration Reference</h1>
      
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        The broker is configured entirely through command-line arguments. There is no configuration
        file; all settings are passed as explicit flags at startup.
      </p>

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
                ['node-id', 'String', 'Required', 'Unique identifier for this broker within the Raft cluster. Must be stable across restarts — changing it will cause the node to be treated as a new, unknown peer.'],
                ['port', 'Integer', '9092', 'TCP port on which the Netty server listens for both client connections and inbound Raft RPC traffic from peers.'],
                ['data-dir', 'String', './data', 'Root directory for all persistent state. DRMQ creates subdirectories here for raft/ (log + metadata) and store/ (topic segments + indexes). Point this at an NVMe-backed path in production.'],
                ['peers', 'String', 'none', 'Comma-separated list of peer addresses in host:port format, e.g. localhost:9093,localhost:9094. Omit the node\'s own address. Empty means standalone (single-node) mode with no replication.'],
                ['log-segment-bytes', 'Long', '100MB', 'Maximum size in bytes of a single partition log segment before it is rolled. Default is 104857600 (100MB).'],
                ['log-retention-ms', 'Long', '7 Days', 'Time in milliseconds to keep inactive log segments before they are deleted. Default is 604800000 (7 days).'],
                ['raft-compact-threshold', 'Long', '1000', 'Number of applied Raft log entries required to trigger an asynchronous disk compaction of the internal consensus log. Default is 1000 entries.'],
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
          mvn exec:java -Dexec.args="--node-id node1 --port 9092 --data-dir /mnt/nvme/node1 --peers localhost:9093,localhost:9094 --log-segment-bytes 52428800 --raft-compact-threshold 500"
        </code>
      </div>
    </div>
  );
}
