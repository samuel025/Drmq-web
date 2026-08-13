import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Introduction } from './pages/Introduction';
import { Quickstart } from './pages/Quickstart';
import { Installation } from './pages/Installation';
import { Architecture } from './pages/Architecture';
import { Deployment } from './pages/Deployment';
import { Configuration } from './pages/Configuration';
import { ProducerAPI } from './pages/ProducerAPI';
import { ConsumerAPI } from './pages/ConsumerAPI';
import { PythonClient } from './pages/PythonClient';
import { TypeScriptClient } from './pages/TypeScriptClient';
import { Raft } from './pages/Raft';
import { Storage } from './pages/Storage';
import { Groups } from './pages/Groups';
import { TopicsAndOffsets } from './pages/TopicsAndOffsets';
import { ClusterMode } from './pages/ClusterMode';
import { DeliveryGuarantees } from './pages/DeliveryGuarantees';
import { Faults } from './pages/Faults';
import { Monitoring } from './pages/Monitoring';
import { CLI } from './pages/CLI';
import { DLQ } from './pages/DLQ';
import { CrossTopicAtomicity } from './pages/CrossTopicAtomicity';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/docs" element={<Layout />}>
          <Route index element={<Introduction />} />
          <Route path="quickstart" element={<Quickstart />} />
          <Route path="installation" element={<Installation />} />
          <Route path="architecture" element={<Architecture />} />
          <Route path="deployment" element={<Deployment />} />
          <Route path="configuration" element={<Configuration />} />
          <Route path="producer" element={<ProducerAPI />} />
          <Route path="consumer" element={<ConsumerAPI />} />
          <Route path="python-client" element={<PythonClient />} />
          <Route path="typescript-client" element={<TypeScriptClient />} />
          <Route path="raft" element={<Raft />} />
          <Route path="storage" element={<Storage />} />
          <Route path="groups" element={<Groups />} />
          <Route path="topics-and-offsets" element={<TopicsAndOffsets />} />
          <Route path="cluster-mode" element={<ClusterMode />} />
          <Route path="delivery-guarantees" element={<DeliveryGuarantees />} />
          <Route path="faults" element={<Faults />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="cli" element={<CLI />} />
          <Route path="dlq" element={<DLQ />} />
          <Route path="atomicity" element={<CrossTopicAtomicity />} />
          <Route path="*" element={<Introduction />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
