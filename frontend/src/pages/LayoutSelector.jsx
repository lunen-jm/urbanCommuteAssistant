import React from 'react';
import { Link } from 'react-router-dom';
import './LayoutSelector.css';

const LayoutSelector = () => {
  const layouts = [
    {
      id: 'layout1',
      name: 'Modern Card Design',
      description: 'Glassmorphism effects, gradient backgrounds, and modern card layouts',
      path: '/layout1',
      preview: '🎨',
      features: ['Gradient Backgrounds', 'Glassmorphism Cards', 'Bottom Navigation', 'Quick Status Grid']
    },
    {
      id: 'layout2',
      name: 'iOS-Style Clean',
      description: 'Apple-inspired minimalist design with clean typography',
      path: '/layout2',
      preview: '🍎',
      features: ['Clean Minimalism', 'Segmented Controls', 'iOS Typography', 'Subtle Shadows']
    },
    {
      id: 'layout3',
      name: 'Material Design',
      description: 'Google Material Design principles with structured hierarchy',
      path: '/layout3',
      preview: '📱',
      features: ['Material Elevation', 'FAB Actions', 'Structured Cards', 'Bold Typography']
    },
    {
      id: 'layout4',
      name: 'Dark Mode Focused',
      description: 'Neon accents and modern dark theme with glowing effects',
      path: '/layout4',
      preview: '🌙',
      features: ['Neon Accents', 'Dark Gradients', 'Glow Effects', 'Cyberpunk Aesthetic']
    },
    {
      id: 'layout5',
      name: 'Bottom Sheet Mobile',
      description: 'Mobile-first design with interactive bottom sheets',
      path: '/layout5',
      preview: '📱',
      features: ['Bottom Sheets', 'Mobile-First', 'Interactive Cards', 'Swipe Gestures']
    }
  ];

  return (
    <div className="layout-selector">
      {/* Header */}
      <header className="selector-header">
        <div className="header-content">
          <h1>Urban Commute Assistant</h1>
          <p>Choose a layout style to preview</p>
        </div>
        <div className="header-actions">
          <Link to="/profile" className="profile-link">
            <span className="profile-icon">👤</span>
            Profile
          </Link>
        </div>
      </header>

      {/* Layout Grid */}
      <div className="layouts-grid">
        {layouts.map(layout => (
          <Link to={layout.path} key={layout.id} className="layout-card">
            <div className="card-preview">
              <span className="preview-icon">{layout.preview}</span>
            </div>
            <div className="card-content">
              <h3 className="layout-name">{layout.name}</h3>
              <p className="layout-description">{layout.description}</p>
              <div className="features-list">
                {layout.features.map((feature, index) => (
                  <span key={index} className="feature-tag">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            <div className="card-arrow">
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Info Section */}
      <div className="info-section">
        <div className="info-card">
          <h3>About These Layouts</h3>
          <p>
            Each layout represents a different approach to modern mobile UI design. 
            Test each one to see which style best fits your preferences and use case.
          </p>
          <div className="info-stats">
            <div className="stat">
              <span className="stat-number">5</span>
              <span className="stat-label">Design Styles</span>
            </div>
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Mobile Optimized</span>
            </div>
            <div className="stat">
              <span className="stat-number">Dark</span>
              <span className="stat-label">Mode Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="selector-footer">
        <p>Urban Commute Assistant - Layout Testing Environment</p>
        <div className="footer-links">
          <a href="#docs">Documentation</a>
          <a href="#github">GitHub</a>
          <a href="#feedback">Feedback</a>
        </div>
      </footer>
    </div>
  );
};

export default LayoutSelector;
