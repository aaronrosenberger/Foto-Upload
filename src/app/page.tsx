import PhotoUploader from "@/components/PhotoUploader";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blush-50 via-white to-sage-50">
      <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-24 text-center">
        <p className="font-serif text-sm uppercase tracking-[0.3em] text-sage-600">
          Wir heiraten
        </p>
        <h1 className="mt-4 font-serif text-5xl text-blush-700 sm:text-6xl">
          Sarah &amp; Jonas
        </h1>
        <p className="mt-6 text-lg text-stone-600">14. September 2026 · Schloss Rosengarten</p>
        <div className="mt-8 h-px w-24 bg-blush-300" />
        <p className="mt-8 max-w-xl text-stone-600">
          Wir freuen uns riesig, unseren großen Tag mit euch zu feiern. Damit keine
          Erinnerung verloren geht, könnt ihr eure schönsten Schnappschüsse direkt
          hier mit uns teilen.
        </p>
      </section>

      <section className="border-t border-blush-100 bg-white/70 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl text-blush-700">Teilt eure Fotos mit uns</h2>
          <p className="mx-auto mt-3 max-w-lg text-stone-600">
            Ladet eure Bilder von der Feier hoch – sie landen direkt in unserem
            gemeinsamen Hochzeitsalbum.
          </p>
        </div>

        <div className="mt-12">
          <PhotoUploader />
        </div>
      </section>

      <footer className="px-6 py-10 text-center text-sm text-stone-400">
        Mit Liebe gemacht für unseren schönsten Tag.
      </footer>
    </main>
  );
}
