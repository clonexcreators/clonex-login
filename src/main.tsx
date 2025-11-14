import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { addCriticalResourceHints, usePerformanceMonitoring } from './utils/performanceOptimizer';
import { ProductionApp } from './components/ProductionApp';
import './index.css'; // 🎨 CRITICAL: Import Tailwind CSS and theme system

// Initialize performance optimizations
addCriticalResourceHints();

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <ProductionApp />
  </StrictMode>
);

// Initialize performance monitoring
usePerformanceMonitoring();
