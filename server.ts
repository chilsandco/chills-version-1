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

// Initialize WooCommerce API
const WOO_URL = process.env.WOOCOMMERCE_URL || "";
const WOO_KEY = process.env.WOOCOMMERCE_KEY || "";
const WOO_SECRET = process.env.WOOCOMMERCE_SECRET || "";

if (!WOO_URL || !WOO_KEY || !WOO_SECRET) {
  console.warn("⚠️ WooCommerce credentials missing. App will run in Mock Mode.");
}

const WooCommerce = new (WooCommerceRestApi as any).default({
  url: WOO_URL.startsWith('http') ? WOO_URL : `https://${WOO_URL}`,
  consumerKey: WOO_KEY,
  consumerSecret: WOO_SECRET,
  version: "wc/v3"
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Helper to map WC product to App product
  const mapProduct = (wcProduct: any) => {
    try {
      return {
        id: wcProduct.id.toString(),
        name: wcProduct.name,
        category: wcProduct.categories[0]?.name || "Uncategorized",
        price: parseFloat(wcProduct.price || "0"),
        description: (wcProduct.short_description || "").replace(/<[^>]*>?/gm, ""), // Strip HTML
        concept: wcProduct.attributes?.find((a: any) => a.name.toLowerCase() === "concept")?.options[0] || "A precise exploration of form and function.",
        material: wcProduct.attributes?.find((a: any) => a.name.toLowerCase() === "material")?.options[0] || "Premium technical fabric.",
        fit: wcProduct.attributes?.find((a: any) => a.name.toLowerCase() === "fit")?.options[0] || "Regular fit.",
        care: wcProduct.attributes?.find((a: any) => a.name.toLowerCase() === "care")?.options[0] || "Machine wash cold.",
        images: (wcProduct.images || []).map((img: any) => img.src),
        status: wcProduct.stock_status === "instock" ? "Available" : "Coming Soon"
      };
    } catch (err) {
      console.error("Mapping Error for product:", wcProduct.id, err);
      return null;
    }
  };

  // API Routes
  app.get("/api/products", async (req, res) => {
    try {
      if (!WOO_KEY) {
        console.log("Serving mock products (No API Key)");
        return res.json([
          {
            id: "t1",
            name: "SYNTAX OVERLOAD TEE (MOCK)",
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
      
      console.log(`Fetching products from: ${WOO_URL}`);
      const response = await WooCommerce.get("products", { per_page: 20 });
      const mappedProducts = response.data.map(mapProduct).filter(Boolean);
      res.json(mappedProducts);
    } catch (error: any) {
      console.error("WooCommerce API Error:", error.response?.data || error.message);
      res.status(500).json({ 
        message: "Failed to fetch products from WooCommerce",
        details: error.message 
      });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      if (!WOO_KEY) {
        return res.status(404).json({ message: "Product not found (Mock Mode)" });
      }
      const response = await WooCommerce.get(`products/${req.params.id}`);
      const product = mapProduct(response.data);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: "Product mapping failed" });
      }
    } catch (error: any) {
      console.error("WooCommerce API Error:", error.response?.data || error.message);
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
