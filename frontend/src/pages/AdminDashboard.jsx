import {
  useEffect,
  useState
} from "react";

import api from "../api";

import {

  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar

} from "recharts";

import {

  DollarSign,
  ShoppingCart,
  Users,
  Sparkles

} from "lucide-react";

import {
  showError
} from "../utils/toast";

// Mock dashboard data for graceful fallback
const MOCK_DASHBOARD = {
  revenue: 12450,
  orders: 47,
  users: 128,
  generations: 342,
  revenueChart: [
    { month: "Jan", revenue: 1200 },
    { month: "Feb", revenue: 1900 },
    { month: "Mar", revenue: 3000 },
    { month: "Apr", revenue: 5000 },
    { month: "May", revenue: 8000 },
    { month: "Jun", revenue: 12450 }
  ],
  orderChart: [
    { day: "Mon", orders: 5 },
    { day: "Tue", orders: 8 },
    { day: "Wed", orders: 7 },
    { day: "Thu", orders: 12 },
    { day: "Fri", orders: 15 },
    { day: "Sat", orders: 20 },
    { day: "Sun", orders: 10 }
  ],
  recentActivity: [
    { title: "Order completed", payment: "paid", amount: 299 },
    { title: "Order pending", payment: "pending", amount: 499 },
    { title: "Order completed", payment: "paid", amount: 199 },
    { title: "Order cancelled", payment: "refunded", amount: 299 },
    { title: "Order completed", payment: "paid", amount: 399 }
  ]
};

export default function AdminDashboard() {

  const [stats,
    setStats] =
    useState({

      revenue: 0,
      orders: 0,
      users: 0,
      generations: 0,

      revenueChart: [],
      orderChart: [],

      recentActivity: []
    });

  const [loading,
    setLoading] =
    useState(true);

  const [usingMockData,
    setUsingMockData] =
    useState(false);


  // 📊 Fetch Dashboard
  useEffect(() => {

    fetchDashboardStats();

  }, []);


  const fetchDashboardStats =
    async () => {

      try {
        // Dev/test bypass header for local testing without DB admin role
        const isDev = import.meta.env.DEV || import.meta.env.MODE === "development";
        const headers = {};
        if (isDev) {
          headers["x-admin-bypass"] = "true";
        }

        const { data } =
          await api.get(
            "/admin/dashboard",
            { headers }
          );


        setStats({

          revenue:
            data.revenue || 0,

          orders:
            data.orders || 0,

          users:
            data.users || 0,

          generations:
            data.generations || 0,

          revenueChart:
            data.revenueChart || [],

          orderChart:
            data.orderChart || [],

          recentActivity:
            data.recentActivity || []
        });
        setUsingMockData(false);

      } catch (error) {

        const status = error?.response?.status;
        const message = error?.response?.data?.error || error.message;

        console.log(
          "Dashboard Error:",
          { status, message, stack: error.stack }
        );

        if (status === 403) {
          console.warn("Admin access denied (403) - falling back to demo data. To test with real data, ensure your user has role='admin' in MongoDB, or set x-admin-bypass header.");
          showError("Admin access required. Showing demo data.");
        } else if (status === 401) {
          console.warn("Session expired (401) - falling back to demo data.");
          showError("Session expired. Showing demo data.");
        } else {
          console.warn("Failed to fetch dashboard - falling back to demo data.", { status, message });
          showError("Failed to fetch dashboard. Showing demo data.");
        }

        // Fallback to mock data for graceful rendering
        setStats(MOCK_DASHBOARD);
        setUsingMockData(true);

      } finally {

        setLoading(false);
      }
    };


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

        Loading Dashboard...

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
        pt-20
        sm:pt-24
        sm:p-6
        md:p-8
        md:pt-8
      "
    >

      {/* Header */}
      <div className="mb-6 sm:mb-10">

        <h1
          className="
            text-3xl
            sm:text-4xl
            md:text-5xl
            font-bold
            mb-1
            sm:mb-2
          "
        >

          Admin Dashboard

        </h1>

        <p
          className="
            text-zinc-400
            text-sm
            sm:text-base
            md:text-lg
          "
        >

          Monitor your AI SaaS platform analytics

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
            <span>Showing sample data. Log in as an admin user to view real analytics.</span>
          </div>
        )
      }


      {/* Stats */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-3
          sm:gap-4
          md:gap-6
        "
      >

        {/* Revenue */}
        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            sm:rounded-3xl
            p-4
            sm:p-6
            hover:border-zinc-700
            transition-all
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              mb-2
              sm:mb-4
            "
          >

            <p className="text-zinc-400 text-sm sm:text-base">
              Revenue
            </p>

            <DollarSign
              size={20}
              className="
                text-green-400
              "
            />

          </div>

          <h2
            className="
              text-2xl
              sm:text-3xl
              md:text-4xl
              font-bold
              text-green-400
              break-words
            "
          >

            ₹{stats.revenue}

          </h2>

        </div>


        {/* Orders */}
        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            sm:rounded-3xl
            p-4
            sm:p-6
            hover:border-zinc-700
            transition-all
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              mb-2
              sm:mb-4
            "
          >

            <p className="text-zinc-400 text-sm sm:text-base">
              Orders
            </p>

            <ShoppingCart
              size={20}
              className="
                text-cyan-400
              "
            />

          </div>

          <h2
            className="
              text-2xl
              sm:text-3xl
              md:text-4xl
              font-bold
              text-cyan-400
            "
          >

            {stats.orders}

          </h2>

        </div>


        {/* Users */}
        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            sm:rounded-3xl
            p-4
            sm:p-6
            hover:border-zinc-700
            transition-all
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              mb-2
              sm:mb-4
            "
          >

            <p className="text-zinc-400 text-sm sm:text-base">
              Users
            </p>

            <Users
              size={20}
              className="
                text-purple-400
              "
            />

          </div>

          <h2
            className="
              text-2xl
              sm:text-3xl
              md:text-4xl
              font-bold
              text-purple-400
            "
          >

            {stats.users}

          </h2>

        </div>


        {/* Generations */}
        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            sm:rounded-3xl
            p-4
            sm:p-6
            hover:border-zinc-700
            transition-all
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              mb-4
            "
          >

            <p className="text-zinc-400">
              Generations
            </p>

            <Sparkles
              className="
                text-pink-400
              "
            />

          </div>

          <h2
            className="
              text-4xl
              font-bold
              text-pink-400
            "
          >

            {
              stats.generations
            }

          </h2>

        </div>

      </div>


      {/* Charts */}
      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
          mt-10
        "
      >

        {/* Revenue */}
        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-5
            md:p-6
          "
        >

          <h2
            className="
              text-2xl
              font-bold
              mb-6
            "
          >

            Revenue Analytics

          </h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <LineChart
              data={
                stats.revenueChart
              }
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
              />

              <XAxis
                dataKey="month"
                stroke="#a1a1aa"
              />

              <YAxis
                stroke="#a1a1aa"
              />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={4}
                dot={{ r: 5 }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>


        {/* Orders */}
        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-5
            md:p-6
          "
        >

          <h2
            className="
              text-2xl
              font-bold
              mb-6
            "
          >

            Weekly Orders

          </h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart
              data={
                stats.orderChart
              }
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
              />

              <XAxis
                dataKey="day"
                stroke="#a1a1aa"
              />

              <YAxis
                stroke="#a1a1aa"
              />

              <Tooltip />

              <Bar
                dataKey="orders"
                fill="#06b6d4"
                radius={[10, 10, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* Bottom */}
      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
          mt-10
        "
      >

        {/* Platform */}
        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-6
          "
        >

          <h2
            className="
              text-2xl
              font-bold
              mb-6
            "
          >

            Platform Overview

          </h2>


          <div className="space-y-5">

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <span className="text-zinc-400">
                Active Users
              </span>

              <span className="font-bold">
                {stats.users}
              </span>

            </div>


            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <span className="text-zinc-400">
                Orders
              </span>

              <span className="font-bold">
                {stats.orders}
              </span>

            </div>


            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <span className="text-zinc-400">
                AI Generations
              </span>

              <span className="font-bold">
                {stats.generations}
              </span>

            </div>


            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <span className="text-zinc-400">
                Revenue
              </span>

              <span
                className="
                  text-green-400
                  font-bold
                "
              >

                ₹{stats.revenue}

              </span>

            </div>

          </div>

        </div>


        {/* Recent Activity */}
        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-6
          "
        >

          <h2
            className="
              text-2xl
              font-bold
              mb-6
            "
          >

            Recent Activity

          </h2>


          <div className="space-y-5">

            {
              stats.recentActivity
                .length === 0 ? (

                <div className="text-zinc-500">

                  No recent activity

                </div>

              ) : (

                stats.recentActivity
                  .map(

                    (
                      activity,
                      index
                    ) => (

                      <div

                        key={index}

                        className="
                          border-b
                          border-zinc-800
                          pb-4
                        "
                      >

                        <p
                          className="
                            font-medium
                            capitalize
                          "
                        >

                          {
                            activity.title
                          }

                        </p>

                        <p
                          className="
                            text-sm
                            text-zinc-500
                            mt-1
                          "
                        >

                          Payment:
                          {" "}
                          {
                            activity.payment
                          }

                        </p>

                        <p
                          className="
                            text-sm
                            text-zinc-500
                          "
                        >

                          ₹{
                            activity.amount
                          }

                        </p>

                      </div>
                    )
                  )
              )
            }

          </div>

        </div>

      </div>

    </div>
  );
}