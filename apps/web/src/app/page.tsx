const ETAPAS = [
  {
    numero: "01",
    titulo: "Identificar",
    detalle: "Reconocer desafíos y oportunidades para mejorar la enseñanza y el aprendizaje.",
  },
  {
    numero: "02",
    titulo: "Diseñar",
    detalle: "Definir objetivos, estrategias y actividades para responder al desafío identificado.",
  },
  {
    numero: "03",
    titulo: "Experimentar",
    detalle: "Implementar la propuesta en el contexto educativo y recoger evidencias.",
  },
  {
    numero: "04",
    titulo: "Acompañar",
    detalle: "Apoyar a los docentes durante el desarrollo de sus iniciativas.",
  },
  {
    numero: "05",
    titulo: "Evaluar",
    detalle: "Analizar resultados y evidencias para comprender los efectos de la experiencia.",
  },
  {
    numero: "06",
    titulo: "Aprender",
    detalle: "Identificar aprendizajes, dificultades y oportunidades de mejora.",
  },
  {
    numero: "07",
    titulo: "Transferir",
    detalle: "Compartir prácticas y aprendizajes que puedan inspirar a otros docentes.",
  },
  {
    numero: "08",
    titulo: "Retroalimentar",
    detalle: "Incorporar comentarios para fortalecer la iniciativa y sus futuras versiones.",
  },
];

const FUNCIONES = [
  {
    numero: "01",
    titulo: "Visibilizar iniciativas",
    detalle:
      "Conocer experiencias docentes que buscan transformar la enseñanza y enriquecer los aprendizajes.",
  },
  {
    numero: "02",
    titulo: "Registrar avances",
    detalle:
      "Documentar objetivos, actividades, hitos, evidencias y resultados de cada iniciativa.",
  },
  {
    numero: "03",
    titulo: "Acompañar procesos",
    detalle:
      "Facilitar el seguimiento y la retroalimentación durante las distintas etapas del trabajo.",
  },
  {
    numero: "04",
    titulo: "Compartir aprendizajes",
    detalle:
      "Promover el intercambio de experiencias y la transferencia de prácticas entre docentes.",
  },
];

export default function Home() {
  return (
    <>
      <header className="border-b border-navy/15">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <a href="#" className="font-serif text-xl text-navy">
            Portal de Innovación
          </a>
          <nav className="flex flex-wrap gap-5 text-sm">
            <a href="#proposito" className="text-slate hover:text-navy">
              Propósito
            </a>
            <a href="#etapas" className="text-slate hover:text-navy">
              Etapas
            </a>
            <a href="#iniciativas" className="text-slate hover:text-navy">
              Iniciativas
            </a>
            <a href="/panel" className="text-slate hover:text-navy">
              Panel de gestión
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-gold">
              Innovación educativa · Experiencias que transforman
            </p>
            <h1 className="font-serif text-4xl leading-tight text-navy sm:text-5xl">
              Las buenas ideas docentes merecen crecer y compartirse.
            </h1>
            <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-slate">
              Un espacio para visibilizar las iniciativas de innovación
              educativa, conocer sus avances, acompañar sus procesos y compartir
              los aprendizajes que contribuyen a mejorar la enseñanza.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#iniciativas"
                className="border border-navy bg-navy px-5 py-3 text-sm text-paper transition-colors hover:bg-ink"
              >
                Explorar iniciativas
              </a>
              <a
                href="#etapas"
                className="border border-navy/30 px-5 py-3 text-sm text-navy transition-colors hover:border-navy"
              >
                Conocer el proceso
              </a>
            </div>
          </div>

          <div className="border border-navy/15 bg-navy/[0.03] p-7 sm:p-9">
            <p className="text-sm uppercase tracking-[0.15em] text-gold">
              Un ciclo de mejora continua
            </p>
            <h2 className="mt-3 font-serif text-2xl text-navy">
              De la idea al aprendizaje compartido
            </h2>
            <div className="mt-7 grid grid-cols-2 gap-3">
              {ETAPAS.map((etapa) => (
                <div
                  key={etapa.numero}
                  className="border border-navy/10 bg-paper p-4"
                >
                  <span className="text-xs text-gold">{etapa.numero}</span>
                  <p className="mt-2 font-serif text-lg text-navy">
                    {etapa.titulo}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="proposito" className="border-t border-navy/15">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gold">
              Nuestro propósito
            </p>
            <h2 className="mt-3 max-w-3xl font-serif text-3xl leading-tight text-navy">
              Hacer visible el trabajo docente y convertir las experiencias en
              oportunidades de aprendizaje institucional.
            </h2>
            <p className="mt-5 max-w-3xl leading-relaxed text-slate">
              La innovación educativa se construye mediante la reflexión, la
              experimentación, el acompañamiento y la evaluación. Este portal
              busca reunir las iniciativas en un espacio común, permitiendo
              conocer su evolución y reconocer los aprendizajes que generan.
            </p>
          </div>
        </section>

        <section id="iniciativas" className="border-t border-navy/15">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gold">
              ¿Qué encontrarás aquí?
            </p>
            <h2 className="mt-3 font-serif text-3xl text-navy">
              Un espacio para acompañar y compartir
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {FUNCIONES.map((funcion) => (
                <article
                  key={funcion.numero}
                  className="border border-navy/15 p-6"
                >
                  <span className="text-sm text-gold">{funcion.numero}</span>
                  <h3 className="mt-3 font-serif text-xl text-navy">
                    {funcion.titulo}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">
                    {funcion.detalle}
                  </p>
                </article>
              ))}
            </div>
            <p className="mt-6 text-sm text-slate">
              Las iniciativas publicadas podrán mostrar su descripción, etapa
              de desarrollo, avances y aprendizajes, según la información
              validada por la institución.
            </p>
          </div>
        </section>

        <section id="etapas" className="border-t border-navy/15 bg-navy/[0.03]">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gold">
              El proceso de innovación
            </p>
            <h2 className="mt-3 font-serif text-3xl text-navy">
              Ocho etapas para aprender y mejorar
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-slate">
              Cada iniciativa puede avanzar a su propio ritmo. Las etapas
              ayudan a organizar el proceso sin perder de vista la reflexión y
              la mejora continua.
            </p>
            <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {ETAPAS.map((etapa) => (
                <li key={etapa.numero} className="border-t-2 border-gold pt-4">
                  <span className="text-sm text-gold">{etapa.numero}</span>
                  <h3 className="mt-2 font-serif text-xl text-navy">
                    {etapa.titulo}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">
                    {etapa.detalle}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-navy/15">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <p className="font-serif text-lg text-navy">
            Portal de Innovación Educativa
          </p>
          <p className="mt-2 text-sm text-slate">
            Un espacio para documentar, acompañar y compartir experiencias que
            fortalecen la enseñanza y el aprendizaje.
          </p>
        </div>
      </footer>
    </>
  );
}
