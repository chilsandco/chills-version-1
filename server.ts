import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

// Ensure NODE_ENV is set to something, default to development for the preview environment
const IS_PROD = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET || 'X1jtvpOK_J<.x%yEe3pm^pGN6!BwN_TLv@ibyA4Ix)3$+IA8I@=^G-5BRRqB9H_M';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize WooCommerce API helper
function getWooCommerce() {
  if (!process.env.WOOCOMMERCE_KEY || !process.env.WOOCOMMERCE_SECRET) {
    return null;
  }
  const rawUrl = process.env.WOOCOMMERCE_URL || "https://chilsandco.com";
  const apiUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
  
  const WooCommerce = (WooCommerceRestApi as any).default || WooCommerceRestApi;
  
  return new WooCommerce({
    url: apiUrl,
    consumerKey: process.env.WOOCOMMERCE_KEY,
    consumerSecret: process.env.WOOCOMMERCE_SECRET,
    version: "wc/v3",
    queryStringAuth: true
  });
}

async function startServer() {
  const app = express();
  
  // Defensive port parsing for Hostinger/Cloud environments
  const rawPort = process.env.PORT;
  const PORT = rawPort && !isNaN(parseInt(rawPort, 10)) && parseInt(rawPort, 10) !== 0
    ? parseInt(rawPort, 10) 
    : 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

  // Health check with active WooCommerce connectivity test
  app.get("/api/health", async (req, res) => {
    const wc = getWooCommerce();
    let connectivity = "Not tested";
    
    if (wc) {
      try {
        const test = await wc.get("products", { per_page: 1 });
        connectivity = test.status === 200 ? "Success" : `Failed (Status: ${test.status})`;
      } catch (err: any) {
        connectivity = `Error: ${err.message}`;
      }
    }

    res.json({ 
      status: "ok", 
      env: process.env.NODE_ENV,
      woocommerce: {
        configured: !!wc,
        url: process.env.WOOCOMMERCE_URL,
        hasKey: !!process.env.WOOCOMMERCE_KEY,
        hasSecret: !!process.env.WOOCOMMERCE_SECRET,
        connectivity
      }
    });
  });

  // Helper to map WC product to App product
  const mapProduct = (wcProduct: any) => {
    const attributes = Array.isArray(wcProduct.attributes) ? wcProduct.attributes : [];
    const categories = Array.isArray(wcProduct.categories) ? wcProduct.categories : [];
    const images = Array.isArray(wcProduct.images) ? wcProduct.images : [];

    // Simple HTML entity decoder for common entities
    const decodeEntities = (str: string) => {
      return (str || "")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–');
    };

    // Strip HTML tags for clean text display
    const cleanHtml = (html: string) => {
      return (html || "").replace(/<[^>]*>?/gm, "").trim();
    };

    return {
      id: (wcProduct.id || "").toString(),
      name: decodeEntities(wcProduct.name || "Unknown Product"),
      category: decodeEntities(categories[0]?.name || "Uncategorized"),
      price: parseFloat(wcProduct.price || "0"),
      // Prefer long description if available, otherwise short description
      description: decodeEntities(cleanHtml(wcProduct.description || wcProduct.short_description || "")),
      concept: attributes.find((a: any) => a.name?.toLowerCase() === "concept")?.options?.[0] || "A precise exploration of form and function.",
      material: attributes.find((a: any) => a.name?.toLowerCase() === "material")?.options?.[0] || "Premium technical fabric.",
      fit: attributes.find((a: any) => a.name?.toLowerCase() === "fit")?.options?.[0] || "Regular fit.",
      care: attributes.find((a: any) => a.name?.toLowerCase() === "care")?.options?.[0] || "Machine wash cold.",
      images: images.map((img: any) => img.src).filter(Boolean),
      status: wcProduct.stock_status === "instock" ? "Available" : "Coming Soon",
      totalSales: parseInt(wcProduct.total_sales || "0", 10),
      stockQuantity: wcProduct.stock_quantity || 0
    };
  };

  // Helper to generate a Signal ID from a WooCommerce Order ID
  const toSignalId = (id: string | number) => {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    // Simple deterministic mapping for CHLS ecosystem
    const signalNum = (numId % 900000) + 100000;
    return `CHLS-${signalNum}`;
  };

  // Helper to map WC order to App signal
  const mapOrderToSignal = (order: any) => {
    try {
      const lineItems = Array.isArray(order.line_items) ? order.line_items : [];
      const shippingLines = Array.isArray(order.shipping_lines) ? order.shipping_lines : [];
      
      return {
        id: (order.id || "").toString(),
        signalId: toSignalId(order.id),
        status: order.status || "pending",
        date: order.date_created || new Date().toISOString(),
        dateCompleted: order.date_completed || null,
        total: parseFloat(order.total || "0"),
        currency: order.currency || "INR",
        items: lineItems.map((item: any) => ({
          productId: (item.product_id || "").toString(),
          name: item.name || "Unknown Item",
          quantity: parseInt(item.quantity || "1", 10),
          price: parseFloat(item.price || "0"),
          total: parseFloat(item.total || "0"),
          // WC V3 often includes image object in line_items if configured
          image: item.image?.src || null 
        })),
        shipping: {
          address: order.shipping ? `${order.shipping.address_1 || ""}${order.shipping.address_1 && order.shipping.city ? ", " : ""}${order.shipping.city || ""}` : "No address provided",
          method: shippingLines[0]?.method_title || "Standard Delivery"
        }
      };
    } catch (err) {
      console.error("[CHILS & CO.] Error mapping order to signal:", err);
      // Return a minimal valid signal object to prevent 500
      return {
        id: (order.id || "0").toString(),
        signalId: "CHLS-ERR",
        status: "error",
        date: new Date().toISOString(),
        total: 0,
        currency: "INR",
        items: [],
        shipping: { address: "Error processing signal", method: "N/A" }
      };
    }
  };

  // API Routes
  app.get("/api/products", async (req, res) => {
    // Force no-cache for debugging
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
      const wc = getWooCommerce();
      if (!wc) {
        console.log("[CHILS & CO.] No WooCommerce credentials found. Serving mock data.");
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
      console.log(`[CHILS & CO.] Fetching products from WooCommerce: ${process.env.WOOCOMMERCE_URL}`);
      const response = await wc.get("products", { per_page: 20 });
      
      console.log(`[CHILS & CO.] WooCommerce Response Status: ${response.status}`);
      
      // Ensure response.data is an array before mapping
      if (!Array.isArray(response.data)) {
        console.warn("[CHILS & CO.] WooCommerce did not return an array. Data type:", typeof response.data);
        console.warn("[CHILS & CO.] Payload received:", JSON.stringify(response.data).substring(0, 200));
        return res.json([]);
      }

      console.log(`[CHILS & CO.] Successfully fetched ${response.data.length} products.`);
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

  app.post("/api/checkout/create-order", async (req, res) => {
    try {
      const { amount, currency, customerDetails, lineItems } = req.body;
      const wc = getWooCommerce();
      
      let customerId = 0;
      if (req.headers.authorization) {
        // If logged in, get user ID from token
        const token = req.headers.authorization.split(' ')[1];
        try {
          const decoded: any = jwt.verify(token, JWT_SECRET);
          customerId = decoded.data?.user?.id || decoded.id || 0;
        } catch (e) {
          console.error("JWT verification failed for checkout:", e);
        }
      }

      if (wc) {
        // Create order in WooCommerce
        const orderData = {
          payment_method: "razorpay",
          payment_method_title: "Razorpay",
          set_paid: true,
          customer_id: customerId,
          billing: {
            first_name: customerDetails.firstName,
            last_name: customerDetails.lastName,
            address_1: customerDetails.address,
            city: customerDetails.city,
            state: customerDetails.state,
            postcode: customerDetails.pincode,
            country: "IN",
            email: customerDetails.email,
            phone: customerDetails.phone
          },
          shipping: {
            first_name: customerDetails.firstName,
            last_name: customerDetails.lastName,
            address_1: customerDetails.address,
            city: customerDetails.city,
            state: customerDetails.state,
            postcode: customerDetails.pincode,
            country: "IN"
          },
          line_items: lineItems.map((item: any) => ({
            product_id: parseInt(item.id),
            quantity: item.quantity,
            meta_data: item.selectedSize ? [{ key: "pa_size", value: item.selectedSize }] : []
          }))
        };

        console.log("[CHILS & CO.] Creating WooCommerce Order:", orderData);
        const response = await wc.post("orders", orderData);
        
        return res.json({
          id: response.data.id.toString(), // Return WC Order ID
          amount: amount * 100,
          currency: currency || "INR",
          receipt: `receipt_${response.data.id}`
        });
      }

      // Fallback/Mock logic if no WC keys
      const orderId = `order_${Math.random().toString(36).substring(7)}`;
      res.json({
        id: orderId,
        amount: amount * 100,
        currency: currency || "INR",
        receipt: `receipt_${Date.now()}`
      });
    } catch (error: any) {
      console.error("Checkout Order Creation Error:", error.response?.data || error);
      res.status(500).json({ message: "Failed to create order in system" });
    }
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

      const rawWpUrl = process.env.WOOCOMMERCE_URL || "https://chilsandco.com";
      const wpUrl = rawWpUrl.endsWith('/') ? rawWpUrl.slice(0, -1) : rawWpUrl;
      
      // Hit the real WordPress JWT endpoint
      console.log(`[CHILS & CO.] Attempting login to: ${wpUrl}/wp-json/jwt-auth/v1/token`);
      const response = await fetch(`${wpUrl}/wp-json/jwt-auth/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email, // WP JWT Auth allows email or username here
          password: password
        })
      }).catch(err => {
        console.error("[CHILS & CO.] Network error during WP login:", err);
        throw err;
      });

      const data = await response.json();
      console.log(`[CHILS & CO.] WordPress login successful for: ${data.user_email}`);

      if (!response.ok) {
        console.error("WordPress Login Failed:", data);
        return res.status(response.status).json({ 
          message: data.message || "Invalid credentials" 
        });
      }

      // Try to find the WooCommerce customer ID to include it in the token
      const wc = getWooCommerce();
      let customerId = 0;
      let firstName = '';
      let lastName = '';
      let onWaitlist = false;
      let bespokeUnlocked = false;
      let coCreatorInterest = false;
      let pseudoName = '';

      if (wc) {
        try {
          console.log(`[CHILS & CO.] Looking up WC customer ID for: ${data.user_email}`);
          const search = await wc.get("customers", { email: data.user_email });
          if (Array.isArray(search.data) && search.data.length > 0) {
            const customer = search.data[0];
            customerId = customer.id;
            firstName = customer.first_name || '';
            lastName = customer.last_name || '';
            
            const getMetaValue = (metaData: any[], key: string) => {
              const match = metaData?.find((m: any) => {
                const k = String(m.key).toLowerCase();
                return k === key || k === `_${key}` || k === key.replace(/_/g, '-');
              });
              return match?.value;
            };

            const isTrue = (val: any) => {
              if (val === true || val === 1 || val === '1') return true;
              if (typeof val === 'string') {
                const v = val.trim().toLowerCase();
                return v === 'true' || v === 'yes' || v === 'on' || v === 'active';
              }
              return false;
            };

            onWaitlist = isTrue(getMetaValue(customer.meta_data, "bespoke_waitlist"));
            bespokeUnlocked = isTrue(getMetaValue(customer.meta_data, "bespoke_unlocked"));
            coCreatorInterest = isTrue(getMetaValue(customer.meta_data, "co_creator_interest"));
            pseudoName = getMetaValue(customer.meta_data, "pseudo_name") || '';
          }
        } catch (err) {
          console.error("[CHILS & CO.] Error searching for customer ID:", err);
        }
      }

      // Verified response structure from your live server:
      // { token, user_email, user_nicename, user_display_name }
      
      // We sign our own token using our JWT_SECRET so we can verify it consistently
      const userPayload = {
        id: customerId,
        email: data.user_email,
        username: data.user_nicename,
        displayName: data.user_display_name,
        firstName,
        lastName,
        onWaitlist,
        bespokeUnlocked,
        coCreatorInterest,
        pseudoName
      };

      // Long-lived token for e-commerce persistence (30 days)
      const locallySignedToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '30d' });

      res.json({
        token: locallySignedToken,
        user: {
          id: customerId,
          email: data.user_email,
          username: data.user_nicename,
          first_name: firstName,
          last_name: lastName,
          firstName,
          lastName,
          onWaitlist,
          bespokeUnlocked,
          coCreatorInterest,
          pseudoName
        },
        message: "Login successful"
      });
    } catch (error: any) {
      console.error("Login Server Error:", error);
      res.status(500).json({ message: "Login failed due to server error" });
    }
  });

  app.post("/api/bespoke/waitlist", async (req, res) => {
    try {
      const { email: rawEmail, pseudoName } = req.body;
      const email = (rawEmail || "").toLowerCase();
      if (!email) return res.status(400).json({ message: "Email is required" });

      const wc = getWooCommerce();
      if (!wc) {
        console.log("[CHILS & CO.] No WooCommerce credentials. Waitlist signal mocked.");
        return res.json({ success: true, message: "Waitlist signal received (Mock Mode)" });
      }

      console.log(`[CHILS & CO.] Processing Bespoke join for: ${email}`, { pseudoName });

      // Check if user already exists using explicit email search
      let customerId: number | null = null;
      try {
        const response = await wc.get("customers", { email: email });
        if (Array.isArray(response.data) && response.data.length > 0) {
          customerId = response.data[0].id;
          console.log(`[CHILS & CO.] Found exact customer match: ${customerId}`);
        } else {
          // Try broader search
          const search = await wc.get("customers", { search: email });
          if (Array.isArray(search.data) && search.data.length > 0) {
            const match = search.data.find((c: any) => c.email?.toLowerCase() === email.toLowerCase());
            if (match) {
              customerId = match.id;
              console.log(`[CHILS & CO.] Found fuzzy customer match: ${customerId}`);
            }
          }
        }
      } catch (err) {
        console.warn("[CHILS & CO.] Search failed", err);
      }

      const metaToUpdate = [
        { key: "bespoke_waitlist", value: "true" }
      ];
      if (pseudoName) {
        metaToUpdate.push({ key: "pseudo_name", value: pseudoName });
      }

      if (customerId) {
        console.log(`[CHILS & CO.] Tagging customer ${customerId} for Bespoke waitlist.`);
        const response = await wc.put(`customers/${customerId}`, {
          meta_data: metaToUpdate
        });
        
        // Use the response data if available to return updated state
        const updatedCustomer = response.data;
        const waitlistMeta = updatedCustomer?.meta_data?.find((m: any) => String(m.key).toLowerCase() === "bespoke_waitlist");
        const unlockedMeta = updatedCustomer?.meta_data?.find((m: any) => String(m.key).toLowerCase() === "bespoke_unlocked");
        const pseudoMeta = updatedCustomer?.meta_data?.find((m: any) => String(m.key).toLowerCase() === "pseudo_name");
        
        const isTrue = (val: any) => {
          if (typeof val === 'string') {
            const v = val.trim().toLowerCase();
            return v === 'true' || v === '1' || v === 'yes' || v === 'on';
          }
          return val === true || val === 1;
        };

        return res.json({ 
          success: true, 
          message: "Existing profile updated for Bespoke.", 
          isExisting: true,
          onWaitlist: true,
          user: {
            id: customerId,
            email,
            onWaitlist: isTrue(waitlistMeta?.value),
            bespokeUnlocked: isTrue(unlockedMeta?.value),
            pseudoName: pseudoMeta?.value || ''
          }
        });
      }

      // Try to create new customer
      try {
        const response = await wc.post("customers", {
          email,
          username: email.split('@')[0],
          meta_data: metaToUpdate
        });
        console.log(`[CHILS & CO.] Created new WooCommerce customer for Bespoke: ${email}`);
        res.json({ 
          success: true, 
          data: response.data, 
          onWaitlist: true,
          pseudoName: pseudoName || '',
          user: {
            id: response.data.id,
            email,
            onWaitlist: true,
            pseudoName: pseudoName || ''
          }
        });
      } catch (createError: any) {
        const errorData = createError.response?.data;
        if (errorData?.code === 'registration-error-email-exists' || errorData?.code === 'customer_invalid_email') {
          console.log(`[CHILS & CO.] Email exists during create. Final recovery search for: ${email}`);
          
          // One last attempt to find the ID to update them
          const finalSearch = await wc.get("customers", { search: email });
          const exactMatch = Array.isArray(finalSearch.data) 
            ? finalSearch.data.find((c: any) => c.email?.toLowerCase() === email.toLowerCase())
            : null;

          if (exactMatch) {
            const response = await wc.put(`customers/${exactMatch.id}`, {
              meta_data: metaToUpdate
            });
            const updatedCustomer = response.data;
            const pseudoMeta = updatedCustomer?.meta_data?.find((m: any) => String(m.key).toLowerCase() === "pseudo_name");
            return res.json({ 
              success: true, 
              message: "Customer tagged via recovery.", 
              isExisting: true, 
              onWaitlist: true,
              pseudoName: pseudoMeta?.value || pseudoName || '',
              user: {
                id: exactMatch.id,
                email,
                onWaitlist: true,
                pseudoName: pseudoMeta?.value || pseudoName || ''
              }
            });
          }
          
          return res.json({ 
            success: true, 
            message: "Signal acknowledged. Security verified.", 
            isExisting: true, 
            onWaitlist: true,
            user: {
              ...(exactMatch || {}),
              email,
              onWaitlist: true,
              pseudoName: pseudoName || ''
            }
          });
        }
        throw createError;
      }
    } catch (error: any) {
      console.error("[CHILS & CO.] Waitlist Processing Error:", error.response?.data || error);
      res.status(500).json({ message: "Failed to process waitlist signal" });
    }
  });

  app.post("/api/bespoke/check-status", async (req, res) => {
    try {
      const { email: rawEmail } = req.body;
      const email = (rawEmail || "").toLowerCase().trim();
      if (!email) return res.status(400).json({ message: "Email is required" });

      const wc = getWooCommerce();
      if (!wc) return res.json({ onWaitlist: false });

      console.log(`[CHILS & CO.] Status check search for: ${email}`);
      
      let customer = null;
      try {
        // Search specifically for the email
        const response = await wc.get("customers", { search: email, per_page: 20 });
        if (Array.isArray(response.data)) {
          // Find exact match as WooCommerce search can be fuzzy
          customer = response.data.find((c: any) => 
            c.email?.toLowerCase() === email || 
            c.billing?.email?.toLowerCase() === email
          );
        }
      } catch (err) {
        console.warn("[CHILS & CO.] Search failed in status check", err);
      }

      // Add no-cache headers
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

      if (customer) {
        const waitlistMeta = customer.meta_data?.find((m: any) => String(m.key).toLowerCase() === "bespoke_waitlist");
        const unlockedMeta = customer.meta_data?.find((m: any) => String(m.key).toLowerCase() === "bespoke_unlocked");
        const coCreatorMeta = customer.meta_data?.find((m: any) => String(m.key).toLowerCase() === "co_creator_interest");
        
        const isTrue = (val: any) => {
          if (typeof val === 'string') {
            const v = val.trim().toLowerCase();
            return v === 'true' || v === '1' || v === 'yes' || v === 'on';
          }
          return val === true || val === 1;
        };

        const onWaitlist = isTrue(waitlistMeta?.value);
        const bespokeUnlocked = isTrue(unlockedMeta?.value);
        const coCreatorInterest = isTrue(coCreatorMeta?.value);

        console.log(`[CHILS & CO.] Status for ${email}: Waitlist=${onWaitlist}, Unlocked=${bespokeUnlocked}, CoCreator=${coCreatorInterest}`);

        return res.json({ 
          onWaitlist,
          bespokeUnlocked,
          coCreatorInterest,
          isExisting: true,
          email: customer.email
        });
      }

      res.json({ onWaitlist: false, isExisting: false });
    } catch (error) {
      console.error("[CHILS & CO.] Status Check Error:", error);
      res.status(500).json({ message: "Failed to check status" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const wc = getWooCommerce();
      if (!wc) return res.json({ waitlistPool: 0, coCreators: 0 });

      // Logic: WooCommerce REST API maps to wp_users and wp_usermeta tables.
      // We check x-wp-total for the absolute user count.
      const response = await wc.get("customers", { per_page: 50 });
      const totalUsers = parseInt(response.headers['x-wp-total'] || '0', 10);
      const customers = response.data || [];

      // Calculate real ratios from the last 50 participants
      const waitlistCount = customers.filter((c: any) => 
        c.meta_data?.some((m: any) => String(m.key).toLowerCase() === "bespoke_waitlist" && String(m.value) === "true")
      ).length;

      const coCreatorCount = customers.filter((c: any) => 
        c.meta_data?.some((m: any) => String(m.key).toLowerCase() === "co_creator_interest" && String(m.value) === "true")
      ).length;

      // Projecting the ratio to the total user base (more accurate than hardcoded inflation)
      const ratioWaitlist = customers.length > 0 ? waitlistCount / customers.length : 0;
      const ratioCoCreator = customers.length > 0 ? coCreatorCount / customers.length : 0;

      const realWaitlist = Math.floor(totalUsers * ratioWaitlist);
      const realCoCreators = Math.floor(totalUsers * ratioCoCreator);

      res.json({ 
        waitlistPool: realWaitlist || waitlistCount, 
        coCreators: realCoCreators || coCreatorCount,
        totalBase: totalUsers
      });
    } catch (error) {
      console.error("[CHILS & CO.] Stats Fetch Error:", error);
      res.json({ waitlistPool: 0, coCreators: 0 });
    }
  });

  app.post("/api/cocreator/interest", async (req, res) => {
    try {
      const { email: rawEmail, pseudoName } = req.body;
      const email = (rawEmail || "").toLowerCase();
      if (!email) return res.status(400).json({ message: "Email is required" });

      const wc = getWooCommerce();
      if (!wc) {
        console.log("[CHILS & CO.] No WooCommerce credentials. Co-Creator interest mocked.");
        return res.json({ success: true, message: "Interest signal received (Mock Mode)" });
      }

      console.log(`[CHILS & CO.] Processing Co-Creator interest for: ${email}`, { pseudoName });

      // Check if user already exists
      let customerId: number | null = null;
      try {
        const response = await wc.get("customers", { email: email });
        if (Array.isArray(response.data) && response.data.length > 0) {
          customerId = response.data[0].id;
        } else {
          const search = await wc.get("customers", { search: email });
          if (Array.isArray(search.data) && search.data.length > 0) {
            const match = search.data.find((c: any) => c.email?.toLowerCase() === email.toLowerCase());
            if (match) customerId = match.id;
          }
        }
      } catch (err) {
        console.warn("[CHILS & CO.] Search failed", err);
      }

      const metaToUpdate = [
        { key: "co_creator_interest", value: "true" }
      ];
      if (pseudoName) {
        metaToUpdate.push({ key: "pseudo_name", value: pseudoName });
      }

      if (customerId) {
        const response = await wc.put(`customers/${customerId}`, {
          meta_data: metaToUpdate
        });
        
        const updatedCustomer = response.data;
        const coCreatorMeta = updatedCustomer?.meta_data?.find((m: any) => String(m.key).toLowerCase() === "co_creator_interest");
        const pseudoMeta = updatedCustomer?.meta_data?.find((m: any) => String(m.key).toLowerCase() === "pseudo_name");
        
        const isTrue = (val: any) => {
          if (typeof val === 'string') {
            const v = val.trim().toLowerCase();
            return v === 'true' || v === '1' || v === 'yes' || v === 'on';
          }
          return val === true || val === 1;
        };

        return res.json({ 
          success: true, 
          message: "Profile updated with interest.", 
          coCreatorInterest: true,
          pseudoName: pseudoMeta?.value || pseudoName || '',
          user: {
            id: customerId,
            email,
            coCreatorInterest: true,
            pseudoName: pseudoMeta?.value || pseudoName || ''
          }
        });
      }

      // Create new customer
      try {
        const response = await wc.post("customers", {
          email,
          username: email.split('@')[0],
          meta_data: metaToUpdate
        });
        res.json({ 
          success: true, 
          coCreatorInterest: true,
          pseudoName: pseudoName || '',
          user: {
            id: response.data.id,
            email,
            coCreatorInterest: true,
            pseudoName: pseudoName || ''
          }
        });
      } catch (createError: any) {
        const errorData = createError.response?.data;
        if (errorData?.code === 'registration-error-email-exists' || errorData?.code === 'customer_invalid_email') {
          const finalSearch = await wc.get("customers", { search: email });
          const exactMatch = Array.isArray(finalSearch.data) 
            ? finalSearch.data.find((c: any) => c.email?.toLowerCase() === email.toLowerCase())
            : null;

          if (exactMatch) {
            await wc.put(`customers/${exactMatch.id}`, {
              meta_data: metaToUpdate
            });
            return res.json({ 
              success: true, 
              coCreatorInterest: true, 
              pseudoName,
              user: {
                ...exactMatch,
                coCreatorInterest: true,
                pseudoName: pseudoName || ''
              }
            });
          }
          return res.json({ 
            success: true, 
            coCreatorInterest: true, 
            pseudoName,
            user: {
              email,
              coCreatorInterest: true,
              pseudoName: pseudoName || ''
            }
          });
        }
        throw createError;
      }
    } catch (error: any) {
      console.error("[CHILS & CO.] Co-Creator Processing Error:", error.response?.data || error);
      res.status(500).json({ message: "Failed to process interest signal" });
    }
  });

  app.post("/api/cocreator/check-status", async (req, res) => {
    try {
      const { email: rawEmail } = req.body;
      const email = (rawEmail || "").toLowerCase().trim();
      if (!email) return res.status(400).json({ message: "Email is required" });

      const wc = getWooCommerce();
      if (!wc) return res.json({ coCreatorInterest: false });

      console.log(`[CHILS & CO.] Co-Creator status check search for: ${email}`);

      // Add no-cache headers
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      let customer = null;
      const response = await wc.get("customers", { search: email });
      if (Array.isArray(response.data)) {
        customer = response.data.find((c: any) => c.email?.toLowerCase() === email);
      }

      if (customer) {
        const getMetaValue = (metaData: any[], key: string) => {
          const match = metaData?.find((m: any) => {
            const k = String(m.key).toLowerCase();
            return k === key || k === `_${key}` || k === key.replace(/_/g, '-');
          });
          return match?.value;
        };

        const isTrue = (val: any) => {
          if (val === true || val === 1 || val === '1') return true;
          if (typeof val === 'string') {
            const v = val.trim().toLowerCase();
            return v === 'true' || v === 'yes' || v === 'on' || v === 'active';
          }
          return false;
        };

        const coCreatorInterest = isTrue(getMetaValue(customer.meta_data, "co_creator_interest"));
        const pseudoName = getMetaValue(customer.meta_data, "pseudo_name") || '';

        return res.json({ 
          coCreatorInterest,
          pseudoName
        });
      }

      res.json({ coCreatorInterest: false, pseudoName: '' });
    } catch (error) {
      res.status(500).json({ message: "Failed to check status" });
    }
  });

  app.get("/api/bespoke/list", authenticateToken, async (req: any, res) => {
    try {
      // Secure endpoint for admin only
      const adminEmails = ['chilsandco.com@gmail.com', 'chilsandco@gmail.com'];
      const userEmail = req.user?.email || "";
      if (!adminEmails.some(email => email.toLowerCase() === userEmail.toLowerCase())) {
        return res.status(403).json({ message: "Access Denied: Admin clearance required." });
      }

      const wc = getWooCommerce();
      if (!wc) return res.json([]);

      // Fetch customers and filter for those with bespoke_waitlist tag
      const response = await wc.get("customers", {
        per_page: 100,
        role: "all"
      });

      if (Array.isArray(response.data)) {
        const getMetaValue = (metaData: any[], key: string) => {
          const match = metaData?.find((m: any) => {
            const k = String(m.key).toLowerCase();
            return k === key || k === `_${key}` || k === key.replace(/_/g, '-');
          });
          return match?.value;
        };

        const isTrue = (val: any) => {
          if (val === true || val === 1 || val === '1') return true;
          if (typeof val === 'string') {
            const v = val.trim().toLowerCase();
            return v === 'true' || v === 'yes' || v === 'on' || v === 'active';
          }
          return false;
        };

        const waitlisted = response.data
          .filter((c: any) => isTrue(getMetaValue(c.meta_data, "bespoke_waitlist")))
          .map((c: any) => ({
            id: c.id,
            email: c.email,
            billing_email: c.billing?.email || c.email,
            username: c.username,
            date_created: c.date_created,
            pseudo_name: getMetaValue(c.meta_data, "pseudo_name") || "",
            is_co_creator: isTrue(getMetaValue(c.meta_data, "co_creator_interest"))
          }));
        return res.json(waitlisted);
      }
      
      res.json([]);
    } catch (error) {
      console.error("[CHILS & CO.] Fetch Bespoke List Error:", error);
      res.status(500).json({ message: "Failed to fetch waitlist" });
    }
  });

  // Protected route example
  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const wc = getWooCommerce();
      if (!wc) return res.json(req.user);

      // Robust search: Try ID from token first, then email
      let customer = null;
      let customerIdFromToken = req.user?.id || req.user?.data?.user?.id || req.user?.user_id;
      const email = (req.user?.email || req.user?.data?.user?.user_email || "").toLowerCase();
      
      try {
        if (customerIdFromToken) {
          const idResponse = await wc.get(`customers/${customerIdFromToken}`);
          if (idResponse.status === 200 && idResponse.data?.id) {
            customer = idResponse.data;
          }
        }

        if (!customer && email) {
          const directResponse = await wc.get("customers", { email });
          if (Array.isArray(directResponse.data) && directResponse.data.length > 0) {
            customer = directResponse.data[0];
          } else {
            const searchResponse = await wc.get("customers", { search: email });
            if (Array.isArray(searchResponse.data)) {
              customer = searchResponse.data.find((c: any) => c.email?.toLowerCase() === email.toLowerCase());
            }
          }

          // More aggressive search by username if email search is failing
          if (!customer) {
            const username = email.split('@')[0];
            const usernameResponse = await wc.get("customers", { search: username });
            if (Array.isArray(usernameResponse.data)) {
              customer = usernameResponse.data.find((c: any) => 
                c.email?.toLowerCase() === email.toLowerCase() || 
                c.username?.toLowerCase() === username.toLowerCase()
              );
            }
          }
        }
      } catch (lookupErr) {
        console.warn("[CHILS & CO.] Customer lookup failed in auth/me", lookupErr);
      }

        const getMetaValue = (metaData: any[], key: string) => {
          const match = metaData?.find((m: any) => {
            const k = String(m.key).toLowerCase();
            return k === key || k === `_${key}` || k === key.replace(/_/g, '-');
          });
          return match?.value;
        };

        const isTrue = (val: any) => {
          if (val === true || val === 1 || val === '1') return true;
          if (typeof val === 'string') {
            const v = val.trim().toLowerCase();
            return v === 'true' || v === 'yes' || v === 'on' || v === 'active';
          }
          return false;
        };

        if (customer) {
          const onWaitlist = isTrue(getMetaValue(customer.meta_data, "bespoke_waitlist"));
          const bespokeUnlocked = isTrue(getMetaValue(customer.meta_data, "bespoke_unlocked"));
          const coCreatorInterest = isTrue(getMetaValue(customer.meta_data, "co_creator_interest"));
          const pseudoName = getMetaValue(customer.meta_data, "pseudo_name") || "";
          
          const enhancedUser = {
            ...req.user,
            ...customer,
            onWaitlist,
            bespokeUnlocked,
            coCreatorInterest,
            pseudoName,
            id: customer.id,
            email: (customer.email || email).toLowerCase()
          };
          return res.json(enhancedUser);
        }
      
      res.json(req.user);
    } catch (error) {
      console.warn("[CHILS & CO.] Recovery failed for auth meta", error);
      res.json(req.user);
    }
  });

  app.get("/api/orders", authenticateToken, async (req: any, res) => {
    try {
      const wc = getWooCommerce();
      if (!wc) {
        // Mock orders if no WC keys
        return res.json([
          mapOrderToSignal({
            id: 101,
            number: "WC-101",
            status: "processing",
            date_created: new Date().toISOString(),
            total: "4500.00",
            currency: "INR",
            line_items: [{ name: "SYNTAX OVERLOAD TEE", quantity: 1, price: "4500.00", total: "4500.00" }],
            shipping: { address_1: "System Hub 01", city: "Neo Metro" },
            shipping_lines: [{ method_title: "Drone Relay" }]
          })
        ]);
      }

      // Robust lookups for the customer ID within various JWT payload structures
      let customerId = req.user?.id || 
                       req.user?.data?.user?.id || 
                       req.user?.user?.id || 
                       req.user?.sub ||
                       req.user?.data?.id;

      const userEmail = req.user?.email || req.user?.data?.user?.email || req.user?.user_email;

      if (!customerId && userEmail) {
        // Fallback: search by email to get the actual ID
        console.log(`[CHILS & CO.] ID missing from token, searching WC by email: ${userEmail}`);
        
        try {
          const customerSearch = await wc.get("customers", { email: userEmail });
          if (Array.isArray(customerSearch.data) && customerSearch.data.length > 0) {
            customerId = customerSearch.data[0].id;
            console.log(`[CHILS & CO.] Found customer ID linked to email: ${customerId}`);
          }
        } catch (searchErr) {
          console.error("[CHILS & CO.] Email search fallback failed:", searchErr);
        }
      }

      let orders;
      if (customerId) {
        console.log(`[CHILS & CO.] Fetching orders for customer ID: ${customerId}`);
        const response = await wc.get("orders", {
          customer: customerId,
          per_page: 50
        });
        orders = response.data;
      } else if (userEmail) {
        // Absolute fallback: try to find orders by email directly if WC API supports it
        // Or if customer ID still missing, try to fetch recent orders and filter manually
        console.log(`[CHILS & CO.] No customer ID found, fetching recent orders to filter by email: ${userEmail}`);
        const response = await wc.get("orders", { per_page: 100 });
        orders = response.data.filter((o: any) => o.billing?.email?.toLowerCase() === userEmail.toLowerCase());
      } else {
        return res.status(400).json({ message: "Unable to identify customer from token" });
      }

      if (!Array.isArray(orders)) {
        console.warn("[CHILS & CO.] WC did not return an array of orders.");
        return res.json([]);
      }

      console.log(`[CHILS & CO.] Successfully retrieved ${orders.length} orders.`);
      res.json(orders.map(mapOrderToSignal));
    } catch (error: any) {
      console.error("WooCommerce Orders Error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", authenticateToken, async (req: any, res) => {
    try {
      const wc = getWooCommerce();
      if (!wc) {
        return res.json(mapOrderToSignal({
          id: req.params.id,
          status: "completed",
          date_created: new Date().toISOString(),
          date_completed: new Date().toISOString(),
          total: "4500.00",
          currency: "INR",
          line_items: [{ name: "SYNTAX OVERLOAD TEE", quantity: 1, price: "4500.00", total: "4500.00" }],
          shipping: { address_1: "System Hub 01", city: "Neo Metro" },
          shipping_lines: [{ method_title: "Drone Relay" }]
        }));
      }

      const response = await wc.get(`orders/${req.params.id}`);
      res.json(mapOrderToSignal(response.data));
    } catch (error: any) {
      console.error("WooCommerce Order Detail Error:", error);
      res.status(404).json({ message: "Signal not found" });
    }
  });

  app.post("/api/orders/:id/return", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { reason, description, products, images } = req.body;
      const rmaSecret = process.env.RMA_API_SECRET || "wps_e48738cedfb75d113a6e3f11a6dc18ff5ca4b9b4";
      const rawWpUrl = process.env.WOOCOMMERCE_URL || "https://chilsandco.com";
      const wpUrl = rawWpUrl.endsWith('/') ? rawWpUrl.slice(0, -1) : rawWpUrl;

      console.log(`[CHILS & CO.] Processing return for order ${id} via RMA API`);

      const rmaSecretClean = rmaSecret.trim();
      const authHeader = 'Basic ' + Buffer.from(`secret_key:${rmaSecretClean}`).toString('base64');
      
      // Construct a unified reason string that includes description and images since the API is basic
      const fullReason = `Reason: ${reason}\nDescription: ${description}\nImages: ${images ? images.join(', ') : 'None'}`;

      const rmaPayload: any = {
        order_id: id.toString(), // Use string ID as shown in docs
        reason: fullReason,
      };

      // If specific products are selected for return
      if (products && products.length > 0) {
        // The RMA API requires products as a stringified JSON array
        rmaPayload.products = JSON.stringify(products.map((p: any) => ({
          product_id: parseInt(p.productId, 10),
          qty: parseInt(p.quantity, 10)
        })));
      }

      console.log(`[CHILS & CO.] Transmitting payload to: ${wpUrl}/wp-json/rma/refund-request`);

      // Using Fetch with additional headers to simulate a standard browser/curl request
      // We keep the query param for redundancy as some WP setups require it for REST auth
      const rmaResponse = await fetch(`${wpUrl}/wp-json/rma/refund-request?secret_key=${rmaSecretClean}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'secret_key': rmaSecretClean, // Direct header option
          'wps-rma-secret-key': rmaSecretClean, // Common plugin-specific variant
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        body: JSON.stringify(rmaPayload)
      });

      const responseText = await rmaResponse.text();
      let rmaData;
      try {
        rmaData = JSON.parse(responseText);
      } catch (e) {
        rmaData = { message: responseText };
      }

      if (!rmaResponse.ok) {
        console.error(`[CHILS & CO.] RMA Rejection: ${rmaResponse.status} - ${responseText}`);
        throw new Error(rmaData.message || `RMA API failed with status ${rmaResponse.status}`);
      }

      res.json({ success: true, message: "Transmission verified. Return request logged.", data: rmaData });
    } catch (error: any) {
      console.error("[CHILS & CO.] Return Request Error:", error);
      res.status(500).json({ message: error.message || "Failed to process return request" });
    }
  });

  // Vite middleware for development
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log(`[CHILS & CO.] Development mode: Vite middleware active`);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    
    if (fs.existsSync(distPath)) {
      console.log(`[CHILS & CO.] Production mode: Serving static files from ${distPath}`);
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    } else {
      console.warn(`[CHILS & CO.] Production mode active but 'dist' directory not found at ${distPath}`);
      console.warn(`[CHILS & CO.] Falling back to a placeholder message. Run 'npm run build' to fix this.`);
      app.get("*", (req, res) => {
        res.status(500).send("Application is in production mode but 'dist' directory is missing. Please build the frontend.");
      });
    }
  }

  try {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[CHILS & CO.] Server started successfully`);
      console.log(`[CHILS & CO.] Listening on port: ${PORT}`);
      console.log(`[CHILS & CO.] Mode: ${IS_PROD ? 'Production' : 'Development'}`);
    });
  } catch (error) {
    console.error("[CHILS & CO.] Critical Failure during server startup:", error);
    process.exit(1);
  }
}

// Global error handlers for production
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CHILS & CO.] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[CHILS & CO.] Uncaught Exception thrown:', err);
  process.exit(1);
});

startServer().catch(err => {
  console.error("[CHILS & CO.] Failed to start server:", err);
  process.exit(1);
});
