import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { WorkflowComposerPage } from './pages/WorkflowComposerPage';

import { DataAnalystPage } from './pages/DataAnalystPage';
import { DecisionGamePage } from './pages/DecisionGamePage';
import { A11yFixerPage } from './pages/A11yFixerPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="a11y-fixer" element={<A11yFixerPage />} />
          <Route path="workflow-composer" element={<WorkflowComposerPage />} />

          <Route path="data-analyst" element={<DataAnalystPage />} />
          <Route path="decision-game" element={<DecisionGamePage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
