import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // Mock Product Data
  const products = [
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
    },
    {
      id: "t2",
      name: "SILICON WAFER TEE",
      category: "T-Shirts",
      price: 1999,
      description: "Premium pima cotton. Minimalist silicon pattern embroidery.",
      concept: "The foundation of everything we build, rendered in thread.",
      material: "95% Pima Cotton, 5% Elastane.",
      fit: "Regular fit, true to size.",
      care: "Hand wash recommended. Dry flat.",
      images: [
        "https://picsum.photos/seed/silicon1/1200/1600",
        "https://picsum.photos/seed/silicon2/1200/1600"
      ],
      status: "Available"
    },
    {
      id: "t3",
      name: "BINARY LOGIC HOODIE",
      category: "T-Shirts",
      price: 3499,
      description: "Brushed fleece interior. 400GSM. Minimalist binary code detail.",
      concept: "Zeros and ones. The only truth in a world of variables.",
      material: "80% Cotton, 20% Polyester Fleece.",
      fit: "Boxy fit.",
      care: "Cold wash. Tumble dry low.",
      images: [
        "https://picsum.photos/seed/binary1/1200/1600",
        "https://picsum.photos/seed/binary2/1200/1600"
      ],
      status: "Available"
    },
    {
      id: "s1",
      name: "DEBUGGER OVERSHIRT",
      category: "Shirts",
      price: 4500,
      description: "Technical fabric. Water resistant. Multiple utility pockets.",
      concept: "Engineered for the transition from terminal to the real world.",
      material: "Nylon Ripstop.",
      fit: "Relaxed overshirt fit.",
      care: "Wipe clean or delicate wash.",
      images: [
        "https://picsum.photos/seed/debug1/1200/1600",
        "https://picsum.photos/seed/debug2/1200/1600"
      ],
      status: "Coming Soon"
    }
  ];

  // API Routes
  app.get("/api/products", (req, res) => {
    res.json(products);
  });

  app.get("/api/products/:id", (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (product) {
      res.json(product);
    } else {
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
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error("Vite middleware error:", err);
      // Fallback to static serving if Vite fails
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
    }
  } else {
    // Production: serve built files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV})`);
  }).on("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
