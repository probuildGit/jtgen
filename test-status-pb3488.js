// Test script to verify status service with PB-3488
const fetch = require('node-fetch');

async function testStatusService() {
  console.log('🧪 Testing Status Service with PB-3488...');
  
  try {
    // Test the local proxy endpoint directly
    console.log('🔍 Testing local proxy endpoint...');
    const response = await fetch('http://localhost:3001/issue/PB-3488');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Local proxy response structure:');
      console.log('- success:', data.success);
      console.log('- data exists:', !!data.data);
      console.log('- fields exists:', !!data.data?.fields);
      console.log('- status exists:', !!data.data?.fields?.status);
      
      if (data.success && data.data && data.data.fields && data.data.fields.status) {
        console.log('🎯 Ticket PB-3488 status:', data.data.fields.status.name);
        console.log('📊 Status category:', data.data.fields.status.statusCategory?.name);
        
        // Test the status service function
        console.log('\n🔍 Testing status service function...');
        const { fetchTicketStatus } = require('./src/services/jiraStatusService.js');
        const statusResult = await fetchTicketStatus('PB-3488');
        
        if (statusResult) {
          console.log('✅ Status service result:', statusResult);
        } else {
          console.log('❌ Status service returned null');
        }
      }
    } else {
      console.log(`❌ Local proxy failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testStatusService();
