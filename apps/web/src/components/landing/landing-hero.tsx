import { QuickCommandPalette } from "@repo/blocks/quick-command-palette";

export function LandingHero({ callbackURL }: { callbackURL: string }) {
  return (
    <section className="relative min-h-[44vh] rounded-b-[1.25rem] bg-brand px-4 pb-8 pt-5 text-canvas sm:min-h-[46vh] sm:px-6 sm:pb-10 sm:pt-7 md:min-h-[48vh] md:px-10 md:pt-9">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6 md:right-10">
        <QuickCommandPalette callbackURL={callbackURL} />
      </div>

      <div className="max-w-[22rem] space-y-4 sm:max-w-xl sm:space-y-5">
        <div className="space-y-1">
          <h1
            className="text-[34px] leading-[0.9] tracking-[0.11em] sm:text-[52px] sm:tracking-[0.16em] md:text-[68px]"
            style={{ fontFamily: '"Geist Pixel", "Geist", "Inter Variable", sans-serif' }}
          >
            BLEVERSE
          </h1>
          <p
            className="text-[24px] font-light leading-[0.95] tracking-[0.05em] sm:text-[42px] sm:tracking-[0.08em] md:text-[56px]"
            style={{ fontFamily: '"Geist", "Inter Variable", sans-serif' }}
          >
            SOCIAL NETWORK
          </p>
        </div>

        <div
          className="space-y-0.5"
          style={{ fontFamily: '"Geist", "Inter Variable", sans-serif' }}
        >
          <p className="text-[22px] font-medium leading-tight sm:text-[30px] md:text-[34px]">Calm by default.</p>
          <p className="text-[22px] font-medium leading-tight sm:text-[30px] md:text-[34px]">Powerful by design.</p>
        </div>
      </div>
    </section>
  );
}
