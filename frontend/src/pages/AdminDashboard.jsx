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


  // 📊 Fetch Dashboard
  useEffect(() => {

    fetchDashboardStats();

  }, []);


  const fetchDashboardStats =
    async () => {

      try {

        const { data } =
          await api.get(
            "/admin/dashboard"
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

      } catch (error) {

        console.error(
          "Dashboard Error:",
          error
        );

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
        pt-24
        md:p-8
        md:pt-8
      "
    >

      {/* Header */}
      <div className="mb-10">

        <h1
          className="
            text-4xl
            md:text-5xl
            font-bold
            mb-2
          "
        >

          Admin Dashboard

        </h1>

        <p
          className="
            text-zinc-400
            text-base
            md:text-lg
          "
        >

          Monitor your AI SaaS platform analytics

        </p>

      </div>


      {/* Stats */}
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-6
        "
      >

        {/* Revenue */}
        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-6
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
              Revenue
            </p>

            <DollarSign
              className="
                text-green-400
              "
            />

          </div>

          <h2
            className="
              text-4xl
              font-bold
              text-green-400
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
            rounded-3xl
            p-6
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
              Orders
            </p>

            <ShoppingCart
              className="
                text-cyan-400
              "
            />

          </div>

          <h2
            className="
              text-4xl
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
            rounded-3xl
            p-6
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
              Users
            </p>

            <Users
              className="
                text-purple-400
              "
            />

          </div>

          <h2
            className="
              text-4xl
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
            rounded-3xl
            p-6
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