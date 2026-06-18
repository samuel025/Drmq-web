import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Introduction } from './pages/Introduction';
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
import { Faults } from './pages/Faults';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Introduction />} />
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
          <Route path="faults" element={<Faults />} />
          <Route path="*" element={<Introduction />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
