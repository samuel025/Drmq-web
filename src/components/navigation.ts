import { Book, Cpu, Layers, HardDrive, Network, Settings, Terminal, ShieldAlert } from 'lucide-react';

export const NAVIGATION = [
  {
    title: 'Getting Started',
    links: [
      { name: 'Introduction', href: '/docs', icon: Book },
      { name: 'Quickstart', href: '/docs/quickstart', icon: Terminal },
      { name: 'Installation', href: '/docs/installation', icon: Settings },
      { name: 'Architecture', href: '/docs/architecture', icon: Layers },
      { name: 'Deployment', href: '/docs/deployment', icon: Network },
      { name: 'Configuration', href: '/docs/configuration', icon: Settings },
    ],
  },
  {
    title: 'Core Concepts',
    links: [
      { name: 'Topics & Offsets', href: '/docs/topics-and-offsets', icon: HardDrive },
      { name: 'Consumer Groups', href: '/docs/groups', icon: Layers },
      { name: 'Delivery Guarantees', href: '/docs/delivery-guarantees', icon: ShieldAlert },
      { name: 'Cluster Mode', href: '/docs/cluster-mode', icon: Cpu },
    ],
  },
  {
    title: 'Client SDKs',
    links: [
      { name: 'Java SDK', href: '/docs/producer', icon: Terminal },
      { name: 'Go SDK', href: '/docs/go-client', icon: Terminal },
      { name: 'Python SDK', href: '/docs/python-client', icon: Terminal },
      { name: 'TypeScript SDK', href: '/docs/typescript-client', icon: Terminal },
    ],
  },
  {
    title: 'Broker Setup',
    links: [
      { name: 'Raft Consensus', href: '/docs/raft', icon: Cpu },
      { name: 'Storage Engine', href: '/docs/storage', icon: HardDrive },
      { name: 'Fault Tolerance', href: '/docs/faults', icon: ShieldAlert },
    ],
  },
  {
    title: 'Features',
    links: [
      { name: 'Cross-Topic Atomicity', href: '/docs/atomicity', icon: ShieldAlert },
      { name: 'Dead-Letter Queues', href: '/docs/dlq', icon: ShieldAlert },
      { name: 'Monitoring', href: '/docs/monitoring', icon: Settings },
      { name: 'Interactive CLI', href: '/docs/cli', icon: Terminal },
    ],
  },
];
