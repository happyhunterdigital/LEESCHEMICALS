import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Customer, Order, Voucher, AnalyticsSummary, CategorySales, DailySales } from "./src/types.js";

// Initialize express app
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Database File Path
const DB_FILE = path.join(process.cwd(), "db.json");

// Default initial data for database seeding
const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-9",
    name: "Lee's Concentrated Washing Powder",
    category: "Home Hygiene",
    price: 145,
    description: "Professional-grade concentrated washing powder. Formulated with smart enzymes to lift deep-seated stains while keeping fabrics soft and vibrantly clean.",
    image: "https://res.cloudinary.com/dka0498ns/image/upload/v1782828369/LeesChemicals_WASHING-POWDER_b2hhsv.jpg",
    inventory: 60,
    initialStock: 60,
    sales: 0,
    rating: 4.8
  },
  {
    id: "prod-10",
    name: "Lee's Whitening Laundry Bleach",
    category: "Home Hygiene",
    price: 65,
    description: "Highly effective whitening and sanitizing laundry bleach. Restores dingy whites to brilliant brightness and disinfects household surfaces with ease.",
    image: "https://res.cloudinary.com/dka0498ns/image/upload/v1782828368/LeesChemicals_laundrybleach_avgb9w.jpg",
    inventory: 50,
    initialStock: 50,
    sales: 0,
    rating: 4.6
  },
  {
    id: "prod-11",
    name: "Lee's All-Purpose Green Cleaner",
    category: "Home Hygiene",
    price: 85,
    description: "Powerful, bio-friendly green cleaning concentrate. Cuts through stubborn grease, grime, and oil on any hard surface without leaving harsh residues.",
    image: "https://res.cloudinary.com/dka0498ns/image/upload/v1782828366/Lees_Chemicals_ALL-PURPOSE-CLEANER-GREENS-1_kzptil.jpg",
    inventory: 40,
    initialStock: 40,
    sales: 0,
    rating: 4.7
  },
  {
    id: "prod-12",
    name: "Lee's Ultra-Degreaser Dishwashing Liquid",
    category: "Home Hygiene",
    price: 48,
    description: "Active-foaming, skin-friendly dishwashing liquid. Enriched with lemon extracts to cut through thick grease instantly, leaving glassware sparkling clean.",
    image: "https://res.cloudinary.com/dka0498ns/image/upload/v1782828361/Lees_Chemicals_Dishwashing_Liquid_qrcaw6.jpg",
    inventory: 80,
    initialStock: 80,
    sales: 0,
    rating: 4.9
  },
  {
    id: "prod-13",
    name: "Lee's Multi-Surface Cleaning Cream",
    category: "Home Hygiene",
    price: 75,
    description: "Micro-abrasive ammonia-free cleaning cream. Safely polishes and deep-cleans sinks, stoves, tiles, and stainless steel without scratching.",
    image: "https://res.cloudinary.com/dka0498ns/image/upload/v1782828364/LeesChemicals_cleaning-cream-BACK_f4uqha.jpg",
    inventory: 45,
    initialStock: 45,
    sales: 0,
    rating: 4.5
  },
  {
    id: "prod-14",
    name: "Lee's Professional Tyre & Dash Shine",
    category: "Automotive Care",
    price: 165,
    description: "Premium silicone-based trim restorer. Protects rubber, vinyl, and plastic from UV damage while producing a deep, long-lasting high-gloss shine.",
    image: "https://res.cloudinary.com/dka0498ns/image/upload/v1782828366/Lees_Chemicals_tyre-dash-official_xj8wit.jpg",
    inventory: 35,
    initialStock: 35,
    sales: 0,
    rating: 4.8
  },
  {
    id: "prod-15",
    name: "Lee's Premium Leather Cleaner",
    category: "Automotive Care",
    price: 185,
    description: "PH-balanced, deeply penetrating leather care solution. Safely lifts embedded soil from leather upholstery and car seats while restoring natural oils.",
    image: "https://res.cloudinary.com/dka0498ns/image/upload/v1782828363/LeesChemicals_Leather_cleaner_apdwfx.jpg",
    inventory: 30,
    initialStock: 30,
    sales: 0,
    rating: 4.7
  },
  {
    id: "prod-16",
    name: "Lee's Heavy-Duty Hand Grit Cleaner",
    category: "Automotive Care",
    price: 110,
    description: "Workshop-grade hand cleaner formulated with polyurethane grit. Easily emulsifies stubborn grease, paint, ink, and automotive oils while nourishing skin.",
    image: "https://res.cloudinary.com/dka0498ns/image/upload/v1782828362/LeesChemicals_hand_grit_cleaner_vpyxcz.jpg",
    inventory: 50,
    initialStock: 50,
    sales: 0,
    rating: 4.9
  }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Sibongile Ndlovu",
    email: "sibongile.ndlovu@example.com",
    avatarColor: "emerald",
    joinDate: "2025-08-15",
    totalSpent: 12450,
    points: 1200,
    lifetimePoints: 1850,
    tier: "Gold",
    vouchers: [
      {
        id: "vch-1",
        code: "SVR-GOLD-50",
        amount: 50,
        pointsCost: 500,
        used: false,
        dateCreated: "2026-05-10"
      }
    ],
    orderHistory: [
      {
        id: "ord-101",
        customerId: "cust-1",
        customerName: "Sibongile Ndlovu",
        date: "2026-05-10",
        items: [
          { productId: "prod-2", name: "AuraGlow Ambient Light Wave", price: 1200, quantity: 1 },
          { productId: "prod-3", name: "KipCup Brew Press Travel Mug", price: 450, quantity: 2 }
        ],
        subtotal: 2100,
        discountApplied: 105, // 5% discount previously
        pointsEarned: 210,
        pointsRedeemed: 0,
        total: 1995
      },
      {
        id: "ord-104",
        customerId: "cust-1",
        customerName: "Sibongile Ndlovu",
        date: "2026-06-12",
        items: [
          { productId: "prod-5", name: "AeroSound ANC True Wireless Pods", price: 1800, quantity: 2 }
        ],
        subtotal: 3600,
        discountApplied: 360, // 10% Gold discount
        pointsEarned: 540, // 1.5x points for Gold
        pointsRedeemed: 0,
        total: 3240
      }
    ]
  },
  {
    id: "cust-2",
    name: "Leroy Smith",
    email: "leroy.smith@example.com",
    avatarColor: "blue",
    joinDate: "2026-02-10",
    totalSpent: 450,
    points: 45,
    lifetimePoints: 45,
    tier: "Bronze",
    vouchers: [],
    orderHistory: [
      {
        id: "ord-102",
        customerId: "cust-2",
        customerName: "Leroy Smith",
        date: "2026-02-12",
        items: [
          { productId: "prod-3", name: "KipCup Brew Press Travel Mug", price: 450, quantity: 1 }
        ],
        subtotal: 450,
        discountApplied: 0,
        pointsEarned: 45, // 1x points for Bronze
        pointsRedeemed: 0,
        total: 450
      }
    ]
  },
  {
    id: "cust-3",
    name: "Amara Okafor",
    email: "amara.okafor@example.com",
    avatarColor: "purple",
    joinDate: "2024-11-05",
    totalSpent: 42000,
    points: 4500,
    lifetimePoints: 5200,
    tier: "Platinum",
    vouchers: [],
    orderHistory: [
      {
        id: "ord-103",
        customerId: "cust-3",
        customerName: "Amara Okafor",
        date: "2026-04-20",
        items: [
          { productId: "prod-5", name: "AeroSound ANC True Wireless Pods", price: 1800, quantity: 3 },
          { productId: "prod-6", name: "SolarArc Foldable Power Station", price: 2400, quantity: 2 }
        ],
        subtotal: 10200,
        discountApplied: 1530, // 15% Platinum discount
        pointsEarned: 2040, // 2x points for Platinum
        pointsRedeemed: 0,
        total: 8670
      }
    ]
  }
];

// Seed db.json if not present
function initializeDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    const data = {
      products: INITIAL_PRODUCTS,
      customers: INITIAL_CUSTOMERS,
      orders: [...INITIAL_CUSTOMERS.flatMap(c => c.orderHistory)]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    console.log("Database seeded successfully at", DB_FILE);
  }
}

initializeDatabase();

// Database read/write helpers
function readDB(): { products: Product[]; customers: Customer[]; orders: Order[] } {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database file, returning default structure", err);
    return { products: INITIAL_PRODUCTS, customers: INITIAL_CUSTOMERS, orders: [] };
  }
}

function writeDB(data: { products: Product[]; customers: Customer[]; orders: Order[] }) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing to database file", err);
  }
}

// REST APIs

// 1. Get database products, customers, and active customer details
app.get("/api/products", (req, res) => {
  const db = readDB();
  res.json(db.products);
});

app.get("/api/customers", (req, res) => {
  const db = readDB();
  res.json(db.customers);
});

// Create customer
app.post("/api/customers", (req, res) => {
  const { name, email, avatarColor } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const db = readDB();
  const existing = db.customers.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Customer with this email already exists" });
  }

  const newCustomer: Customer = {
    id: `cust-${Date.now()}`,
    name,
    email,
    avatarColor: avatarColor || "rose",
    joinDate: new Date().toISOString().split('T')[0],
    totalSpent: 0,
    points: 0,
    lifetimePoints: 0,
    tier: "Bronze",
    vouchers: [],
    orderHistory: []
  };

  db.customers.push(newCustomer);
  writeDB(db);
  res.status(201).json(newCustomer);
});

// Update stock (Inventory Management)
app.post("/api/products/stock", (req, res) => {
  const { productId, quantity, operation } = req.body; // operation: 'add' | 'set'
  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  const db = readDB();
  const product = db.products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (operation === "add") {
    product.inventory += Number(quantity);
    if (product.inventory < 0) product.inventory = 0;
  } else {
    product.inventory = Math.max(0, Number(quantity));
  }

  writeDB(db);
  res.json({ success: true, product });
});

// Create product (Inventory Management - Adding new products)
app.post("/api/products", (req, res) => {
  const { name, category, price, description, image, inventory, rating, loyaltyExclusive, pointsCost } = req.body;
  if (!name || !category || !price || inventory === undefined) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  const db = readDB();
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name,
    category,
    price: Number(price),
    description: description || "",
    image: image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
    inventory: Number(inventory),
    initialStock: Number(inventory),
    sales: 0,
    rating: Number(rating) || 4.5,
    loyaltyExclusive: !!loyaltyExclusive,
    pointsCost: loyaltyExclusive ? Number(pointsCost) : undefined
  };

  db.products.push(newProduct);
  writeDB(db);
  res.status(201).json(newProduct);
});

// Place order (Seamless Checkout & Point accumulation & reward redemption)
app.post("/api/orders", (req, res) => {
  const { customerId, items, usePointsAmount, redeemVoucherId, forcePointsOnlyBuy } = req.body;
  // items is array of { productId, quantity }
  if (!customerId || !items || !items.length) {
    return res.status(400).json({ error: "Invalid order parameters" });
  }

  const db = readDB();
  const customer = db.customers.find(c => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  // Calculate prices and check stock
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = db.products.find(p => p.id === item.productId);
    if (!product) {
      return res.status(404).json({ error: `Product ${item.productId} not found` });
    }
    if (product.inventory < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for product ${product.name}` });
    }
    subtotal += product.price * item.quantity;
    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity
    });
  }

  // Calculate tier discounts
  let tierDiscountPercent = 0;
  if (customer.tier === "Silver") tierDiscountPercent = 0.05;
  else if (customer.tier === "Gold") tierDiscountPercent = 0.10;
  else if (customer.tier === "Platinum") tierDiscountPercent = 0.15;

  let discountApplied = subtotal * tierDiscountPercent;
  let remainingTotal = subtotal - discountApplied;

  // Apply Voucher if any
  if (redeemVoucherId) {
    const voucherIndex = customer.vouchers.findIndex(v => v.id === redeemVoucherId && !v.used);
    if (voucherIndex !== -1) {
      const voucher = customer.vouchers[voucherIndex];
      discountApplied += voucher.amount;
      voucher.used = true;
      remainingTotal = Math.max(0, remainingTotal - voucher.amount);
    }
  }

  // Apply direct points redemption if requested
  // Rule: 10 points = R1.00 (discount of points / 10)
  let pointsRedeemed = 0;
  if (usePointsAmount && usePointsAmount > 0) {
    const availablePoints = customer.points;
    const requestedPoints = Math.min(availablePoints, usePointsAmount);
    const directDiscount = requestedPoints / 10;
    
    if (directDiscount > 0) {
      pointsRedeemed = requestedPoints;
      discountApplied += directDiscount;
      remainingTotal = Math.max(0, remainingTotal - directDiscount);
    }
  }

  // Loyalty Exclusive Check: if they bought an item using pure points
  let loyaltyPointsDeducted = 0;
  for (const item of items) {
    const product = db.products.find(p => p.id === item.productId);
    if (product?.loyaltyExclusive && product.pointsCost) {
      const totalPointsCost = product.pointsCost * item.quantity;
      if (customer.points < totalPointsCost && !forcePointsOnlyBuy) {
        return res.status(400).json({ error: `You need ${totalPointsCost} points to redeem ${product.name}.` });
      }
      if (forcePointsOnlyBuy || (product.loyaltyExclusive && product.pointsCost)) {
        loyaltyPointsDeducted += totalPointsCost;
        // In this case, standard cash cost is zero for this item
        subtotal -= product.price * item.quantity;
        remainingTotal = Math.max(0, remainingTotal - (product.price * item.quantity));
      }
    }
  }

  if (loyaltyPointsDeducted > customer.points) {
    return res.status(400).json({ error: "Insufficient loyalty points for exclusive items." });
  }

  // Total points to deduct
  const totalPointsToDeduct = pointsRedeemed + loyaltyPointsDeducted;
  customer.points -= totalPointsToDeduct;

  // Accumulate loyalty points for remaining cash spent
  // Points earned based on cash spent (R10 spent = points)
  // Bronze: 1 point per R10 (0.1)
  // Silver: 1.2 points per R10 (0.12)
  // Gold: 1.5 points per R10 (0.15)
  // Platinum: 2.0 points per R10 (0.20)
  let multiplier = 0.1;
  if (customer.tier === "Silver") multiplier = 0.12;
  else if (customer.tier === "Gold") multiplier = 0.15;
  else if (customer.tier === "Platinum") multiplier = 0.20;

  const pointsEarned = Math.round(remainingTotal * multiplier);

  // Update customer fields
  customer.totalSpent += remainingTotal;
  customer.points += pointsEarned;
  customer.lifetimePoints += pointsEarned;

  // Re-calculate membership tiers based on lifetime points
  // Bronze: up to 500
  // Silver: 501 - 1500
  // Gold: 1501 - 4000
  // Platinum: 4001+
  let oldTier = customer.tier;
  if (customer.lifetimePoints <= 500) customer.tier = "Bronze";
  else if (customer.lifetimePoints <= 1500) customer.tier = "Silver";
  else if (customer.lifetimePoints <= 4000) customer.tier = "Gold";
  else customer.tier = "Platinum";

  // Deduct actual product inventory and count sales
  for (const item of items) {
    const product = db.products.find(p => p.id === item.productId);
    if (product) {
      product.inventory -= item.quantity;
      product.sales += item.quantity;
    }
  }

  // Create Order Record
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    customerId: customer.id,
    customerName: customer.name,
    date: new Date().toISOString().split('T')[0],
    items: orderItems,
    subtotal: Number(subtotal.toFixed(2)),
    discountApplied: Number(discountApplied.toFixed(2)),
    pointsEarned,
    pointsRedeemed: totalPointsToDeduct,
    total: Number(remainingTotal.toFixed(2))
  };

  customer.orderHistory.unshift(newOrder);
  db.orders.unshift(newOrder);

  writeDB(db);

  res.status(201).json({
    success: true,
    order: newOrder,
    customer,
    pointsEarned,
    oldTier,
    newTier: customer.tier,
    tierUpgraded: oldTier !== customer.tier && customer.lifetimePoints > 500
  });
});

// Redeem Points for Store Vouchers (Loyalty System)
app.post("/api/customers/redeem-voucher", (req, res) => {
  const { customerId, voucherOption } = req.body; // voucherOption: 'R50' | 'R100' | 'R250'
  if (!customerId || !voucherOption) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  const db = readDB();
  const customer = db.customers.find(c => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  let pointsCost = 0;
  let amount = 0;

  if (voucherOption === "R50") {
    pointsCost = 500;
    amount = 50;
  } else if (voucherOption === "R100") {
    pointsCost = 1000;
    amount = 100;
  } else if (voucherOption === "R250") {
    pointsCost = 2200; // Special 12% discount on bulk points redemption!
    amount = 250;
  } else {
    return res.status(400).json({ error: "Invalid voucher option" });
  }

  if (customer.points < pointsCost) {
    return res.status(400).json({ error: "Insufficient loyalty points" });
  }

  // Deduct points
  customer.points -= pointsCost;

  const newVoucher: Voucher = {
    id: `vch-${Date.now()}`,
    code: `SVR-${voucherOption}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    amount,
    pointsCost,
    used: false,
    dateCreated: new Date().toISOString().split('T')[0]
  };

  customer.vouchers.push(newVoucher);
  writeDB(db);

  res.json({ success: true, customer, voucher: newVoucher });
});

// AI Personalization Route (Gemini powered product recommendations)
app.post("/api/recommendations", async (req, res) => {
  const { customerId } = req.body;
  if (!customerId) {
    return res.status(400).json({ error: "Customer ID is required" });
  }

  const db = readDB();
  const customer = db.customers.find(c => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  const availableProducts = db.products;

  // Let's check if the Gemini API Key is available
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
    console.warn("GEMINI_API_KEY is not configured or left at placeholder. Using high-quality local rule personalization fallback engine.");
    return res.json({
      recommendations: getRuleBasedRecommendations(customer, availableProducts),
      aiGrounded: false
    });
  }

  try {
    // Generate AI recommendations
    // Map available products to small summary so model doesn't hit token boundaries
    const productSummaries = availableProducts.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description,
      loyaltyExclusive: !!p.loyaltyExclusive,
      pointsCost: p.pointsCost
    }));

    const customerSummary = {
      name: customer.name,
      tier: customer.tier,
      points: customer.points,
      totalSpent: customer.totalSpent,
      previouslyPurchased: customer.orderHistory.flatMap(o => o.items.map(i => i.name))
    };

    const systemInstruction = `You are a sophisticated retail AI personalization engine. Your task is to recommend exactly 3 products from the available catalog to a specific customer based on their tier, current points, and purchase history.
For each recommendation, write a personalized, highly engaging 1-2 sentence description explaining exactly why this product fits their lifestyle or membership tier. Be friendly, retail-savvy, and specific. Keep formatting elegant.`;

    const prompt = `
CUSTOMER DETAILS:
${JSON.stringify(customerSummary, null, 2)}

AVAILABLE PRODUCTS CATALOG:
${JSON.stringify(productSummaries, null, 2)}

Provide exactly 3 recommendations, returning a valid JSON array matching the schema. Do not output any markdown wrapper except valid raw JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              productId: { type: Type.STRING, description: "The product's ID matching the catalog" },
              productName: { type: Type.STRING, description: "The product's exact name matching the catalog" },
              reason: { type: Type.STRING, description: "Personalized explanation of why they will love it" },
              confidence: { type: Type.NUMBER, description: "Match probability score between 0.0 and 1.0" }
            },
            required: ["productId", "productName", "reason", "confidence"]
          }
        }
      }
    });

    const text = response.text || "[]";
    const parsedRecommendations = JSON.parse(text.trim());
    
    // Map the returned suggestions back to actual products to ensure IDs are absolutely correct
    const finalized = parsedRecommendations
      .map((rec: any) => {
        const prod = availableProducts.find(p => p.id === rec.productId || p.name === rec.productName);
        if (prod) {
          return {
            productId: prod.id,
            productName: prod.name,
            reason: rec.reason,
            confidence: rec.confidence || 0.90
          };
        }
        return null;
      })
      .filter((x: any) => x !== null);

    if (finalized.length > 0) {
      return res.json({ recommendations: finalized.slice(0, 3), aiGrounded: true });
    } else {
      // Fallback if AI output doesn't match product IDs
      return res.json({
        recommendations: getRuleBasedRecommendations(customer, availableProducts),
        aiGrounded: false,
        note: "AI generated results were unmatched, fallback applied"
      });
    }

  } catch (error) {
    console.error("Gemini personalization API error, executing fallback:", error);
    return res.json({
      recommendations: getRuleBasedRecommendations(customer, availableProducts),
      aiGrounded: false
    });
  }
});

// Analytics Dashboard Endpoint
app.get("/api/analytics", (req, res) => {
  const db = readDB();
  const products = db.products;
  const customers = db.customers;
  const orders = db.orders;

  // 1. Core totals
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const pointsIssued = customers.reduce((sum, c) => sum + c.lifetimePoints, 0);
  const pointsRedeemed = orders.reduce((sum, o) => sum + o.pointsRedeemed, 0);

  // 2. Category sales aggregation
  const categoryMap: { [key: string]: { revenue: number; units: number } } = {};
  // Standard categories
  products.forEach(p => {
    categoryMap[p.category] = { revenue: 0, units: 0 };
  });

  orders.forEach(o => {
    o.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const cat = prod ? prod.category : "Uncategorized";
      if (!categoryMap[cat]) {
        categoryMap[cat] = { revenue: 0, units: 0 };
      }
      categoryMap[cat].revenue += item.price * item.quantity;
      categoryMap[cat].units += item.quantity;
    });
  });

  const categoryBreakdown: CategorySales[] = Object.keys(categoryMap).map(cat => ({
    category: cat,
    revenue: Number(categoryMap[cat].revenue.toFixed(2)),
    units: categoryMap[cat].units
  }));

  // 3. Sales over time (last 7 days simulation based on orders dates)
  // Let's aggregate orders by date
  const dailyMap: { [date: string]: { revenue: number; orders: number } } = {};
  
  // Initialize last 7 days including today
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyMap[dateStr] = { revenue: 0, orders: 0 };
  }

  orders.forEach(o => {
    if (dailyMap[o.date] !== undefined) {
      dailyMap[o.date].revenue += o.total;
      dailyMap[o.date].orders += 1;
    } else {
      // If order dates are earlier than 7 days, just add them optionally or keep list updated
      dailyMap[o.date] = { revenue: o.total, orders: 1 };
    }
  });

  const dailySales: DailySales[] = Object.keys(dailyMap)
    .sort()
    .map(date => ({
      date: formatDateString(date),
      revenue: Number(dailyMap[date].revenue.toFixed(2)),
      orders: dailyMap[date].orders
    }));

  // 4. Top Selling Products
  const topSellingProducts = [...products]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4)
    .map(p => ({
      id: p.id,
      name: p.name,
      sales: p.sales,
      revenue: p.sales * p.price
    }));

  // 5. Low stock indicators
  const lowStockItems = products.filter(p => p.inventory <= 5);

  const summary: AnalyticsSummary = {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalOrders,
    totalCustomers,
    pointsIssued,
    pointsRedeemed,
    categoryBreakdown,
    dailySales,
    topSellingProducts,
    lowStockItems
  };

  res.json(summary);
});

// Local personal rule engine fallback helper
function getRuleBasedRecommendations(customer: Customer, products: Product[]): any[] {
  const purchasedIds = new Set(customer.orderHistory.flatMap(o => o.items.map(i => i.productId)));
  const list = [];

  // Suggest products they haven't bought yet
  const unpurchased = products.filter(p => !purchasedIds.has(p.id));

  // 1. If Platinum / Gold: Recommend high-value smart items or loyalty items if they have points
  if (customer.tier === "Platinum" || customer.tier === "Gold") {
    const highEnd = unpurchased.find(p => p.price >= 1000 && !p.loyaltyExclusive);
    const loyaltyItem = unpurchased.find(p => p.loyaltyExclusive && customer.points >= (p.pointsCost || 99999));
    
    if (highEnd) {
      list.push({
        productId: highEnd.id,
        productName: highEnd.name,
        reason: `As a premium ${customer.tier} loyalty member, you get 10%+ off on high-end tech like the ${highEnd.name}.`,
        confidence: 0.95
      });
    }
    if (loyaltyItem) {
      list.push({
        productId: loyaltyItem.id,
        productName: loyaltyItem.name,
        reason: `Excellent news! You have ${customer.points} points, which fully covers the cost of this exclusive ${loyaltyItem.name}.`,
        confidence: 0.98
      });
    }
  }

  // 2. Recommend lifestyle products if they bought coffee presses
  const boughtCoffee = customer.orderHistory.some(o => o.items.some(i => i.productId === "prod-3"));
  if (boughtCoffee) {
    const lifestyle = unpurchased.find(p => p.id === "prod-1" || p.id === "prod-8");
    if (lifestyle) {
      list.push({
        productId: lifestyle.id,
        productName: lifestyle.name,
        reason: "Since you enjoy high-quality brews on the go, this item is the perfect eco-conscious pairing for your daily commute.",
        confidence: 0.88
      });
    }
  }

  // Fill up to 3 recommendations
  const pool = unpurchased.filter(p => !list.some(l => l.productId === p.id));
  for (const item of pool) {
    if (list.length >= 3) break;
    list.push({
      productId: item.id,
      productName: item.name,
      reason: `The popular ${item.name} is currently highly rated by our smart shopper community and matches your active tier benefits.`,
      confidence: 0.82
    });
  }

  // Absolute fallback if everything is bought
  if (list.length < 3) {
    const fallbackProducts = products.slice(0, 3);
    fallbackProducts.forEach(p => {
      if (!list.some(l => l.productId === p.id) && list.length < 3) {
        list.push({
          productId: p.id,
          productName: p.name,
          reason: "A top-selling community favorite recommended to enhance your household catalog.",
          confidence: 0.75
        });
      }
    });
  }

  return list.slice(0, 3);
}

function formatDateString(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(d)} ${months[Number(m) - 1]}`;
}

// Vite integration middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
