const express =
  require("express");

const http =
  require("http");

const mongoose =
  require("mongoose");

const cors =
  require("cors");

const dotenv =
  require("dotenv");

dotenv.config();


// =====================================
// ROUTES
// =====================================

const authRoutes =
  require("./routes/auth");

const generationRoutes =
  require("./routes/generation");

const wishlistRoutes =
  require("./routes/wishlist");

const cartRoutes =
  require("./routes/cart");

const orderRoutes =
  require("./routes/order");

// ==============================
// TEMPORARILY DISABLED FOR TESTING
// ==============================


//const paymentRoutes =
//  require("./routes/payment");

const adminRoutes =
  require("./routes/admin");

const uploadRoutes =
  require("./routes/upload");

const presetRoutes =
  require("./routes/presets");


// =====================================
// APP
// =====================================

const app =
  express();


// =====================================
// MIDDLEWARES
// =====================================

app.use(cors());

app.use(

  express.json({

    limit: "50mb"
  })
);


// =====================================
// TEST ROUTE
// =====================================

app.get("/", (req, res) => {

  res.send(
    "AI Clothing Backend Running 🚀"
  );
});


// =====================================
// API ROUTES
// =====================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/generation",
  generationRoutes
);

app.use(
  "/api/wishlist",
  wishlistRoutes
);

app.use(
  "/api/cart",
  cartRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);
// ==============================
// TEMPORARILY DISABLED FOR TESTING
// ==============================

//app.use(
//  "/api/payment",
//  paymentRoutes
//);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/upload",
  uploadRoutes
);

app.use(
  "/api/presets",
  presetRoutes
);


// =====================================
// MONGODB
// =====================================

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(async () => {
  console.log("MongoDB Connected");

  // 🌱 Auto-Admin Provisioning (dev/test mode only)
  // Grants admin role to a known dev email/phone or creates one if missing
  if (process.env.NODE_ENV !== "production") {
    try {
      const User = require("./models/User");

      // Check if admin already exists
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        console.log("✅ Admin user already exists:", existingAdmin.email || existingAdmin.phone);
      } else {
        // Look for a dev user by email or phone from env, or use a default
        const devEmail = process.env.ADMIN_EMAIL || "admin@example.com";
        const devPhone = process.env.ADMIN_PHONE || "+919999999999";

        let devUser = await User.findOne({
          $or: [{ email: devEmail }, { phone: devPhone }]
        });

        if (!devUser) {
          // Create a dev admin user if none exists
          devUser = await User.create({
            name: "Dev Admin",
            email: devEmail,
            phone: devPhone,
            phoneVerified: true,
            role: "admin",
            tier: "vip",
            weeklyLimit: 999,
            weeklyPromptsLeft: 999,
            extraPrompts: 0,
            promptCreditBalance: 0,
            lastPromptReset: new Date()
          });
          console.log("✅ Created dev admin user:", devEmail);
        } else {
          // Upgrade existing user to admin
          devUser.role = "admin";
          devUser.tier = "vip";
          devUser.weeklyLimit = 100;
          devUser.weeklyPromptsLeft = 100;
          await devUser.save();
          console.log("✅ Upgraded existing user to admin:", devEmail);
        }
      }
    } catch (err) {
      console.warn("⚠️ Auto-admin provisioning failed:", err.message);
    }
  }

  // 🔑 Production Admin Bootstrap
  // Set ADMIN_BOOTSTRAP_PHONE=+91XXXXXXXXXX in Render env vars, redeploy once,
  // and that account is promoted to admin + vip. Remove the env var afterwards.
  if (process.env.ADMIN_BOOTSTRAP_PHONE) {
    try {
      const User = require("./models/User");

      const bootstrapUser = await User.findOne({ phone: process.env.ADMIN_BOOTSTRAP_PHONE });

      if (!bootstrapUser) {
        console.warn("⚠️ Admin bootstrap: no user found with phone", process.env.ADMIN_BOOTSTRAP_PHONE);
      } else if (bootstrapUser.role === "admin") {
        console.log("✅ Admin bootstrap: user already admin:", bootstrapUser.phone);
      } else {
        bootstrapUser.role = "admin";
        bootstrapUser.tier = "vip";
        bootstrapUser.weeklyLimit = 100;
        bootstrapUser.weeklyPromptsLeft = 100;
        await bootstrapUser.save();
        console.log("✅ Admin bootstrap: promoted user to admin:", bootstrapUser.phone);
      }
    } catch (err) {
      console.warn("⚠️ Admin bootstrap failed:", err.message);
    }
  }
})
.catch((err) => {
  console.log("MongoDB ERROR:");
  console.log(err);
});

// =====================================
// PORT
// =====================================

const PORT =
  process.env.PORT || 5000;


// =====================================
// SERVER
// =====================================

const server =
  http.createServer(app);


// =====================================
// TIMEOUT
// =====================================

server.timeout =
  1000 * 60 * 5;


// =====================================
// START SERVER
// =====================================

server.listen(

  PORT,

  () => {

    console.log(
      `Server running on port ${PORT}`
    );
  }
);
