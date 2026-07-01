import { CodeBlock } from '../components/CodeBlock';

export function ConsumerAPI() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-6">Java SDK (Consumer)</h1>
      
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        As the first-class native client, the Java <code>DRMQConsumer</code> provides the most robust implementation for reading messages from topics.
        It natively supports automatic reconnects, leader redirection, and long-polling. DRMQ supports two distinct consumption modes: <strong>Group Mode</strong> (default)
        and <strong>Single Mode</strong>.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mb-6">Consumption Modes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="border border-slate-700 bg-slate-800/50 rounded-lg p-5">
          <div className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wider">Group Mode (Default)</div>
          <p className="text-slate-300 text-sm leading-relaxed">
            The broker tracks the consumer's offsets persistently via Raft. Multiple consumers in the same group coordinate via short-lived leases, ensuring a message is delivered to exactly one consumer in the group.
          </p>
        </div>
        <div className="border border-slate-700 bg-slate-800/50 rounded-lg p-5">
          <div className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wider">Single Mode</div>
          <p className="text-slate-300 text-sm leading-relaxed">
            The consumer tracks its own offsets locally. It sends raw offset-based requests to the broker. Useful for replay tools, ad-hoc scripts, or systems that persist offsets in their own external database.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Basic Usage (Group Mode)</h2>
      <p className="text-slate-300 mb-4">
        In group mode, the consumer asks the broker where it left off upon subscription. Auto-commit
        is disabled by default, meaning you must manually commit offsets after processing, or explicitly
        enable auto-commit.
      </p>
      <CodeBlock 
        language="java"
        code={`import com.drmq.client.DRMQConsumer;\nimport com.drmq.client.DRMQConsumer.ConsumedMessage;\n\n// Initialize with bootstrap servers and consumer group ID\nDRMQConsumer consumer = new DRMQConsumer("10.0.1.10:9092,10.0.1.11:9092", "analytics-group");\nconsumer.connect();\n\n// Let the broker manage the offset\nconsumer.subscribe("orders");\n\n// Optional: Enable auto-commit after every poll\nconsumer.setAutoCommit(true);\n\nwhile (true) {\n    // Poll max 100 messages. Wait up to 2000ms if queue is empty (Long Polling)\n    List<ConsumedMessage> messages = consumer.poll(100, 2000);\n\n    for (ConsumedMessage msg : messages) {\n        System.out.printf("Offset: %d, Key: %s, Data: %s%n", \n            msg.offset(), msg.key(), msg.payloadAsString());\n    }\n}`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">The Fan-Out Pattern (Multiple Groups)</h2>
      <p className="text-slate-300 mb-4">
        If you want to broadcast the exact same messages to different independent downstream systems (e.g., an Email Service and a Database Writer), simply use different group names! The broker maintains separate offset pointers for every distinct group.
      </p>
      <CodeBlock 
        language="java"
        code={`// Service A will process all messages independently\nDRMQConsumer emailService = new DRMQConsumer("localhost:9092", "email-senders");\nemailService.subscribe("user-signups");\n\n// Service B will ALSO process the exact same messages independently\nDRMQConsumer analyticsService = new DRMQConsumer("localhost:9092", "analytics-indexers");\nanalyticsService.subscribe("user-signups");`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Manual Offset Management</h2>
      <p className="text-slate-300 mb-4">
        To achieve <strong>at-least-once</strong> processing semantics, you must disable auto-commit, process the
        messages fully, and only then commit the offset. You can also explicitly seek to a specific offset.
      </p>
      <CodeBlock 
        language="java"
        code={`consumer.setAutoCommit(false);\n\n// Override the broker's offset and explicitly resume from offset 500\nconsumer.subscribe("orders", 500L);\n\nList<ConsumedMessage> messages = consumer.poll(50, 1000);\nfor (ConsumedMessage msg : messages) {\n    processInDatabase(msg);\n}\n\n// Manually commit the offset to the broker\nif (!messages.isEmpty()) {\n    long lastOffset = messages.get(messages.size() - 1).offset();\n    consumer.commit("orders", lastOffset);\n}`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Dead-Letter Queues (DLQ) & Explicit NACK</h2>
      <p className="text-slate-300 mb-4">
        When using Group Mode, DRMQ provides built-in failure handling. If your application encounters an unprocessable message (a "poison pill"), you can explicitly reject it using the <code>nack()</code> method. If a message fails too many times, the broker automatically routes it to an isolated DLQ topic (e.g. <code>dlq.group.topic</code>) and advances your consumer group past the bad message.
      </p>
      <CodeBlock 
        language="java"
        code={`List<ConsumedMessage> messages = consumer.poll(50, 1000);\nfor (ConsumedMessage msg : messages) {\n    try {\n        processOrder(msg);\n        consumer.commit("orders", msg.offset());\n    } catch (ValidationException e) {\n        // Explicitly reject the message\n        boolean routedToDlq = consumer.nack("orders", msg.offset());\n        if (routedToDlq) {\n            System.err.println("Message " + msg.offset() + " was routed to the DLQ.");\n        }\n    }\n}`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Consumer: Single Mode (No Group)</h2>
      <p className="text-slate-300 mb-4">
        If you want a consumer to simply read from a topic independently without the broker tracking
        its state (e.g. for replaying historical data), just instantiate the consumer without a group ID. The Java SDK automatically disables <code>groupMode</code> under the hood!
      </p>
      <CodeBlock 
        language="java"
        code={`// Instantiate without a group string (automatically disables groupMode!)\nDRMQConsumer consumer = new DRMQConsumer("10.0.1.10:9092");\nconsumer.connect();\n\n// Subscribe and explicitly provide the offset you want to start from\nconsumer.subscribe("orders", 0L);\n\nwhile (true) {\n    List<ConsumedMessage> messages = consumer.poll();\n    for (ConsumedMessage msg : messages) {\n        System.out.printf("Replaying Offset: %d%n", msg.offset());\n    }\n}`}
      />
    </div>
  );
}
