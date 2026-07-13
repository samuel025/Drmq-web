import { CodeBlock } from '../components/CodeBlock';

export function PythonClient() {
  return (
    <div>
      <div className="inline-block text-xs font-mono tracking-widest text-cyan-500 border border-cyan-500/30 bg-cyan-500/10 rounded px-3 py-1 mb-4">PYTHON SDK</div>
      <h1 className="text-4xl font-bold text-white mb-6">Python Client SDK</h1>
      <p className="text-slate-300 mb-6">
        The DRMQ Python client lets you send and receive messages using the same TCP/Protobuf protocol as the Java SDK. It lives in the <code>drmq-python-client/</code> directory and requires no external broker-specific package — only the standard <code>protobuf</code> library. Both <code>DRMQProducer</code> and <code>DRMQConsumer</code> inherit from a shared <code>DRMQClient</code> base that manages connection pooling, bootstrap-server rotation, and transparent leader redirection via typed <code>ErrorCode</code>s.
      </p>

      <div className="border-l-4 border-cyan-500 bg-cyan-500/10 rounded-r-lg p-4 mt-4 mb-8">
        <p className="text-sm text-cyan-200/80"><strong>Client-Side Batching:</strong> Similar to the Java client, the <code>send()</code> method places messages into an internal accumulator queue. A dedicated background thread groups these messages into a single <code>ProduceBatchRequest</code>, waiting up to <strong>5ms (linger.ms)</strong> or until the batch reaches <strong>16KB</strong> before flushing to the network. This provides massive throughput gains.</p>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Prerequisites</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <div className="text-sm font-bold text-cyan-400 mb-2">Python 3.x</div>
          <p className="text-sm text-slate-400">Any recent Python 3 release works. The client uses type hints and f-strings requiring Python 3.6+.</p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <div className="text-sm font-bold text-cyan-400 mb-2">protobuf</div>
          <p className="text-sm text-slate-400">Install the Google Protobuf runtime with <code>pip install protobuf</code>. The generated <code>messages_pb2</code> module is included in the client directory.</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Setup</h2>
      <CodeBlock language="bash" code={`pip install protobuf
cd drmq-python-client`} />
      <CodeBlock language="python" code={`from drmq_client import DRMQProducer, DRMQConsumer`} />

      <hr className="border-slate-700/50 my-10" />
      <h2 className="text-2xl font-semibold text-slate-100 mb-4">DRMQProducer</h2>
      <p className="text-slate-300 mb-6">Connects to a DRMQ broker and sends byte payloads to named topics. When the broker returns a <code>NOT_LEADER</code> error, the client automatically redirects to the reported leader.</p>

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Constructor</h3>
      <CodeBlock language="python" code={`DRMQProducer(bootstrap_servers: str)

# Single broker — development
producer = DRMQProducer("localhost:9092")

# Cluster — production
producer = DRMQProducer("broker1:9092,broker2:9093,broker3:9094")`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Methods</h3>
      <div className="space-y-3 mb-6">
        {[
          ['connect()', 'None', 'Opens a TCP socket to one of the bootstrap brokers. Raises DRMQConnectionError if no broker is reachable.'],
          ['send(topic, payload, key=None)', 'concurrent.futures.Future', 'Asynchronously queues payload (bytes) to topic. Returns a Future resolving to a ProduceResponse.'],
          ['close()', 'None', 'Closes the underlying TCP socket.'],
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

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">ProduceResponse fields</h3>
      <div className="space-y-2 mb-6">
        {[
          ['.success', 'bool', 'True when the broker accepted and persisted the message.'],
          ['.offset', 'int', 'Broker-assigned log offset. Meaningful only when .success is True.'],
          ['.error_message', 'str', 'Human-readable error when .success is False.'],
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

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Producer example</h3>
      <CodeBlock language="python" code={`import json
from drmq_client import DRMQProducer

producer = DRMQProducer("localhost:9092,localhost:9093")
try:
    producer.connect()

    # Create a DTO-like dictionary and serialize it to JSON bytes
    order = {"userId": "user-123", "amount": 99.50, "currency": "USD"}
    payload = json.dumps(order).encode('utf-8')

    res = producer.send("orders", payload, key="user-123").result()
    
    if res.success:
        print(f"Order persisted at offset {res.offset}")
    else:
        print(f"Send failed: {res.error_message}")
finally:
    producer.close()`} />
      <div className="border-l-4 border-cyan-500 bg-cyan-500/10 rounded-r-lg p-4 my-4">
        <p className="text-sm text-cyan-200/80"><strong>Tip:</strong> You do not need to pre-create a topic. DRMQ creates topics implicitly on the first produce call.</p>
      </div>

      <hr className="border-slate-700/50 my-10" />
      <h2 className="text-2xl font-semibold text-slate-100 mb-4">DRMQConsumer</h2>
      <p className="text-slate-300 mb-6">Reads messages from one or more subscribed topics. Supports <strong>group mode</strong> for load-balanced consumption and <strong>single mode</strong> for precise manual offset control.</p>

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Constructor</h3>
      <CodeBlock language="python" code={`DRMQConsumer(bootstrap_servers: str, group_id: Optional[str] = None, consumer_id: str = "py-consumer-1")

# Group mode
consumer = DRMQConsumer("localhost:9092,localhost:9093", group_id="python-workers")

# Single mode — manual offset control
consumer = DRMQConsumer("localhost:9092")`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Methods</h3>
      <div className="space-y-3 mb-6">
        {[
          ['connect()', 'None', 'Opens a TCP socket to one of the bootstrap brokers.'],
          ['auto_commit (property)', 'bool', 'Set to True to auto-commit after each poll(). Defaults to False. Assign directly: consumer.auto_commit = True.'],
          ['subscribe(topic, from_offset=None)', 'None', 'Register interest in topic. Pass from_offset to override the broker.'],
          ['seek_by_time(topic, timestamp)', 'None', 'Seek to the first message at or after the given Unix epoch timestamp (ms).'],
          ['poll(max_messages=100, timeout_ms=1000)', 'list[pb.StoredMessage]', 'Fetch messages across all subscriptions.'],
          ['commit(topic, next_offset)', 'None', 'Commit next_offset to the broker for topic.'],
          ['nack(topic, offset)', 'bool', 'Reject a message. Returns True if routed to DLQ, False if requeued. Raises RuntimeError in single mode.'],
          ['close()', 'None', 'Closes the underlying TCP socket.'],
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

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">StoredMessage fields</h3>
      <div className="space-y-2 mb-8">
        {[
          ['.offset', 'int', 'Broker-assigned log position.'],
          ['.payload', 'bytes', 'Raw message bytes. Decode with msg.payload.decode("utf-8") for text.'],
          ['.key', 'str', 'Optional routing key set by the producer.'],
          ['.timestamp', 'int', 'Producer-set timestamp in milliseconds since epoch.'],
          ['.topic', 'str', 'The topic the message was read from.'],
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

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Example 1 — Group mode (auto-commit)</h3>
      <CodeBlock language="python" code={`import json
from drmq_client import DRMQConsumer

consumer = DRMQConsumer("localhost:9092,localhost:9093", group_id="python-workers")
consumer.auto_commit = True
try:
    consumer.connect()
    consumer.subscribe("orders")

    messages = consumer.poll(max_messages=10, timeout_ms=5000)
    for msg in messages:
        # Deserialize JSON bytes back to a dictionary
        order = json.loads(msg.payload.decode('utf-8'))
        print(f"Received order from {order['userId']} for {order['amount']} (offset {msg.offset})")
finally:
    consumer.close()`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Example 2 — Manual commit</h3>
      <CodeBlock language="python" code={`from drmq_client import DRMQConsumer

consumer = DRMQConsumer("localhost:9092,localhost:9093", group_id="order-processors")
try:
    consumer.connect()
    consumer.subscribe("orders")

    while True:
        messages = consumer.poll(max_messages=50, timeout_ms=2000)
        for msg in messages:
            try:
                process_order(msg.payload)
                consumer.commit("orders", msg.offset + 1)
            except Exception as e:
                print(f"Processing failed for offset {msg.offset}: {e}")
                routed = consumer.nack("orders", msg.offset)
                if routed:
                    print(f"Poison pill sent to DLQ: offset {msg.offset}")
finally:
    consumer.close()`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Example 3 — Single mode (replay)</h3>
      <CodeBlock language="python" code={`from drmq_client import DRMQConsumer

consumer = DRMQConsumer("localhost:9092")  # no group_id → single mode
try:
    consumer.connect()
    consumer.subscribe("audit-log", from_offset=0)  # replay from start

    while True:
        messages = consumer.poll(max_messages=100, timeout_ms=1000)
        for msg in messages:
            print(f"Replaying offset {msg.offset}: {msg.payload.decode('utf-8')}")
finally:
    consumer.close()`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Example 4 — Time-Based Log Replay</h3>
      <CodeBlock language="python" code={`from drmq_client import DRMQConsumer
from datetime import datetime, timezone

consumer = DRMQConsumer("localhost:9092") # works in both single and group mode
try:
    consumer.connect()

    # Replay from exactly 1 hour ago
    target_dt = datetime.now(timezone.utc)
    target_timestamp = int(target_dt.timestamp() * 1000) - (60 * 60 * 1000)
    
    # The SDK automatically asks the broker for the exact offset
    consumer.seek_by_time("user-activity", target_timestamp)

    # Poll will naturally fetch from the new offset
    messages = consumer.poll(max_messages=100, timeout_ms=1000)
    print(f"Fetched {len(messages)} messages from the past hour.")
finally:
    consumer.close()`} />
      <div className="border-l-4 border-rose-500 bg-rose-500/10 rounded-r-lg p-4 mt-4">
        <p className="text-sm text-rose-200/80"><strong>Warning:</strong> <code>nack()</code> raises <code>RuntimeError</code> when called in single-consumer mode. Dead-letter routing is only available when a <code>group_id</code> is set.</p>
      </div>
    </div>
  );
}
