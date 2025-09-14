import React from 'react';

// Simple smoke test
test('React is working', () => {
  expect(React).toBeDefined();
});

// Test i18n configuration
test('i18n configuration is valid', () => {
  const fs = require('fs');
  const path = require('path');
  
  // Check if translation files exist
  const enPath = path.join(__dirname, 'locales', 'en.json');
  
  expect(() => {
    const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    expect(enData).toHaveProperty('app');
    expect(enData.app).toHaveProperty('name');
  }).not.toThrow();
});
