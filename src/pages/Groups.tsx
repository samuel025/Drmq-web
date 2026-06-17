import React from 'react';

export function Groups() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-6">Consumer Groups</h1>
      
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        DRMQ uses a server-coordinated consumer group model to provide exact load-balancing without the
        need for complex client-side partition rebalancing protocols or external coordination systems.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mb-6 mt-10">Lease-based Coordination</h2>
      <p className="text-slate-300 mb-6 leading-relaxed">
        Because DRMQ has no partitions (every topic is a single linear log), multiple consumers in a group
        cannot simply lock different partitions. Instead, DRMQ uses a <strong>message-level lease system</strong>:
      </p>

      <div className="space-y-0 mb-10 relative">
        <div className="absolute top-0 bottom-0 left-[15px] w-px bg-slate-800 z-0 hidden sm:block" />
        
        {[
          { step: '1', title: 'Poll Request', desc: 'A consumer in the group requests a batch of messages.' },
          { step: '2', title: 'Lease Grant', desc: 'The broker identifies the next uncommitted, unleased offset. It grants a 30-second lease to the consumer for a batch of messages.' },
          { step: '3', title: 'Processing', desc: 'While the lease is active, no other consumer in the group will be handed those specific offsets.' },
          { step: '4', title: 'Commit or Expire', desc: 'If the consumer commits the offsets within the timeout, the broker marks them permanently processed. If the lease expires or the client disconnects, the broker invalidates the lease and makes the messages available to the next polling consumer.' },
        ].map(({ step, title, desc }) => (
          <div key={step} className="flex gap-4 relative z-10 mb-4 group">
            <div className="flex flex-col items-center shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-cyan-500 transition-colors flex items-center justify-center text-xs font-bold text-slate-300 group-hover:text-cyan-400">
                {step}
              </div>
            </div>
            <div className="flex-1 rounded-lg border border-slate-700/50 bg-slate-800/40 p-5 shadow-sm transition-all hover:shadow-md">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2 flex items-center">
                {title}
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Offset Durability</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Consumer group offsets must be as resilient as the messages themselves. When a consumer commits
        an offset, the broker generates an internal <code>CommitOffsetCommand</code>.
      </p>
      <div className="bg-emerald-900/10 border border-emerald-800/30 rounded-lg p-5">
        <p className="text-emerald-200/80 text-sm leading-relaxed">
          This command is appended to the <strong>Raft log</strong> and replicated across the quorum just
          like a standard producer message. If the Leader crashes, the new Leader replays the Raft log
          to reconstruct the exact state of all consumer groups, ensuring no leases or commits are lost.
        </p>
      </div>
    </div>
  );
}
