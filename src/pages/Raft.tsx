export function Raft() {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Raft Consensus</h1>
      
      <p className="text-base md:text-lg text-slate-300 mb-8 leading-relaxed">
        DRMQ implements the Raft consensus algorithm as described in the original{' '}
        <em>In Search of an Understandable Consensus Algorithm</em> paper (Ongaro &amp; Ousterhout, 2014),
        extended with the Pre-Vote mechanism from the follow-up dissertation.
      </p>

      <h2 className="text-xl md:text-2xl font-semibold text-slate-100 mb-6 mt-10">Node States</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border border-slate-700/50 bg-slate-800/40 rounded-lg p-5">
          <div className="text-xs font-bold tracking-widest text-slate-400 mb-2">FOLLOWER</div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Default state on startup. Passively replicates entries from the leader. Runs an election timer; if no heartbeat is received before timeout, transitions to Pre-Candidate.
          </p>
        </div>
        <div className="border border-amber-500/20 bg-amber-500/10 rounded-lg p-5">
          <div className="text-xs font-bold tracking-widest text-amber-400 mb-2">CANDIDATE</div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Actively seeking votes. Sends RequestVote RPCs to all peers. Transitions to LEADER on quorum, or back to FOLLOWER if a higher term is observed.
          </p>
        </div>
        <div className="border border-cyan-500/20 bg-cyan-500/10 rounded-lg p-5">
          <div className="text-xs font-bold tracking-widest text-cyan-400 mb-2">LEADER</div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Accepts all write requests. Broadcasts AppendEntries RPCs on every heartbeat interval and immediately after a new log entry is appended. There is exactly one leader per term.
          </p>
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-semibold text-slate-100 mb-4 mt-10">Leader Election & Pre-Vote</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        A standard Raft follower increments its term and requests votes the moment its election
        timer fires. This is safe but can cause unnecessary term inflation when a partitioned node
        reconnects — it may have a term far ahead of the cluster, forcing a brief but disruptive
        leader re-election even though it has stale log data.
      </p>
      <p className="text-slate-300 mb-8 leading-relaxed">
        DRMQ uses the <strong className="text-white">Pre-Vote</strong> extension to prevent this.
        When a follower's timer expires it sends a <code>PreVoteRequest</code> without incrementing its
        term. A peer grants a pre-vote only if the requester's log is at least as up-to-date
        as the peer's own log. Only after receiving pre-votes from a majority does the node
        increment its term and send real <code>RequestVote</code> RPCs. A lagging node that
        has missed thousands of entries will be denied pre-votes and remain a follower, silently
        catching up without disrupting the cluster.
      </p>

      <h2 className="text-xl md:text-2xl font-semibold text-slate-100 mb-4 mt-10">Quorum-Loss Stepdown (Split-Brain Prevention)</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        What happens if the current leader is suddenly separated from the rest of the cluster by a network partition, but it doesn't crash? In standard Raft, it might continue acting as the leader indefinitely, endlessly accepting client requests that it can never commit. This leads to "ghost leadership" and stalled clients.
      </p>
      <div className="bg-red-900/10 border border-red-800/30 rounded-lg p-5 mb-8">
        <p className="text-red-200/80 text-sm leading-relaxed">
          DRMQ proactively guards against this with a strictly timed <strong>Quorum-Loss Stepdown</strong>. The leader runs a background monitor that constantly checks the age of the last successful heartbeat acknowledgment from every peer. If the leader realizes that an entire election window (e.g., 900ms) has passed without communicating with a majority of the cluster, it voluntarily demotes itself back to <code>FOLLOWER</code> and instantly fails any pending client requests to prevent data loss.
        </p>
      </div>

      <h2 className="text-xl md:text-2xl font-semibold text-slate-100 mb-4 mt-10">Log Compaction & Snapshots</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        The Raft log grows continuously as messages are appended. To prevent unbounded disk usage,
        DRMQ compacts the <code>RaftLog</code> by truncating entries that have already been applied 
        to the <code>MessageStore</code>.
      </p>
      
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 my-6">
        <h3 className="font-semibold text-white mb-2">Zero-Downtime Snapshot Installation</h3>
        <p className="text-slate-300 leading-relaxed text-sm">
          <strong>State Transfer:</strong> When a follower falls behind and its required entries have been 
          compacted from the leader's Raft log, the leader initiates an <code>InstallSnapshotRequest</code> stream. 
          The leader dynamically zips its persistent <code>MessageStore</code> and <code>OffsetManager</code> data 
          into a single archive, transmitting it in 2MB chunks over the network. Upon receiving the final chunk, 
          the follower safely and atomically hot-swaps its current storage directories with the snapshot contents. 
          Furthermore, DRMQ intelligently marks peers receiving large snapshots as "in-flight" so the leader does not accidentally lose quorum during heavy disk I/O.
        </p>
      </div>
    </div>
  );
}
