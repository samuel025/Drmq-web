import { CodeBlock } from '../components/CodeBlock';

export function DeliveryGuarantees() {
  return (
    <div>
      <div className="inline-block text-xs font-mono tracking-widest text-cyan-500 border border-cyan-500/30 bg-cyan-500/10 rounded px-3 py-1 mb-4">
        DELIVERY GUARANTEES
      </div>
      <h1 className="text-4xl font-bold text-white mb-6">Commits, NACKs, and DLQs</h1>
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        DRMQ provides <strong>at-least-once delivery</strong> for consumers operating in group mode. The broker guarantees that every acknowledged message will reach a consumer in the group at least one time, but it does not eliminate the possibility of a message arriving more than once.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">At-Least-Once Delivery</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        A duplicate delivery happens when:
      </p>
      <ol className="list-decimal list-inside text-slate-300 space-y-2 mb-8 ml-2">
        <li>The broker dispatches a message and the consumer begins processing it.</li>
        <li>The consumer crashes (or its network drops) before calling <code>commit()</code>.</li>
        <li>The broker's lease for that message expires and it requeues the message.</li>
        <li>Another consumer polls and receives it again.</li>
      </ol>
      <p className="text-slate-300 mb-8 leading-relaxed">
        The solution is to write <strong>idempotent</strong> consumers.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">How `commit()` Prevents Redelivery</h2>
      <CodeBlock 
        language="java"
        code={`for (DRMQConsumer.ConsumedMessage msg : messages) {\n    // 1. Do your work\n    persistToDatabase(msg);\n\n    // 2. Only commit after the work succeeds\n    consumer.commit("payments", msg.offset() + 1);\n}`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">NACK and Dead-Letter Queues</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        If a message cannot be processed, call <code>consumer.nack(topic, offset)</code> to explicitly reject it. Once the delivery count reaches the <code>maxDeliveries</code> threshold (default: 5), the broker routes the message to a Dead-Letter Queue (DLQ).
      </p>
      <CodeBlock 
        language="java"
        code={`try {\n    processOrder(msg);\n    consumer.commit("orders", msg.offset() + 1);\n} catch (UnprocessableMessageException e) {\n    boolean routedToDlq = consumer.nack("orders", msg.offset());\n    if (routedToDlq) {\n        alertOncall("Poison pill sent to DLQ");\n    }\n}`}
      />

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Ordering Guarantee</h2>
      <p className="text-slate-300 mb-8 leading-relaxed">
        Messages within a single topic are strictly ordered by offset. The broker assigns offsets sequentially and atomically. There is no out-of-order delivery within a topic.
      </p>
    </div>
  );
}
