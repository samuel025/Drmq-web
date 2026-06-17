import React from 'react';
import { CodeBlock } from '../components/CodeBlock';

export function PythonClient() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-6">Python Client (SDK)</h1>
      
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        Because DRMQ relies entirely on raw TCP framing and Google Protocol Buffers, 
        building clients in other languages is incredibly easy. A native Python SDK is 
        available in the <code>drmq-python-client</code> directory. 
        The SDK natively handles automatic leader failovers, transparent retries, and offset auto-committing.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Python Producer</h2>
      <CodeBlock 
        language="python"
        code={`from drmq_client import DRMQProducer\n\nproducer = DRMQProducer("localhost:9092,localhost:9093")\nproducer.connect()\n\n# The payload must be bytes\nres = producer.send("python-topic", b"Hello from Python!")\nif res.success:\n    print(f"Message sent successfully at offset {res.offset}")\nelse:\n    print(f"Failed: {res.error_message}")`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Python Consumer</h2>
      <CodeBlock 
        language="python"
        code={`from drmq_client import DRMQConsumer\n\nconsumer = DRMQConsumer("localhost:9092,localhost:9093", group_id="python-workers")\nconsumer.auto_commit = True\nconsumer.connect()\nconsumer.subscribe("python-topic")\n\n# Long-poll the broker for new messages\nmessages = consumer.poll(max_messages=10, timeout_ms=5000)\nfor msg in messages:\n    print(f"Received (offset {msg.offset}): {msg.payload.decode('utf-8')}")`}
      />
    </div>
  );
}
