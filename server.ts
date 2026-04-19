import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize WooCommerce API helper
function getWooCommerce() {
  if (!process.env.WOOCOMMERCE_KEY || !process.env.WOOCOMMERCE_SECRET) {
    return null;
  }
  return new (WooCommerceRestApi as any).default({
    url: process.env.WOOCOMMERCE_URL || "https://example.com",
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
