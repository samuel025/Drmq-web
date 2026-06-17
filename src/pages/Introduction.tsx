import React from 'react';
import { CodeBlock } from '../components/CodeBlock';

export function Introduction() {
  return (
    <div>
      <div className="inline-block text-xs font-mono tracking-widest text-cyan-500 border border-cyan-500/30 bg-cyan-500/10 rounded px-3 py-1 mb-4">
        DRMQ v1.0
      </div>
      <h1 className="text-4xl font-bold text-white mb-6">Introduction</h1>
      
      <p className="text-lg text-slate-300 mb-6 leading-relaxed">
        DRMQ (Distributed Reliable Message Queue) is a high-performance, fault-tolerant event streaming platform engineered from the ground up to provide uncompromising data durability and strict global ordering. At its core, DRMQ is built on a highly optimized implementation of the Raft consensus algorithm, ensuring that your distributed infrastructure remains resilient even in the face of unpredictable network partitions and catastrophic hardware failures.
      </p>

      <p className="text-slate-400 mb-6 leading-relaxed">
        Unlike traditional messaging systems that rely on complex partition maps, disparate storage topologies, and external coordination services, DRMQ embraces architectural minimalism. We replicate the entire continuous topic log uniformly across all participating nodes in the consensus cluster. This unified, single-partition model sacrifices arbitrary horizontal write scaling in exchange for vastly superior operational simplicity, deterministic failure modes, and absolute linearizability.
      </p>

      <p className="text-slate-400 mb-8 leading-relaxed">
        In the DRMQ ecosystem, every message follows a strict sequence, and every consumer observes the identical global state machine. There are no split-brain scenarios, no cumbersome consumer rebalancing delays, and no complex election protocols to tune. It is a system purpose-built for mission-critical financial ledgers, audit trails, state machine replication, and any distributed architecture where data integrity is paramount.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-6">Core Capabilities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <div className="text-sm font-bold text-cyan-400 mb-2">Strict Global Ordering</div>
          <p className="text-sm text-slate-400 leading-relaxed">
            All messages published to a topic are appended to a singular, immutable log. Consumers are guaranteed to process events in the exact chronological sequence they were acknowledged by the cluster.
          </p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <div className="text-sm font-bold text-cyan-400 mb-2">Zero-Dependency Architecture</div>
          <p className="text-sm text-slate-400 leading-relaxed">
            DRMQ is a fully self-contained binary. It embeds its own consensus engine and custom-built storage tier, eliminating the operational overhead of managing external coordination software.
          </p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <div className="text-sm font-bold text-cyan-400 mb-2">Transparent Failover</div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Leveraging our Pre-Vote Raft extension, minority partitions and leader crashes are resolved automatically within milliseconds. Smart SDKs seamlessly redirect to the new authoritative leader.
          </p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <div className="text-sm font-bold text-cyan-400 mb-2">Real-Time Observability</div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Embedded WebSocket servers expose low-latency telemetry natively, powering our dynamic frontend dashboard for real-time visualization of cluster health, network graphs, and replication lag.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Key Guarantee</h2>
      <div className="bg-slate-800/50 border border-cyan-900/50 rounded-lg p-5 mb-8">
        <p className="text-slate-300">
          A message is only acknowledged to the producer after a <strong className="text-white">quorum (majority)</strong> of
          Raft nodes have durably written it to their local log. A single node failure cannot cause
          data loss for any acknowledged message.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Quick Start Example</h2>
      <p className="text-slate-400 mb-4">
        Connecting a client and sending a message is simple using any of our native SDKs.
      </p>
      
      <CodeBlock 
        language="typescript"
        code={`import { DRMQProducer } from 'drmq-client';\n\nconst producer = new DRMQProducer("localhost:9092,localhost:9093");\nawait producer.connect();\n\nconst res = await producer.send("my-topic", Buffer.from("Hello DRMQ!"));\nconsole.log(\`Sent at offset \${res.offset}\`);`}
      />
    </div>
  );
}
