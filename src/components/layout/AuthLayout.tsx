import { Outlet, Link } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-svh flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden bg-gradient-to-br from-background via-background to-background">
        <div className="absolute inset-0 grid-bg" />
        {/* Orbs */}
        <div className="hero-orb size-96 bg-emerald top-1/4 -left-24" />
        <div className="hero-orb size-80 bg-cyan bottom-1/4 right-0" />
        <div className="hero-orb size-64 bg-amber/50 top-3/4 left-1/3" />

        <div className="relative z-10 flex flex-col h-full px-14 py-10">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/Scholar.png" alt="ScholarQuest" className="size-8 object-contain dark:invert" />
            <span className="font-black text-lg tracking-tight">Scholar<span className="gradient-text">Quest</span></span>
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="space-y-8 animate-fade-up">
              <div className="space-y-3">
                <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-emerald border border-emerald/30 bg-emerald/10 px-3 py-1 rounded-full">
                  Scholarship Discovery
                </span>
                <h1 className="text-5xl font-black tracking-tight leading-[1.1]">
                  Find your<br />
                  <span className="shimmer-text">funding.</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Match with 200+ scholarships across 30+ countries. Step-by-step guides, alumni mentors, and smart matching — all in one place.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  ['161+', 'Scholarships', 'bg-emerald/10 border-emerald/20'],
                  ['30+', 'Countries', 'bg-cyan/10 border-cyan/20'],
                  ['15', 'Alumni Mentors', 'bg-amber/10 border-amber/20'],
                ].map(([num, label, cls]) => (
                  <div key={label} className={`p-4 rounded-2xl border ${cls} text-center`}>
                    <div className="text-2xl font-black gradient-text">{num}</div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">{label}</div>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <div className="p-5 rounded-2xl border border-border bg-card/50 backdrop-blur-sm">
                <p className="text-sm italic text-muted-foreground leading-relaxed">
                  "ScholarQuest helped me find the Chevening scholarship I never knew I was eligible for. The guides were incredible."
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="size-7 rounded-full bg-emerald/20 flex items-center justify-center text-xs font-bold text-emerald">ML</div>
                  <div>
                    <p className="text-xs font-semibold">Mei Lin Zhang</p>
                    <p className="text-xs text-muted-foreground">Chevening Scholar, LSE</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-card">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/Scholar.png" alt="ScholarQuest" className="size-8 object-contain dark:invert" />
              <span className="font-black text-lg tracking-tight">Scholar<span className="gradient-text">Quest</span></span>
            </Link>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
