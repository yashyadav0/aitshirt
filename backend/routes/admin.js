const express =
  require("express");

const router =
  express.Router();

const User =
  require("../models/User");

const Order =
  require("../models/Order");

const Product =
  require("../models/Product");

const Coupon =
  require("../models/Coupon");

const Generation =
  require("../models/Generation");

const authMiddleware =
  require("../middleware/authMiddleware");

const adminMiddleware =
  require("../middleware/adminMiddleware");


// =====================================
// 📊 DASHBOARD
// =====================================

router.get(

  "/dashboard",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      // 📊 Counts

      const totalUsers =
        await User.countDocuments();

      const totalOrders =
        await Order.countDocuments();

      const totalProducts =
        await Product.countDocuments();

      const totalCoupons =
        await Coupon.countDocuments();

      const totalGenerations =
        await Generation.countDocuments();


      // 💰 Revenue

      const paidOrders =
        await Order.find({

          paymentStatus: "paid"
        });


      let totalRevenue = 0;

      paidOrders.forEach(
        (order) => {

          totalRevenue +=
            order.finalAmount || 0;
        }
      );


      // 📈 Revenue Chart

      const revenueChart =
        await Order.aggregate([

          {
            $match: {

              paymentStatus: "paid"
            }
          },

          {
            $group: {

              _id: {

                month: {
                  $month: "$createdAt"
                }
              },

              revenue: {
                $sum: "$finalAmount"
              }
            }
          },

          {
            $sort: {

              "_id.month": 1
            }
          }
        ]);


      const monthNames = [

        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];


      const formattedRevenueChart =

        revenueChart.map(
          (item) => ({

            month:

              monthNames[
                item._id.month - 1
              ],

            revenue:
              item.revenue
          })
        );


      // 📦 Orders Chart

      const orderChart =
        await Order.aggregate([

          {
            $group: {

              _id: {

                day: {
                  $dayOfWeek:
                    "$createdAt"
                }
              },

              orders: {
                $sum: 1
              }
            }
          },

          {
            $sort: {

              "_id.day": 1
            }
          }
        ]);


      const dayNames = [

        "",
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
      ];


      const formattedOrderChart =

        orderChart.map(
          (item) => ({

            day:
              dayNames[
                item._id.day
              ],

            orders:
              item.orders
          })
        );


      // ⚡ Recent Activity

      const recentOrders =
        await Order.find()

          .sort({
            createdAt: -1
          })

          .limit(5);


      const recentActivity =

        recentOrders.map(
          (order) => ({

            title:
              `Order ${order.orderStatus}`,

            payment:
              order.paymentStatus,

            amount:
              order.finalAmount,

            time:
              order.createdAt
          })
        );


      // ✅ Response

      res.json({

        revenue:
          totalRevenue,

        orders:
          totalOrders,

        users:
          totalUsers,

        products:
          totalProducts,

        coupons:
          totalCoupons,

        generations:
          totalGenerations,

        revenueChart:
          formattedRevenueChart,

        orderChart:
          formattedOrderChart,

        recentActivity
      });

    } catch (err) {

      console.log(
        "ADMIN DASHBOARD ERROR:",
        err
      );

      res.status(500).json({

        error:
          err.message
      });
    }
  }
);


// =====================================
// 👥 GET USERS
// =====================================

router.get(

  "/users",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const users =
        await User.find()

          .sort({
            createdAt: -1
          });


      res.json(users);

    } catch (err) {

      console.log(
        "FETCH USERS ERROR:",
        err
      );

      res.status(500).json({

        error:
          err.message
      });
    }
  }
);


// =====================================
// 🚫 BLOCK / UNBLOCK USER
// =====================================

router.put(

  "/block-user/:id",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.id
        );


      if (!user) {

        return res.status(404)
          .json({

            error:
              "User not found"
          });
      }


      // 🔄 Toggle

      user.isBlocked =
        !user.isBlocked;


      await user.save();


      res.json({

        success: true,

        isBlocked:
          user.isBlocked
      });

    } catch (err) {

      console.log(
        "BLOCK USER ERROR:",
        err
      );

      res.status(500).json({

        error:
          err.message
      });
    }
  }
);


// =====================================
// 📦 GET ORDERS
// =====================================

router.get(

  "/orders",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const orders =
        await Order.find()

          .sort({
            createdAt: -1
          });


      res.json(orders);

    } catch (err) {

      console.log(
        "FETCH ORDERS ERROR:",
        err
      );

      res.status(500).json({

        error:
          err.message
      });
    }
  }
);


// =====================================
// ✏️ UPDATE ORDER STATUS
// =====================================

router.put(

  "/orders/:id",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const {
        orderStatus
      } = req.body;


      const order =
        await Order.findById(
          req.params.id
        );


      if (!order) {

        return res.status(404)
          .json({

            error:
              "Order not found"
          });
      }


      order.orderStatus =
        orderStatus;


      await order.save();


      res.json({

        success: true,
        order
      });

    } catch (err) {

      console.log(
        "UPDATE ORDER ERROR:",
        err
      );

      res.status(500)
        .json({

          error:
            err.message
        });
    }
  }
);


// =====================================
// 👕 GET PRODUCTS
// =====================================

router.get(

  "/products",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const products =
        await Product.find()

          .sort({
            createdAt: -1
          });


      res.json(products);

    } catch (err) {

      console.log(
        "FETCH PRODUCTS ERROR:",
        err
      );

      res.status(500).json({

        error:
          err.message
      });
    }
  }
);


// =====================================
// 🎟 GET COUPONS
// =====================================

router.get(

  "/coupons",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const coupons =
        await Coupon.find()

          .sort({
            createdAt: -1
          });


      res.json(coupons);

    } catch (err) {

      console.log(
        "FETCH COUPONS ERROR:",
        err
      );

      res.status(500).json({

        error:
          err.message
      });
    }
  }
);

// =====================================
// DELETE ORDER
// =====================================

router.delete(

  "/orders/:id",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const order =
        await Order.findById(
          req.params.id
        );


      if (!order) {

        return res.status(404)
          .json({

            error:
              "Order not found"
          });
      }


      await Order.findByIdAndDelete(
        req.params.id
      );


      res.json({

        success: true,

        message:
          "Order deleted"
      });

    } catch (err) {

      console.log(
        "DELETE ORDER ERROR:",
        err
      );

      res.status(500)
        .json({

          error:
            err.message
        });
    }
  }
);

// =====================================
// CREATE COUPON
// =====================================

router.post(

  "/coupons",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const {
        code,
        discount,
        expiryDate
      } = req.body;


      const existing =
        await Coupon.findOne({

          code
        });


      if (existing) {

        return res.status(400)
          .json({

            error:
              "Coupon already exists"
          });
      }


      const coupon =
        new Coupon({

          code:
            code.toUpperCase(),

          discount,

          expiryDate
        });


      await coupon.save();


      res.json(coupon);

    } catch (err) {

      console.log(
        "CREATE COUPON ERROR:",
        err
      );

      res.status(500)
        .json({

          error:
            err.message
        });
    }
  }
);


// =====================================
// DELETE COUPON
// =====================================

router.delete(

  "/coupons/:id",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      await Coupon.findByIdAndDelete(
        req.params.id
      );


      res.json({

        success: true
      });

    } catch (err) {

      console.log(
        "DELETE COUPON ERROR:",
        err
      );

      res.status(500)
        .json({

          error:
            err.message
        });
    }
  }
);
module.exports =
  router;