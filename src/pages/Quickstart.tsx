import { CodeBlock } from '../components/CodeBlock';

export function Quickstart() {
  return (
    <div>
      <div className="inline-block text-xs font-mono tracking-widest text-cyan-500 border border-cyan-500/30 bg-cyan-500/10 rounded px-3 py-1 mb-4">
        QUICKSTART
      </div>
      <h1 className="text-4xl font-bold text-white mb-6">Send Your First Message</h1>
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        This guide walks you through getting a DRMQ broker running on your machine and exchanging your first message end-to-end. You'll clone the repository, build all modules with Maven, start a single-node broker, and use <code>DRMQProducer</code> and <code>DRMQConsumer</code> to produce and consume a message. The whole process takes less than five minutes.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">1. Check Prerequisites</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Confirm you have the required tools installed before you begin.
      </p>
      <ul className="list-disc list-inside text-slate-300 space-y-2 mb-8 ml-2">
        <li><strong>Java (JDK):</strong> Minimum version 17</li>
        <li><strong>Apache Maven:</strong> Minimum version 3.8.x</li>
      </ul>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">2. Clone and Build</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Clone the repository and run a full build from the root directory.
      </p>
      <CodeBlock 
        language="bash"
        code={`git clone https://github.com/samuel025/DRMQ.git\ncd DRMQ\nmvn clean install`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">3. Start the Broker</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Start a single-node broker on port <code>9092</code>. The <code>--data-dir</code> flag tells the broker where to persist its Write-Ahead Log segments.
      </p>
      <CodeBlock 
        language="bash"
        code={`./mvnw -pl drmq-broker exec:java -Dexec.args="--port 9092 --data-dir ./data-1"`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">4. Send a Message</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Add <code>drmq-client</code> as a dependency in your project's <code>pom.xml</code>, then use <code>DRMQProducer</code> to publish a message.
      </p>
      <CodeBlock 
        language="java"
        code={`import com.drmq.client.DRMQProducer;\n\ntry (DRMQProducer producer = new DRMQProducer("localhost:9092")) {\n    producer.connect();\n    DRMQProducer.SendResult result = producer.send("my-topic", "Hello, DRMQ!");\n    if (result.isSuccess()) {\n        System.out.println("Message sent at offset " + result.getOffset());\n    }\n} catch (Exception e) {\n    e.printStackTrace();\n}`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">5. Consume a Message</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Use <code>DRMQConsumer</code> to read the message you just sent.
      </p>
      <CodeBlock 
        language="java"
        code={`import com.drmq.client.DRMQConsumer;\nimport java.util.List;\n\ntry (DRMQConsumer consumer = new DRMQConsumer("localhost:9092", "my-group")) {\n    consumer.setAutoCommit(true);\n    consumer.connect();\n    consumer.subscribe("my-topic");\n\n    while (true) {\n        List<DRMQConsumer.ConsumedMessage> messages = consumer.poll(100, 1000);\n        for (DRMQConsumer.ConsumedMessage msg : messages) {\n            System.out.printf("Received (offset %d): %s\\n", msg.offset(), msg.payloadAsString());\n        }\n    }\n} catch (Exception e) {\n    e.printStackTrace();\n}`}
      />
    </div>
  );
}
