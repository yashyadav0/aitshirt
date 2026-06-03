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
        bg-black
        text-white
        px-5
        py-10
      "
    >

      <h1
        className="
          text-5xl
          font-black
          mb-10
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
                      bg-[#18181b]
                      border
                      border-[#27272a]
                      rounded-[32px]
                      overflow-hidden
                    "
                  >

                    {
                      item.isCouple

                      ? (

                        <>

                          <div
                            className="
                              p-5
                              flex
                              justify-between
                              items-center
                            "
                          >

                            <div>

                              <div
                                className="
                                  text-2xl
                                  font-black
                                "
                              >

                                Couple Set

                              </div>

                              <div
                                className="
                                  text-gray-400
                                "
                              >

                                ₹1299

                              </div>

                            </div>


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
                              p-5
                              flex
                              justify-between
                              items-center
                            "
                          >

                            <div>

                              <div
                                className="
                                  text-2xl
                                  font-black
                                "
                              >

                                Single Design

                              </div>

                              <div
                                className="
                                  text-gray-400
                                "
                              >

                                ₹699

                              </div>

                            </div>


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
                bg-white
                text-black
                rounded-[32px]
                p-6
              "
            >

              <div
                className="
                  text-3xl
                  font-black
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
                bg-[#18181b]
                border
                border-[#27272a]
                rounded-[32px]
                p-6
                flex
                flex-col
                gap-4
              "
            >

              <h2
                className="
                  text-3xl
                  font-black
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
                  bg-[#232326]
                  border
                  border-[#2f2f35]
                  rounded-[20px]
                  p-4
                  outline-none
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
                  bg-[#232326]
                  border
                  border-[#2f2f35]
                  rounded-[20px]
                  p-4
                  outline-none
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
                  bg-[#232326]
                  border
                  border-[#2f2f35]
                  rounded-[20px]
                  p-4
                  outline-none
                  resize-none
                  min-h-[120px]
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
                  bg-[#232326]
                  border
                  border-[#2f2f35]
                  rounded-[20px]
                  p-4
                  outline-none
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
                  bg-[#232326]
                  border
                  border-[#2f2f35]
                  rounded-[20px]
                  p-4
                  outline-none
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
                  bg-[#232326]
                  border
                  border-[#2f2f35]
                  rounded-[20px]
                  p-4
                  outline-none
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
                  mt-4
                  bg-cyan-500
                  hover:bg-cyan-400
                  transition
                  py-5
                  rounded-[24px]
                  text-xl
                  font-black
                  disabled:opacity-50
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