import { CodeBlock } from '../components/CodeBlock';

export function DLQ() {
  return (
    <div>
      <div className="inline-block text-xs font-mono tracking-widest text-cyan-500 border border-cyan-500/30 bg-cyan-500/10 rounded px-3 py-1 mb-4">FEATURES</div>
      <h1 className="text-4xl font-bold text-white mb-6">Dead-Letter Queues</h1>
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        When a consumer encounters a message it cannot process — a malformed payload, invalid schema, or permanently unavailable dependency — retrying indefinitely blocks every subsequent message in the queue. DRMQ solves this with <strong>Dead-Letter Queues (DLQs)</strong>: after a configurable number of failed delivery attempts, the broker automatically moves the offending message to a separate DLQ topic and advances the consumer group's offset, so the rest of your queue keeps flowing.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">How DLQs Work</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Every time a consumer calls <code>nack()</code> on a message, the broker increments that message's delivery failure counter. Once the counter reaches the configured maximum (default <strong>5</strong>), the broker routes the message to a dedicated DLQ topic instead of requeueing it. The consumer group's offset advances past that message, unblocking all subsequent messages.
      </p>

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">DLQ topic naming</h3>
      <p className="text-slate-300 mb-4">DLQ topics follow the pattern <code>dlq.&lt;group&gt;.&lt;topic&gt;</code>. For example, if your consumer group is <code>order-processors</code> and the source topic is <code>orders</code>, failed messages land in:</p>
      <CodeBlock language="text" code={`dlq.order-processors.orders`} />
      <p className="text-slate-300 mt-4 mb-8">You can change the prefix with the <code>--dlq-topic-prefix</code> broker flag (default <code>dlq.</code>).</p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">NACKing a Message</h2>
      <p className="text-slate-300 mb-4">Call <code>consumer.nack(topic, offset)</code> to explicitly reject a message. The method returns a boolean:</p>
      <ul className="list-disc list-inside text-slate-300 space-y-2 mb-6 ml-2">
        <li><code>true</code> — the broker routed the message to the DLQ (max deliveries reached).</li>
        <li><code>false</code> — the broker requeued the message for redelivery to another consumer in the group.</li>
      </ul>
      <CodeBlock language="java" code={`boolean routedToDlq = consumer.nack("orders", msg.offset());`} />
      <div className="border-l-4 border-blue-500 bg-blue-500/10 rounded-r-lg p-4 my-4">
        <p className="text-sm text-blue-200/80"><code>nack()</code> is only supported in <strong>group mode</strong>. Calling it when group mode is disabled throws an <code>IllegalStateException</code>.</p>
      </div>
      <div className="border-l-4 border-rose-500 bg-rose-500/10 rounded-r-lg p-4 mb-8">
        <p className="text-sm text-rose-200/80"><strong>Warning:</strong> Single consumer mode does not support NACK. If you need DLQ behaviour, ensure you construct your consumer with a consumer group name so that group mode is enabled automatically.</p>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Full Example: Processing with NACK</h2>
      <CodeBlock language="java" code={`try (DRMQConsumer consumer = new DRMQConsumer("localhost:9092,localhost:9093", "order-processors")) {
    consumer.connect();
    consumer.subscribe("orders");

    while (true) {
        List<DRMQConsumer.ConsumedMessage> messages = consumer.poll();
        for (DRMQConsumer.ConsumedMessage msg : messages) {
            try {
                processOrder(msg);                              // Your business logic
                consumer.commit("orders", msg.offset() + 1);   // Acknowledge success
            } catch (Exception e) {
                // Explicitly reject the message on failure
                boolean routedToDlq = consumer.nack("orders", msg.offset());
                if (routedToDlq) {
                    System.err.println("Poison pill routed to DLQ: " + msg.offset());
                }
            }
        }
    }
} catch (IOException e) {
    e.printStackTrace();
}`} />

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Consuming from the DLQ Topic</h2>
      <p className="text-slate-300 mb-4">The DLQ topic is a standard DRMQ topic. Subscribe to it with a separate consumer to inspect or reprocess failed messages:</p>
      <CodeBlock language="java" code={`try (DRMQConsumer dlqConsumer = new DRMQConsumer("localhost:9092,localhost:9093", "dlq-inspector")) {
    dlqConsumer.connect();
    dlqConsumer.subscribe("dlq.order-processors.orders");

    List<DRMQConsumer.ConsumedMessage> failed = dlqConsumer.poll(100, 5000);
    for (DRMQConsumer.ConsumedMessage msg : failed) {
        System.out.printf("DLQ message at offset %d: %s%n", msg.offset(), msg.payloadAsString());
    }
}`} />

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Replaying DLQ Messages</h2>
      <p className="text-slate-300 mb-4">Subscribe to the DLQ topic using <strong>single consumer mode</strong> to read the messages without broker coordination. Then fix the underlying issue and republish to the original topic:</p>
      <CodeBlock language="java" code={`try (DRMQConsumer consumer = new DRMQConsumer("localhost:9092", "dlq-replay")) {
    consumer.setGroupMode(false);
    consumer.connect();
    consumer.subscribe("dlq.order-processors.orders", 0); // replay from the start

    List<DRMQConsumer.ConsumedMessage> messages = consumer.poll(100, 5000);
    for (DRMQConsumer.ConsumedMessage msg : messages) {
        System.out.printf("Replaying offset %d: %s%n", msg.offset(), msg.payloadAsString());
        // Optionally republish to the original topic after fixing the issue
    }
}`} />

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Configuration Reference</h2>
      <div className="space-y-3 mb-8">
        {[
          ['--max-deliveries', 'int', '5', 'The maximum number of delivery attempts before routing to the DLQ. Must be a positive integer.'],
          ['--dlq-topic-prefix', 'string', 'dlq.', 'String prepended to the consumer group and topic name when constructing the DLQ topic. E.g., a prefix of dead. produces dead.order-processors.orders.'],
        ].map(([flag, type, def, desc]) => (
          <div key={flag} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
            <div className="flex flex-wrap gap-3 mb-2 items-baseline">
              <code className="text-cyan-400 font-semibold">{flag}</code>
              <span className="text-xs text-slate-500">{type}</span>
              <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-xs text-slate-300">default: {def}</span>
            </div>
            <p className="text-sm text-slate-400">{desc}</p>
          </div>
        ))}
      </div>
      <CodeBlock language="bash" code={`./mvnw -pl drmq-broker exec:java \\
  -Dexec.args="--port 9092 --data-dir ./data-1 --max-deliveries 3 --dlq-topic-prefix dead."`} />
    </div>
  );
}
