import express from "express";
import cors from "cors";
import dns from "dns";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";

import { ConnectDB } from "./config/db.js";
import { auth } from "./lib/auth.js";
import CategoryRoute from "./routes/CategoryRoute.js";
import ProductRoute from "./routes/ProductRoute.js";
import ReviewRoute from "./routes/ReviewRoute.js";
import AddressRoute from "./routes/AddressRoute.js";
import WishlistRoute from "./routes/WishlistRoute.js";
import OrderRoute from "./routes/OrderRoute.js";
import CouponRoute from "./routes/CouponRoute.js";
import PaymentRoute from "./routes/PaymentRoute.js";
import AdminOrderRoute from "./routes/AdminOrderRoute.js";
import {stripeWebhook,} from "./controllers/PaymentController.js";
import CartRoute from "./routes/CartRoute.js";
import AdminProductRoute from "./routes/AdminProductRoute.js";
import AdminCategoryRoute from "./routes/AdminCategoryRoute.js";
import AdminUserRoute from "./routes/AdminUserRoute.js";
import AdminDashboardRoute from "./routes/AdminDashboardRoute.js";
import siteSettingsRoute from "./routes/SiteSettingRoute.js";
import UploadImageRoute from "./routes/UserRoute.js";

dotenv.config();

export const app = express();

dns.setServers([
  "1.1.1.1",
  "8.8.8.8",
]);

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);



app.all("/api/auth/*splat", toNodeHandler(auth));

app.post(
  "/api/payments/stripe-webhook",
  express.raw({
    type: "application/json",
  }),
  stripeWebhook
);

app.use(express.json());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "AtoZ Ecommerce server is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AtoZ Ecommerce API is working",
  });
});

app.use("/api/categories", CategoryRoute);
app.use("/api/products", ProductRoute);
app.use("/api/reviews", ReviewRoute);
app.use("/api/addresses", AddressRoute);
app.use("/api/wishlist", WishlistRoute);
app.use("/api/orders", OrderRoute);
app.use("/api/coupons", CouponRoute);
app.use("/api/payments", PaymentRoute);
app.use("/api/admin/orders", AdminOrderRoute);
app.use("/api/cart", CartRoute);
app.use("/api/admin/products", AdminProductRoute);
app.use("/api/admin/categories",AdminCategoryRoute)
app.use("/api/admin/users",AdminUserRoute);
app.use("/api/admin/dashboard", AdminDashboardRoute);
app.use("/api/site-settings", siteSettingsRoute);
app.use("/api/upload", UploadImageRoute);

ConnectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;