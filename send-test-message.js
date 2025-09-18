const https = require('https');

// Data to send
const data = JSON.stringify({
  message: 'Hello, this is a test message to check if conversations are saved',
  sessionId: 'test-session-' + Date.now()
});

console.log('Sending request to chatbot API...');

// Options for the request
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/chat/gemini',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  // Skip certificate validation for self-signed certificates
  rejectUnauthorized: false
};

// Make the request
const req = https.request(options, res => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let responseData = '';
  
  res.on('data', chunk => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', responseData);
    
    // Now check if the conversation was saved
    setTimeout(checkDatabase, 2000);
  });
});

req.on('error', error => {
  console.error('Request Error:', error.message);
});

req.write(data);
req.end();

console.log('Request sent with data:', data);

// Function to check the database after sending the message
function checkDatabase() {
  console.log('\nChecking database for saved conversations...');
  
  const { createClient } = require('@supabase/supabase-js');
  
  // Use the credentials directly from the working test script
  const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Check conversations table
  supabase
    .from('conversations')
    .select('*')
    .limit(5)
    .then(({ data: conversations, error }) => {
      if (error) {
        console.error('Error fetching conversations:', error);
      } else {
        console.log(`Found ${conversations.length} conversations:`);
        conversations.forEach(conv => {
          console.log(`  - ID: ${conv.id}, Session: ${conv.session_id}, Created: ${conv.created_at}`);
        });
      }
      
      // Check messages table
      return supabase
        .from('messages')
        .select('*')
        .limit(5);
    })
    .then(({ data: messages, error }) => {
      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        console.log(`Found ${messages.length} messages:`);
        messages.forEach(msg => {
          console.log(`  - ID: ${msg.id}, Conv ID: ${msg.conversation_id}, Sender: ${msg.sender}, Content: ${msg.content?.substring(0, 50)}...`);
        });
      }
    })
    .catch(error => {
      console.error('Error checking database:', error);
    });
}