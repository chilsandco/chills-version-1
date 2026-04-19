import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'X1jtvpOK_J<.x%yEe3pm^pGN6!BwN_TLv@ibyA4Ix)3$+IA8I@=^G-5BRRqB9H_M';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize WooCommerce API helper
function getWooCommerce() {
  if (!process.env.WOOCOMMERCE_KEY || !process.env.WOOCOMMERCE_SECRET) {
    return null;
  }
  return new (WooCommerceRestApi as any).default({
    url: process.env.WOOCOMMERCE_URL || "https://chilsandco.com",
    consumerKey: process.env.WOOCOMMERCE_KEY,
    consumerSecret: process.env.WOOCOMMERCE_SECRET,
    version: "wc/v3"
  });
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // JWT Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: "Invalid or expired token." });
      req.user = user;
      next();
    });
  };

  // Request logger for production debugging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => res.json({ status: "ok", env: process.env.NODE_ENV }));

  // Helper to map WC product to App product
  const mapProduct = (wcProduct: any) => ({
    id: wcProduct.id.toString(),
    name: wcProduct.name,
    category: wcProduct.categories[0]?.name || "Uncategorized",
    price: parseFloat(wcProduct.price || "0"),
    description: wcProduct.short_description.replace(/<[^>]*>?/gm, ""), // Strip HTML
    concept: wcProduct.attributes.find((a: any) => a.name.toLowerCase() === "concept")?.options[0] || "A precise exploration of form and function.",
    material: wcProduct.attributes.find((a: any) => a.name.toLowerCase() === "material")?.options[0] || "Premium technical fabric.",
    fit: wcProduct.attributes.find((a: any) => a.name.toLowerCase() === "fit")?.options[0] || "Regular fit.",
    care: wcProduct.attributes.find((a: any) => a.name.toLowerCase() === "care")?.options[0] || "Machine wash cold.",
    images: wcProduct.images.map((img: any) => img.src),
    status: wcProduct.stock_status === "instock" ? "Available" : "Coming Soon"
  });

  // API Routes
  app.get("/api/products", async (req, res) => {
    try {
      const wc = getWooCommerce();
      if (!wc) {
        // Fallback to mock data if credentials are missing
        return res.json([
          {
            id: "t1",
            name: "SYNTAX OVERLOAD TEE",
            category: "T-Shirts",
            price: 1899,
            description: "Heavyweight 240GSM cotton. Oversized fit. Screen printed graphics.",
            concept: "A tribute to the late-night refactoring sessions where logic becomes art.",
            material: "100% Organic Cotton, 240 GSM.",
            fit: "Oversized, dropped shoulders.",
            care: "Machine wash cold, inside out. Do not iron on print.",
            images: [
              "https://picsum.photos/seed/syntax1/1200/1600",
              "https://picsum.photos/seed/syntax2/1200/1600"
            ],
            status: "Available"
          }
        ]);
      }
      const response = await wc.get("products", { per_page: 20 });
      const mappedProducts = response.data.map(mapProduct);
      res.json(mappedProducts);
    } catch (error) {
      console.error("WooCommerce API Error:", error);
      res.status(500).json({ message: "Failed to fetch products from WooCommerce" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const wc = getWooCommerce();
      if (!wc) {
        return res.status(404).json({ message: "Product not found (Mock Mode)" });
      }
      const response = await wc.get(`products/${req.params.id}`);
      res.json(mapProduct(response.data));
    } catch (error) {
      console.error("WooCommerce API Error:", error);
      res.status(404).json({ message: "Product not found" });
    }
  });

  app.post("/api/checkout/create-order", (req, res) => {
    const { amount, currency } = req.body;
    // Razorpay placeholder logic
    const orderId = `order_${Math.random().toString(36).substring(7)}`;
    res.json({
      id: orderId,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`
    });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, first_name, last_name, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const wc = getWooCommerce();
      if (!wc) {
        // Mock success in development if no WC keys
        console.log("[CHILS & CO.] Registering mock customer:", email);
        return res.json({
          id: Math.floor(Math.random() * 1000),
          email,
          first_name: first_name || "",
          last_name: last_name || "",
          username: email.split('@')[0],
          message: "Registration successful (Mock Mode)"
        });
      }

      const customerData = {
        email,
        first_name: first_name || "",
        last_name: last_name || "",
        password,
        username: email.split('@')[0]
      };

      const response = await wc.post("customers", customerData);
      res.status(201).json(response.data);
    } catch (error: any) {
      console.error("WooCommerce Registration Error:", error.response?.data || error);
      const errorMessage = error.response?.data?.message || "Failed to register user";
      res.status(error.response?.status || 400).json({ message: errorMessage });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const wpUrl = process.env.WOOCOMMERCE_URL || "https://chilsandco.com";
      
      // Hit the real WordPress JWT endpoint
      const response = await fetch(`${wpUrl}/wp-json/jwt-auth/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email, // WP JWT Auth allows email or username here
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("WordPress Login Failed:", data);
        return res.status(response.status).json({ 
          message: data.message || "Invalid credentials" 
        });
      }

      // Verified response structure from your live server:
      // { token, user_email, user_nicename, user_display_name }
      res.json({
        token: data.token,
        user: {
          id: 0, // ID is hidden in token payload per standard response
          email: data.user_email,
          username: data.user_nicename
        },
        message: "Login successful"
      });
    } catch (error: any) {
      console.error("Login Server Error:", error);
      res.status(500).json({ message: "Login failed due to server error" });
    }
  });

  // Protected route example
  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json(req.user);
  });

  app.get("/api/orders", authenticateToken, async (req: any, res) => {
    try {
      const wc = getWooCommerce();
      if (!wc) {
        // Mock orders if no WC keys
        return res.json([
          {
            id: 101,
            number: "WC-101",
            status: "processing",
            date_created: new Date().toISOString(),
            total: "4500.00",
            line_items: [{ name: "SYNTAX OVERLOAD TEE", quantity: 1 }]
          }
        ]);
      }

      // The WordPress JWT plugin stores user data in data.user
      // We need to extract the user ID
      const customerId = req.user?.data?.user?.id;

      if (!customerId) {
        return res.status(400).json({ message: "Unable to identify customer from token" });
      }

      const response = await wc.get("orders", {
        customer: customerId,
        per_page: 10
      });

      res.json(response.data);
    } catch (error: any) {
      console.error("WooCommerce Orders Error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CHILS & CO.] Production Server started successfully`);
    console.log(`[CHILS & CO.] Listening on port: ${PORT}`);
    console.log(`[CHILS & CO.] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[CHILS & CO.] Servicing static files from: ${path.resolve(__dirname, "dist")}`);
  });
}

startServer();
