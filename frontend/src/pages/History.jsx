import {
  useEffect,
  useState
} from "react";
import { useNavigate } from "react-router-dom";

import API from "../api";

import {
  History as HistoryIcon,
  Heart
} from "lucide-react";

import {
  showError,
  showSuccess
} from "../utils/toast";


export default function History() {

  const navigate = useNavigate();

  const [generations,
    setGenerations] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);


  useEffect(() => {

    fetchHistory();

  }, []);


  const fetchHistory =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );


        const res =
          await API.get(

            "/generation/my-generations",

            {
              headers: {

                Authorization:
                  `Bearer ${token}`
              }
            }
          );


        setGenerations(
          res.data
        );

      } catch (err) {

        console.log(err);

        showError(
          "Failed to fetch history"
        );

      } finally {

        setLoading(false);
      }
    };


  // =====================================
  // ADD TO WISHLIST
  // =====================================

  const addToWishlist =
    async (item) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );


        await API.post(

          "/wishlist/add",

          item,

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


        showSuccess(
          "Added to wishlist"
        );

      } catch (err) {

        console.log(err);

        showError(
          "Failed to add to wishlist"
        );
      }
    };


  if (loading) {

    return (

      <div
        className="
          min-h-screen
          bg-[#0b0b0b]
          text-white
          flex
          items-center
          justify-center
        "
      >

        Loading...

      </div>
    );
  }


  return (

    <div
      className="
        min-h-screen
        bg-[#0b0b0b]
        text-white
        px-4
        py-20
        sm:px-6
        md:p-8
      "
    >

      <div
        className="
          flex
          items-center
          gap-2
          sm:gap-4
          mb-8
          sm:mb-10
        "
      >

        <HistoryIcon
          size={30}
          className="sm:w-12 sm:h-12"
        />

        <h1
          className="
            text-2xl
            sm:text-3xl
            font-semibold
            tracking-tight
          "
        >

          Design History

        </h1>

      </div>


      <div
        className="
          flex
          flex-col
          gap-4
          sm:gap-8
        "
      >

        {
          generations.length === 0
            ? (
              <p className="rounded-2xl border border-[#2f2f2f] bg-[#171717] p-6 text-zinc-400">
                Your generated designs will appear here.
              </p>
            )
            : generations.map(
            (item) => (

              <div

                key={item._id}

                className="
                  bg-[#171717]
                  rounded-3xl
                  overflow-hidden
                  border
                  border-[#2f2f2f]
                "
              >

                {
                  item.isCouple

                  ? (

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-4
                        p-4
                      "
                    >

                      <div
                        className="
                          aspect-square
                          overflow-hidden
                          rounded-[24px]
                          bg-[#232326]
                        "
                      >

                        <img

                          src={
                            item.hisDesign
                          }

                          alt="his design"

                          className="
                            w-full
                            h-full
                            object-cover
                          "
                        />

                      </div>


                      <div
                        className="
                          aspect-square
                          overflow-hidden
                          rounded-[24px]
                          bg-[#232326]
                        "
                      >

                        <img

                          src={
                            item.herDesign
                          }

                          alt="her design"

                          className="
                            w-full
                            h-full
                            object-cover
                          "
                        />

                      </div>

                    </div>

                  ) : item.frontDesignImage && item.backDesignImage ? (

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-4
                        p-4
                      "
                    >

                      <div
                        className="
                          aspect-square
                          overflow-hidden
                          rounded-[24px]
                          bg-[#232326]
                        "
                      >

                        <img

                          src={
                            item.frontDesignImage
                          }

                          alt="front design"

                          className="
                            w-full
                            h-full
                            object-cover
                          "
                        />

                      </div>


                      <div
                        className="
                          aspect-square
                          overflow-hidden
                          rounded-[24px]
                          bg-[#232326]
                        "
                      >

                        <img

                          src={
                            item.backDesignImage
                          }

                          alt="back design"

                          className="
                            w-full
                            h-full
                            object-cover
                          "
                        />

                      </div>

                    </div>

                  ) : (

                    <div
                      className="
                        w-full
                        aspect-square
                        overflow-hidden
                        bg-[#232326]
                      "
                    >

                      <img

                        src={
                          item.designImage
                        }

                        alt="history"

                        className="
                          w-full
                          h-full
                          object-cover
                        "
                      />

                    </div>
                  )
                }


                {/* BOTTOM */}

                <div
                  className="
                    p-5
                    flex
                    items-center
                    justify-between
                  "
                >

                  <div
                    className="
                      min-w-0
                    "
                  >

                    <div className="text-xl font-black">
                      {
                        item.isCouple
                          ? "Couple Design"
                          : (item.frontDesignImage && item.backDesignImage)
                            ? "Double Side"
                            : "Single Design"
                      }
                    </div>
                    <p className="mt-1 max-w-xl truncate text-sm font-normal text-zinc-400">
                      {item.prompt || item.couplePrompt || "Generated design"}
                    </p>

                  </div>


                  <div className="flex shrink-0 items-center gap-4">
                    <button
                      onClick={() =>
                        navigate("/workspace", {
                          state: { historyGeneration: item }
                        })
                      }
                      className="rounded-full border border-cyan-500/40 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/10"
                    >
                      Edit with prompt
                    </button>
                    <button
                      onClick={() => addToWishlist(item)}
                      aria-label="Add design to wishlist"
                      className="text-pink-500"
                    >
                      <Heart />
                    </button>
                  </div>

                </div>

              </div>
            )
          )
        }

      </div>

    </div>
  );
}
