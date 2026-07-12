export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0F16] text-[#F5F3EF] selection:bg-[#3E6E99] selection:text-white">
      <style>{`
        @keyframes stampLoop {
          0%   { opacity: 0; transform: translateY(6px); }
          38%  { opacity: 0; transform: translateY(6px); }
          46%  { opacity: 1; transform: translateY(0); }
          85%  { opacity: 1; transform: translateY(0); }
          93%  { opacity: 0; transform: translateY(6px); }
          100% { opacity: 0; transform: translateY(6px); }
        }
        @keyframes fillBarLoop {
          0%   { width: 0%; }
          35%  { width: 100%; }
          85%  { width: 100%; }
          95%  { width: 0%; }
          100% { width: 0%; }
        }
        .animate-stamp { animation: stampLoop 4.5s ease-in-out infinite; }
        .animate-fill { animation: fillBarLoop 4.5s ease-in-out infinite; }
      `}</style>

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#3E6E99]" />
          <span className="text-[15px] font-semibold tracking-tight">JustCheckIt</span>
        </div>
        <a
          href="https://rentedge.justcheckit.app"
          className="text-sm font-medium text-white/70 hover:text-white transition-colors"
        >
          RentEdge →
        </a>
      </nav>

      {/* ── HERO ── */}
      <section className="px-6 pt-14 pb-16 md:pt-24 md:pb-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1.1fr_0.9fr] gap-12 md:gap-16 items-center">

          {/* Left: copy */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60">South Africa</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5FA88F]">Free to start</span>
            </div>

            <h1 className="text-[2.35rem] md:text-[3.4rem] font-bold leading-[1.1] tracking-tight mb-6">
              Know where you stand
              <br />
              before you apply, pay, or sign.
            </h1>

            <p className="text-lg text-white/70 leading-relaxed max-w-md mb-8">
              JustCheckIt reads the fine print of your high-stakes decisions before you make them, and tells
              you exactly where you stand — in plain language, before it costs you anything.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#tools"
                className="bg-[#F5F3EF] text-[#0B0F16] px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-white transition-colors"
              >
                See our tools
              </a>
              <span className="text-sm text-white/60">No account needed to see your first result</span>
            </div>
          </div>

          {/* Right: signature element — grounded case card */}
          <div className="relative">
            <div className="rounded-2xl border border-white/15 bg-[#141A24] shadow-[0_24px_64px_-20px_rgba(0,0,0,0.7)]">

              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Case 0417
                </span>
                <span className="text-xs font-medium text-white/40">Rental application</span>
              </div>

              <div className="p-6 space-y-5">
                {[
                  { label: 'Applicant income ratio', value: '3.4×', sub: 'rent' },
                  { label: 'Documentation', value: '5/6', sub: 'ready' },
                  { label: 'Reference availability', value: 'Confirmed', sub: '' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-sm text-white/65">{row.label}</span>
                    <span className="font-mono text-base font-semibold text-white">
                      {row.value}
                      {row.sub && <span className="text-white/40 text-sm font-sans font-normal"> {row.sub}</span>}
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-6">
                <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="animate-fill h-full rounded-full bg-[#5FA88F]" />
                </div>
              </div>

              <div className="px-6 py-5 border-t border-white/10 flex items-center justify-between bg-black/20 rounded-b-2xl">
                <span className="text-sm text-white/60">Verdict</span>
                <span className="animate-stamp inline-flex items-center gap-1.5 bg-[#5FA88F] text-[#0B0F16] text-xs font-bold uppercase tracking-wide px-3.5 py-1.5 rounded-full">
                  ✓ Competitive
                </span>
              </div>
            </div>

            <p className="text-xs text-white/40 mt-4 text-center">
              Illustrative example. Your results are private and never stored.
            </p>
          </div>

        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="px-6 py-14 border-t border-white/10 bg-[#0E131B]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-8">
            Before you trust the result, trust the process
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                title: 'Nothing stored without permission',
                body: 'Your income, documents, and personal details stay on your device unless you choose to save them.',
              },
              {
                title: 'Grounded in real criteria',
                body: 'Built around the actual affordability rules and documentation standards South African letting agents apply — not guesswork.',
              },
              {
                title: 'No account required to start',
                body: 'Get your result first. Create an account later only if you want to save it.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3.5">
                <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-[#3E6E99]/20 border border-[#3E6E99]/50 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7FB4DD]" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white/90 mb-1.5">{item.title}</p>
                  <p className="text-sm text-white/55 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOOLS / CASE INDEX ── */}
      <section id="tools" className="px-6 py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/60">Open cases</h2>
            <span className="text-xs text-white/40">2 tools · 1 live</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* RentEdge — live */}
            <a
              href="https://rentedge.justcheckit.app"
              className="group relative block p-8 rounded-2xl border border-white/15 hover:border-[#5FA88F]/50 bg-[#141A24] transition-colors"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">01 · Rental</span>
                <span className="text-xs font-bold uppercase tracking-wide bg-[#5FA88F] text-[#0B0F16] px-2.5 py-1 rounded-full">
                  Live
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">RentEdge</h3>
              <p className="text-white/65 text-sm leading-relaxed mb-8">
                Know what landlords and agents are looking for before you apply. Get your rental positioning
                score and a personalised strategy.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                Try it free
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </span>
            </a>

            {/* Scam Check — coming soon */}
            <div className="relative block p-8 rounded-2xl border border-white/10 bg-[#141A24]/60">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">02 · Fraud</span>
                <span className="text-xs font-medium uppercase tracking-wide bg-white/10 text-white/60 px-2.5 py-1 rounded-full">
                  Coming soon
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight text-white/70">Scam Check</h3>
              <p className="text-white/45 text-sm leading-relaxed">
                Check a phone number, bank account, or link before you send money. Instant fraud risk report
                for South Africans.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-10 border-t border-white/10 flex items-center justify-between max-w-6xl mx-auto text-sm text-white/40">
        <span>© 2025 JustCheckIt</span>
        <span>Built for South Africa</span>
      </footer>
    </main>
  );
}
