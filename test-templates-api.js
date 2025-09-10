// Test API directly to see what templates are being returned
async function testTemplatesAPI() {
  console.log('🔍 Testing Templates API directly...');
  
  try {
    console.log('📡 Making request to: http://localhost:3000/api/email-marketing/v2?action=templates&category=All');
    
    const response = await fetch('http://localhost:3000/api/email-marketing/v2?action=templates&category=All', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.log(`❌ HTTP Error: ${response.status}`);
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    
    console.log('✅ API Response received:');
    console.log('Success:', data.success);
    console.log('Is Real Data:', data.isRealData);
    
    if (data.data) {
      console.log('Templates count:', data.data.templates?.length || 0);
      console.log('Categories:', data.data.categories);
      
      if (data.data.templates?.length > 0) {
        console.log('First template:', JSON.stringify(data.data.templates[0], null, 2));
      } else {
        console.log('⚠️ No templates found in API response');
      }
    }
    
    if (data.error) {
      console.log('❌ API Error message:', data.error);
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  }
}

// Run the test
testTemplatesAPI();