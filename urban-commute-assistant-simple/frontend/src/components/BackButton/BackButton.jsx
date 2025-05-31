import React from 'react';
import { Link } from 'react-router-dom';
import './BackButton.css';

const BackButton = ({ variant = 'default', to = '/layouts', text = 'Back to Layouts' }) => {
  return (
    <Link to={to} className={`back-button ${variant}`}>
      <span className="back-icon">←</span>
      <span className="back-text">{text}</span>
    </Link>
  );
};

export default BackButton;
