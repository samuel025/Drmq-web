import { CodeBlock } from '../components/CodeBlock';

export function Installation() {
  return (
    <div>
      <div className="inline-block text-xs font-mono tracking-widest text-cyan-500 border border-cyan-500/30 bg-cyan-500/10 rounded px-3 py-1 mb-4">
        INSTALLATION
      </div>
      <h1 className="text-4xl font-bold text-white mb-6">Install and Build DRMQ</h1>
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        DRMQ is distributed as source code and built with Apache Maven. The build process compiles all modules, generates Java classes from the Protocol Buffers definitions in <code>drmq-protocol</code>, and packages the broker and client JARs.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Prerequisites</h2>
      <ul className="list-disc list-inside text-slate-300 space-y-2 mb-8 ml-2">
        <li><strong>Java Development Kit (JDK):</strong> Version 17+ (OpenJDK, Eclipse Temurin, etc.)</li>
        <li><strong>Apache Maven:</strong> Version 3.8.x or higher</li>
      </ul>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Build Steps</h2>
      
      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">1. Clone the Repository</h3>
      <CodeBlock 
        language="bash"
        code={`git clone https://github.com/samuel025/DRMQ.git\ncd DRMQ`}
      />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">2. Build All Modules</h3>
      <CodeBlock 
        language="bash"
        code={`mvn clean install`}
      />
      <p className="text-slate-300 mt-4 mb-8 leading-relaxed">
        Maven processes the modules in dependency order: <code>drmq-protocol</code>, <code>drmq-broker</code>, <code>drmq-client</code>, and <code>drmq-integration-tests</code>. If you want to skip integration tests, run <code>mvn clean install -DskipTests</code>.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Running the Broker</h2>
      
      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Single-Node Mode</h3>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Use single-node mode for local development and testing. It requires no peer configuration:
      </p>
      <CodeBlock 
        language="bash"
        code={`./mvnw -pl drmq-broker exec:java -Dexec.args="--port 9092 --data-dir ./data-1"`}
      />

      <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Cluster Mode</h3>
      <p className="text-slate-300 mb-4 leading-relaxed">
        For production deployments that require fault tolerance, start three nodes and provide each with the addresses of its peers:
      </p>
      <CodeBlock 
        language="bash"
        code={`# Node 1\n./mvnw -pl drmq-broker exec:java -Dexec.args="--node-id 1 --port 9092 --data-dir ./data-1 --peers 2:localhost:9093,3:localhost:9094"\n\n# Node 2\n./mvnw -pl drmq-broker exec:java -Dexec.args="--node-id 2 --port 9093 --data-dir ./data-2 --peers 1:localhost:9092,3:localhost:9094"\n\n# Node 3\n./mvnw -pl drmq-broker exec:java -Dexec.args="--node-id 3 --port 9094 --data-dir ./data-3 --peers 1:localhost:9092,2:localhost:9093"`}
      />
    </div>
  );
}
