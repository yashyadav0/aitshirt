import {
  showSuccess,
  showError
} from "../utils/toast";

import {
  useEffect,
  useState
} from "react";

import API from "../api";

const getCartPreviewImage = (item) =>
  item.frontDesignImage ||
  item.backDesignImage ||
  item.designImage ||
  item.hisDesignImage ||
  item.herDesignImage ||
  item.imageUrl ||
  "";


export default function Checkout() {

  const [cartItems,
    setCartItems] =
      useState([]);

  const [loading,
    setLoading] =
      useState(false);

  const [couponCode,
    setCouponCode] =
      useState("");

  const [discount,
    setDiscount] =
      useState(0);


  // =====================================
  // FETCH CART
  // =====================================

  async function fetchCart() {

    try {

      const token =
        localStorage.getItem(
          "token"
        );


      const res =
        await API.get(

          "/cart/my-cart",

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


      setCartItems(
        res.data
      );

    } catch (err) {

      console.log(
        "FETCH CART ERROR:",
        err
      );
    }
  }


  // =====================================
  // APPLY COUPON
  // =====================================

  async function applyCoupon() {

    try {

      const token =
        localStorage.getItem(
          "token"
        );


      const res =
        await API.post(

          "/coupon/apply",

          {
            code:
              couponCode
          },

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


      setDiscount(
        res.data.discountPercent
      );


      showSuccess(
        `Coupon Applied (${res.data.discountPercent}% OFF)`
      );

    } catch (err) {

      console.log(err);

      showError(
        err.response?.data?.error
        || "Invalid Coupon"
      );
    }
  }


  // =====================================
  // TOTAL
  // =====================================

  const subtotal =
    cartItems.reduce(

      (acc, item) =>

        acc +
        (
          item.price *
          (item.quantity || 1)
        ),

      0
    );


  const finalTotal =
    subtotal -
    (
      subtotal *
      discount
    ) / 100;


  // =====================================
  // CHECKOUT
  // =====================================

  async function handleCheckout() {

    try {

      setLoading(true);

      showSuccess(
        "Razorpay integration later"
      );

    } catch (err) {

      console.log(
        "CHECKOUT ERROR:",
        err
      );

    } finally {

      setLoading(false);
    }
  }


  useEffect(() => {

    fetchCart();

  }, []);


  return (

    <main className="min-h-screen bg-[#0b0b0b] px-4 py-20 sm:px-6 text-white md:p-8">

      <h1
        className="
          text-2xl
          sm:text-3xl
          font-semibold
          tracking-tight
          mb-6
          sm:mb-8
        "
      >
        Checkout
      </h1>


      {/* ITEMS */}

      <div
        className="
          flex
          flex-col
          gap-3
          sm:gap-4
          mb-6
          sm:mb-8
        "
      >

        {
          cartItems.map(
            (item) => (

              <div

                key={item._id}

                className="
                  bg-[#171717]
                  border
                  border-[#2f2f2f]
                  p-3
                  sm:p-4
                  rounded-2xl
                  sm:rounded-3xl
                  flex
                  gap-3
                  sm:gap-4
                  items-center
                "
              >

                {(item.designType === "double" || item.frontDesignImage || item.backDesignImage) ? (
                  <div className="grid w-16 h-16 sm:w-24 sm:h-24 grid-cols-2 gap-1 overflow-hidden rounded-lg sm:rounded-xl flex-shrink-0">
                    <img
                      src={item.frontDesignImage || getCartPreviewImage(item)}
                      alt="front cart preview"
                      className="h-full w-full object-cover"
                    />
                    <img
                      src={item.backDesignImage || item.frontDesignImage || getCartPreviewImage(item)}
                      alt="back cart preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : item.isCouple ? (
                  <div className="grid w-16 h-16 sm:w-24 sm:h-24 grid-cols-2 gap-1 overflow-hidden rounded-lg sm:rounded-xl flex-shrink-0">
                    <img
                      src={item.hisDesignImage || getCartPreviewImage(item)}
                      alt="his cart preview"
                      className="h-full w-full object-cover"
                    />
                    <img
                      src={item.herDesignImage || item.hisDesignImage || getCartPreviewImage(item)}
                      alt="her cart preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <img
                    src={getCartPreviewImage(item)}
                    alt="cart"
                    className="
                      w-16
                      sm:w-24
                      h-16
                      sm:h-24
                      object-cover
                      rounded-lg
                      sm:rounded-xl
                      flex-shrink-0
                    "
                  />
                )}

                <div className="flex-1 min-w-0">

                  <p className="font-bold text-sm sm:text-base truncate">

                    {
                      item.prompt
                      || item.couplePrompt
                      || "AI Generated Design"
                    }

                  </p>

                  <p className="text-xs sm:text-sm text-gray-400">

                    Quantity:
                    {" "}
                    {
                      item.quantity || 1
                    }

                  </p>

                  <p className="text-cyan-400 font-bold text-sm sm:text-base">

                    ₹
                    {
                      item.price *
                      (item.quantity || 1)
                    }

                  </p>

                  {(item.selectedColor || item.color || item.hisColor || item.herColor) && (
                    <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                      Color: {item.selectedColor || item.color || item.hisColor || item.herColor}
                    </p>
                  )}

                </div>

              </div>
            ))
        }

      </div>


      {/* PAYMENT */}

      <div
        className="
          mt-6
          sm:mt-10
          bg-[#171717]
          border
          border-[#2f2f2f]
          p-4
          sm:p-6
          rounded-2xl
          sm:rounded-3xl
        "
      >

        <h2
          className="
            text-xl
            sm:text-2xl
            font-semibold
            mb-4
            sm:mb-6
          "
        >
          Payment
        </h2>


        {/* COUPON */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            gap-2
            sm:gap-3
            mb-6
          "
        >

          <input

            type="text"

            placeholder="Enter Coupon Code"

            value={couponCode}

            onChange={(e) =>
              setCouponCode(
                e.target.value
              )
            }

            className="
              flex-1
              bg-[#101010]
              border
              border-[#333]
              rounded-xl
              sm:rounded-2xl
              px-3
              sm:px-4
              py-3
              sm:py-4
              min-h-12
              outline-none
              text-sm
              sm:text-base
              focus:border-cyan-500
              transition
            "
          />


          <button

            onClick={
              applyCoupon
            }

            className="
              bg-cyan-400
              text-black
              px-4
              sm:px-5
              py-3
              sm:py-4
              min-h-12
              rounded-xl
              sm:rounded-2xl
              font-semibold
              text-sm
              sm:text-base
              hover:bg-cyan-300
              transition
              flex-shrink-0
            "
          >

            Apply

          </button>

        </div>


        {/* TOTALS */}

        <div
          className="
            flex
            flex-col
            gap-2
            mb-6
            text-sm
            sm:text-base
          "
        >

          <div
            className="
              flex
              justify-between
            "
          >

            <span>
              Subtotal
            </span>

            <span>
              ₹{subtotal}
            </span>

          </div>


          <div
            className="
              flex
              justify-between
              text-green-400
            "
          >

            <span>
              Discount
            </span>

            <span>
              -{discount}%
            </span>

          </div>


          <div
            className="
              flex
              justify-between
              text-2xl
              font-bold
              mt-2
            "
          >

            <span>
              Total
            </span>

            <span>
              ₹{finalTotal}
            </span>

          </div>

        </div>


        {/* PAY */}

        <button

          onClick={
            handleCheckout
          }

          disabled={loading}

          className="
            bg-cyan-400
            text-black
            px-6
            py-4
            min-h-12
            rounded-2xl
            font-semibold
            w-full
          "
        >

          {
            loading

              ? "Processing..."

              : "Pay with Razorpay"
          }

        </button>

      </div>

    </main>
  );
}
