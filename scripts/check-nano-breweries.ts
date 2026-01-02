import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
import { supabaseAdmin } from '../lib/supabase';

async function checkNanoBreweries() {
  const { data: breweries } = await supabaseAdmin
    .from('breweries')
    .select('id, name, type');

  const nanoBreweries = breweries?.filter(b => 
    (typeof b.type === 'string' && b.type.toLowerCase().includes('nano')) ||
    (Array.isArray(b.type) && b.type.some((t: string) => typeof t === 'string' && t.toLowerCase().includes('nano')))
  );

  console.log('Found', nanoBreweries?.length || 0, 'breweries with nano in type:');
  nanoBreweries?.forEach(b => {
    console.log(`  - ${b.name}: ${JSON.stringify(b.type)}`);
  });
}

checkNanoBreweries().catch(console.error);

