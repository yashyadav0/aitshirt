import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {

  const navigate = useNavigate();

  return (

    <div
      className="
        min-h-screen
        bg-black
        text-white
        overflow-hidden
        relative
      "
    >

      {/* Background Blur */}
      <div
        className="
          absolute
          top-[-200px]
          left-[-200px]
          w-[400px]
          h-[400px]
          md:w-[500px]
          md:h-[500px]
          bg-purple-600/20
          blur-[120px]
          rounded-full
        "
      />

      <div
        className="
          absolute
          bottom-[-200px]
          right-[-200px]
          w-[400px]
          h-[400px]
          md:w-[500px]
          md:h-[500px]
          bg-cyan-500/20
          blur-[120px]
          rounded-full
        "
      />



      {/* Navbar */}
      <nav
        className="
          relative
          z-10
          flex
          items-center
          justify-between
          px-5
          md:px-10
          py-5
          border-b
          border-zinc-900
        "
      >

        <h1
          className="
            text-2xl
            md:text-3xl
            font-bold
            bg-gradient-to-r
            from-purple-400
            to-cyan-400
            bg-clip-text
            text-transparent
          "
        >
          AIWear
        </h1>


        <button

          onClick={() =>
            navigate("/login")
          }

          className="
            bg-white
            text-black
            px-5
            md:px-6
            py-2.5
            rounded-xl
            font-semibold
            hover:bg-zinc-200
            transition-all
            text-sm
          "
        >
          Login
        </button>

      </nav>



      {/* Hero */}
      <section
        className="
          relative
          z-10
          max-w-7xl
          mx-auto
          px-5
          md:px-10
          pt-14
          md:pt-24
          pb-20
          grid
          lg:grid-cols-2
          gap-12
          lg:gap-20
          items-center
        "
      >

        {/* Left */}
        <div
          className="
            text-center
            lg:text-left
            order-2
            lg:order-1
          "
        >

          {/* Small Badge */}
          <div
            className="
              inline-flex
              items-center
              gap-2
              bg-zinc-900/80
              border
              border-zinc-800
              rounded-full
              px-4
              py-2
              mb-6
            "
          >

            <Sparkles size={16} />

            <span
              className="
                text-sm
                text-zinc-300
              "
            >
              AI Fashion Platform
            </span>

          </div>



          <h1
            className="
              text-4xl
              sm:text-5xl
              md:text-6xl
              font-bold
              leading-[1.1]
              tracking-tight
              mb-6
            "
          >
            Create Premium
            <span
              className="
                bg-gradient-to-r
                from-purple-400
                to-cyan-400
                bg-clip-text
                text-transparent
              "
            >
              {" "}AI Clothing
            </span>
            {" "}Designs
          </h1>



          <p
            className="
              text-zinc-400
              text-base
              md:text-lg
              leading-relaxed
              max-w-2xl
              mx-auto
              lg:mx-0
              mb-8
            "
          >
            Generate high-quality fashion mockups,
            customize apparel styles,
            save your favorite creations,
            and build unique designs instantly using AI.
          </p>



          <div
            className="
              flex
              flex-col
              sm:flex-row
              gap-4
              justify-center
              lg:justify-start
            "
          >

            <button

              onClick={() =>
                navigate("/login")
              }

              className="
                flex
                items-center
                justify-center
                gap-2
                bg-gradient-to-r
                from-purple-600
                to-cyan-500
                px-8
                py-4
                rounded-2xl
                font-semibold
                hover:scale-[1.02]
                active:scale-100
                transition-all
                shadow-lg
                shadow-purple-900/20
              "
            >

              Start Designing

              <ArrowRight size={20} />

            </button>


            <button

              className="
                border
                border-zinc-700
                bg-zinc-900/40
                px-8
                py-4
                rounded-2xl
                hover:bg-zinc-900
                transition-all
              "
            >
              Explore Designs
            </button>

          </div>

        </div>



        {/* Right */}
        <div
          className="
            relative
            flex
            justify-center
            order-1
            lg:order-2
          "
        >

          <div
            className="
              bg-gradient-to-br
              from-purple-600
              to-cyan-500
              p-[2px]
              rounded-[32px]
              w-full
              max-w-[460px]
            "
          >

            <div
              className="
                bg-zinc-950
                rounded-[32px]
                p-3
                md:p-5
              "
            >

              <img

                src="
                https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop
                "

                alt="fashion"

                className="
                  rounded-[24px]
                  h-[300px]
                  sm:h-[380px]
                  md:h-[500px]
                  w-full
                  object-cover
                "
              />

            </div>

          </div>

        </div>

      </section>



      {/* CTA */}
      <section
        className="
          relative
          z-10
          px-5
          md:px-10
          pb-16
          md:pb-24
        "
      >

        <div
          className="
            max-w-5xl
            mx-auto
            text-center
            bg-gradient-to-r
            from-purple-600/15
            to-cyan-500/15
            border
            border-zinc-800
            rounded-[32px]
            px-6
            md:px-12
            py-12
            md:py-16
          "
        >

          <h1
            className="
              text-3xl
              md:text-5xl
              font-bold
              leading-tight
              mb-5
            "
          >
            Ready to create your
            next fashion design?
          </h1>

          <p
            className="
              text-zinc-400
              text-base
              md:text-lg
              mb-8
              max-w-2xl
              mx-auto
            "
          >
            Start generating AI-powered
            apparel designs with a modern,
            seamless creative experience.
          </p>


          <button

            onClick={() =>
              navigate("/login")
            }

            className="
              bg-white
              text-black
              px-8
              py-4
              rounded-2xl
              font-semibold
              hover:bg-zinc-200
              transition-all
            "
          >
            Get Started
          </button>

        </div>

      </section>

    </div>
  );
}