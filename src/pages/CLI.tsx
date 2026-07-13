import { CodeBlock } from '../components/CodeBlock';

export function CLI() {
  return (
    <div>
      <div className="inline-block text-xs font-mono tracking-widest text-cyan-500 border border-cyan-500/30 bg-cyan-500/10 rounded px-3 py-1 mb-4">
        FEATURES
      </div>
      <h1 className="text-4xl font-bold text-white mb-6">Interactive CLI</h1>
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        DRMQ ships with two interactive command-line applications — a producer CLI and a consumer CLI — that let you interact with a running broker without writing any application code.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Producer CLI</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        The producer CLI lets you send messages to any topic interactively.
      </p>
      <CodeBlock 
        language="bash"
        code={`cd drmq-client\nmvn exec:java -Dexec.mainClass="com.drmq.client.commandLineExample.ProducerApp" \\\n  -Dexec.args="localhost:9092,localhost:9093"`}
      />
      <p className="text-slate-300 mt-4 mb-4 leading-relaxed">Once connected, use the <code>send</code> command:</p>
      <CodeBlock 
        language="text"
        code={`producer> send orders Book Order #101\n✓ Sent to [orders] at offset 4\n\nproducer> help\nproducer> exit`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Consumer CLI</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        The consumer CLI lets you subscribe to topics, fetch messages, commit offsets, and switch consumption modes.
      </p>
      <CodeBlock 
        language="bash"
        code={`cd drmq-client\nmvn exec:java -Dexec.mainClass="com.drmq.client.commandLineExample.ConsumerApp" \\\n  -Dexec.args="localhost:9092,localhost:9093 my-consumer-group"`}
      />
      
      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Commands</h3>
      <ul className="list-disc list-inside text-slate-300 space-y-4 mb-8 ml-2">
        <li><strong><code>subscribe &lt;topic&gt; [offset]</code>:</strong> Subscribe to a topic.</li>
        <li><strong><code>seektime &lt;topic&gt; &lt;timestamp&gt;</code>:</strong> Seek to a specific date/time (accepts Unix ms or ISO-8601).</li>
        <li><strong><code>poll [max] [timeout_ms]</code>:</strong> Fetch one batch of messages from all subscribed topics.</li>
        <li><strong><code>stream [timeout_ms]</code>:</strong> Enter continuous streaming mode.</li>
        <li><strong><code>commit &lt;topic&gt; [offset]</code>:</strong> Commit the current offset.</li>
        <li><strong><code>autocommit on|off</code>:</strong> Enable or disable automatic offset commits.</li>
        <li><strong><code>mode group|single</code>:</strong> Switch between consumption modes at runtime.</li>
        <li><strong><code>status</code>:</strong> Print the current consumer state.</li>
      </ul>

      <CodeBlock 
        language="text"
        code={`consumer[my-consumer-group]> subscribe orders\nconsumer[my-consumer-group]> seektime orders 2026-07-13T10:30:00Z\nconsumer[my-consumer-group]> stream\n📡 Streaming... (press Ctrl+C to stop) [auto-commit=off]`}
      />
    </div>
  );
}
