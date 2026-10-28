import SearchCombobox from '@/components/search/SearchCombobox';

export default function HeroV2() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                var(--color-brand-red) 0px,
                var(--color-brand-red) 10px,
                var(--color-gold) 10px,
                var(--color-gold) 20px
              )
            `,
          }}
        />
      </div>

      <div className="relative bg-gradient-to-b from-paper to-white pt-12 md:pt-16 pb-6 md:pb-8">
        <div className="container mx-auto px-4">
          {/* Main Headline */}
          <h1 className="text-center text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-ink mb-6 leading-[1.1] font-display">
            Discover Maryland's
            <br />
            <span className="text-brand-red">Craft Brewery</span> Scene
          </h1>

          {/* Subtitle */}
          <p className="text-center text-body-large md:text-xl text-muted max-w-2xl mx-auto mb-10 font-sans">
            A local curated directory of craft breweries in the state of
            Maryland. Find a brewery for your next event, outing, or place to
            hang with family and friends.
          </p>

          {/* Search with suggestions */}
          <SearchCombobox
            className="mx-auto max-w-2xl"
            submitLabel="Find breweries"
          />
        </div>
      </div>
    </section>
  );
}
