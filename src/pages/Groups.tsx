import { CodeBlock } from '../components/CodeBlock';

export function Groups() {
  return (
    <div>
      <div className="inline-block text-xs font-mono tracking-widest text-cyan-500 border border-cyan-500/30 bg-cyan-500/10 rounded px-3 py-1 mb-4">CORE CONCEPTS</div>
      <h1 className="text-4xl font-bold text-white mb-6">Consumer Groups</h1>
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        DRMQ lets you scale message processing horizontally without partitions. Create any number of consumers that share the same <strong>group name</strong>, and the broker automatically divides the workload among them. At the same time, completely separate groups each receive their own independent copy of every message, enabling fan-out to multiple downstream systems from a single topic.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">What Is a Consumer Group?</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        A consumer group is a set of consumer instances that all identify themselves to the broker with the same group name string. The broker tracks a <strong>single committed offset per group per topic</strong> and uses a lease-based dispatch protocol to ensure that each message is delivered to exactly one consumer within the group.
      </p>
      <CodeBlock language="text" code={`Topic: orders
  offset 0: {"id": 1}
  offset 1: {"id": 2}
  offset 2: {"id": 3}
  offset 3: {"id": 4}

Group "order-processors" (c1, c2)
  ├─ c1 receives offsets 0, 2, ...
  └─ c2 receives offsets 1, 3, ...

Group "analytics" (independent)
  └─ receives ALL offsets: 0, 1, 2, 3, ...`} />

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">How DRMQ Distributes Messages Without Partitions</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Traditional brokers rely on partitions to parallelize consumption. DRMQ takes a different approach: the broker maintains a <strong>dispatch queue per group</strong> and leases the next available message to whichever consumer polls first. This means:
      </p>
      <ul className="list-disc list-inside text-slate-300 space-y-2 mb-8 ml-2">
        <li>You can add or remove consumers at any time without reconfiguration.</li>
        <li>Every consumer in the group stays busy as long as there are unprocessed messages.</li>
        <li>There is no concept of a "partition owner" or rebalance event.</li>
      </ul>
      <div className="bg-blue-500/10 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-200/80"><strong>Note:</strong> Because lease-based dispatch ties each in-flight message to a specific consumer instance, uncommitted messages are automatically redelivered if that consumer disconnects before committing. Always design your consumers to be <strong>idempotent</strong>.</p>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Fan-Out: Independent Groups Each Receive All Messages</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Two groups named differently are completely isolated from each other. Both groups maintain their own committed offset, and advancing one has zero effect on the other.
      </p>
      <CodeBlock language="text" code={`Topic: orders
        │
        ├──► Group "order-processors"  (fulfillment service)
        │         offset pointer: 42
        │
        └──► Group "analytics"         (reporting service)
                  offset pointer: 38`} />

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-6">Group Mode vs. Single Consumer Mode</h2>
      <div className="space-y-6 mb-8">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-cyan-400 mb-3">Group Mode (Default)</h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">Active whenever you construct a <code>DRMQConsumer</code> with a non-empty group name. The broker manages offset dispatch, load balancing, and lease-based redelivery on your behalf.</p>
          <CodeBlock language="java" code={`// Two consumers sharing the same group
DRMQConsumer c1 = new DRMQConsumer("localhost:9092,localhost:9093", "order-processors");
c1.setAutoCommit(true);
c1.connect();
c1.subscribe("orders");

DRMQConsumer c2 = new DRMQConsumer("localhost:9092,localhost:9093", "order-processors");
c2.setAutoCommit(true);
c2.connect();
c2.subscribe("orders");
// The broker ensures c1 and c2 receive different messages`} />
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-cyan-400 mb-3">Single Consumer Mode</h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">Call <code>setGroupMode(false)</code> to disable broker-managed dispatch. Use this for replay, auditing, or reading from an arbitrary position.</p>
          <CodeBlock language="java" code={`try (DRMQConsumer consumer = new DRMQConsumer("localhost:9092", "my-group")) {
    consumer.setGroupMode(false); // disable broker coordination
    consumer.connect();
    consumer.subscribe("orders", 0); // replay from beginning

    while (true) {
        List<DRMQConsumer.ConsumedMessage> msgs = consumer.poll(100, 1000);
        for (var msg : msgs) {
            System.out.printf("Replaying offset %d: %s%n",
                msg.offset(), msg.payloadAsString());
        }
        if (!msgs.isEmpty()) {
            long last = msgs.get(msgs.size() - 1).offset();
            consumer.commit("orders", last + 1);
        }
    }
}`} />
        </div>
      </div>
      <div className="bg-rose-500/10 rounded-lg p-4 mb-8">
        <p className="text-sm text-rose-200/80"><strong>Warning:</strong> <code>nack()</code> is only supported in group mode. Calling it on a single-mode consumer throws <code>IllegalStateException</code>.</p>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">At-Least-Once Delivery and the Lease Protocol</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        In group mode, every dispatched message is held under a <strong>lease</strong> tied to the consumer that received it. The lease remains open until that consumer calls <code>commit()</code>. If the consumer's connection drops before the commit reaches the broker, the lease expires and the broker redelivers the message to the next available consumer in the group.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <div className="text-sm font-bold text-emerald-400 mb-2">Commit advances the group</div>
          <p className="text-sm text-slate-400">Calling <code>consumer.commit("orders", offset + 1)</code> tells the broker the group has successfully consumed up to <code>offset</code>. No message before that point will be redelivered to this group.</p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <div className="text-sm font-bold text-amber-400 mb-2">Crash triggers redelivery</div>
          <p className="text-sm text-slate-400">If a consumer disconnects with an uncommitted lease, the broker automatically requeues that message for the next <code>poll()</code> call from any live consumer in the group.</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Designing Idempotent Consumers</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">Because the same message can arrive more than once under at-least-once semantics, your processing logic must be safe to run multiple times with the same input. Common patterns:</p>
      <div className="space-y-3 mb-8">
        {[
          ['Use a unique message key as an idempotency token', 'Producers can attach an optional key to each message. Read it via msg.key(). Store processed keys in a fast lookup (Redis, a database unique index) and skip any message whose key you have already handled.'],
          ['Use database upsert semantics', "Rather than inserting a new row, use an INSERT ... ON CONFLICT DO NOTHING or equivalent upsert. If the row already exists from a previous delivery, the duplicate write becomes a no-op."],
          ['Use the offset as a natural idempotency key', 'Every message has a unique, stable offset() value within its topic. Record the highest offset you have successfully persisted per group; if an incoming message\'s offset is ≤ the recorded value, skip it.'],
        ].map(([title, desc]) => (
          <div key={title} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
            <div className="font-semibold text-slate-200 mb-2">{title}</div>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Dead-Letter Queues for Unprocessable Messages</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        If a consumer repeatedly fails to process a message, call <code>consumer.nack(topic, offset)</code> to explicitly reject it. Once a message exceeds the configured threshold (default: <strong>5 attempts</strong>, configurable via <code>--max-deliveries</code>), it is automatically routed to the DLQ topic <code>dlq.&lt;groupName&gt;.&lt;topic&gt;</code> and the group's offset advances past it.
      </p>
      <CodeBlock language="java" code={`try (DRMQConsumer consumer = new DRMQConsumer("localhost:9092", "order-processors")) {
    consumer.connect();
    consumer.subscribe("orders");

    while (true) {
        List<DRMQConsumer.ConsumedMessage> messages = consumer.poll();
        for (DRMQConsumer.ConsumedMessage msg : messages) {
            try {
                processOrder(msg);
                consumer.commit("orders", msg.offset() + 1);
            } catch (Exception e) {
                // Reject the message; broker will redeliver or route to DLQ
                boolean routedToDlq = consumer.nack("orders", msg.offset());
                if (routedToDlq) {
                    System.err.println("Poison pill sent to DLQ: offset " + msg.offset());
                }
            }
        }
    }
}`} />
      <div className="bg-blue-500/10 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-200/80"><strong>Note:</strong> The DLQ topic name follows the pattern <code>dlq.&lt;groupName&gt;.&lt;originalTopic&gt;</code>. Subscribe a separate consumer to that topic to inspect, retry, or alert on failed messages.</p>
      </div>
    </div>
  );
}
