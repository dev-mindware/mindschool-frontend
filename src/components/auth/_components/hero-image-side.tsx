import Image from "next/image";

interface HeroImageSideProps {
  source: string;
  title?: string;
  subtitle?: string;
  badge?: string;
}

export function HeroImageSide({
  source,
  title = "Gestão escolar inteligente e integrada.",
  subtitle = "Uma forma simples de gerir matrículas, estudantes, propinas e turmas para colégios e instituições de ensino.",
  badge = "MINDWARE - Educação & Ensino",
}: HeroImageSideProps) {
  return (
    <div className="relative hidden min-h-dvh w-full flex-col justify-between overflow-hidden bg-black lg:flex">
      <div className="absolute inset-0 z-0">
        <Image
          fill
          src={source}
          alt="Hero Background"
          className="object-cover opacity-60"
          sizes="50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5 z-10 pointer-events-none" />
      </div>

      <div className="relative z-20 w-full p-10 md:p-14">
        <div className="relative h-12 w-40">
          <Image
            src={"/mindgest.png"}
            fill
            alt="Logótipo do MindSchool"
            className="object-contain object-left"
            priority
          />
        </div>
      </div>

      <div className="relative z-20 w-full p-10 md:p-14 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
          {title}
        </h1>
        <p className="text-lg text-white/80 font-medium leading-relaxed mb-8 max-w-xl">
          {subtitle}
        </p>

        {badge && (
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-primary/80" />
            <span className="text-sm font-semibold text-white/70 tracking-widest uppercase">
              {badge}
            </span>
            <div className="h-px w-8 bg-primary/80" />
          </div>
        )}
      </div>
    </div>
  );
}
