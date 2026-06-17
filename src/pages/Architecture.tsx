import React from 'react';

export function Architecture() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-6">Architecture</h1>
      
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        DRMQ is structured in three independent layers that interact through well-defined internal
        interfaces. Understanding these boundaries is critical for operational and debugging work.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mb-6">The Three Layers</h2>
      <div className="space-y-4 mb-12">
        <div className="border border-cyan-500/20 bg-cyan-500/5 rounded-lg p-6">
          <div className="text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wider">Protocol Layer</div>
          <p className="text-slate-300 leading-relaxed">
            All client and peer communication uses a single Netty-based TCP server. Messages are 
            framed with a 4-byte length prefix and encoded as Protobuf binary. Client requests 
            (ProduceRequest, ConsumeRequest, CommitOffsetRequest) and Raft RPCs 
            (AppendEntries, RequestVote, InstallSnapshot) share the same transport. The Netty 
            LengthFieldBasedFrameDecoder is configured with a 256MB maximum frame size to 
            accommodate large snapshots.
          </p>
        </div>

        <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-6">
          <div className="text-sm font-bold text-emerald-400 mb-3 uppercase tracking-wider">Consensus Layer</div>
          <p className="text-slate-300 leading-relaxed">
            RaftNode implements the full Raft protocol: leader election with Pre-Vote, log 
            replication with batched AppendEntries (capped at MAX_ENTRIES_PER_RPC = 500 entries), 
            InstallSnapshot for severely lagging followers, and durable persistence of currentTerm, 
            votedFor, commitIndex, and lastApplied across restarts. The consensus layer is the 
            gatekeeper — no write reaches the storage layer without first being committed by a quorum.
          </p>
        </div>

        <div className="border border-purple-500/20 bg-purple-500/5 rounded-lg p-6">
          <div className="text-sm font-bold text-purple-400 mb-3 uppercase tracking-wider">Storage Layer</div>
          <p className="text-slate-300 leading-relaxed">
            MessageStore manages the on-disk topic data using a segmented, append-only log. 
            Each topic is a directory of .log files (100MB each) with corresponding .idx sparse 
            index files. The RaftLog itself uses a separate binary-encoded file to persist Raft 
            log entries. Consumer group offsets are also persisted inside the Raft log as 
            CommitOffsetCommand entries, giving them the same durability guarantee as messages.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mb-6">Request Lifecycle: Producer Write</h2>
      <div className="space-y-0 mb-8 relative">
        <div className="absolute top-0 bottom-0 left-[15px] w-px bg-slate-800 z-0 hidden sm:block" />
        
        {[
          { step: '1', actor: 'Client', bg: 'bg-slate-800/80', border: 'border-slate-700', desc: 'Sends a ProduceRequest (topic + payload bytes) over TCP to any broker node.' },
          { step: '2', actor: 'Broker — not leader', bg: 'bg-[#1E293B]', border: 'border-slate-700/50', desc: 'If the receiving broker is a follower, it immediately responds NOT_LEADER:<addr>. The client SDK transparently redirects to the leader.' },
          { step: '3', actor: 'Leader — RaftNode', bg: 'bg-cyan-900/20', border: 'border-cyan-800/50', desc: 'Appends the entry to its local RaftLog, then fires parallel AppendEntries RPCs to all followers. The request is held open.' },
          { step: '4', actor: 'Followers — RaftNode', bg: 'bg-[#1E293B]', border: 'border-slate-700/50', desc: 'Each follower writes the entry to its local log and replies AppendEntriesResponse(success=true).' },
          { step: '5', actor: 'Leader — Quorum reached', bg: 'bg-cyan-900/20', border: 'border-cyan-800/50', desc: 'Once a majority of nodes have acknowledged, the Leader advances its commitIndex, applies the entry to the MessageStore, and assigns a monotonically increasing global offset.' },
          { step: '6', actor: 'Client', bg: 'bg-emerald-900/20', border: 'border-emerald-800/50', desc: 'Receives ProduceResponse(success=true, offset=N). The message is now durable and visible to consumers.' },
        ].map(({ step, actor, bg, border, desc }) => (
          <div key={step} className="flex gap-4 relative z-10 mb-4 group">
            <div className="flex flex-col items-center shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-cyan-500 transition-colors flex items-center justify-center text-xs font-bold text-slate-300 group-hover:text-cyan-400">
                {step}
              </div>
            </div>
            <div className={`flex-1 rounded-lg border ${border} ${bg} p-5 shadow-sm transition-all hover:shadow-md`}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                <div className="w-2 h-2 rounded-full bg-slate-500 mr-2" />
                {actor}
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
