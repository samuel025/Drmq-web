import { CodeBlock } from '../components/CodeBlock';

export function Introduction() {
  return (
    <div>
      <div className="inline-block text-xs font-mono tracking-widest text-cyan-500 border border-cyan-500/30 bg-cyan-500/10 rounded px-3 py-1 mb-4">
        DRMQ v1.0
      </div>
      <h1 className="text-4xl font-bold text-white mb-6">Introduction</h1>
      
      <p className="text-lg text-slate-300 mb-8 leading-relaxed">
        Welcome to DRMQ (Distributed Reliable Message Queue)! If you are new to distributed systems, don't worry. This guide is designed to be as friendly and straightforward as possible.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">What is a Distributed System?</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Before diving into message queues, we need to understand the environment they live in. A <strong>Distributed System</strong> is simply a collection of multiple independent computers (servers) that work together over a network to appear to the user as one single, powerful computer.
      </p>
      <p className="text-slate-300 mb-8 leading-relaxed">
        Think of it like running a business. Instead of having one person do absolutely everything (a <em>monolithic</em> system), you hire a Salesperson, an Accountant, and a Shipping Manager (a <em>distributed</em> system). This is much faster and more scalable, but there is a major catch: <strong>they have to communicate constantly</strong>. If the Salesperson makes a sale, they have to tell the Accountant. If the Accountant's phone is turned off, the Salesperson is stuck waiting on the line and can't help the next customer. This fragility in communication is exactly what Message Queues were invented to solve.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">What is a Message Queue?</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        To solve this communication problem, we use Message Queues. To understand how they work, think about how communication works in the real world. If you need to tell your friend something urgently, you call them on the phone. This is <strong>synchronous</strong> communication. Both of you must be available at the exact same time. If your friend's phone is off, the communication fails completely.
      </p>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Now, imagine instead you send them a letter through the <strong>Post Office</strong>. You drop the letter in a mailbox (you are the <strong>Producer</strong>) and you walk away. The Post Office (the <strong>Message Queue</strong>) stores that letter safely in its sorting room. Hours or days later, your friend (the <strong>Consumer</strong>) walks to their PO box and picks it up. This is <strong>asynchronous</strong> communication. You and your friend never had to be available at the same time, yet the message was safely delivered.
      </p>
      <p className="text-slate-300 mb-8 leading-relaxed">
        In software, a Message Queue acts as the digital Post Office. It is an independent server that sits between different parts of your application. When Server A wants to send data to Server B, it doesn't call Server B directly over an HTTP API. Instead, Server A drops the data into the Message Queue. The Queue writes it safely to its hard drive and waits. Whenever Server B is ready, it connects to the Queue and pulls the data down. This architectural pattern is called <strong>Decoupling</strong>.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">How Do They Work and Why Do We Need Them?</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        When modern applications grow large, having servers talk directly to each other becomes dangerous. If the Billing server crashes, any other server trying to talk to it will also freeze up or fail. Message queues solve this by acting as an indestructible shock-absorber. They organize messages into logical categories called <strong>Topics</strong>, allowing different services to subscribe only to the data they care about.
      </p>
      <p className="text-slate-300 mb-4 leading-relaxed">
        Common real-world examples include:
      </p>
      <ul className="list-disc list-inside text-slate-300 space-y-3 mb-8 ml-2">
        <li><strong>Spike Smoothing (Buffering):</strong> Imagine a ticket-selling website for a major concert. Suddenly, 100,000 users click "Buy" at the exact same second. If the website tried to process all 100,000 credit cards instantly, the database would crash. Instead, the website instantly accepts the 100,000 orders and dumps them into a Message Queue. A fleet of payment servers then slowly pulls orders from the queue, processing a manageable 500 per second without crashing.</li>
        <li><strong>Background Processing:</strong> When a user uploads a 4K video to a streaming site, they shouldn't have to stare at a loading screen for 30 minutes while the server compresses it. The web server immediately says "Upload Complete!", drops a "Compress Video ID: #123" message into the queue, and lets the user keep browsing. A background server will read that message and compress it later.</li>
        <li><strong>Microservice Broadcasting:</strong> When a new user signs up on your app, the <em>Billing Service</em> needs to create an invoice, the <em>Email Service</em> needs to send a welcome email, and the <em>Analytics Service</em> needs to update the charts. Instead of the main website calling all three services directly, it drops one "User Signed Up" message into a <strong>Topic</strong> on the queue. All three services "subscribe" to that topic and process the event independently at their own pace.</li>
      </ul>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">So, What Makes DRMQ Special?</h2>
      <p className="text-slate-300 mb-4 leading-relaxed">
        While high-throughput message queues like Apache Kafka are built for raw streaming scale across multi-partition clusters, <strong>DRMQ is designed specifically for environments where strict cross-topic atomicity and linear consensus safety take priority over extreme write throughput</strong>.
      </p>
      <p className="text-slate-300 mb-8 leading-relaxed">
        By placing topic logs, consumer offset state, and multi-topic operations into a single unified Raft consensus log, DRMQ eliminates the need for complex, failure-prone Two-Phase Commit (2PC) transaction coordinators. If one broker loses power, the remaining cluster seamlessly maintains complete state consistency without partial commits or split-brain metadata.
      </p>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-6">Core Capabilities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <div className="text-sm font-bold text-cyan-400 mb-2">Strict Global Ordering</div>
          <p className="text-sm text-slate-400 leading-relaxed">
            All messages are appended to a singular, immutable log. Consumers are guaranteed to process events in the exact chronological sequence they were sent.
          </p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <div className="text-sm font-bold text-cyan-400 mb-2">Zero-Dependency Architecture</div>
          <p className="text-sm text-slate-400 leading-relaxed">
            DRMQ is a fully self-contained binary. You don't need to install external coordination software (like ZooKeeper) to run it. Just start it up!
          </p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <div className="text-sm font-bold text-cyan-400 mb-2">Transparent Failover</div>
          <p className="text-sm text-slate-400 leading-relaxed">
            If a server crashes, the system fixes itself automatically within milliseconds. The client SDKs will seamlessly redirect to the surviving servers.
          </p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <div className="text-sm font-bold text-cyan-400 mb-2">Real-Time Dashboard</div>
          <p className="text-sm text-slate-400 leading-relaxed">
            DRMQ comes with a beautiful, real-time Telemetry Dashboard so you can visually watch your messages flow through the network.
          </p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
          <div className="text-sm font-bold text-cyan-400 mb-2">Cross-Topic Atomic Transactions</div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Produce messages to multiple distinct topics in a single, atomic operation. Guaranteed to commit or fail as a single unit at the Raft level.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-slate-100 mt-10 mb-4">Quick Start Example</h2>
      <p className="text-slate-400 mb-4">
        Connecting a client and sending a message is incredibly simple using our SDKs.
      </p>
      
      <CodeBlock 
        language="typescript"
        code={`import { DRMQProducer } from 'drmq-client';

const producer = new DRMQProducer("localhost:9092,localhost:9093");
await producer.connect();

// 1. Standard single-topic write
const res = await producer.send("my-topic", Buffer.from("Hello DRMQ!"));
console.log(\`Sent at offset \${res.offset}\`);

// 2. Cross-Topic Atomic write
const offsets = await producer.sendAtomic({
  "orders": Buffer.from("order-123"),
  "inventory": Buffer.from("reserve-sku-456")
});
console.log(\`Atomic commit successful! Offsets: \${JSON.stringify(offsets)}\`);`}
      />
    </div>
  );
}
