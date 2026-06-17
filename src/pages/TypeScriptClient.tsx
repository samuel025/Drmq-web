import { CodeBlock } from '../components/CodeBlock';

export function TypeScriptClient() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-6">TypeScript Client (SDK)</h1>
      
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        A native Node.js/TypeScript SDK is also available in the 
        <code>drmq-ts-client</code> directory. It uses 
        the <code>net</code> module to interact natively 
        with the broker without requiring heavy HTTP libraries, and features exactly the 
        same automatic leader redirection and failover capabilities as the Java client.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">TypeScript Producer</h2>
      <CodeBlock 
        language="typescript"
        code={`import { DRMQProducer } from './client';\n\nconst producer = new DRMQProducer("localhost:9092,localhost:9093");\nawait producer.connect();\n\nconst payload = Buffer.from("Hello from TypeScript!");\nconst res = await producer.send("ts-topic", payload);\nconsole.log(\`Sent at offset \${res.offset}\`);`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">TypeScript Consumer</h2>
      <CodeBlock 
        language="typescript"
        code={`import { DRMQConsumer } from './client';\n\nconst consumer = new DRMQConsumer("localhost:9092,localhost:9093", "ts-workers");\nconsumer.autoCommit = true;\nawait consumer.connect();\nawait consumer.subscribe("ts-topic");\n\n// Long-poll the broker for new messages\nconst messages = await consumer.poll(10, 5000);\nfor (const msg of messages) {\n  console.log(\`Received: \${Buffer.from(msg.payload).toString('utf-8')}\`);\n}`}
      />
    </div>
  );
}
