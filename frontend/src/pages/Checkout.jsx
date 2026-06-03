import {
  showSuccess,
  showError
} from "../utils/toast";

import {
  useEffect,
  useState
} from "react";

import API from "../api";


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

    <div className="p-8">

      <h1
        className="
          text-4xl
          font-bold
          mb-8
        "
      >
        Checkout
      </h1>


      {/* ITEMS */}

      <div
        className="
          flex
          flex-col
          gap-4
        "
      >

        {
          cartItems.map(
            (item) => (

              <div

                key={item._id}

                className="
                  bg-[#2a2a2a]
                  p-4
                  rounded-2xl
                  flex
                  gap-4
                  items-center
                "
              >

                <img

                  src={
                    item.imageUrl
                    || item.designImage
                    || item.hisDesignImage
                  }

                  alt="cart"

                  className="
                    w-24
                    h-24
                    object-cover
                    rounded-xl
                  "
                />

                <div>

                  <p className="font-bold">

                    {
                      item.prompt
                      || item.couplePrompt
                      || "AI Generated Design"
                    }

                  </p>

                  <p className="text-gray-400">

                    Quantity:
                    {" "}
                    {
                      item.quantity || 1
                    }

                  </p>

                  <p className="text-cyan-400 font-bold">

                    ₹
                    {
                      item.price *
                      (item.quantity || 1)
                    }

                  </p>

                </div>

              </div>
            ))
        }

      </div>


      {/* PAYMENT */}

      <div
        className="
          mt-10
          bg-[#2a2a2a]
          p-6
          rounded-2xl
        "
      >

        <h2
          className="
            text-2xl
            font-bold
            mb-6
          "
        >
          Payment
        </h2>


        {/* COUPON */}

        <div
          className="
            flex
            gap-3
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
              bg-black
              border
              border-zinc-700
              rounded-xl
              px-4
              py-3
              outline-none
            "
          />


          <button

            onClick={
              applyCoupon
            }

            className="
              bg-cyan-500
              px-5
              rounded-xl
              font-bold
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
            bg-white
            text-black
            px-6
            py-3
            rounded-xl
            font-bold
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

    </div>
  );
}