import { CodeBlock } from '../components/CodeBlock';

export function TypeScriptClient() {
  return (
    <div>
      <div className="inline-block text-xs font-mono tracking-widest text-cyan-500 border border-cyan-500/30 bg-cyan-500/10 rounded px-3 py-1 mb-4">TYPESCRIPT SDK</div>
      <h1 className="text-4xl font-bold text-white mb-6">TypeScript SDK</h1>
      <p className="text-slate-300 mb-6">
        The DRMQ TypeScript client provides a fully async, promise-based API for producing and consuming messages against a DRMQ broker cluster. It lives in the <code>drmq-ts-client/</code> directory and communicates using the same TCP/Protobuf protocol as the Java and Python SDKs. Both <code>DRMQProducer</code> and <code>DRMQConsumer</code> extend a shared <code>DRMQClient</code> base that manages connection lifecycle, bootstrap-server rotation, and transparent leader redirection via typed <code>ErrorCode</code>s.
      </p>

      <div className="bg-cyan-500/10 rounded-lg p-4 mt-4 mb-8">
        <p className="text-sm text-cyan-200/80"><strong>Client-Side Batching:</strong> Similar to the Java client, the <code>send()</code> method places messages into an internal accumulator queue. A dedicated background loop groups these messages into a single <code>ProduceBatchRequest</code>, waiting up to <strong>5ms (linger.ms)</strong> or until the batch reaches <strong>16KB</strong> before flushing to the network. This ensures extremely high throughput under load.</p>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Prerequisites</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          ['Node.js', 'Any current LTS release. The client uses the built-in net module — no native add-ons required.'],
          ['TypeScript', 'Install TypeScript as a dev dependency. The source is fully typed and ships a tsconfig.json.'],
          ['protobufjs', 'The Protobuf runtime used to encode and decode broker messages. Install with npm install protobufjs.'],
        ].map(([t, d]) => (
          <div key={t} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
            <div className="text-sm font-bold text-cyan-400 mb-2">{t}</div>
            <p className="text-sm text-slate-400">{d}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Setup</h2>
      <CodeBlock language="bash" code={`cd drmq-ts-client
npm install protobufjs
npm install --save-dev typescript @types/node
npx tsc`} />
      <CodeBlock language="typescript" code={`import { DRMQProducer, DRMQConsumer } from './client';`} />

      <hr className="border-slate-700/50 my-10" />
      <h2 className="text-2xl font-semibold text-slate-100 mb-4">DRMQProducer</h2>
      <p className="text-slate-300 mb-6">Opens a persistent TCP connection and sends <code>Uint8Array</code> payloads to named topics. Every call to <code>send()</code> is fully async. When the broker returns a <code>NOT_LEADER</code> redirect, the client reconnects to the reported leader automatically.</p>

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Constructor</h3>
      <CodeBlock language="typescript" code={`new DRMQProducer(bootstrapServers: string)

// Single broker — development
const producer = new DRMQProducer("localhost:9092");

// Cluster — production
const producer = new DRMQProducer("broker1:9092,broker2:9093,broker3:9094");`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Methods</h3>
      <div className="space-y-3 mb-6">
        {[
          ['await connect()', 'Promise<void>', 'Opens the TCP connection. Throws DRMQConnectionError if no broker is reachable.'],
          ['await send(topic, payload, key?)', 'Promise<ProduceResponse>', 'Send payload (Uint8Array) to topic. Optionally attach a routing key. Check .success before using .offset.'],
          ['close()', 'void', 'Destroys the underlying TCP socket and clears any pending callbacks.'],
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
          ['success', 'boolean', 'true when the broker accepted and durably persisted the message.'],
          ['offset', 'number', 'Broker-assigned log offset. Only meaningful when success is true.'],
          ['errorMessage', 'string', 'A human-readable description of the error when success is false.'],
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
      <CodeBlock language="typescript" code={`import { DRMQProducer } from './client';

// Define your DTO
interface OrderDTO {
  userId: string;
  amount: number;
  currency: string;
}

async function main() {
  const producer = new DRMQProducer("localhost:9092,localhost:9093");
  await producer.connect();

  try {
    const order: OrderDTO = { userId: "user-123", amount: 99.50, currency: "USD" };
    // Serialize object to JSON buffer
    const payload = Buffer.from(JSON.stringify(order));
    
    // Send with an optional routing key
    const res = await producer.send("orders", payload, "user-123");
    
    if (res.success) {
      console.log(\`Order persisted at offset \${res.offset}\`);
    } else {
      console.error(\`Send failed: \${res.errorMessage}\`);
    }
  } finally {
    producer.close();
  }
}

main().catch(console.error);`} />

      <hr className="border-slate-700/50 my-10" />
      <h2 className="text-2xl font-semibold text-slate-100 mb-4">DRMQConsumer</h2>
      <p className="text-slate-300 mb-6">Reads messages from one or more subscribed topics. Supports <strong>Group Mode</strong> (broker coordinates delivery) and <strong>Single Consumer Mode</strong> (manual offset control).</p>

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Constructor</h3>
      <CodeBlock language="typescript" code={`new DRMQConsumer(bootstrapServers: string, groupId?: string, consumerId?: string)

// Group mode — scale out with the same groupId
const consumer = new DRMQConsumer("localhost:9092,localhost:9093", "ts-workers");

// Single consumer mode — full manual offset control
const consumer = new DRMQConsumer("localhost:9092");`} />
      <p className="text-slate-400 text-sm mt-2 mb-6"><code>consumerId</code> defaults to <code>'ts-consumer-1'</code> — set a unique value when running multiple consumers in the same process.</p>

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Methods</h3>
      <div className="space-y-3 mb-6">
        {[
          ['await connect()', 'Promise<void>', 'Opens a TCP connection to one of the bootstrap brokers.'],
          ['autoCommit (property)', 'boolean', 'Set to true to auto-commit after each poll(). Default: false. Assign directly: consumer.autoCommit = true.'],
          ['await subscribe(topic, fromOffset?)', 'Promise<void>', 'Register interest in topic. In group mode, broker manages offsets. Pass fromOffset to override.'],
          ['await seekByTime(topic, timestamp)', 'Promise<void>', 'Seek to the first message at or after the given Unix epoch timestamp (ms).'],
          ['await poll(maxMessages?, timeoutMs?)', 'Promise<StoredMessage[]>', 'Fetch up to maxMessages (default 100). Broker waits up to timeoutMs ms (default 1000).'],
          ['await commit(topic, nextOffset)', 'Promise<void>', 'Commit nextOffset to the broker for topic.'],
          ['await nack(topic, offset)', 'Promise<boolean>', 'Reject a message. Returns true if routed to DLQ, false if requeued. Throws Error in single mode.'],
          ['close()', 'void', 'Destroys the TCP socket and flushes any pending callbacks.'],
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
          ['offset', 'number', 'The broker-assigned log position of the message.'],
          ['topic', 'string', 'The topic the message was read from.'],
          ['payload', 'Uint8Array', "Raw message bytes. Convert with Buffer.from(msg.payload).toString('utf-8')."],
          ['key', 'string | undefined', 'Optional routing key set by the producer.'],
          ['timestamp', 'number', 'Producer-set timestamp in milliseconds since epoch.'],
          ['storedAt', 'number', 'Broker-set timestamp (ms since epoch) when the message was durably persisted.'],
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
      <CodeBlock language="typescript" code={`import { DRMQConsumer } from './client';

interface OrderDTO {
  userId: string;
  amount: number;
  currency: string;
}

async function main() {
  const consumer = new DRMQConsumer("localhost:9092,localhost:9093", "ts-workers");
  consumer.autoCommit = true;
  await consumer.connect();
  await consumer.subscribe("orders");

  const messages = await consumer.poll(10, 5000);
  for (const msg of messages) {
    // Deserialize raw bytes back to JSON object
    const orderStr = Buffer.from(msg.payload).toString('utf-8');
    const order: OrderDTO = JSON.parse(orderStr);
    
    console.log(\`Received order from \${order.userId} for \${order.amount} (offset \${msg.offset})\`);
  }

  consumer.close();
}

main().catch(console.error);`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Example 2 — Manual commit</h3>
      <CodeBlock language="typescript" code={`async function main() {
  const consumer = new DRMQConsumer("localhost:9092,localhost:9093", "order-processors");
  await consumer.connect();
  await consumer.subscribe("orders");

  while (true) {
    const messages = await consumer.poll(50, 2000);
    for (const msg of messages) {
      try {
        await processOrder(msg.payload);
        await consumer.commit("orders", msg.offset + 1);
      } catch (err) {
        console.error(\`Processing failed at offset \${msg.offset}:\`, err);
        const routedToDlq = await consumer.nack("orders", msg.offset);
        if (routedToDlq) {
          console.warn(\`Poison pill moved to DLQ: offset \${msg.offset}\`);
        }
      }
    }
  }
}

main().catch(console.error);`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Example 3 — Single mode (replay)</h3>
      <CodeBlock language="typescript" code={`async function main() {
  const consumer = new DRMQConsumer("localhost:9092"); // no groupId → single mode
  await consumer.connect();

  // Start from the very beginning of the log
  await consumer.subscribe("audit-log", 0);

  while (true) {
    const messages = await consumer.poll(100, 1000);
    for (const msg of messages) {
      console.log(
        \`Replaying offset \${msg.offset}: \${Buffer.from(msg.payload).toString('utf-8')}\`
      );
    }
  }
}

main().catch(console.error);`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Example 4 — Time-Based Log Replay</h3>
      <CodeBlock language="typescript" code={`async function main() {
  const consumer = new DRMQConsumer("localhost:9092"); // works in both single and group mode
  await consumer.connect();

  // Replay from exactly 1 hour ago
  const targetTimestamp = Date.now() - (60 * 60 * 1000);
  
  // The SDK automatically asks the broker for the exact offset
  await consumer.seekByTime("user-activity", targetTimestamp);

  // Poll will naturally fetch from the new offset
  const messages = await consumer.poll(100, 1000);
  console.log(\`Fetched \${messages.length} messages from the past hour.\`);
}

main().catch(console.error);`} />
      <div className="bg-rose-500/10 rounded-lg p-4 mt-4">
        <p className="text-sm text-rose-200/80"><strong>Warning:</strong> <code>nack()</code> throws an <code>Error</code> when called without a <code>groupId</code>. Dead-letter routing is only available in group mode.</p>
      </div>
    </div>
  );
}
