import { useEffect, useState } from "react";

import api from "../api";

import {
  showSuccess,
  showError,
} from "../utils/toast";

import {
  getAdminHeaders
} from "../utils/adminHeaders";

// Mock coupons for graceful fallback
const MOCK_COUPONS = [
  {
    _id: "mock-coupon-1",
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    active: true,
    minOrderAmount: 0,
    maxDiscount: 500,
    maxUsage: null
  },
  {
    _id: "mock-coupon-2",
    code: "FLAT500",
    discountType: "fixed",
    discountValue: 500,
    expiryDate: new Date(Date.now() + 86400000 * 60).toISOString(),
    active: true,
    minOrderAmount: 1000,
    maxDiscount: null,
    maxUsage: null
  },
  {
    _id: "mock-coupon-3",
    code: "EXPIRED30",
    discountType: "percentage",
    discountValue: 30,
    expiryDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    active: false,
    minOrderAmount: 0,
    maxDiscount: null,
    maxUsage: null
  }
];

export default function AdminCoupons() {

  const [coupons, setCoupons] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [usingMockData, setUsingMockData] =
    useState(false);

  const [formData, setFormData] =
    useState({

      code: "",
      discountType: "percentage",
      discountValue: "",
      expiryDate: "",
      minOrderAmount: "",
      maxDiscount: "",
      maxUsage: ""
    });


  // =====================================
  // FETCH COUPONS
  // =====================================

  async function fetchCoupons() {

    try {

      const { data } =
        await api.get(

          "/admin/coupons",

          { headers: getAdminHeaders() }
        );


      setCoupons(data || []);
      setUsingMockData(false);

    } catch (err) {

      const status = err?.response?.status;
      const message = err?.response?.data?.error || err.message;

      console.log(
        "Coupons Error:",
        { status, message, stack: err.stack }
      );

      if (status === 403) {
        console.warn("Admin access denied (403) - falling back to demo data.");
        showError("Admin access required. Showing demo data.");
      } else if (status === 401) {
        console.warn("Session expired (401) - falling back to demo data.");
        showError("Session expired. Showing demo data.");
      } else {
        console.warn("Failed to fetch coupons - falling back to demo data.", { status, message });
        showError("Failed to fetch coupons. Showing demo data.");
      }

      setCoupons(MOCK_COUPONS);
      setUsingMockData(true);

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

      if (usingMockData) {
        showError("Cannot create coupons in demo mode.");
        return;
      }

      const payload = {
        code: formData.code,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        expiryDate: formData.expiryDate,
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        maxUsage: formData.maxUsage ? Number(formData.maxUsage) : null
      };

      const { data } =
        await api.post(

          "/admin/coupons",

          payload,

          { headers: getAdminHeaders() }
        );


      setCoupons(prev => [
        data,
        ...prev
      ]);


      setFormData({

        code: "",
        discountType: "percentage",
        discountValue: "",
        expiryDate: "",
        minOrderAmount: "",
        maxDiscount: "",
        maxUsage: ""
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

      if (usingMockData) {
        showError("Cannot delete coupons in demo mode.");
        return;
      }

      await api.delete(

        `/admin/coupons/${id}`,

        { headers: getAdminHeaders() }
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

      {/* Mock Data Banner */}
      {
        usingMockData && (
          <div
            className="
              mb-6
              p-4
              bg-amber-500/15
              border
              border-amber-500/40
              rounded-2xl
              text-amber-300
              flex
              items-center
              gap-3
            "
          >
            <span className="font-medium">Demo Mode:</span>
            <span>Showing sample coupons. Log in as an admin user to manage real coupons.</span>
          </div>
        )
      }


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
            md:grid-cols-4
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
                  e.target.value.toUpperCase()
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


          {/* DISCOUNT TYPE */}

          <select
            value={formData.discountType}
            onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
            className="
              bg-zinc-800
              border
              border-zinc-700
              rounded-xl
              px-4
              py-3
              outline-none
            "
          >
            <option value="percentage">Percentage %</option>
            <option value="fixed">Fixed Amount (₹)</option>
          </select>


          {/* DISCOUNT VALUE */}

          <input

            type="number"

            placeholder={
              formData.discountType === "percentage"
                ? "Discount % (e.g. 10)"
                : "Amount ₹ (e.g. 500)"
            }

            value={formData.discountValue}

            onChange={(e) =>
              setFormData({

                ...formData,

                discountValue:
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


          {/* MIN ORDER AMOUNT */}

          <input

            type="number"

            placeholder="Min Order ₹ (optional)"

            value={formData.minOrderAmount}

            onChange={(e) =>
              setFormData({

                ...formData,

                minOrderAmount:
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


          {/* MAX DISCOUNT (for percentage) */}

          <input

            type="number"

            placeholder="Max Discount ₹ (optional)"

            value={formData.maxDiscount}

            onChange={(e) =>
              setFormData({

                ...formData,

                maxDiscount:
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
            disabled={formData.discountType !== "percentage"}
          />


          {/* MAX USAGE */}

          <input

            type="number"

            placeholder="Max Usage (optional)"

            value={formData.maxUsage}

            onChange={(e) =>
              setFormData({

                ...formData,

                maxUsage:
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
              md:col-span-4
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

                  Type

                </th>


                <th
                  className="
                    text-left
                    px-6
                    py-4
                    text-zinc-400
                  "
                >

                  Value

                </th>


                <th
                  className="
                    text-left
                    px-6
                    py-4
                    text-zinc-400
                  "
                >

                  Min Order

                </th>


                <th
                  className="
                    text-left
                    px-6
                    py-4
                    text-zinc-400
                  "
                >

                  Max Discount

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


                        {/* TYPE */}

                        <td
                          className="
                            px-6
                            py-5
                            text-cyan-400
                          "
                        >

                          {coupon.discountType === "percentage" ? (
                            <span className="px-2 py-1 bg-cyan-500/20 rounded text-xs">%</span>
                          ) : (
                            <span className="px-2 py-1 bg-purple-500/20 rounded text-xs">₹</span>
                          )}

                        </td>


                        {/* VALUE */}

                        <td
                          className="
                            px-6
                            py-5
                            text-green-400
                          "
                        >

                          {coupon.discountType === "percentage"
                            ? coupon.discountValue + "%"
                            : "₹" + coupon.discountValue}

                        </td>


                        {/* MIN ORDER */}

                        <td
                          className="
                            px-6
                            py-5
                            text-zinc-400
                          "
                        >

                          {coupon.minOrderAmount ? "₹" + coupon.minOrderAmount : "—"}

                        </td>


                        {/* MAX DISCOUNT */}

                        <td
                          className="
                            px-6
                            py-5
                            text-zinc-400
                          "
                        >

                          {coupon.maxDiscount ? "₹" + coupon.maxDiscount : "—"}

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

                        colSpan="8"

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