import { useEffect, useState } from "react";

import api from "../api";

import {
  showSuccess,
  showError,
} from "../utils/toast";

export default function AdminCoupons() {

  const [coupons, setCoupons] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [formData, setFormData] =
    useState({

      code: "",
      discount: "",
      expiryDate: "",
    });


  // =====================================
  // FETCH COUPONS
  // =====================================

  async function fetchCoupons() {

    try {

      const token =
        localStorage.getItem(
          "token"
        );


      const { data } =
        await api.get(

          "/admin/coupons",

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


      setCoupons(data || []);

    } catch (err) {

      console.log(err);

      showError(
        "Failed to fetch coupons"
      );

    } finally {

      setLoading(false);
    }
  }


  // =====================================
  // CREATE COUPON
  // =====================================

  async function createCoupon(e) {

    e.preventDefault();

    try {

      const token =
        localStorage.getItem(
          "token"
        );


      const { data } =
        await api.post(

          "/admin/coupons",

          formData,

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


      setCoupons(prev => [
        data,
        ...prev
      ]);


      setFormData({

        code: "",
        discount: "",
        expiryDate: "",
      });


      showSuccess(
        "Coupon created successfully"
      );

    } catch (err) {

      console.log(err);

      showError(
        "Failed to create coupon"
      );
    }
  }


  // =====================================
  // DELETE COUPON
  // =====================================

  async function deleteCoupon(id) {

    try {

      const token =
        localStorage.getItem(
          "token"
        );


      await api.delete(

        `/admin/coupons/${id}`,

        {
          headers: {

            Authorization:
              `Bearer ${token}`
          }
        }
      );


      setCoupons(prev =>
        prev.filter(
          coupon => coupon._id !== id
        )
      );


      showSuccess(
        "Coupon deleted"
      );

    } catch (err) {

      console.log(err);

      showError(
        "Failed to delete coupon"
      );
    }
  }


  useEffect(() => {

    fetchCoupons();

  }, []);


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
          text-2xl
        "
      >

        Loading Coupons...

      </div>
    );
  }


  return (

    <div
      className="
        min-h-screen
        bg-black
        text-white
        p-4
        pt-20
        sm:pt-24
        sm:p-6
        md:p-8
      "
    >

      {/* HEADER */}

      <div className="mb-8">

        <h1
          className="
            text-4xl
            font-bold
          "
        >

          Admin Coupons

        </h1>


        <p
          className="
            text-zinc-400
            mt-2
          "
        >

          Manage discount coupons

        </p>

      </div>


      {/* CREATE COUPON */}

      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-2xl
          p-6
          mb-8
        "
      >

        <h2
          className="
            text-2xl
            font-semibold
            mb-6
          "
        >

          Create Coupon

        </h2>


        <form

          onSubmit={createCoupon}

          className="
            grid
            md:grid-cols-3
            gap-4
          "
        >

          {/* CODE */}

          <input

            type="text"

            placeholder="Coupon Code"

            value={formData.code}

            onChange={(e) =>
              setFormData({

                ...formData,

                code:
                  e.target.value
              })
            }

            className="
              bg-zinc-800
              border
              border-zinc-700
              rounded-xl
              px-4
              py-3
              outline-none
            "
          />


          {/* DISCOUNT */}

          <input

            type="number"

            placeholder="Discount %"

            value={formData.discount}

            onChange={(e) =>
              setFormData({

                ...formData,

                discount:
                  e.target.value
              })
            }

            className="
              bg-zinc-800
              border
              border-zinc-700
              rounded-xl
              px-4
              py-3
              outline-none
            "
          />


          {/* EXPIRY */}

          <input

            type="date"

            value={formData.expiryDate}

            onChange={(e) =>
              setFormData({

                ...formData,

                expiryDate:
                  e.target.value
              })
            }

            className="
              bg-zinc-800
              border
              border-zinc-700
              rounded-xl
              px-4
              py-3
              outline-none
            "
          />


          {/* BUTTON */}

          <button

            type="submit"

            className="
              md:col-span-3
              bg-gradient-to-r
              from-purple-600
              to-cyan-500
              py-3
              rounded-xl
              font-semibold
              hover:opacity-90
              transition-all
            "
          >

            Create Coupon

          </button>

        </form>

      </div>


      {/* COUPONS TABLE */}

      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-2xl
          overflow-hidden
        "
      >

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead
              className="
                bg-zinc-950
                border-b
                border-zinc-800
              "
            >

              <tr>

                <th
                  className="
                    text-left
                    px-6
                    py-4
                    text-zinc-400
                  "
                >

                  Code

                </th>


                <th
                  className="
                    text-left
                    px-6
                    py-4
                    text-zinc-400
                  "
                >

                  Discount

                </th>


                <th
                  className="
                    text-left
                    px-6
                    py-4
                    text-zinc-400
                  "
                >

                  Expiry

                </th>


                <th
                  className="
                    text-left
                    px-6
                    py-4
                    text-zinc-400
                  "
                >

                  Status

                </th>


                <th
                  className="
                    text-left
                    px-6
                    py-4
                    text-zinc-400
                  "
                >

                  Actions

                </th>

              </tr>

            </thead>


            <tbody>

              {
                coupons.length > 0

                  ? (

                    coupons.map((coupon) => (

                      <tr

                        key={coupon._id}

                        className="
                          border-b
                          border-zinc-800
                        "
                      >

                        {/* CODE */}

                        <td
                          className="
                            px-6
                            py-5
                            font-semibold
                          "
                        >

                          {coupon.code}

                        </td>


                        {/* DISCOUNT */}

                        <td
                          className="
                            px-6
                            py-5
                            text-green-400
                          "
                        >

                          {coupon.discount}%

                        </td>


                        {/* EXPIRY */}

                        <td
                          className="
                            px-6
                            py-5
                            text-zinc-400
                          "
                        >

                          {
                            new Date(
                              coupon.expiryDate
                            ).toLocaleDateString()
                          }

                        </td>


                        {/* STATUS */}

                        <td
                          className="
                            px-6
                            py-5
                          "
                        >

                          <span
                            className={`
                              px-3
                              py-1
                              rounded-full
                              text-sm

                              ${coupon.active

                                ? `
                                  bg-green-500/20
                                  text-green-400
                                `

                                : `
                                  bg-red-500/20
                                  text-red-400
                                `
                              }
                            `}
                          >

                            {
                              coupon.active
                                ? "Active"
                                : "Inactive"
                            }

                          </span>

                        </td>


                        {/* DELETE */}

                        <td
                          className="
                            px-6
                            py-5
                          "
                        >

                          <button

                            onClick={() =>
                              deleteCoupon(
                                coupon._id
                              )
                            }

                            className="
                              bg-red-500
                              hover:bg-red-600
                              px-4
                              py-2
                              rounded-lg
                              transition-all
                            "
                          >

                            Delete

                          </button>

                        </td>

                      </tr>
                    ))
                  )

                  : (

                    <tr>

                      <td

                        colSpan="5"

                        className="
                          text-center
                          py-10
                          text-zinc-500
                        "
                      >

                        No coupons found

                      </td>

                    </tr>
                  )
              }

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}