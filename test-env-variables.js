// Script to test environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing environment variables...');

// Test Google AI API Key
console.log('🔑 GOOGLE_AI_API_KEY:', process.env.GOOGLE_AI_API_KEY ? 'Present' : 'Missing');
console.log('🌐 NEXT_PUBLIC_GOOGLE_AI_API_KEY:', process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY ? 'Present' : 'Missing');

// Test Supabase variables
console.log('🔗 NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing');
console.log('👤 NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
console.log('🛡️ SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing');

// Test Admin variables
console.log('👤 ADMIN_USERNAME:', process.env.ADMIN_USERNAME ? 'Present' : 'Missing');
console.log('🔒 ADMIN_PASSWORD_HASH:', process.env.ADMIN_PASSWORD_HASH ? 'Present' : 'Missing');
console.log('🧂 ADMIN_SALT:', process.env.ADMIN_SALT ? 'Present' : 'Missing');
console.log('🔐 JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'Missing');

console.log('✅ Environment variable test complete!');