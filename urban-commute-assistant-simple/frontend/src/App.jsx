import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Home from './pages/Home';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Header from './components/Header/Header';
import './styles.css';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/" element={<Home />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
