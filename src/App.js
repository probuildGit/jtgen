// MINIMAL TEST APP - VERSION 4.0
import React from 'react';

function App() {
  console.log('🏠 MINIMAL TEST APP: VERSION 4.1 - FORCED RECOMPILATION');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🏠 LOCAL APP VERSION 4.0</h1>
      <p>This is a minimal test to verify the React server is recompiling.</p>
      <p>If you see this, the new code is being served!</p>
      <div style={{ 
        background: '#e3f2fd', 
        padding: '10px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <strong>Console should show:</strong> 🏠 MINIMAL TEST APP: VERSION 4.0 - NO IMPORTS
      </div>
    </div>
  );
}

export default App;