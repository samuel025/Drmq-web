import { CodeBlock } from '../components/CodeBlock';

export function TopicsAndOffsets() {
  return (
    <div>
      <div className="inline-block text-xs font-mono tracking-widest text-cyan-500 border border-cyan-500/30 bg-cyan-500/10 rounded px-3 py-1 mb-4">CORE CONCEPTS</div>
      <h1 className="text-4xl font-bold text-white mb-6">Topics & Offsets</h1>
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        Every message you publish to DRMQ lands in a <strong>topic</strong> — a named, append-only log stored durably on disk. Think of a topic as an infinite tape: producers always write to the end, and consumers read forward through it at their own pace using a numeric marker called an <strong>offset</strong>. Because the log is persistent, messages survive broker restarts, and any consumer can revisit past messages simply by rewinding its offset.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">What Is a Topic?</h2>
      <p className="text-slate-300 mb-6 leading-relaxed">
        A topic is the fundamental unit of organization in DRMQ. It is an ordered sequence of messages identified by a human-readable name (e.g., <code>orders</code>, <code>payments</code>, or <code>sensor-readings</code>). There are no partitions — the topic itself is the single, strictly ordered log.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[
          ['Append-only', 'Producers always append to the tail of the log. Existing messages are never modified or deleted before the retention window expires.'],
          ['Durable', 'DRMQ writes every message to a custom Write-Ahead Log (WAL) before acknowledging the producer. Messages survive broker crashes and restarts.'],
          ['Strictly ordered', 'Every message within a topic has a unique, monotonically increasing offset. Message n is always older than message n+1.'],
          ['Multi-reader', 'Any number of consumer groups can read the same topic independently. Each group maintains its own offset pointer without affecting others.'],
        ].map(([t, d]) => (
          <div key={t} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
            <div className="text-sm font-bold text-cyan-400 mb-2">{t}</div>
            <p className="text-sm text-slate-400 leading-relaxed">{d}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">What Is an Offset?</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        An offset is a <strong>sequential, monotonically increasing integer</strong> that uniquely identifies a message's position in the broker's log. Offsets never reset and never reuse a value.
      </p>
      <div className="border-l-4 border-blue-500 bg-blue-500/10 rounded-r-lg p-4 mb-6">
        <p className="text-sm text-blue-200/80"><strong>Note:</strong> DRMQ uses a <strong>single broker-wide offset counter</strong> shared across all topics, not a separate counter per topic. This means the first message on a newly created topic does not necessarily receive offset <code>0</code> — it receives the next available value from the global counter. Within a single topic, offsets are always ascending, but may not be contiguous (e.g., <code>0, 3, 7, 11</code>) if other topics received messages in between.</p>
      </div>
      <p className="text-slate-300 mb-4">When you call <code>producer.send(topic, payload)</code>, the broker returns a <code>SendResult</code> that carries the assigned offset:</p>
      <CodeBlock language="java" code={`try (DRMQProducer producer = new DRMQProducer("localhost:9092")) {
    producer.connect();
    DRMQProducer.SendResult result = producer.send("orders", "{ \\"id\\": 42 }");

    if (result.isSuccess()) {
        System.out.println("Message stored at offset " + result.getOffset());
    } else {
        System.err.println("Send failed: " + result.getErrorMessage());
    }
}`} />

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">How Consumers Track Position</h2>
      <p className="text-slate-300 mb-8 leading-relaxed">
        A consumer's current position is the offset of the <strong>next message it expects to receive</strong>. After processing offset 5, the consumer's position advances to 6. DRMQ stores this position on the broker so that a restarting consumer can resume exactly where it left off, without any local state file.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Auto-Commit vs. Manual Commit</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <h3 className="font-bold text-cyan-400 mb-3">Auto-Commit</h3>
          <p className="text-sm text-slate-400 mb-4">Call <code>setAutoCommit(true)</code> before connecting. After every successful <code>poll()</code>, DRMQ automatically commits the offset of the last message in the batch.</p>
          <CodeBlock language="java" code={`DRMQConsumer consumer = new DRMQConsumer("localhost:9092", "order-processors");
consumer.setAutoCommit(true);
consumer.connect();
consumer.subscribe("orders");

while (true) {
    List<DRMQConsumer.ConsumedMessage> messages = consumer.poll(100, 1000);
    for (var msg : messages) {
        process(msg); // offset committed automatically after poll
    }
}`} />
          <div className="border-l-4 border-amber-500 bg-amber-500/10 rounded-r-lg p-3 mt-3">
            <p className="text-xs text-amber-200/80">If your consumer crashes between <code>poll()</code> and your logic completing, the commit may have already fired — those messages <strong>will not</strong> be redelivered. This is <strong>at-most-once</strong> delivery.</p>
          </div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <h3 className="font-bold text-cyan-400 mb-3">Manual Commit</h3>
          <p className="text-sm text-slate-400 mb-4">Leave <code>autoCommit</code> at its default (<code>false</code>) and call <code>consumer.commit(topic, offset)</code> only after you have successfully processed a message.</p>
          <CodeBlock language="java" code={`DRMQConsumer consumer = new DRMQConsumer("localhost:9092", "order-processors");
// autoCommit is false by default
consumer.connect();
consumer.subscribe("orders");

while (true) {
    List<DRMQConsumer.ConsumedMessage> messages = consumer.poll(100, 1000);
    for (var msg : messages) {
        process(msg);
        // Commit offset + 1 so next poll starts at the following message
        consumer.commit("orders", msg.offset() + 1);
    }
}`} />
          <div className="border-l-4 border-blue-500 bg-blue-500/10 rounded-r-lg p-3 mt-3">
            <p className="text-xs text-blue-200/80">Pass <code>offset + 1</code> to <code>commit()</code> — the argument is the offset of the <strong>next</strong> message to consume.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Replaying Messages from a Specific Offset</h2>
      <p className="text-slate-300 mb-6 leading-relaxed">
        DRMQ stores messages durably on disk for the configured retention window (default: 7 days). You can replay any portion of a topic by subscribing with an explicit starting offset using <code>subscribe(topic, fromOffset)</code>.
      </p>
      <div className="space-y-4 mb-8">
        {[
          ['1', 'Disable group mode', 'Switch to single consumer mode so the broker does not override your offset with the group\'s committed position.', `DRMQConsumer consumer = new DRMQConsumer("localhost:9092", "replay-job");
consumer.setGroupMode(false);
consumer.connect();`],
          ['2', 'Subscribe at the target offset', 'Pass the exact offset you want to start from. Use 0 to replay from the very beginning of the topic.', `consumer.subscribe("orders", 0);       // replay from start
consumer.subscribe("orders", 1_500);   // or a specific position`],
          ['3', 'Poll and track progress manually', 'Read messages and commit your position explicitly so you can resume if interrupted.', `while (true) {
    List<DRMQConsumer.ConsumedMessage> messages = consumer.poll(100, 1000);
    for (var msg : messages) {
        System.out.printf("Replaying offset %d: %s%n", msg.offset(), msg.payloadAsString());
    }
    if (!messages.isEmpty()) {
        long last = messages.get(messages.size() - 1).offset();
        consumer.commit("orders", last + 1);
    }
}`],
        ].map(([step, title, desc, code]) => (
          <div key={step} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-400">{step}</div>
              <h3 className="font-semibold text-slate-200">{title}</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">{desc}</p>
            <CodeBlock language="java" code={code} />
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Replaying Messages from a Specific Date and Time</h2>
      <p className="text-slate-300 mb-6 leading-relaxed">
        If you don't know the exact numeric offset but you know *when* an incident occurred, DRMQ allows you to efficiently rewind your consumer to a specific historical timestamp.
      </p>
      <CodeBlock language="java" code={`DRMQConsumer consumer = new DRMQConsumer("localhost:9092", "analytics-group");
consumer.connect();

// Rewind the group to exactly 12 hours ago
long targetTime = System.currentTimeMillis() - (12 * 60 * 60 * 1000);
consumer.seekByTime("orders", targetTime);

// The consumer will naturally resume fetching from the new offset
List<DRMQConsumer.ConsumedMessage> messages = consumer.poll(100, 1000);`} />
      <p className="text-slate-300 mt-4 mb-8 leading-relaxed">
        When using <code>seekByTime()</code>, the SDK automatically updates the broker's committed offset for your consumer group, ensuring a seamless failover and cluster-wide consistency.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Persistent Storage</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        DRMQ writes every incoming message to a Write-Ahead Log before returning a success response to the producer. Log data is organized into fixed-size segments (default 100 MB each) retained for a configurable window (default 7 days). This means:
      </p>
      <ul className="list-disc list-inside text-slate-300 space-y-2 mb-8 ml-2">
        <li>Broker restarts do not lose any acknowledged messages.</li>
        <li>You can replay historical data up to the retention boundary.</li>
        <li>In cluster mode, the Raft snapshot mechanism compacts the log while preserving correctness.</li>
      </ul>
    </div>
  );
}
