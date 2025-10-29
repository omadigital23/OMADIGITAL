require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 Vérification des clés Supabase:\n');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('SUPABASE_URL:', url ? '✅ OK' : '❌ MISSING');
console.log('ANON_KEY:', anonKey ? `✅ OK (${anonKey.length} chars)` : '❌ MISSING');
console.log('SERVICE_KEY:', serviceKey ? `✅ OK (${serviceKey.length} chars)` : '❌ MISSING');

if (url && anonKey && serviceKey) {
  console.log('\n✅ Toutes les clés sont présentes!\n');
} else {
  console.log('\n❌ Des clés manquent!\n');
}
