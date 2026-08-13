import { CodeBlock } from '../components/CodeBlock';

export function ProducerAPI() {
  return (
    <div>
      <div className="inline-block text-xs font-mono tracking-widest text-cyan-500 border border-cyan-500/30 bg-cyan-500/10 rounded px-3 py-1 mb-4">JAVA SDK</div>
      <h1 className="text-4xl font-bold text-white mb-6">Java SDK — Producer & Consumer Guide</h1>
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        The DRMQ Java client is the primary SDK for producing and consuming messages against a DRMQ broker cluster. It wraps the custom TCP/Protobuf protocol in a clean, asynchronous API that handles automatic leader redirection via typed Protocol Buffer <code>ErrorCode</code>s, bootstrap-server failover, and offset management. Both <code>DRMQProducer</code> and <code>DRMQConsumer</code> implement <code>AutoCloseable</code>.
      </p>

      <div className="bg-cyan-500/10 rounded-lg p-4 mt-4 mb-8">
        <p className="text-sm text-cyan-200/80"><strong>Client-Side Batching:</strong> The <code>send()</code> method is asynchronous. It instantly places messages into an internal accumulator queue. A dedicated background thread groups these messages into a single <code>ProduceBatchRequest</code>, waiting up to <strong>5ms (linger.ms)</strong> or until the batch reaches <strong>16KB</strong> before flushing to the network. This provides massive throughput gains while maintaining low latency.</p>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Add the dependency</h2>
      <p className="text-slate-300 mb-4"><code>drmq-client</code> is <strong>not published to Maven Central</strong>. Run <code>mvn clean install</code> from the repo root first, then add:</p>
      <CodeBlock language="xml" code={`<dependency>
    <groupId>com.drmq</groupId>
    <artifactId>drmq-client</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>`} />

      <hr className="border-slate-700/50 my-10" />
      <h2 className="text-2xl font-semibold text-slate-100 mb-4">DRMQProducer</h2>
      <p className="text-slate-300 mb-6">Thread-safe. When it receives a <code>NOT_LEADER</code> redirect from a follower, it transparently reconnects to the leader and retries.</p>

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Constructors</h3>
      <CodeBlock language="java" code={`DRMQProducer(String bootstrapServers) // comma-separated host:port list
DRMQProducer(String host, int port)   // single broker address
DRMQProducer()                        // defaults to localhost:9092`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Methods</h3>
      <div className="space-y-3 mb-6">
        {[
          ['connect()', 'void', 'Opens the TCP connection. Throws IOException if no broker is reachable.'],
          ['send(String topic, String message)', 'CompletableFuture<SendResult>', 'Encodes message as UTF-8 and asynchronously queues it for batching.'],
          ['send(String topic, byte[] payload)', 'CompletableFuture<SendResult>', 'Asynchronously queues a raw byte payload.'],
          ['send(String topic, byte[] payload, String key)', 'CompletableFuture<SendResult>', 'Sends raw bytes with an optional routing key (pass null to omit).'],
          ['sendAtomic(Map<String, byte[]> payloads)', 'CompletableFuture<Map<String, Long>>', 'Sends an atomic batch to multiple distinct topics. Guaranteed to commit or fail as a single unit at the Raft level.'],
          ['setLingerMs(long lingerMs)', 'void', 'Sets the max time the accumulator waits for more messages before flushing. Default: 5ms.'],
          ['setBatchSizeBytes(int batchSizeBytes)', 'void', 'Sets the max size of a single batch before eager flushing. Default: 16384 (16KB).'],
          ['isConnected()', 'boolean', 'Returns true when the underlying socket is open.'],
          ['close()', 'void', 'Closes the TCP connection. Implements AutoCloseable.'],
        ].map(([m, r, d]) => (
          <div key={m} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
            <div className="flex flex-wrap gap-2 mb-1 items-baseline">
              <code className="text-cyan-400 font-semibold">{m}</code>
              <span className="text-xs text-slate-500">→ {r}</span>
            </div>
            <p className="text-sm text-slate-400">{d}</p>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">SendResult fields</h3>
      <div className="space-y-2 mb-6">
        {[
          ['isSuccess()', 'boolean', 'true if the broker accepted and persisted the message.'],
          ['getOffset()', 'long', 'Broker-assigned log offset. Only meaningful when isSuccess() is true; -1 on failure.'],
          ['getErrorMessage()', 'String', 'Human-readable error when isSuccess() is false; null on success.'],
        ].map(([f, t, d]) => (
          <div key={f} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 flex flex-wrap gap-2">
            <code className="text-emerald-400 font-semibold">{f}</code>
            <span className="text-xs text-slate-500 self-center">→ {t}</span>
            <p className="text-sm text-slate-400 w-full">{d}</p>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Producer example</h3>
      <CodeBlock language="java" code={`import com.fasterxml.jackson.databind.ObjectMapper;

try (DRMQProducer producer = new DRMQProducer("localhost:9092,localhost:9093")) {
    producer.connect();
    ObjectMapper mapper = new ObjectMapper();

    // Create a DTO and serialize it to JSON bytes
    OrderDTO order = new OrderDTO("user-123", 99.50, "USD");
    byte[] payload = mapper.writeValueAsBytes(order);

    DRMQProducer.SendResult result = producer.send("orders", payload, "user-123").get(); // Block on future
    
    if (result.isSuccess()) {
        System.out.println("Order persisted at offset " + result.getOffset());
    } else {
        System.err.println("Send failed: " + result.getErrorMessage());
    }
} catch (Exception e) {
    e.printStackTrace();
}`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Producer Example 2 — Cross-Topic Atomic Transaction</h3>
      <p className="text-slate-300 mb-4">DRMQ allows you to write to multiple topics atomically. The entire batch is committed to the Raft log as a single unit and recovered atomically via intent files.</p>
      <CodeBlock language="java" code={`try (DRMQProducer producer = new DRMQProducer("localhost:9092")) {
    producer.connect();
    
    Map<String, byte[]> atomicBatch = new HashMap<>();
    atomicBatch.put("orders", "order-123".getBytes());
    atomicBatch.put("inventory", "reserve-sku-456".getBytes());
    
    // Block on future to await Raft consensus
    Map<String, Long> offsets = producer.sendAtomic(atomicBatch).get(); 
    
    System.out.println("Atomic commit successful! Offsets: " + offsets);
} catch (Exception e) {
    e.printStackTrace();
}`} />


      <hr className="border-slate-700/50 my-10" />
      <h2 className="text-2xl font-semibold text-slate-100 mb-4">DRMQConsumer</h2>
      <p className="text-slate-300 mb-6">Reads messages from one or more topics in <strong>Group Mode</strong> (broker coordinates delivery) or <strong>Single Consumer Mode</strong> (client drives offsets manually).</p>

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Constructors</h3>
      <CodeBlock language="java" code={`DRMQConsumer(String bootstrapServers, String consumerGroup) // group mode if consumerGroup is non-blank
DRMQConsumer(String bootstrapServers)                      // single-consumer mode
DRMQConsumer(String host, int port)                        // single broker`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Methods</h3>
      <div className="space-y-3 mb-6">
        {[
          ['connect()', 'void', 'Opens a TCP connection to one of the bootstrap brokers.'],
          ['setAutoCommit(boolean)', 'void', 'When true, commits the last offset in each poll() batch automatically. Default: false.'],
          ['setGroupMode(boolean)', 'void', 'Set to false for single-consumer mode and full manual offset control.'],
          ['subscribe(String topic)', 'void', 'Subscribe to topic. Broker assigns offsets in group mode.'],
          ['subscribe(String topic, long fromOffset)', 'void', 'Subscribe starting from fromOffset. Use 0 to replay from the beginning.'],
          ['seekByTime(String topic, long timestamp)', 'void', 'Seek to the first message at or after the given Unix epoch timestamp (ms).'],
          ['poll()', 'List<ConsumedMessage>', 'Fetch up to 100 messages with a 1-second broker wait.'],
          ['poll(int maxMessages)', 'List<ConsumedMessage>', 'Fetch up to maxMessages with a 1-second broker wait.'],
          ['poll(int maxMessages, long timeoutMs)', 'List<ConsumedMessage>', 'Fetch up to maxMessages waiting up to timeoutMs ms on the broker side.'],
          ['commit(String topic, long offset)', 'void', 'Manually commit offset. Broker delivers messages starting at offset on next poll.'],
          ['nack(String topic, long offset)', 'boolean', 'Reject a message. Returns true if routed to DLQ, false if requeued. Group mode only.'],
          ['getCurrentOffset(String topic)', 'long', "The client's local next-offset for topic."],
          ['getConsumerGroup()', 'String', 'Returns the group name, or null in single mode.'],
          ['close()', 'void', 'Closes the TCP connection. Implements AutoCloseable.'],
        ].map(([m, r, d]) => (
          <div key={m} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
            <div className="flex flex-wrap gap-2 mb-1 items-baseline">
              <code className="text-cyan-400 font-semibold">{m}</code>
              <span className="text-xs text-slate-500">→ {r}</span>
            </div>
            <p className="text-sm text-slate-400">{d}</p>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">ConsumedMessage fields</h3>
      <div className="space-y-2 mb-8">
        {[
          ['offset()', 'long', 'Broker-assigned log position.'],
          ['topic()', 'String', 'The topic the message was read from.'],
          ['payload()', 'byte[]', 'Raw message bytes.'],
          ['key()', 'String', 'Optional routing key; null if none was provided.'],
          ['timestamp()', 'long', 'Producer-set timestamp (ms since epoch).'],
          ['storedAt()', 'long', 'Broker-set timestamp (ms since epoch) when the message was persisted.'],
          ['payloadAsString()', 'String', 'Decodes payload() as UTF-8. Shortcut for new String(msg.payload()).'],
        ].map(([f, t, d]) => (
          <div key={f} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
            <div className="flex flex-wrap gap-2 mb-1 items-baseline">
              <code className="text-emerald-400 font-semibold">{f}</code>
              <span className="text-xs text-slate-500">→ {t}</span>
            </div>
            <p className="text-sm text-slate-400">{d}</p>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Example 1 — Group mode with auto-commit</h3>
      <CodeBlock language="java" code={`ObjectMapper mapper = new ObjectMapper();
DRMQConsumer consumer = new DRMQConsumer("localhost:9092,localhost:9093", "order-processors");
consumer.setAutoCommit(true);
consumer.connect();
consumer.subscribe("orders");

while (true) {
    List<DRMQConsumer.ConsumedMessage> messages = consumer.poll(100, 1000);
    for (DRMQConsumer.ConsumedMessage msg : messages) {
        // Deserialize JSON bytes back to DTO
        OrderDTO order = mapper.readValue(msg.payload(), OrderDTO.class);
        System.out.printf("Received order %s (amount: %.2f) at offset %d%n", 
                          order.getUserId(), order.getAmount(), msg.offset());
    }
}`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Example 2 — Single mode with manual offsets and replay</h3>
      <CodeBlock language="java" code={`try (DRMQConsumer consumer = new DRMQConsumer("localhost:9092", "my-group")) {
    consumer.setGroupMode(false);
    consumer.connect();
    consumer.subscribe("my-topic", 0); // replay from the beginning

    while (true) {
        List<DRMQConsumer.ConsumedMessage> messages = consumer.poll(100, 1000);
        for (DRMQConsumer.ConsumedMessage msg : messages) {
            System.out.printf("Replaying (offset %d): %s%n", msg.offset(), msg.payloadAsString());
        }
        if (!messages.isEmpty()) {
            long last = messages.get(messages.size() - 1).offset();
            consumer.commit("my-topic", last + 1);
        }
    }
} catch (IOException e) { e.printStackTrace(); }`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Example 3 — NACK and dead-letter queue handling</h3>
      <CodeBlock language="java" code={`try (DRMQConsumer consumer = new DRMQConsumer("localhost:9092", "order-processors")) {
    consumer.connect();
    consumer.subscribe("orders");

    while (true) {
        for (DRMQConsumer.ConsumedMessage msg : consumer.poll()) {
            try {
                processOrder(msg);
                consumer.commit("orders", msg.offset() + 1);
            } catch (Exception e) {
                boolean toDlq = consumer.nack("orders", msg.offset());
                System.err.println(toDlq ? "Sent to DLQ: " : "Requeued: " + msg.offset());
            }
        }
    }
} catch (IOException e) { e.printStackTrace(); }`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Example 4 — Time-Based Log Replay</h3>
      <CodeBlock language="java" code={`try (DRMQConsumer consumer = new DRMQConsumer("localhost:9092", "analytics-group")) {
    consumer.connect();

    // Rewind the group to exactly 12 hours ago
    long targetTime = System.currentTimeMillis() - (12 * 60 * 60 * 1000);
    
    // The SDK automatically asks the broker for the exact offset
    consumer.seekByTime("orders", targetTime);

    // The consumer will naturally resume fetching from the new offset
    List<DRMQConsumer.ConsumedMessage> messages = consumer.poll(100, 1000);
    System.out.printf("Fetched %d messages from the past 12 hours.%n", messages.size());
} catch (IOException e) { e.printStackTrace(); }`} />

      <div className="bg-rose-500/10 rounded-lg p-4 mt-4">
        <p className="text-sm text-rose-200/80"><strong>Warning:</strong> <code>nack()</code> throws <code>IllegalStateException</code> in single-consumer mode. Dead-letter routing requires group mode.</p>
      </div>
    </div>
  );
}
