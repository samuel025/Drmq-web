import { CodeBlock } from '../components/CodeBlock';

export function GoClient() {
  return (
    <div>
      <div className="inline-block text-xs font-mono tracking-widest text-cyan-500 border border-cyan-500/30 bg-cyan-500/10 rounded px-3 py-1 mb-4">
        GO SDK
      </div>
      <h1 className="text-4xl font-bold text-white mb-6">Go Client SDK</h1>
      <p className="text-slate-300 mb-6 leading-relaxed">
        The DRMQ Go client provides a native, idiomatic, high-concurrency client library for producing and consuming messages against a DRMQ broker cluster. It communicates over TCP using the same length-prefixed Protocol Buffers wire protocol as the Java, Python, and TypeScript SDKs. Both <code>Producer</code> and <code>Consumer</code> feature randomized bootstrap-server failover, automatic reconnects, and seamless leader redirection upon receiving <code>NOT_LEADER</code> responses.
      </p>

      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 mt-4 mb-8">
        <p className="text-sm text-cyan-200/90 leading-relaxed">
          <strong>Client-Side Batching & Backpressure:</strong> Calls to <code>Send()</code> or <code>SendString()</code> immediately enqueue messages into an internal accumulator. A dedicated background goroutine aggregates records into a <code>ProduceBatchRequest</code>, waiting up to <strong>5ms (LingerMs)</strong> or until reaching <strong>16KB (BatchSizeBytes)</strong> before flushing over TCP. In-flight request counters and channel limits protect against unbounded memory growth during broker slowdowns.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Prerequisites</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <div className="text-sm font-bold text-cyan-400 mb-2">Go 1.22+</div>
          <p className="text-sm text-slate-400">
            Requires Go 1.22 or higher (utilizes <code>math/rand/v2</code> and modern standard library features).
          </p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <div className="text-sm font-bold text-cyan-400 mb-2">Protocol Buffers Runtime</div>
          <p className="text-sm text-slate-400">
            Uses <code>google.golang.org/protobuf</code>. Generated message bindings are bundled directly within the package.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Installation</h2>
      <p className="text-slate-300 mb-4">Add the Go SDK module to your project:</p>
      <CodeBlock language="bash" code={`go get github.com/drmq/drmq-go-client`} />

      <p className="text-slate-300 my-4">Import the package in your Go code:</p>
      <CodeBlock language="go" code={`import drmq "github.com/drmq/drmq-go-client"`} />

      <hr className="border-slate-700/50 my-10" />

      {/* ===================== PRODUCER ===================== */}
      <h2 className="text-2xl font-semibold text-slate-100 mb-4">Producer</h2>
      <p className="text-slate-300 mb-6 leading-relaxed">
        <code>Producer</code> is safe for concurrent use by multiple goroutines. It maintains persistent connections, automatically discovers and redirects to partition leaders, and handles background batching transparently.
      </p>

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Configuration & Creation</h3>
      <p className="text-slate-300 mb-3 text-sm">
        Pass a <code>ProducerConfig</code> struct to <code>NewProducer()</code>:
      </p>
      <CodeBlock language="go" code={`// Single broker (development)
producer, err := drmq.NewProducer(drmq.ProducerConfig{
    BootstrapServers: "localhost:9092",
})

// Production cluster with custom batching and structured logger
producer, err := drmq.NewProducer(drmq.ProducerConfig{
    BootstrapServers: "broker1:9092,broker2:9093,broker3:9094",
    BatchSizeBytes:   32768,             // 32 KB batch size (default: 16384)
    LingerMs:         10,                // 10ms linger window (default: 5)
    MaxInflight:      10,                // max concurrent in-flight batches (default: 5)
    Logger:           slog.Default(),    // optional log/slog Logger
})
if err != nil {
    log.Fatal(err)
}
defer producer.Close()

// Connect to the cluster
if err := producer.Connect(); err != nil {
    log.Fatal(err)
}`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-8 mb-3">Producer Methods</h3>
      <div className="space-y-3 mb-6">
        {[
          ['Connect() error', 'error', 'Establishes a TCP connection to one of the bootstrap servers. Automatically walks the list on failure.'],
          ['Send(topic string, payload []byte) *SendFuture', '*SendFuture', 'Asynchronously buffers a raw byte payload. Returns a future to await the broker acknowledgement.'],
          ['SendString(topic string, payload string) *SendFuture', '*SendFuture', 'Convenience helper to send a UTF-8 string payload asynchronously.'],
          ['SendWithKey(topic string, payload []byte, key string) *SendFuture', '*SendFuture', 'Asynchronously sends a payload with a partition routing key.'],
          ['SendAtomic(topicPayloads map[string][]byte) *AtomicSendFuture', '*AtomicSendFuture', 'Sends a cross-topic atomic batch. Guaranteed to commit or fail across all target topics as a single Raft unit.'],
          ['Flush() error', 'error', 'Immediately drains the internal accumulator and flushes all buffered messages to the broker.'],
          ['Close() error', 'error', 'Flushes any pending batches and terminates the underlying TCP connection cleanly.'],
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

      <h3 className="text-xl font-semibold text-slate-200 mt-8 mb-3">SendResult & Futures</h3>
      <p className="text-slate-300 mb-4 text-sm">
        Every asynchronous send returns a <code>*SendFuture</code> that can be awaited synchronously with or without a timeout:
      </p>
      <div className="space-y-2 mb-6">
        {[
          ['future.Get() (SendResult, error)', 'Waits indefinitely until the message is acknowledged by the broker or a terminal error occurs.'],
          ['future.GetWithTimeout(timeout time.Duration) (SendResult, error)', 'Waits for the ack up to the specified duration. Returns a timeout error if exceeded.'],
        ].map(([m, d]) => (
          <div key={m} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
            <code className="text-cyan-400 text-sm font-semibold">{m}</code>
            <p className="text-sm text-slate-400 mt-1">{d}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 mb-6">
        {[
          ['.Success', 'bool', 'true when the message was durably committed to the Raft log.'],
          ['.Offset', 'int64', 'The durable log offset assigned by the broker (meaningful when Success is true).'],
          ['.ErrorMessage', 'string', 'Human-readable failure details when Success is false.'],
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

      <h3 className="text-xl font-semibold text-slate-200 mt-8 mb-3">Producer Example: Standard & Keyed Send</h3>
      <CodeBlock language="go" code={`package main

import (
    "encoding/json"
    "fmt"
    "log"
    "time"

    drmq "github.com/drmq/drmq-go-client"
)

type OrderDTO struct {
    UserID   string  \`json:"userId"\`
    Amount   float64 \`json:"amount"\`
    Currency string  \`json:"currency"\`
}

func main() {
    producer, err := drmq.NewProducer(drmq.ProducerConfig{
        BootstrapServers: "localhost:9092,localhost:9093",
    })
    if err != nil {
        log.Fatalf("Failed to create producer: %v", err)
    }
    defer producer.Close()

    if err := producer.Connect(); err != nil {
        log.Fatalf("Connect failed: %v", err)
    }

    // 1. Send plain string
    future1 := producer.SendString("notifications", "System alert: high load")
    res1, err := future1.GetWithTimeout(5 * time.Second)
    if err != nil {
        log.Printf("Send failed: %v", err)
    } else {
        fmt.Printf("Notification sent at offset: %d\n", res1.Offset)
    }

    // 2. Send structured JSON with a routing key
    order := OrderDTO{UserID: "usr_991", Amount: 149.99, Currency: "USD"}
    payload, _ := json.Marshal(order)

    future2 := producer.SendWithKey("orders", payload, order.UserID)
    res2, err := future2.GetWithTimeout(5 * time.Second)
    if err != nil {
        log.Printf("Keyed send failed: %v", err)
    } else {
        fmt.Printf("Order persisted: offset=%d success=%t\n", res2.Offset, res2.Success)
    }
}`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-8 mb-3">Producer Example: Cross-Topic Atomic Transactions</h3>
      <p className="text-slate-300 mb-3 text-sm">
        Use <code>SendAtomic()</code> to write across multiple distinct topics in a single, indivisible Raft consensus entry:
      </p>
      <CodeBlock language="go" code={`// Atomic multi-topic produce
atomicFuture := producer.SendAtomic(map[string][]byte{
    "orders":    []byte(\`{"orderId": "ord_101", "status": "PENDING"}\`),
    "inventory": []byte(\`{"sku": "prod_456", "quantity": -1}\`),
    "audit_log": []byte(\`{"action": "ORDER_CREATED", "orderId": "ord_101"}\`),
})

offsets, err := atomicFuture.GetWithTimeout(5 * time.Second)
if err != nil {
    log.Fatalf("Atomic transaction failed or aborted: %v", err)
}

// Map of topic -> committed log offset
for topic, offset := range offsets {
    fmt.Printf("Topic %s committed at offset %d\n", topic, offset)
}`} />

      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 my-6">
        <p className="text-sm text-cyan-200/90">
          <strong>Tip:</strong> Topics do not need to be pre-created. DRMQ creates topics on the fly on the first produce or subscribe request.
        </p>
      </div>

      <hr className="border-slate-700/50 my-10" />

      {/* ===================== CONSUMER ===================== */}
      <h2 className="text-2xl font-semibold text-slate-100 mb-4">Consumer</h2>
      <p className="text-slate-300 mb-6 leading-relaxed">
        The Go <code>Consumer</code> reads messages from one or more topics. It supports two execution modes:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="border border-slate-700 bg-slate-800/40 rounded-lg p-5">
          <div className="text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">Group Mode</div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Enabled by setting <code>ConsumerGroup</code> in <code>ConsumerConfig</code>. The cluster coordinates message distribution via short-lived Raft leases, guarantees at-least-once delivery, persists group offsets, and enables Dead-Letter Queue (DLQ) routing upon <code>Nack()</code>.
          </p>
        </div>
        <div className="border border-slate-700 bg-slate-800/40 rounded-lg p-5">
          <div className="text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">Single Mode</div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Leave <code>ConsumerGroup</code> empty. The consumer manages its own cursor locally. Perfect for log replay, audit inspectors, migration tools, or offset rewind via <code>SubscribeFrom()</code> and <code>SeekByTime()</code>.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Consumer Methods</h3>
      <div className="space-y-3 mb-6">
        {[
          ['Connect() error', 'error', 'Opens a TCP connection to one of the bootstrap brokers.'],
          ['Subscribe(topic string) error', 'error', 'Registers interest in a topic. Resumes from the last committed group offset (group mode) or offset 0 (single mode).'],
          ['SubscribeFrom(topic string, fromOffset int64) error', 'error', 'Subscribes starting from an explicit log offset (e.g. 0 to replay from start).'],
          ['SeekByTime(topic string, timestamp int64) error', 'error', 'Queries the broker for the earliest offset on or after the given UNIX millisecond timestamp and repositions the cursor.'],
          ['Poll() ([]ConsumedMessage, error)', '[]ConsumedMessage, error', 'Fetches available messages with default parameters (100 messages max, 1000ms long-polling timeout).'],
          ['PollMax(maxMessages int) ([]ConsumedMessage, error)', '[]ConsumedMessage, error', 'Fetches up to maxMessages with the default 1000ms timeout.'],
          ['PollWithOptions(maxMessages int, timeoutMs int64) ([]ConsumedMessage, error)', '[]ConsumedMessage, error', 'Fetches up to maxMessages waiting up to timeoutMs before returning an empty slice if no messages arrive.'],
          ['Commit(topic string, offset int64) error', 'error', 'Persists the next read offset for the consumer group. Only supported in group mode.'],
          ['Nack(topic string, offset int64) (routedToDLQ bool, err error)', 'bool, error', 'Explicitly rejects a message. Increments failure count; routes to DLQ if max attempts exceeded. Only supported in group mode.'],
          ['CurrentOffset(topic string) int64', 'int64', 'Returns the current in-memory offset tracked by the client for the given topic.'],
          ['ConsumerID() string', 'string', 'Returns the unique client identifier assigned to this consumer instance.'],
          ['Close() error', 'error', 'Closes the TCP socket and cleans up connection resources.'],
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

      <h3 className="text-xl font-semibold text-slate-200 mt-8 mb-3">ConsumedMessage Fields</h3>
      <div className="space-y-2 mb-8">
        {[
          ['.Offset', 'int64', 'Broker-assigned log sequence position.'],
          ['.Topic', 'string', 'Name of the topic the message was read from.'],
          ['.Payload', '[]byte', 'Raw message payload bytes.'],
          ['.Key', 'string', 'Optional routing key assigned by the producer.'],
          ['.Timestamp', 'int64', 'Producer-assigned UNIX millisecond timestamp.'],
          ['.StoredAt', 'int64', 'Broker-assigned timestamp when written to WAL.'],
          ['.PayloadAsString()', 'string', 'Helper method returning string(m.Payload).'],
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

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Example 1: Consumer Group Mode (Auto-Commit)</h3>
      <p className="text-slate-300 mb-3 text-sm">
        Ideal for scalable microservice workers. The broker coordinates work-sharing without manual partition assignment:
      </p>
      <CodeBlock language="go" code={`package main

import (
    "fmt"
    "log"

    drmq "github.com/drmq/drmq-go-client"
)

func main() {
    consumer, err := drmq.NewConsumer(drmq.ConsumerConfig{
        BootstrapServers: "localhost:9092,localhost:9093,localhost:9094",
        ConsumerGroup:    "order-processors",
        AutoCommit:       true, // Broker advances offset after each poll
    })
    if err != nil {
        log.Fatal(err)
    }
    defer consumer.Close()

    if err := consumer.Connect(); err != nil {
        log.Fatal(err)
    }

    if err := consumer.Subscribe("orders"); err != nil {
        log.Fatal(err)
    }

    fmt.Println("Listening for orders...")
    for {
        messages, err := consumer.PollWithOptions(50, 2000)
        if err != nil {
            log.Printf("Poll warning: %v", err)
            continue
        }

        for _, msg := range messages {
            fmt.Printf("Received: offset=%d key=%s payload=%s\n",
                msg.Offset, msg.Key, msg.PayloadAsString())
        }
    }
}`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-8 mb-3">Example 2: Manual Commit & DLQ NACKing</h3>
      <p className="text-slate-300 mb-3 text-sm">
        For critical at-least-once workflows where unprocessable messages must be moved to Dead-Letter Queues after retries:
      </p>
      <CodeBlock language="go" code={`consumer, err := drmq.NewConsumer(drmq.ConsumerConfig{
    BootstrapServers: "localhost:9092",
    ConsumerGroup:    "payment-workers",
    AutoCommit:       false, // Manual offset control
})
if err != nil {
    log.Fatal(err)
}
defer consumer.Close()

consumer.Connect()
consumer.Subscribe("payments")

for {
    messages, err := consumer.Poll()
    if err != nil {
        continue
    }

    for _, msg := range messages {
        err := processPayment(msg.Payload)
        if err != nil {
            log.Printf("Processing failed for offset %d: %v", msg.Offset, err)
            
            // Explicitly reject. If max delivery attempts exceeded, broker routes to DLQ
            routedToDLQ, nackErr := consumer.Nack("payments", msg.Offset)
            if nackErr != nil {
                log.Printf("NACK error: %v", nackErr)
            } else if routedToDLQ {
                log.Printf("Poison pill routed to DLQ topic: dlq.payment-workers.payments")
            }
        } else {
            // Commit next expected offset
            consumer.Commit("payments", msg.Offset+1)
        }
    }
}`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-8 mb-3">Example 3: Single Mode (Log Replay)</h3>
      <p className="text-slate-300 mb-3 text-sm">
        Omitting <code>ConsumerGroup</code> puts the consumer into single mode. You can replay the entire topic log from offset 0:
      </p>
      <CodeBlock language="go" code={`// Single mode — no cluster coordination
consumer, err := drmq.NewConsumer(drmq.ConsumerConfig{
    BootstrapServers: "localhost:9092",
})
if err != nil {
    log.Fatal(err)
}
defer consumer.Close()

consumer.Connect()
// Replay all events from the very beginning of the topic
consumer.SubscribeFrom("audit-events", 0)

for {
    messages, err := consumer.PollWithOptions(100, 1000)
    if err != nil {
        log.Printf("Poll error: %v", err)
        continue
    }
    for _, msg := range messages {
        fmt.Printf("[REPLAY] offset=%d payload=%s\n", msg.Offset, msg.PayloadAsString())
    }
}`} />

      <h3 className="text-xl font-semibold text-slate-200 mt-8 mb-3">Example 4: Time-Based Seek</h3>
      <p className="text-slate-300 mb-3 text-sm">
        Seek directly to a specific point in time (in milliseconds) without needing to know internal offset numbers:
      </p>
      <CodeBlock language="go" code={`// Replay records from the last 15 minutes
fifteenMinutesAgo := time.Now().Add(-15 * time.Minute).UnixMilli()

// Repositions the offset pointer to the first message at or after the timestamp
if err := consumer.SeekByTime("user-activity", fifteenMinutesAgo); err != nil {
    log.Fatalf("SeekByTime failed: %v", err)
}

messages, err := consumer.Poll()
fmt.Printf("Fetched %d messages from the last 15 minutes\n", len(messages))`} />

      <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 mt-6">
        <p className="text-sm text-rose-200/90">
          <strong>Note on DLQ:</strong> <code>Nack()</code> and <code>Commit()</code> are only supported when a <code>ConsumerGroup</code> is configured. In single mode, offset tracking is local to the client instance.
        </p>
      </div>

      <hr className="border-slate-700/50 my-10" />

      {/* ===================== WIRE PROTOCOL & SOURCE ===================== */}
      <h2 className="text-2xl font-semibold text-slate-100 mb-4">Wire Protocol & Source Build</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        The Go SDK conforms to the standard DRMQ framing specification:
      </p>
      <CodeBlock language="text" code={`+-------------------------------+----------------------------------------+
| 4-byte big-endian length (N)  | N-byte serialized protobuf MessageEnvelope |
+-------------------------------+----------------------------------------+`} />

      <p className="text-slate-300 my-4 text-sm">
        If you clone the DRMQ repository and want to recompile the protobuf bindings or run tests:
      </p>
      <CodeBlock language="bash" code={`cd drmq-go-client

# Recompile protobuf bindings (requires protoc and protoc-gen-go)
make proto

# Run unit and mock broker tests
make test

# Run Go static analysis
make vet

# Build package
make build`} />
    </div>
  );
}
