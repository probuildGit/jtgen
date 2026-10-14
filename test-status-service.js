// Test script to verify status service is working
const fetch = require('node-fetch');

async function testStatusService() {
  console.log('🧪 Testing Local Status Service...');
  
  try {
    // Test with a known ticket key (you can replace this with an actual ticket)
    const testTicketKey = 'PB-1'; // Replace with an actual ticket key from your Jira
    
    console.log(`🔍 Testing status fetch for ticket: ${testTicketKey}`);
    
    const response = await fetch(`http://localhost:3001/issue/${testTicketKey}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Status service response:', JSON.stringify(data, null, 2));
      
      if (data.success && data.data && data.data.fields && data.data.fields.status) {
        console.log(`🎯 Ticket ${testTicketKey} status: ${data.data.fields.status.name}`);
        console.log(`📊 Status category: ${data.data.fields.status.statusCategory?.name || 'unknown'}`);
      } else {
        console.log('⚠️ No status data found in response');
      }
    } else {
      console.log(`❌ Status service failed with status: ${response.status}`);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testStatusService();
