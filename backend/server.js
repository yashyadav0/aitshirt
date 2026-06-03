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


// =====================================
// MONGODB
// =====================================

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log("MongoDB Connected");
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