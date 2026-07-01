export function Groups() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-6">Consumer Coordination & Commits</h1>
      
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        DRMQ provides extremely flexible message consumption by supporting two completely different paradigms: <strong>Single Mode</strong> and <strong>Group Mode</strong>. Understanding the difference between these modes, and exactly how the concept of "Committing" works, is fundamental to using DRMQ effectively in a production system.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mb-6 mt-10">Single Mode vs. Group Mode</h2>
      
      <div className="space-y-6 mb-10">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-400 mb-3">Single Mode (Manual Control)</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            In Single Mode, the consumer acts entirely independently. The broker <strong>does not</strong> track what this consumer has read, it <strong>does not</strong> coordinate it with other consumers, and it <strong>does not</strong> prevent multiple single-mode consumers from reading the exact same messages.
          </p>
          <ul className="list-disc pl-5 text-slate-300 space-y-2 mb-4">
            <li><strong>Offset Tracking:</strong> You are 100% responsible for keeping track of your own offsets (e.g., saving them in a local file or an external database like PostgreSQL).</li>
            <li><strong>Replayability:</strong> Because the broker doesn't track state, you can subscribe to any offset at any time. This makes Single Mode perfect for "time-traveling" through the log, re-indexing databases, or debugging.</li>
            <li><strong>No Commits:</strong> The concept of "committing" does not exist in Single Mode. The broker simply streams messages starting from whatever offset you ask for.</li>
          </ul>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-400 mb-3">Group Mode (Broker Coordinated)</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            In Group Mode, multiple consumers share a single "Group ID". The broker acts as a central coordinator, ensuring that <strong>every message in the topic is delivered to exactly one active consumer in the group</strong>. This allows you to effortlessly scale out your processing power.
          </p>
          <ul className="list-disc pl-5 text-slate-300 space-y-2 mb-4">
            <li><strong>No Partitions Needed:</strong> Unlike Kafka, which requires physical partitions to scale consumers, DRMQ dynamically load-balances a single linear topic across as many consumers as you want.</li>
            <li><strong>Broker Tracking:</strong> The broker permanently remembers the "Current Offset" for the group, so when a new consumer joins or an old one crashes, consumption resumes exactly where the group left off.</li>
            <li><strong>Leases & Commits:</strong> To achieve load-balancing without partitions, DRMQ uses a sophisticated Lease and Commit system to guarantee reliable delivery even if a consumer suddenly loses power.</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mb-6 mt-10">What is a "Commit"?</h2>
      <p className="text-slate-300 mb-6 leading-relaxed">
        A <strong>Commit</strong> is simply an acknowledgment sent from the consumer to the broker saying: <em>"I have successfully finished processing this message. You can permanently mark it as done for my group, and you never need to send it to us again."</em>
      </p>
      
      <p className="text-slate-300 mb-6 leading-relaxed">
        When a commit is received by the broker, DRMQ generates an internal <code>CommitOffsetCommand</code>. This command is actually appended to the <strong>Raft consensus log</strong> and replicated across the entire cluster of brokers! This means that consumer offsets are just as durable and fault-tolerant as the messages themselves. If the leader broker crashes, the new leader replays the Raft log and instantly knows exactly which messages your group has committed.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mb-6 mt-10">How Leases Prevent Data Loss</h2>
      <p className="text-slate-300 mb-6 leading-relaxed">
        But what happens between the time the broker sends a message to a consumer, and the time the consumer sends a "Commit" back? What if the consumer crashes right in the middle of processing? This is where <strong>Leases</strong> come in.
      </p>

      <div className="space-y-0 mb-10 relative">
        <div className="absolute top-0 bottom-0 left-[15px] w-px bg-slate-800 z-0 hidden sm:block" />
        
        {[
          { step: '1', title: 'Poll Request', desc: 'A consumer in the group requests a batch of messages.' },
          { step: '2', title: 'Lease Grant (In-Flight)', desc: 'The broker identifies the next uncommitted messages. Instead of marking them "done", it grants a temporary 30-second lease to that specific consumer. The messages are now "In-Flight".' },
          { step: '3', title: 'Exclusivity', desc: 'While the lease is active, if another consumer in the same group asks for messages, the broker will skip over the leased messages and hand out the next available ones.' },
          { step: '4', title: 'The Crossroads (Commit vs. Expire)', desc: 'If the consumer finishes processing and sends a Commit within 30 seconds, the lease is destroyed and the messages are permanently marked completed. However, if the consumer crashes and the 30 seconds expire, the broker instantly revokes the lease and makes those exact messages available to the next polling consumer in the group!' },
        ].map(({ step, title, desc }) => (
          <div key={step} className="flex gap-4 relative z-10 mb-4 group">
            <div className="flex flex-col items-center shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-emerald-500 transition-colors flex items-center justify-center text-xs font-bold text-slate-300 group-hover:text-emerald-400">
                {step}
              </div>
            </div>
            <div className="flex-1 rounded-lg border border-slate-700/50 bg-slate-800/40 p-5 shadow-sm transition-all hover:shadow-md">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center">
                {title}
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mb-6 mt-10">Auto-Commit vs. Manual Commit</h2>
      <p className="text-slate-300 mb-6 leading-relaxed">
        DRMQ allows you to choose exactly how and when commits happen, which directly dictates your data delivery semantics:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-5">
          <h4 className="text-lg font-semibold text-white mb-2">Auto-Commit (At-Most-Once)</h4>
          <p className="text-slate-300 text-sm leading-relaxed mb-3">
            When auto-commit is enabled, the client library automatically sends a commit to the broker the moment the messages are received, <strong>before</strong> your code has actually processed them.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed italic">
            Use case: Fast processing where losing a few messages during a crash is acceptable (e.g., live metrics, sensor data).
          </p>
        </div>

        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-5">
          <h4 className="text-lg font-semibold text-white mb-2">Manual Commit (At-Least-Once)</h4>
          <p className="text-slate-300 text-sm leading-relaxed mb-3">
            When auto-commit is disabled (the default), you must explicitly call <code>consumer.commit()</code> <strong>after</strong> you have successfully processed the data (e.g., saved it to a database).
          </p>
          <p className="text-slate-400 text-sm leading-relaxed italic">
            Use case: Mission-critical data where dropping a message is unacceptable (e.g., financial transactions, order processing).
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mb-6 mt-10">Dead-Letter Queues (DLQ)</h2>
      <p className="text-slate-300 mb-6 leading-relaxed">
        Because DRMQ guarantees at-least-once delivery with manual commits, a "poison pill" message (e.g., malformed JSON that always throws an exception) could cause an infinite loop of crashes and redeliveries, permanently blocking the consumer group. DRMQ solves this elegantly using a built-in <strong>Dead-Letter Queue (DLQ)</strong> mechanism.
      </p>

      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 mb-10">
        <h3 className="text-xl font-bold text-rose-400 mb-4">How DLQ Routing Works</h3>
        <ul className="list-disc pl-5 text-slate-300 space-y-3">
          <li>
            <strong className="text-white">Delivery Tracking:</strong> The broker tracks the number of times each specific message offset fails (either via lease expiration or an explicit <code>NACK</code> from the consumer).
          </li>
          <li>
            <strong className="text-white">Threshold Reached:</strong> Once a message reaches the <code>max-deliveries</code> threshold (default: 5), the broker intervenes.
          </li>
          <li>
            <strong className="text-white">Automatic Routing:</strong> The broker automatically reads the poison pill message from the active topic and produces it into a new, isolated DLQ topic (e.g., <code>dlq.payments.orders</code>).
          </li>
          <li>
            <strong className="text-white">Group Advancement:</strong> The broker then artificially commits the bad offset for your group. Your consumers instantly advance to the next healthy message, and the poison pill is safely isolated for manual debugging.
          </li>
        </ul>
      </div>

    </div>
  );
}
