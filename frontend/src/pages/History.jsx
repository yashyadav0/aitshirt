import {
  useEffect,
  useState
} from "react";

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
          bg-black
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
        bg-black
        text-white
        px-5
        py-10
      "
    >

      <div
        className="
          flex
          items-center
          gap-4
          mb-10
        "
      >

        <HistoryIcon
          size={50}
        />

        <h1
          className="
            text-6xl
            font-black
          "
        >

          Design History

        </h1>

      </div>


      <div
        className="
          flex
          flex-col
          gap-8
        "
      >

        {
          generations.map(
            (item) => (

              <div

                key={item._id}

                className="
                  bg-zinc-900
                  rounded-[40px]
                  overflow-hidden
                  border
                  border-zinc-800
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
                      text-2xl
                      font-black
                    "
                  >

                    {
                      item.isCouple
                        ? "Couple Design"
                        : "Single Design"
                    }

                  </div>


                  {/* WISHLIST */}

                  <button

                    onClick={() =>
                      addToWishlist(
                        item
                      )
                    }

                    className="
                      text-pink-500
                    "
                  >

                    <Heart />

                  </button>

                </div>

              </div>
            )
          )
        }

      </div>

    </div>
  );
}