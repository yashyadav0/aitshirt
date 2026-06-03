import {
  useEffect,
  useState
} from "react";

import api from "../api";

import {
  Trash2
} from "lucide-react";

import {
  showSuccess,
  showError
} from "../utils/toast";

import {
  upscaleImage
} from "../utils/upscaleImage";


export default function AdminOrders() {

  const [orders,
    setOrders] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);


  // =====================================
  // FETCH ORDERS
  // =====================================

  useEffect(() => {

    fetchOrders();

  }, []);


  const fetchOrders =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );


        const { data } =
          await api.get(

            "/admin/orders",

            {
              headers: {

                Authorization:
                  `Bearer ${token}`
              }
            }
          );


        setOrders(
          data || []
        );

      } catch (error) {

        console.error(
          "Orders Error:",
          error
        );

        showError(
          "Failed to fetch orders"
        );

      } finally {

        setLoading(false);
      }
    };


  // =====================================
  // UPDATE STATUS
  // =====================================

  const updateOrderStatus =
    async (
      id,
      orderStatus
    ) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );


        await api.put(

          `/admin/orders/${id}`,

          { orderStatus },

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


        setOrders((prev) =>

          prev.map((order) =>

            order._id === id

              ? {
                  ...order,
                  orderStatus
                }

              : order
          )
        );


        showSuccess(
          "Order updated"
        );

      } catch (error) {

        console.error(
          "Status Update Error:",
          error
        );

        showError(
          "Failed to update order"
        );
      }
    };


  // =====================================
  // DELETE ORDER
  // =====================================

  const deleteOrder =
    async (id) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );


        await api.delete(

          `/admin/orders/${id}`,

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


        setOrders(

          orders.filter(

            (order) =>

              order._id !== id
          )
        );


        showSuccess(
          "Order deleted"
        );

      } catch (err) {

        console.log(err);

        showError(
          "Failed to delete order"
        );
      }
    };


  // =====================================
  // LOADING
  // =====================================

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
          text-3xl
          font-bold
        "
      >

        Loading Orders...

      </div>
    );
  }


  return (

    <div
      className="
        min-h-screen
        bg-black
        text-white
        p-5
      "
    >

      {/* HEADER */}

      <div className="mb-10">

        <h1
          className="
            text-5xl
            font-black
          "
        >

          Admin Orders

        </h1>

      </div>


      {/* ORDERS */}

      <div
        className="
          flex
          flex-col
          gap-8
        "
      >

        {
          orders.map(
            (order) => (

              <div

                key={order._id}

                className="
                  bg-zinc-900
                  rounded-[32px]
                  overflow-hidden
                  border
                  border-zinc-800
                "
              >

                {/* TOP */}

                <div
                  className="
                    p-6
                    border-b
                    border-zinc-800
                  "
                >

                  <h2
                    className="
                      text-2xl
                      font-black
                    "
                  >

                    {
                      order.shippingAddress
                        ?.fullName
                    }

                  </h2>


                  <p
                    className="
                      text-zinc-400
                      mt-2
                    "
                  >

                    {
                      order.shippingAddress
                        ?.phone
                    }

                  </p>


                  <p
                    className="
                      text-zinc-400
                    "
                  >

                    {
                      order.shippingAddress
                        ?.address
                    }

                  </p>


                  <div
                    className="
                      mt-4
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <div
                      className="
                        text-3xl
                        font-black
                        text-green-400
                      "
                    >

                      ₹
                      {
                        order.finalAmount
                      }

                    </div>


                    <button

                      onClick={() =>
                        deleteOrder(
                          order._id
                        )
                      }

                      className="
                        bg-red-500
                        hover:bg-red-400
                        transition
                        p-3
                        rounded-xl
                      "
                    >

                      <Trash2 size={22} />

                    </button>

                  </div>

                </div>


                {/* ITEMS */}

                <div
                  className="
                    p-6
                    flex
                    flex-col
                    gap-8
                  "
                >

                  {
                    order.items?.map(
                      (
                        item,
                        index
                      ) => (

                        <div

                          key={index}

                          className="
                            bg-black
                            rounded-[28px]
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
                                  p-5
                                "
                              >

                                {/* HIS */}

                                <div>

                                  <div
                                    className="
                                      aspect-square
                                      overflow-hidden
                                      rounded-[24px]
                                    "
                                  >

                                    <img

                                      src={
                                        item.hisDesignImage
                                      }

                                      alt="his"

                                      className="
                                        w-full
                                        h-full
                                        object-cover
                                      "
                                    />

                                  </div>


                                  <button

                                    onClick={async () => {

                                      const success =
                                        await upscaleImage(

                                          item.hisDesign,

                                          "his-design"
                                        );

                                      if (success) {

                                        showSuccess(
                                          "Downloaded"
                                        );

                                      } else {

                                        showError(
                                          "Upscale failed"
                                        );
                                      }
                                    }}

                                    className="
                                      w-full
                                      mt-4
                                      bg-cyan-500
                                      py-4
                                      rounded-[20px]
                                      font-bold
                                    "
                                  >

                                    Upscale His

                                  </button>

                                </div>


                                {/* HER */}

                                <div>

                                  <div
                                    className="
                                      aspect-square
                                      overflow-hidden
                                      rounded-[24px]
                                    "
                                  >

                                    <img

                                      src={
                                        item.herDesignImage
                                      }

                                      alt="her"

                                      className="
                                        w-full
                                        h-full
                                        object-cover
                                      "
                                    />

                                  </div>


                                  <button

                                    onClick={async () => {

                                      const success =
                                        await upscaleImage(

                                          item.herDesign,

                                          "her-design"
                                        );

                                      if (success) {

                                        showSuccess(
                                          "Downloaded"
                                        );

                                      } else {

                                        showError(
                                          "Upscale failed"
                                        );
                                      }
                                    }}

                                    className="
                                      w-full
                                      mt-4
                                      bg-pink-500
                                      py-4
                                      rounded-[20px]
                                      font-bold
                                    "
                                  >

                                    Upscale Her

                                  </button>

                                </div>

                              </div>

                            ) : (

                              <div className="p-5">

                                <div
                                  className="
                                    aspect-square
                                    overflow-hidden
                                    rounded-[24px]
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


                                <button

                                  onClick={async () => {

                                    const success =
                                      await upscaleImage(

                                        item.transparentDesign,

                                        "single-design"
                                      );

                                    if (success) {

                                      showSuccess(
                                        "Downloaded"
                                      );

                                    } else {

                                      showError(
                                        "Upscale failed"
                                      );
                                    }
                                  }}

                                  className="
                                    w-full
                                    mt-4
                                    bg-cyan-500
                                    py-4
                                    rounded-[20px]
                                    font-bold
                                  "
                                >

                                  Upscale To 4K

                                </button>

                              </div>

                            )
                          }

                        </div>
                      )
                    )
                  }

                </div>


                {/* STATUS */}

                <div
                  className="
                    p-6
                    border-t
                    border-zinc-800
                  "
                >

                  <select

                    value={
                      order.orderStatus ||
                      "processing"
                    }

                    onChange={(e) =>
                      updateOrderStatus(

                        order._id,

                        e.target.value
                      )
                    }

                    className="
                      w-full
                      bg-black
                      border
                      border-zinc-700
                      rounded-[20px]
                      px-5
                      py-4
                      outline-none
                    "
                  >

                    <option value="processing">
                      Processing
                    </option>

                    <option value="shipped">
                      Shipped
                    </option>

                    <option value="delivered">
                      Delivered
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>

                  </select>

                </div>

              </div>
            )
          )
        }

      </div>

    </div>
  );
}