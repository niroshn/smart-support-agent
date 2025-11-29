// Mock for react-markdown
import React from 'react';

const ReactMarkdown = ({ children }) => {
  return React.createElement('div', null, children);
};

export default ReactMarkdown;
