import { CodeBlock } from '../components/CodeBlock';

export function TypeScriptClient() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-6">TypeScript SDK</h1>
      
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        A native Node.js/TypeScript SDK is also available in the 
        <code>drmq-ts-client</code> directory. It uses 
        the <code>net</code> module to interact natively 
        with the broker without requiring heavy HTTP libraries, and features exactly the 
        same automatic leader redirection and failover capabilities as the Java client.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Installation</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        The TypeScript SDK requires Node.js 18+. You can install it directly from the local repository:
      </p>
      <CodeBlock 
        language="bash"
        code={`cd drmq-ts-client\nnpm install\nnpm run build`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Producer: Sending Messages</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        The Producer connects to a random bootstrap server. If it hits a follower, it is automatically redirected to the Raft Leader. Payload data is handled exclusively as Node.js <code>Buffer</code> objects.
      </p>
      <CodeBlock 
        language="typescript"
        code={`import { DRMQProducer } from 'drmq-ts-client';\n\nconst producer = new DRMQProducer("localhost:9092,localhost:9093");\nawait producer.connect();\n\n// 1. Send a string payload (must be converted to Buffer)\nconst payload1 = Buffer.from("Hello from TypeScript!");\nconst res1 = await producer.send("ts-topic", payload1);\nif (res1.success) {\n  console.log(\`Sent string at offset \${res1.offset}\`);\n}\n\n// 2. Send JSON payload with an optional routing key\nconst payload2 = Buffer.from(JSON.stringify({ user: "bob", action: "click" }));\nconst res2 = await producer.send("analytics", payload2, "bob");`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Consumer: Group Mode (At-Least-Once)</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        To prevent message loss in production, use Group Mode with Manual Commits. This requires you to explicitly call <code>commit()</code> only after your asynchronous logic (like database inserts) completes successfully.
      </p>
      <CodeBlock 
        language="typescript"
        code={`import { DRMQConsumer } from 'drmq-ts-client';\n\n// Join a consumer group for broker-side load balancing\nconst consumer = new DRMQConsumer("localhost:9092", "analytics-workers");\n\n// Disable auto-commit to ensure at-least-once delivery\nconsumer.autoCommit = false;\nawait consumer.connect();\nawait consumer.subscribe("analytics");\n\nwhile (true) {\n  // Long-poll the broker for new messages\n  const messages = await consumer.poll(50, 5000);\n  \n  for (const msg of messages) {\n    const data = JSON.parse(Buffer.from(msg.payload).toString('utf-8'));\n    await processEventInDatabase(data);\n  }\n  \n  // Commit the batch only after all processing succeeds\n  if (messages.length > 0) {\n    const lastOffset = messages[messages.length - 1].offset;\n    await consumer.commit("analytics", lastOffset);\n    console.log(\`Successfully committed up to offset \${lastOffset}\`);\n  }\n}`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Consumer: Single Mode (No Group)</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        If you want to manually stream the log from a specific offset without interfering with production consumer groups, instantiate the client without a group ID.
      </p>
      <CodeBlock 
        language="typescript"
        code={`// Instantiate without a group string\nconst consumer = new DRMQConsumer("localhost:9092");\nawait consumer.connect();\n\n// Explicitly seek to offset 100\nawait consumer.subscribe("analytics", 100);\n\nconst messages = await consumer.poll(10);\nfor (const msg of messages) {\n  console.log(\`Replaying offset \${msg.offset}\`);\n}`}
      />
    </div>
  );
}
