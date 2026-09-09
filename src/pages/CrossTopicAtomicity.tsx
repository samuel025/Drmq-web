import { CodeBlock } from '../components/CodeBlock';

export function CrossTopicAtomicity() {
  return (
    <div>
      <div className="inline-block text-xs font-mono tracking-widest text-emerald-500 border border-emerald-500/30 bg-emerald-500/10 rounded px-3 py-1 mb-4">
        ADVANCED FEATURE
      </div>
      <h1 className="text-4xl font-bold text-white mb-6">Cross-Topic Atomic Transactions</h1>
      
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        DRMQ supports native cross-topic atomic transactions. This allows a producer to write messages to multiple different topics as a single, indivisible unit of work. Either all messages are successfully committed and become visible to consumers, or none of them do.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Why is this important?</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        In distributed microservice architectures, business operations frequently span multiple entities. For example, placing an order requires publishing to an <code>orders</code> topic and an <code>inventory-deductions</code> topic.
      </p>
      <p className="text-slate-300 mb-4 leading-relaxed">
        <strong>The 2PC Coordinator Problem (Apache Kafka)</strong>: Kafka scales throughput via partitioned topic logs. However, atomic multi-topic operations require external Two-Phase Commit (2PC) transaction coordinators, transaction marker records, and state tracking topics (<code>__transaction_state</code>). This introduces coordinator failure modes, latency penalties, and risks of partial commit states if a coordinator fails mid-flight.
      </p>
      <p className="text-slate-300 mb-8 leading-relaxed">
        <strong>The DRMQ Single-Raft Advantage</strong>: DRMQ trades multi-partition raw throughput for <strong>zero-2PC atomic safety</strong>. Cross-topic batches are proposed and committed in a single Raft log entry. Either all messages across all requested topics commit, or none do—eliminating 2PC coordinator failure windows entirely.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">How it works</h2>
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 mb-8">
        <ol className="list-decimal list-inside text-slate-300 space-y-3">
          <li><strong>Raft Consensus:</strong> The atomic batch is appended to the Raft log as a single entry and replicated across the cluster.</li>
          <li><strong>Application Phase:</strong> Once a quorum is reached, the leader applies the entry, appending the messages into their respective topic segments.</li>
          <li><strong>Durability Marker:</strong> After all segments are written, a <code>.atomic-done</code> completion marker is created and the cross-topic batch becomes visible to consumers.</li>
          <li><strong>Crash Recovery:</strong> If a crash occurs during step 2 before the marker is written, the broker detects the partial apply on reboot and safely truncates the unfinished batch.</li>
        </ol>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Code Examples</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        The <code>sendAtomic()</code> API is available across all official DRMQ client SDKs. It accepts a map (or dictionary) of topic names to payloads.
      </p>

      <div className="space-y-6 mb-10">
        <div>
          <h3 className="text-lg font-medium text-slate-200 mb-3">Java SDK</h3>
          <CodeBlock 
            language="java"
            code={`import com.drmq.client.DRMQProducer;
import java.util.Map;

DRMQProducer producer = new DRMQProducer("localhost:9092");
producer.connect();

Map<String, byte[]> atomicBatch = Map.of(
    "orders", "new-order-123".getBytes(),
    "inventory", "deduct-sku-abc".getBytes()
);

Map<String, Long> offsets = producer.sendAtomic(atomicBatch);
System.out.println("Committed offsets: " + offsets);`}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-slate-200 mb-3">Python SDK</h3>
          <CodeBlock 
            language="python"
            code={`from drmq import DRMQProducer

producer = DRMQProducer("localhost:9092")
producer.connect()

batch = {
    "orders": b"new-order-123",
    "inventory": b"deduct-sku-abc"
}

offsets = producer.send_atomic(batch)
print(f"Committed offsets: {offsets}")`}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-slate-200 mb-3">TypeScript SDK</h3>
          <CodeBlock 
            language="typescript"
            code={`import { DRMQProducer } from 'drmq-client';

const producer = new DRMQProducer("localhost:9092");
await producer.connect();

const offsets = await producer.sendAtomic({
    "orders": Buffer.from("new-order-123"),
    "inventory": Buffer.from("deduct-sku-abc")
});

console.log("Committed offsets:", offsets);`}
          />
        </div>
      </div>
    </div>
  );
}
