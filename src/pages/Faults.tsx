
export function Faults() {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Fault Tolerance</h1>
      
      <p className="text-base md:text-lg text-slate-300 mb-8 leading-relaxed">
        DRMQ is built to survive failures gracefully. The following scenarios describe how the cluster 
        behaves under duress.
      </p>

      <div className="grid grid-cols-1 gap-6 mb-12">
        {[
          ['Follower Crash', 'The cluster continues operating normally. The Leader logs warnings that the follower is unreachable. When the follower restarts, the Leader automatically sends it the missing entries.', 'border-cyan-500/30', 'bg-cyan-500/5'],
          ['Leader Crash', 'Write operations temporarily block. Within 150-300ms, the remaining nodes notice the lack of heartbeats. One initiates an election, wins a quorum, and becomes the new Leader. Clients transparently reconnect.', 'border-amber-500/30', 'bg-amber-500/5'],
          ['Minority Network Partition', 'If 1 node in a 3-node cluster loses network access, the other 2 nodes form a quorum and continue processing. The isolated node cannot elect itself (it cannot reach a quorum) and refuses writes. When the partition heals, the Pre-Vote mechanism prevents the isolated node from disrupting the active Leader.', 'border-emerald-500/30', 'bg-emerald-500/5'],
          ['Majority Network Partition', 'If 2 out of 3 nodes crash, the remaining node steps down to FOLLOWER. All produce requests will fail (or block, depending on client configuration) because a quorum cannot be reached to commit writes. This guarantees consistency over availability (CP system).', 'border-rose-500/30', 'bg-rose-500/5'],
        ].map(([scenario, result, borderCol, bgCol]) => (
          <div key={scenario} className={`border ${borderCol} ${bgCol} rounded-lg p-6 shadow-sm`}>
            <h3 className="text-base md:text-lg font-semibold text-white mb-3">{scenario}</h3>
            <p className="text-slate-300 leading-relaxed">{result}</p>
          </div>
        ))}
      </div>
      
      <h2 className="text-xl md:text-2xl font-semibold text-slate-100 mb-4 mt-10">Persistence Across Restarts</h2>
      <p className="text-slate-300 mb-6 leading-relaxed">
        The following state is written to disk before any RPC response is sent, ensuring correctness
        after a crash:
      </p>

      <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-8 bg-slate-800/40">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/80 text-white border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold w-40 uppercase tracking-wider text-xs text-slate-400">Field</th>
              <th className="px-6 py-4 font-semibold w-48 uppercase tracking-wider text-xs text-slate-400">Location</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-slate-400">Why it must survive a crash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {[
              ['currentTerm',  'raft/state.properties', 'Prevents a restarted node from accepting RPCs from a leader in an older term.'],
              ['votedFor',     'raft/state.properties', 'Ensures a node never grants two votes in the same term (Safety Property).'],
              ['log entries',  'raft/raft.log',         'The source of truth for uncommitted writes. Entries committed but not yet snapshotted must survive to be re-applied.'],
              ['lastApplied',  'raft/state.properties', 'Restored on restart and used to reconstruct commitIndex. Also used to set RaftLog.startIndex if the live log is empty after a snapshot.'],
            ].map(([field, loc, why]) => (
              <tr key={field} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-6 py-4 font-mono text-cyan-400 font-semibold align-top">{field}</td>
                <td className="px-6 py-4 text-slate-400 align-top font-mono text-xs">{loc}</td>
                <td className="px-6 py-4 text-slate-300 leading-relaxed align-top">{why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
