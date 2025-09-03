// Simple test to verify the lead form submission fix
// This simulates the form data that was causing the error

const testFormSubmission = async () => {
  const formData = {
    nome: 'Test User',
    email: 'test@example.com',
    whatsapp: '+1234567890',
    origem: {
      iataCode: 'JFK',
      name: 'John F. Kennedy International Airport',
      city: 'New York',
      country: 'United States'
    },
    destino: {
      iataCode: 'GRU',
      name: 'São Paulo-Guarulhos International Airport',
      city: 'São Paulo',
      country: 'Brazil'
    },
    selectedServices: ['voos'],
    dataIda: '2024-12-15',
    source: 'test'
  };

  try {
    console.log('🧪 Testing form submission with airport objects...');
    console.log('📝 Form data:', JSON.stringify(formData, null, 2));

    const response = await fetch('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('✅ SUCCESS: Form submission works with airport objects!');
      return true;
    } else {
      console.log('❌ FAILED: Form submission still has issues');
      return false;
    }

  } catch (error) {
    console.error('❌ ERROR during test:', error.message);
    return false;
  }
};

// Wait for server to start, then run test
setTimeout(testFormSubmission, 8000);