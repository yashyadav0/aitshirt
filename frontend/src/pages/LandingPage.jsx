import {
  ArrowRight
} from "lucide-react";

import {
  useNavigate
} from "react-router-dom";

import tshirtMockup
from "../templates/tshirts/black/front.png";

import hoodieMockup
from "../templates/hoodies/blue/front.png";

import whiteMockup
from "../templates/tshirts/white/front.png";

export default function LandingPage() {

  const navigate =
    useNavigate();

  const examples = [
    {
      label: "T-Shirts",
      image: tshirtMockup
    },
    {
      label: "Hoodies",
      image: hoodieMockup
    },
    {
      label: "Couple Designs",
      image: whiteMockup
    }
  ];

  return (

    <main className="min-h-screen bg-[#0b0b0b] text-white">

      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">
        <button
          onClick={() =>
            navigate("/")
          }
          className="text-xl font-semibold"
        >
          AIWear
        </button>

        <button
          onClick={() =>
            navigate("/login")
          }
          className="min-h-11 rounded-2xl border border-[#2f2f2f] px-5 text-sm text-zinc-300 transition hover:bg-[#171717] hover:text-white"
        >
          Login
        </button>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-14 md:grid-cols-[1fr_0.9fr] md:px-8 md:pt-24">

        <div className="flex flex-col justify-center">
          <p className="mb-4 text-sm font-medium text-cyan-300">
            AI apparel studio
          </p>

          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
            Create AI Apparel Designs Instantly
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400 md:text-lg">
            Generate professional T-shirt and Hoodie designs using AI.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() =>
                navigate("/login")
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 text-sm font-semibold text-black transition hover:bg-cyan-300"
            >
              Start Designing
              <ArrowRight size={18} />
            </button>

            <a
              href="#examples"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#2f2f2f] px-6 text-sm text-zinc-300 transition hover:bg-[#171717] hover:text-white"
            >
              View Examples
            </a>
          </div>
        </div>

        <div
          id="examples"
          className="grid grid-cols-3 gap-3 md:gap-4"
        >
          {
            examples.map((item, index) => (

              <article
                key={item.label}
                className={`
                  rounded-3xl
                  border
                  border-[#2f2f2f]
                  bg-[#171717]
                  p-2
                  transition
                  duration-500
                  hover:-translate-y-1
                  hover:border-cyan-500/50
                  ${
                    index === 1
                      ? "mt-10"
                      : ""
                  }
                `}
              >
                <img
                  src={item.image}
                  alt={item.label}
                  className="aspect-[3/4] w-full rounded-2xl object-cover"
                />

                <p className="px-2 py-3 text-center text-xs text-zinc-400 md:text-sm">
                  {item.label}
                </p>
              </article>
            ))
          }
        </div>

      </section>

    </main>
  );
}
