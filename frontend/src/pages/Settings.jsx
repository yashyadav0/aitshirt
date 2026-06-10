export default function Settings() {

  return (

    <main className="min-h-screen bg-[#0b0b0b] px-4 py-20 text-white md:p-8">
      <section className="mx-auto max-w-3xl">
        <p className="mb-2 text-sm font-medium text-cyan-300">
          AIWear
        </p>

        <h1 className="text-3xl font-semibold">
          Settings
        </h1>

        <div className="mt-8 rounded-3xl border border-[#2f2f2f] bg-[#171717] p-5">
          <p className="font-medium">
            Studio preferences
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Account and generation preferences will live here as the product grows.
          </p>
        </div>
      </section>
    </main>
  );
}
