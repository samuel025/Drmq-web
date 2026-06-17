import React from 'react';

export function Storage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-6">Storage Engine</h1>
      
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        Once a message is committed by the Raft consensus layer, it is handed off to the{' '}
        <code>MessageStore</code>. The storage layer uses a segmented, append-only log design 
        optimized for high-throughput sequential writes and efficient sequential reads.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Log Segments and Sparse Indexing</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Messages for a topic are stored in a dedicated directory (e.g., <code>./data/store/topics/orders/</code>).
        Instead of writing to a single infinitely growing file, the log is split into segments of
        up to <code>100 MB</code>.
      </p>

      <ul className="list-disc list-inside text-slate-300 space-y-3 my-6 pl-4">
        <li>
          <strong>Data File (<code>00000000000000000000.log</code>):</strong> Contains the raw serialized
          message payloads along with a binary header (length prefix).
        </li>
      </ul>

      <p className="text-slate-300 mb-8 leading-relaxed">
        To achieve <code>O(1)</code> random access for consumers, DRMQ builds a 
        <strong> sparse index in memory</strong> (<code>ConcurrentSkipListMap</code>) 
        during broker startup. There are no on-disk <code>.idx</code> files. 
        When a consumer requests a specific offset, the broker binary-searches the in-memory index to find the 
        nearest byte boundary before performing a short linear scan on disk.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mb-4 mt-10">Compaction Candidate Files</h2>
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
        <p className="text-slate-300 text-sm leading-relaxed">
          Because of the segmented design, older completed segments (e.g., <code>00000000.log</code>) become immutable. 
          When topic retention policies run, DRMQ can simply delete the oldest files instantly, without 
          needing to parse or rewrite active data.
        </p>
      </div>
    </div>
  );
}
