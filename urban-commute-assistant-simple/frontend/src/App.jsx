import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Home from './pages/Home';
import Login from './pages/Login';
import Settings from './pages/Settings';
import SmartFavorites from './pages/SmartFavorites';
import Analytics from './pages/Analytics';
import Header from './components/Header/Header';
import LayoutSelector from './pages/LayoutSelector';
import Layout1_Modern from './pages/TestLayouts/Layout1_Modern';
import Layout2_iOS from './pages/TestLayouts/Layout2_iOS';
import Layout3_Material from './pages/TestLayouts/Layout3_Material';
import Layout4_Dark from './pages/TestLayouts/Layout4_Dark';
import Layout5_BottomSheet from './pages/TestLayouts/Layout5_BottomSheet';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './pages/Dashboard/Dashboard';
import FullPageMap from './pages/FullPageMap/FullPageMap';
import './styles.css';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <Routes>            {/* Main App Routes - Dashboard First */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<FullPageMap />} />
            <Route path="/favorites" element={<SmartFavorites />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/login" element={<Login />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Layout Test Routes - No Header */}
            <Route path="/layouts" element={<LayoutSelector />} />
            <Route path="/layout1" element={<Layout1_Modern />} />
            <Route path="/layout2" element={<Layout2_iOS />} />
            <Route path="/layout3" element={<Layout3_Material />} />
            <Route path="/layout4" element={<Layout4_Dark />} />
            <Route path="/layout5" element={<Layout5_BottomSheet />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Original App Routes - With Header (for legacy access) */}
            <Route path="/original/*" element={
              <>
                <Header />
                <main className="main-content">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/" element={<Home />} />
                  </Routes>
                </main>
              </>
            } />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
