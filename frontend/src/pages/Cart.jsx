import React, {
  useEffect,
  useState
} from "react";

import API from "../api";

import {
  Trash2,
  Plus,
  Minus
} from "lucide-react";

import {
  showSuccess,
  showError
} from "../utils/toast";


export default function Cart() {

  const [cartItems,
    setCartItems] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const [placingOrder,
    setPlacingOrder] =
    useState(false);


  // =====================================
  // SHIPPING FORM
  // =====================================

  const [shippingAddress,
    setShippingAddress] =
    useState({

      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: ""
    });


  // =====================================
  // FETCH CART
  // =====================================

  const fetchCart =
    async () => {

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

        console.log(err);

        showError(
          "Failed to load cart"
        );

      } finally {

        setLoading(false);
      }
    };


  useEffect(() => {

    fetchCart();

  }, []);


  // =====================================
  // UPDATE QUANTITY
  // =====================================

  const updateQuantity =
    async (id, quantity) => {

      try {

        if (quantity < 1)
          return;


        const token =
          localStorage.getItem(
            "token"
          );


        await API.put(

          `/cart/update-quantity/${id}`,

          {
            quantity
          },

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


        setCartItems(

          cartItems.map(
            (item) =>

              item._id === id

                ? {
                    ...item,
                    quantity
                  }

                : item
          )
        );

      } catch (err) {

        console.log(err);

        showError(
          "Failed to update quantity"
        );
      }
    };


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

          `/cart/remove/${id}`,

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


        setCartItems(

          cartItems.filter(

            (item) =>

              item._id !== id
          )
        );


        showSuccess(
          "Removed from cart"
        );

      } catch (err) {

        console.log(err);

        showError(
          "Failed to remove item"
        );
      }
    };


  // =====================================
  // PLACE ORDER
  // =====================================

  const handlePlaceOrder =
    async () => {

      try {

        if (

          !shippingAddress.fullName ||
          !shippingAddress.phone ||
          !shippingAddress.address ||
          !shippingAddress.city ||
          !shippingAddress.state ||
          !shippingAddress.pincode

        ) {

          return showError(
            "Please fill all shipping details"
          );
        }


        setPlacingOrder(true);


        const token =
          localStorage.getItem(
            "token"
          );


        await API.post(

          "/orders/place-order",

          {
            shippingAddress
          },

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


        setCartItems([]);


        showSuccess(
          "Order placed successfully"
        );

      } catch (err) {

        console.log(err);

        showError(
          "Failed to place order"
        );

      } finally {

        setPlacingOrder(false);
      }
    };


  // =====================================
  // TOTAL
  // =====================================

  const totalPrice =

    cartItems.reduce(

      (acc, item) =>

        acc + (item.price * item.quantity),

      0
    );


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

      <h1
        className="
          text-2xl
          sm:text-3xl
          font-semibold
          tracking-tight
          mb-8
          sm:mb-10
        "
      >

        Your Cart

      </h1>


      {
        loading

        ? (

          <div>
            Loading...
          </div>

        ) : cartItems.length === 0

        ? (

          <div
            className="
              text-gray-400
              text-xl
            "
          >

            Cart is empty

          </div>

        ) : (

          <div
            className="
              flex
              flex-col
              gap-6
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
                      rounded-3xl
                      overflow-hidden
                    "
                  >

                    {
                      item.isCouple

                      ? (

                        <>

                          <div
                            className="
                              p-4
                              sm:p-5
                              flex
                              justify-between
                              items-start
                              sm:items-center
                              gap-2
                            "
                          >

                            <div className="flex-1 min-w-0">

                              <div
                                className="
                                  text-xl
                                  sm:text-2xl
                                  font-black
                                "
                              >

                                Couple Set

                              </div>

                              <div
                                className="
                                  text-sm
                                  sm:text-base
                                  text-gray-400
                                "
                              >

                                ₹1299

                              </div>

                              {(item.selectedColor || item.color || item.hisColor || item.herColor) && (
                                <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                                  Color: {item.selectedColor || item.color || item.hisColor || item.herColor}
                                </div>
                              )}

                            </div>


                            <button

                              onClick={() =>
                                removeItem(
                                  item._id
                                )
                              }

                              className="
                                text-red-500
                                flex-shrink-0
                                p-2
                                hover:bg-red-500/10
                                rounded-lg
                                transition
                              "
                              aria-label="Remove item"
                            >

                              <Trash2 size={20} />

                            </button>

                          </div>


                          {/* QUANTITY */}

                          <div
                            className="
                              px-5
                              pb-4
                              flex
                              items-center
                              gap-4
                            "
                          >

                            <button

                              onClick={() =>
                                updateQuantity(
                                  item._id,
                                  item.quantity - 1
                                )
                              }

                              className="
                                bg-[#232326]
                                p-2
                                rounded-xl
                              "
                            >

                              <Minus size={18} />

                            </button>


                            <div
                              className="
                                text-xl
                                font-bold
                              "
                            >

                              {item.quantity}

                            </div>


                            <button

                              onClick={() =>
                                updateQuantity(
                                  item._id,
                                  item.quantity + 1
                                )
                              }

                              className="
                                bg-[#232326]
                                p-2
                                rounded-xl
                              "
                            >

                              <Plus size={18} />

                            </button>

                          </div>


                          <div
                            className="
                              grid
                              grid-cols-2
                              gap-4
                              px-5
                              pb-5
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
                                  item.hisDesignImage
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
                                  item.herDesignImage
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

                        </>

                      ) : (

                        <>

                          <div
                            className="
                             p-4
                             sm:p-5
                             flex
                             justify-between
                             items-start
                             sm:items-center
                             gap-2
                           "
                         >

                           <div className="flex-1 min-w-0">

                             <div
                               className="
                                 text-xl
                                 sm:text-2xl
                                 font-black
                               "
                             >

                               Single Design

                             </div>

                             <div
                               className="
                                 text-sm
                                 sm:text-base
                                 text-gray-400
                               "
                             >

                               ₹699

                             </div>

                             {(item.selectedColor || item.color) && (
                               <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                                 Color: {item.selectedColor || item.color}
                               </div>
                             )}

                           </div>


                           <button

                             onClick={() =>
                               removeItem(
                                 item._id
                               )
                             }

                             className="
                               text-red-500
                               flex-shrink-0
                               p-2
                               hover:bg-red-500/10
                               rounded-lg
                               transition
                             "
                             aria-label="Remove item"
                           >

                             <Trash2 size={20} />

                           </button>

                         </div>


                         {/* QUANTITY */}

                         <div
                           className="
                             px-4
                             sm:px-5
                             pb-4
                             flex
                             items-center
                             gap-2
                             sm:gap-4
                           "
                         >

                           <button

                             onClick={() =>
                               updateQuantity(
                                 item._id,
                                 item.quantity - 1
                               )
                             }

                             className="
                               bg-[#232326]
                               p-2
                               sm:p-3
                               rounded-lg
                               sm:rounded-xl
                               hover:bg-[#333]
                               transition
                               flex-shrink-0
                             "
                             aria-label="Decrease quantity"
                           >

                             <Minus size={18} />

                           </button>


                           <div
                              className="
                               text-lg
                               sm:text-xl
                               font-bold
                               flex-1
                               text-center
                             "
                           >

                             {item.quantity}

                           </div>


                           <button

                             onClick={() =>
                               updateQuantity(
                                 item._id,
                                 item.quantity + 1
                               )
                             }

                             className="
                               bg-[#232326]
                               p-2
                               sm:p-3
                               rounded-lg
                               sm:rounded-xl
                               hover:bg-[#333]
                               transition
                               flex-shrink-0
                             "
                             aria-label="Increase quantity"
                           >

                             <Plus size={18} />

                           </button>

                         </div>


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

                        </>

                      )
                    }

                  </div>
                )
              )
            }


            {/* TOTAL */}

            <div
              className="
                mt-5
                mb-20
                sticky
                bottom-4
                z-20
                bg-cyan-400
                text-black
                rounded-2xl
                sm:rounded-3xl
                p-4
                sm:p-5
              "
            >

              <div
                className="
                  text-xl
                  sm:text-2xl
                  font-semibold
                "
              >

                Total:
                {" "}
                ₹{totalPrice}

              </div>

            </div>


            {/* SHIPPING FORM */}

            <div
              className="
                bg-[#171717]
                border
                border-[#2f2f2f]
                rounded-2xl
                sm:rounded-3xl
                p-4
                sm:p-6
                flex
                flex-col
                gap-3
                sm:gap-4
                mb-8
              "
            >

              <h2
                className="
                  text-xl
                  sm:text-2xl
                  font-semibold
                  mb-2
                "
              >

                Shipping Details

              </h2>


              <input

                type="text"

                placeholder="Full Name"

                value={
                  shippingAddress.fullName
                }

                onChange={(e) =>
                  setShippingAddress({

                    ...shippingAddress,

                    fullName:
                      e.target.value
                  })
                }

                className="
                  bg-[#101010]
                  border
                  border-[#2f2f35]
                  rounded-xl
                  sm:rounded-2xl
                  p-3
                  sm:p-4
                  outline-none
                  text-sm
                  sm:text-base
                  focus:border-cyan-500
                  transition
                "
              />


              <input

                type="text"

                placeholder="Phone Number"

                value={
                  shippingAddress.phone
                }

                onChange={(e) =>
                  setShippingAddress({

                    ...shippingAddress,

                    phone:
                      e.target.value
                  })
                }

                className="
                  bg-[#101010]
                  border
                  border-[#2f2f35]
                  rounded-xl
                  sm:rounded-2xl
                  p-3
                  sm:p-4
                  outline-none
                  text-sm
                  sm:text-base
                  focus:border-cyan-500
                  transition
                "
              />


              <textarea

                placeholder="Full Address"

                value={
                  shippingAddress.address
                }

                onChange={(e) =>
                  setShippingAddress({

                    ...shippingAddress,

                    address:
                      e.target.value
                  })
                }

                className="
                  bg-[#101010]
                  border
                  border-[#2f2f35]
                  rounded-xl
                  sm:rounded-2xl
                  p-3
                  sm:p-4
                  outline-none
                  resize-none
                  min-h-[100px]
                  sm:min-h-[120px]
                  text-sm
                  sm:text-base
                  focus:border-cyan-500
                  transition
                "
              />


              <input

                type="text"

                placeholder="City"

                value={
                  shippingAddress.city
                }

                onChange={(e) =>
                  setShippingAddress({

                    ...shippingAddress,

                    city:
                      e.target.value
                  })
                }

                className="
                  bg-[#101010]
                  border
                  border-[#2f2f35]
                  rounded-xl
                  sm:rounded-2xl
                  p-3
                  sm:p-4
                  outline-none
                  text-sm
                  sm:text-base
                  focus:border-cyan-500
                  transition
                "
              />


              <input

                type="text"

                placeholder="State"

                value={
                  shippingAddress.state
                }

                onChange={(e) =>
                  setShippingAddress({

                    ...shippingAddress,

                    state:
                      e.target.value
                  })
                }

                className="
                  bg-[#101010]
                  border
                  border-[#2f2f35]
                  rounded-xl
                  sm:rounded-2xl
                  p-3
                  sm:p-4
                  outline-none
                  text-sm
                  sm:text-base
                  focus:border-cyan-500
                  transition
                "
              />


              <input

                type="text"

                placeholder="Pincode"

                value={
                  shippingAddress.pincode
                }

                onChange={(e) =>
                  setShippingAddress({

                    ...shippingAddress,

                    pincode:
                      e.target.value
                  })
                }

                className="
                  bg-[#101010]
                  border
                  border-[#2f2f35]
                  rounded-xl
                  sm:rounded-2xl
                  p-3
                  sm:p-4
                  outline-none
                  text-sm
                  sm:text-base
                  focus:border-cyan-500
                  transition
                "
              />


              <button

                onClick={
                  handlePlaceOrder
                }

                disabled={
                  placingOrder
                }

                className="
                  mt-2
                  sm:mt-4
                  bg-cyan-400
                  hover:bg-cyan-300
                  transition
                  py-4
                  sm:py-5
                  rounded-xl
                  sm:rounded-2xl
                  text-sm
                  font-semibold
                  text-black
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  w-full
                  min-h-12
                "
              >

                {
                  placingOrder

                    ? "Placing Order..."

                    : "Place Order"
                }

              </button>

            </div>

          </div>
        )
      }

    </div>
  );
}
