
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { SiteProvider } from './context/SiteContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { PostDetail } from './pages/PostDetail';
import { CategoryArchive } from './pages/CategoryArchive';
import { Author } from './pages/Author';
import { Archive } from './pages/Archive';

const App: React.FC = () => {
  return (
    <SiteProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/category/:name" element={<CategoryArchive />} />
            <Route path="/author" element={<Author />} />
          </Routes>
        </Layout>
      </Router>
    </SiteProvider>
  );
};

export default App;
