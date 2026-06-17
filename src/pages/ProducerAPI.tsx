import React from 'react';
import { CodeBlock } from '../components/CodeBlock';

export function ProducerAPI() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-6">Producer API</h1>
      
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        The <code>DRMQProducer</code> is a thread-safe client for sending messages to the cluster.
        It uses synchronous sends with an underlying blocking TCP socket, meaning <code>send()</code>
        blocks until the message is either acknowledged by a Raft quorum or an unrecoverable error occurs.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Initialisation and Failover</h2>
      <p className="text-slate-300 mb-4">
        Producers should be initialised with a list of bootstrap servers. The producer connects to a random
        server from the list. If it connects to a Follower, the Follower immediately responds with a
        <code>NOT_LEADER</code> error containing the current Leader's address.
        The producer transparently redirects to the Leader. If the Leader crashes, the producer will
        cycle through the bootstrap servers, waiting for a new Leader to be elected.
      </p>
      <CodeBlock 
        language="java"
        code={`import com.drmq.client.DRMQProducer;\n\n// Initialize with a comma-separated list of bootstrap servers\nDRMQProducer producer = new DRMQProducer("10.0.1.10:9092,10.0.1.11:9092,10.0.1.12:9092");\n\n// Connect to the cluster\nproducer.connect();`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Sending Messages</h2>
      <p className="text-slate-300 mb-4">
        Messages can be sent as raw byte arrays or as UTF-8 strings. You can optionally attach a key
        to the message (useful for downstream grouping/partitioning logic, though DRMQ enforces global
        ordering regardless of the key).
      </p>
      <CodeBlock 
        language="java"
        code={`// Send a simple string payload\nDRMQProducer.SendResult result = producer.send("orders", "Order #1234");\n\nif (result.isSuccess()) {\n    System.out.println("Message committed at offset: " + result.getOffset());\n} else {\n    System.err.println("Failed to send: " + result.getErrorMessage());\n}\n\n// Send raw bytes with an optional key\nbyte[] payload = serialize(myObject);\nDRMQProducer.SendResult result = producer.send("metrics", payload, "sensor-01");`}
      />
      
      <div className="border-l-4 border-yellow-500 bg-yellow-500/10 rounded-r-lg p-5 my-8">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-400 uppercase tracking-wide mb-1">Retry Behavior</h3>
            <div className="text-sm text-yellow-200/80 leading-relaxed">
              The <code>send()</code> method automatically retries up to{' '}
              <code>MAX_RETRIES = 5</code> times across the bootstrap servers
              if connection errors or leader elections occur during the send. It only throws an{' '}
              <code>IOException</code> if all retries are exhausted.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
