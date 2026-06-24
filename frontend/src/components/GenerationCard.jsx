import {
  useState
} from "react";

import {
  X,
  Heart,
  ShoppingCart
} from "lucide-react";

import {
  showSuccess,
  showError
} from "../utils/toast";

import API from "../api";

export default function GenerationCard({

  image,

  prompt

}) {

  const [open,
    setOpen] =
      useState(false);


  // ❤️ Add To Wishlist
  async function addToWishlist() {

    try {

      const token =
        localStorage.getItem("token");

      await API.post(

        "/wishlist/add",

        {
          imageUrl: image,
          prompt
        },

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

      console.log(
        "WISHLIST ERROR:",
        err
      );

      showError(
        "Wishlist failed"
      );
    }
  }


  // 🛒 Add To Cart
  async function addToCart() {

    try {

      const token =
        localStorage.getItem("token");

      await API.post(

        "/cart/add",

        {
          imageUrl: image,
          prompt
        },

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

      console.log(
        "CART ERROR:",
        err
      );

      showError(
        "Cart failed"
      );
    }
  }


  return (

    <>

      {/* Card */}
      <div
        className="
          bg-[#2a2a2a]
          rounded-3xl
          overflow-hidden
          w-full
          max-w-sm
          border
          border-zinc-800
          hover:border-purple-500
          hover:shadow-[0_0_40px_rgba(168,85,247,0.25)]
          hover:scale-[1.02]
          transition-all
          duration-300
          group
        "
      >

        {/* Image */}
        <div
          className="
            overflow-hidden
            cursor-pointer
          "

          onClick={() =>
            setOpen(true)
          }
        >

          <img

            src={image}

            alt="design"

            className="
              w-full
              h-[320px]
              object-cover
              group-hover:scale-110
              transition-all
              duration-500
            "
          />

        </div>


        {/* Content */}
        <div className="p-5">

          <p
            className="
              text-sm
              text-zinc-300
              line-clamp-2
            "
          >

            {prompt}

          </p>


          {/* Buttons */}
          <div
            className="
              flex
              gap-3
              mt-5
            "
          >

            {/* Wishlist */}
            <button

              onClick={addToWishlist}

              className="
                flex
                items-center
                gap-2
                bg-zinc-800
                hover:bg-zinc-700
                hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]
                px-4
                py-3
                rounded-xl
                text-sm
                transition-all
                flex-1
                justify-center
              "
            >

              <Heart size={18} />

              Wishlist

            </button>


            {/* Cart */}
            <button

              onClick={addToCart}

              className="
                flex
                items-center
                gap-2
                bg-gradient-to-r
                from-purple-600
                to-cyan-500
                px-4
                py-3
                rounded-xl
                text-sm
                transition-all
                flex-1
                justify-center
                hover:opacity-90
                hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]
              "
            >

              <ShoppingCart size={18} />

              Cart

            </button>

          </div>

        </div>

      </div>


      {/* 🔥 Modal */}
      {
        open && (

          <div
            className="
              fixed
              inset-0
              z-50
              bg-black/80
              backdrop-blur-md
              flex
              items-center
              justify-center
              p-6
            "
          >

            {/* Close */}
            <button

              onClick={() =>
                setOpen(false)
              }

              className="
                absolute
                top-6
                right-6
                bg-zinc-900
                border
                border-zinc-700
                p-3
                rounded-full
                hover:bg-zinc-800
                transition-all
              "
            >

              <X size={24} />

            </button>


            {/* Modal Content */}
            <div
              className="
                max-w-6xl
                w-full
                grid
                lg:grid-cols-2
                gap-8
                items-center
              "
            >

              {/* Image */}
              <div
                className="
                  rounded-3xl
                  overflow-hidden
                  border
                  border-zinc-800
                  shadow-[0_0_50px_rgba(168,85,247,0.15)]
                "
              >

                <img

                  src={image}

                  alt="preview"

                  className="
                    w-full
                    max-h-[80vh]
                    object-cover
                  "
                />

              </div>


              {/* Details */}
              <div>

                <h1
                  className="
                    text-5xl
                    font-bold
                    mb-6
                    leading-tight
                  "
                >
                  AI Generated
                  Fashion Design
                </h1>


                <p
                  className="
                    text-zinc-400
                    text-lg
                    leading-relaxed
                    mb-8
                  "
                >
                  {prompt}
                </p>


                {/* Buttons */}
                <div
                  className="
                    flex
                    gap-4
                    flex-wrap
                  "
                >

                  <button

                    onClick={addToWishlist}

                    className="
                      flex
                      items-center
                      gap-2
                      bg-zinc-800
                      hover:bg-zinc-700
                      hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]
                      px-6
                      py-4
                      rounded-2xl
                      transition-all
                    "
                  >

                    <Heart size={20} />

                    Add to Wishlist

                  </button>


                  <button

                    onClick={addToCart}

                    className="
                      flex
                      items-center
                      gap-2
                      bg-gradient-to-r
                      from-purple-600
                      to-cyan-500
                      px-6
                      py-4
                      rounded-2xl
                      font-semibold
                      hover:opacity-90
                      hover:shadow-[0_0_35px_rgba(168,85,247,0.5)]
                      transition-all
                    "
                  >

                    <ShoppingCart size={20} />

                    Add to Cart

                  </button>

                </div>

              </div>

            </div>

          </div>
        )
      }

    </>
  );
}