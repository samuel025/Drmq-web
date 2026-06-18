import { CodeBlock } from '../components/CodeBlock';

export function PythonClient() {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Python SDK</h1>
      
      <p className="text-base md:text-lg text-slate-300 mb-8 leading-relaxed">
        Because DRMQ relies entirely on raw TCP framing and Google Protocol Buffers, 
        building clients in other languages is incredibly easy. A native Python SDK is 
        available in the <code>drmq-python-client</code> directory. 
        The SDK natively handles automatic leader failovers, transparent retries, and offset auto-committing.
      </p>

      <h2 className="text-xl md:text-2xl font-semibold text-slate-100 mb-4 mt-10">Installation</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        The Python SDK requires Python 3.8+ and the <code>protobuf</code> package. 
        You can install the SDK locally from the repository root:
      </p>
      <CodeBlock 
        language="bash"
        code={`cd drmq-python-client\npip install .`}
      />

      <h2 className="text-xl md:text-2xl font-semibold text-slate-100 mb-4 mt-10">Producer: Sending Messages</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        The Producer connects to a random bootstrap server and automatically redirects to the Raft Leader. 
        It supports sending raw bytes, strings, and optional keys.
      </p>
      <CodeBlock 
        language="python"
        code={`from drmq_client import DRMQProducer\n\n# Initialize with a comma-separated list of bootstrap servers\nproducer = DRMQProducer("localhost:9092,localhost:9093")\nproducer.connect()\n\n# 1. Send a simple string (implicitly encoded to bytes)\nres1 = producer.send("python-topic", b"Hello from Python!")\nif res1.success:\n    print(f"Message sent successfully at offset {res1.offset}")\n\n# 2. Send JSON payload with a routing key\nimport json\ndata = json.dumps({"user": "alice", "action": "login"}).encode('utf-8')\nres2 = producer.send("events", payload=data, key="alice")`}
      />

      <h2 className="text-xl md:text-2xl font-semibold text-slate-100 mb-4 mt-10">Consumer: Group Mode (At-Least-Once)</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        For production workloads, you should use Group Mode with Manual Commits to guarantee "At-Least-Once" processing.
        If your script crashes before calling <code>commit()</code>, the broker will redeliver the messages to another consumer after 30 seconds.
      </p>
      <CodeBlock 
        language="python"
        code={`from drmq_client import DRMQConsumer\n\n# Join a consumer group for broker-side load balancing\nconsumer = DRMQConsumer("localhost:9092", group_id="analytics-workers")\n\n# Disable auto-commit for strict at-least-once guarantees\nconsumer.auto_commit = False\nconsumer.connect()\nconsumer.subscribe("events")\n\nwhile True:\n    # Long-poll the broker for new messages (waits up to 5 seconds if queue is empty)\n    messages = consumer.poll(max_messages=50, timeout_ms=5000)\n    \n    for msg in messages:\n        # 1. Process the message\n        process_event(msg.payload.decode('utf-8'))\n        \n    # 2. Only commit after successful processing\n    if messages:\n        last_offset = messages[-1].offset\n        consumer.commit("events", last_offset)\n        print(f"Committed up to offset {last_offset}")`}
      />

      <h2 className="text-xl md:text-2xl font-semibold text-slate-100 mb-4 mt-10">Consumer: Single Mode (No Group)</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        If you want to read messages starting from a specific point without the broker tracking your state, 
        you can use Single Mode. The SDK automatically sets <code>group_mode = False</code> under the hood if you instantiate it without a <code>group_id</code>.
      </p>
      <CodeBlock 
        language="python"
        code={`# Instantiate without a group_id (automatically sets group_mode=False)\nconsumer = DRMQConsumer("localhost:9092")\nconsumer.connect()\n\n# Explicitly seek to offset 100\nconsumer.subscribe("events", from_offset=100)\n\nmessages = consumer.poll(max_messages=10)\nfor msg in messages:\n    print(f"Replaying message at {msg.offset}: {msg.payload}")`}
      />

      <h2 className="text-xl md:text-2xl font-semibold text-slate-100 mb-4 mt-10">The Fan-Out Pattern (Multiple Groups)</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        If you want to broadcast the exact same messages to different independent downstream systems, simply use different group names. The broker maintains separate offset pointers for every distinct group.
      </p>
      <CodeBlock 
        language="python"
        code={`# Service A will process all messages independently\nemail_service = DRMQConsumer("localhost:9092", group_id="email-senders")\nemail_service.subscribe("user-signups")\n\n# Service B will ALSO process the exact same messages independently\nanalytics_service = DRMQConsumer("localhost:9092", group_id="analytics-indexers")\nanalytics_service.subscribe("user-signups")`}
      />

    </div>
  );
}
