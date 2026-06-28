export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <span className="text-lg font-semibold tracking-tight">JustCheckIt</span>
        <a href="https://rentedge.justcheckit.app" className="text-sm text-white/60 hover:text-white transition-colors">
          RentEdge
        </a>
      </nav>
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <span className="text-xs font-medium tracking-widest text-white/40 uppercase mb-6">South Africa</span>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl mb-6">Check before you act.</h1>
        <p className="text-lg text-white/60 max-w-xl mb-12">JustCheckIt is a platform of tools that give you the information you need before making a high-stakes decision. Free to start.</p>
        <a href="#tools" className="bg-white text-black px-8 py-3 rounded-full text-sm font-semibold hover:bg-white/90 transition-colors">See our tools</a>
      </section>
      <section id="tools" className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-xs font-medium tracking-widest text-white/40 uppercase mb-10">Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="https://rentedge.justcheckit.app" className="group block p-8 rounded-2xl border border-white/10 hover:border-white/30 transition-colors bg-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium tracking-widest text-white/40 uppercase">Rental</span>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Live</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">RentEdge</h3>
            <p className="text-white/60 text-sm leading-relaxed">Know what landlords and agents are looking for before you apply. Get your rental positioning score and a personalised strategy.</p>
            <span className="inline-block mt-6 text-sm text-white/40 group-hover:text-white transition-colors">Try it free</span>
          </a>
          <div className="block p-8 rounded-2xl border border-white/10 bg-white/5 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium tracking-widest text-white/40 uppercase">Fraud</span>
              <span className="text-xs bg-white/10 text-white/40 px-2 py-1 rounded-full">Coming soon</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Scam Check</h3>
            <p className="text-white/60 text-sm leading-relaxed">Check a phone number, bank account, or link before you send money. Instant fraud risk report for South Africans.</p>
          </div>
        </div>
      </section>
      <footer className="px-6 py-10 border-t border-white/10 text-center text-white/30 text-sm">
        2025 JustCheckIt. Built for South Africa.
      </footer>
    </main>
  );
}
