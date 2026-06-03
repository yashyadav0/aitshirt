import {
  useEffect,
  useState
} from "react";

import {
  Package
} from "lucide-react";

import API from "../api";

import {
  showError
} from "../utils/toast";


export default function Orders() {

  const [orders,
    setOrders] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);


  // 📦 Fetch Orders
  async function fetchOrders() {

    try {

      const token =
        localStorage.getItem(
          "token"
        );


      const res =
        await API.get(

          "/orders/my-orders",

          {

            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


      setOrders(
        res.data
      );

    } catch (err) {

      console.log(
        "FETCH ORDERS ERROR:",
        err
      );

      showError(
        "Failed to fetch orders"
      );

    } finally {

      setLoading(false);
    }
  }


  useEffect(() => {

    fetchOrders();

  }, []);


  // ⏳ Loading
  if (loading) {

    return (

      <div
        className="
          flex-1
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
          text-2xl
          md:text-3xl
          font-bold
        "
      >

        Loading...

      </div>
    );
  }


  return (

    <div
      className="
        flex-1
        min-h-screen
        bg-black
        text-white
        p-4
        pt-24
        md:p-8
        md:pt-8
      "
    >

      {/* Heading */}
      <div
        className="
          flex
          items-center
          gap-4
          mb-8
        "
      >

        <Package
          size={36}
        />

        <h1
          className="
            text-4xl
            md:text-5xl
            font-bold
          "
        >

          My Orders

        </h1>

      </div>


      {/* Empty */}
      {
        orders.length === 0 && (

          <div
            className="
              text-zinc-500
              text-xl
              md:text-2xl
            "
          >

            No orders yet

          </div>
        )
      }


      {/* Orders */}
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-6
        "
      >

        {
          orders.map(
            (order) => (

              <div

                key={order._id}

                className="
                  bg-zinc-900
                  border
                  border-zinc-800
                  rounded-3xl
                  overflow-hidden
                  hover:border-zinc-700
                  transition-all
                "
              >

                {/* Image */}
                <div
                  className="
                    aspect-square
                    bg-zinc-950
                    overflow-hidden
                  "
                >

                  <img

                    src={order.imageUrl}

                    alt="order"

                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />

                </div>


                {/* Content */}
                <div
                  className="
                    p-4
                    md:p-5
                  "
                >

                  {/* Prompt */}
                  <p
                    className="
                      text-zinc-300
                      text-sm
                      md:text-base
                      leading-relaxed
                      line-clamp-3
                      mb-5
                    "
                  >

                    {order.prompt}

                  </p>


                  {/* Status Row */}
                  <div
                    className="
                      flex
                      flex-wrap
                      gap-3
                    "
                  >

                    {/* Order Status */}
                    <div
                      className="
                        bg-zinc-800
                        px-4
                        py-2
                        rounded-full
                        text-sm
                        capitalize
                      "
                    >

                      Status:
                      {" "}
                      {order.status}

                    </div>


                    {/* Payment */}
                    <div
                      className="
                        bg-cyan-500/20
                        text-cyan-400
                        px-4
                        py-2
                        rounded-full
                        text-sm
                        capitalize
                      "
                    >

                      Payment:
                      {" "}
                      {
                        order.paymentStatus
                      }

                    </div>

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