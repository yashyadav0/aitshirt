import React, {
  useEffect,
  useState
} from "react";

import API from "../api";

import {
  Trash2,
  ShoppingCart
} from "lucide-react";

import {
  showSuccess,
  showError
} from "../utils/toast";


export default function Wishlist() {

  const [wishlistItems,
    setWishlistItems] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);


  const fetchWishlist =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );


        const res =
          await API.get(

            "/wishlist/my-wishlist",

            {
              headers: {

                Authorization:
                  `Bearer ${token}`
              }
            }
          );


        setWishlistItems(
          res.data
        );

      } catch (err) {

        console.log(err);

        showError(
          "Failed to load wishlist"
        );

      } finally {

        setLoading(false);
      }
    };


  useEffect(() => {

    fetchWishlist();

  }, []);


  // =====================================
  // REMOVE ITEM
  // =====================================

  const removeItem =
    async (id) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );


        await API.delete(

          `/wishlist/${id}`,

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


        setWishlistItems(

          wishlistItems.filter(

            (item) =>

              item._id !== id
          )
        );


        showSuccess(
          "Removed from wishlist"
        );

      } catch (err) {

        console.log(err);

        showError(
          "Failed to remove"
        );
      }
    };


  // =====================================
  // ADD TO CART
  // =====================================

  const addToCart =
    async (item) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );


        await API.post(

          "/cart/add",

          item,

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


        showSuccess(
          "Added to cart"

        );

      } catch (err) {

        console.log(err);

        showError(
          "Failed to add to cart"
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
        md:p-8
      "
    >

      <h1
        className="
          text-3xl
          font-semibold
          tracking-tight
          mb-8
        "
      >

        Wishlist

      </h1>


      <div
        className="
          flex
          flex-col
          gap-6
        "
      >

        {
          wishlistItems.map(
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

                        alt="design"

                        className="
                          w-full
                          h-full
                          object-cover
                        "
                      />

                    </div>
                  )
                }


                <div
                  className="
                    p-5
                    flex
                    items-center
                    justify-between
                  "
                >

                  <h2
                    className="
                      text-2xl
                      font-bold
                    "
                  >

                    {
                      item.isCouple
                        ? "Couple Set"
                        : "Single Design"
                    }

                  </h2>


                  <div
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >

                    {/* ADD TO CART */}

                    <button

                      onClick={() =>
                        addToCart(
                          item
                        )
                      }

                      className="
                        text-cyan-400
                      "
                    >

                      <ShoppingCart />

                    </button>


                    {/* REMOVE */}

                    <button

                      onClick={() =>
                        removeItem(
                          item._id
                        )
                      }

                      className="
                        text-red-500
                      "
                    >

                      <Trash2 />

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
