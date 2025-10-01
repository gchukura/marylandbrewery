import { getProcessedBreweryData } from '../../../../lib/brewery-data';

export const revalidate = 3600; // ISR hourly

const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] as const;

export async function generateStaticParams() {
  return DAYS.map((d) => ({ day: d }));
}

function isOpenOnDay(hours?: Record<string, string>, day?: string) {
  if (!hours || !day) return false;
  const h = hours[day as keyof typeof hours];
  if (!h || /closed/i.test(h)) return false;
  return true;
}

export default async function OpenDayPage({ params }: { params: { day: string } }) {
  const day = (params.day || '').toLowerCase();
  const processed = await getProcessedBreweryData();
  const list = processed.breweries.filter((b) => isOpenOnDay(b.hours as any, day));

  const groups = new Map<string, any[]>();
  for (const b of list) {
    if (!groups.has(b.city)) groups.set(b.city, []);
    groups.get(b.city)!.push(b);
  }
  const sorted = Array.from(groups.entries()).sort((a,b) => a[0].localeCompare(b[0]));

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Open on {day.charAt(0).toUpperCase()+day.slice(1)}</h1>
      <p className="text-gray-600 mb-6">Breweries open on {day}. Updated hourly.</p>

      {sorted.length === 0 && (
        <div className="text-gray-600">No breweries listed as open on this day.</div>
      )}

      <div className="space-y-10">
        {sorted.map(([city, items]) => (
          <section key={city}>
            <h2 className="text-2xl font-semibold mb-4">{city}</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((b) => (
                <li key={b.id} className="border rounded-md p-4">
                  <div className="font-medium text-gray-900">{b.name}</div>
                  <div className="text-sm text-gray-600">{b.city}, {b.state}</div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
