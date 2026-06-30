import React, { useState, useEffect } from "react";
import { Product, Customer, Order, AnalyticsSummary } from "./types";
import Storefront from "./components/Storefront";
import LoyaltyPortal from "./components/LoyaltyPortal";
import InventoryAdmin from "./components/InventoryAdmin";
import BusinessAnalytics from "./components/BusinessAnalytics";
import CompanyHome from "./components/CompanyHome";
import {
  Award,
  ShoppingCart,
  LayoutDashboard,
  Sparkles,
  Layers,
  ChevronDown,
  UserPlus,
  BadgeCheck,
  CheckCircle,
  X,
  CreditCard,
  Ticket,
  Percent,
  Plus,
  Minus,
  Trash2,
  Receipt,
  MapPin,
  TrendingUp,
  Home
} from "lucide-react";

export default function App() {
  // Navigation & Viewport State
  const [activeTab, setActiveTab] = useState<"home" | "store" | "loyalty" | "inventory" | "analytics">("home");
  
  // Database States
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [loadingDB, setLoadingDB] = useState(true);

  // Cart States
  const [cart, setCart] = useState<{ product: Product; quantity: number; loyaltyRedeem?: boolean }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string>("");
  const [directPointsAmount, setDirectPointsAmount] = useState<number>(0);

  // Checkout Modal State
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutInvoice, setCheckoutInvoice] = useState<any | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  // Add Customer Modal State
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustColor, setNewCustColor] = useState("emerald");
  const [addCustError, setAddCustError] = useState<string | null>(null);

  // Load database lists
  const refreshDatabase = async () => {
    try {
      const pRes = await fetch("/api/products");
      const pData = await pRes.json();
      setProducts(pData);

      const cRes = await fetch("/api/customers");
      const cData = await cRes.json();
      setCustomers(cData);

      // If activeCustomer is selected, sync their values
      if (activeCustomer) {
        const updated = cData.find((c: Customer) => c.id === activeCustomer.id);
        if (updated) {
          setActiveCustomer(updated);
        }
      }
    } catch (err) {
      console.error("Failed to connect to database APIs", err);
    } finally {
      setLoadingDB(false);
    }
  };

  const refreshAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load analytics summary", err);
    }
  };

  useEffect(() => {
    refreshDatabase();
  }, []);

  // Sync activeCustomer dropdown selector
  const handleSelectCustomer = (id: string) => {
    if (id === "new") {
      setShowAddCustomer(true);
      return;
    }
    const found = customers.find((c) => c.id === id);
    if (found) {
      setActiveCustomer(found);
      setCart([]); // Clear cart when switching customer profiles
      setSelectedVoucherId("");
      setDirectPointsAmount(0);
    } else {
      setActiveCustomer(null);
      setCart([]);
    }
  };

  // Add new customer form submit
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddCustError(null);
    if (!newCustName || !newCustEmail) {
      setAddCustError("Name and email are required.");
      return;
    }

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCustName,
          email: newCustEmail,
          avatarColor: newCustColor,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewCustName("");
        setNewCustEmail("");
        setShowAddCustomer(false);
        refreshDatabase();
        setActiveCustomer(data); // Auto-select new customer
      } else {
        setAddCustError(data.error || "Failed to register customer.");
      }
    } catch (err) {
      setAddCustError("Connection error. Try again.");
    }
  };

  // Cart management
  const handleAddToCart = (product: Product, qty: number, loyaltyRedeem = false) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.loyaltyRedeem === loyaltyRedeem
      );

      if (existingIdx !== -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + qty;
        if (newQty > product.inventory) {
          alert(`Cannot add more. Catalog stock limit is ${product.inventory}.`);
          return prev;
        }
        updated[existingIdx].quantity = newQty;
        return updated;
      }

      // Check initial stock limit
      if (qty > product.inventory) {
        alert(`Cannot add. Catalog stock limit is ${product.inventory}.`);
        return prev;
      }

      return [...prev, { product, quantity: qty, loyaltyRedeem }];
    });
    setCartOpen(true);
  };

  const handleUpdateCartQty = (idx: number, change: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const target = updated[idx];
      const newQty = target.quantity + change;

      if (newQty <= 0) {
        return prev.filter((_, i) => i !== idx);
      }

      if (newQty > target.product.inventory) {
        alert(`Stock limit reached! Current stock is ${target.product.inventory}.`);
        return prev;
      }

      updated[idx].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveCartItem = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  // Cart Calculations (VAT included, discounts, loyalty points applied)
  const cartSubtotal = cart.reduce((sum, item) => {
    if (item.loyaltyRedeem) return sum; // Loyalty exclusive costs zero cash
    return sum + item.product.price * item.quantity;
  }, 0);

  // Tier Discount Percent
  const getTierDiscountPercent = () => {
    if (!activeCustomer) return 0;
    if (activeCustomer.tier === "Silver") return 0.05;
    if (activeCustomer.tier === "Gold") return 0.10;
    if (activeCustomer.tier === "Platinum") return 0.15;
    return 0;
  };

  const tierDiscountPercent = getTierDiscountPercent();
  const tierDiscountAmount = cartSubtotal * tierDiscountPercent;

  // Selected Voucher discount
  const activeVoucher = activeCustomer?.vouchers.find((v) => v.id === selectedVoucherId);
  const voucherDiscountAmount = activeVoucher ? activeVoucher.amount : 0;

  // Direct points deduction
  const directPointsDiscountAmount = directPointsAmount / 10; // 10 points = R1.00

  const totalDiscount = tierDiscountAmount + voucherDiscountAmount + directPointsDiscountAmount;
  const cartTotal = Math.max(0, cartSubtotal - totalDiscount);

  // Exclusive loyalty points total cost check
  const totalLoyaltyPointsCost = cart.reduce((sum, item) => {
    if (item.loyaltyRedeem && item.product.pointsCost) {
      return sum + item.product.pointsCost * item.quantity;
    }
    return sum;
  }, 0);

  // Points accumulation preview for the cash spent
  const getEarnedPointsPreview = () => {
    if (!activeCustomer) return 0;
    let mult = 0.1;
    if (activeCustomer.tier === "Silver") mult = 0.12;
    if (activeCustomer.tier === "Gold") mult = 0.15;
    if (activeCustomer.tier === "Platinum") mult = 0.20;
    return Math.round(cartTotal * mult);
  };

  const pointsEarnedPreview = getEarnedPointsPreview();

  // Perform Server Checkout API order placement
  const handleConfirmCheckout = async () => {
    if (!activeCustomer) {
      alert("Please select a customer profile to place an order.");
      return;
    }
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // Verify loyalty points for exclusives
    const combinedDeduction = directPointsAmount + totalLoyaltyPointsCost;
    if (activeCustomer.points < combinedDeduction) {
      alert("Insufficient loyalty points for direct discount or exclusive items.");
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: activeCustomer.id,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          usePointsAmount: directPointsAmount,
          redeemVoucherId: selectedVoucherId || undefined,
          forcePointsOnlyBuy: totalLoyaltyPointsCost > 0,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Successful checkout!
        setCheckoutInvoice(data);
        setInvoiceOpen(true);
        setCart([]); // Clear cart
        setSelectedVoucherId("");
        setDirectPointsAmount(0);
        setCartOpen(false);
        refreshDatabase(); // Pull fresh stock and customer points
      } else {
        alert(data.error || "Order placement failed.");
      }
    } catch (err) {
      console.error("Checkout failed", err);
      alert("Payment & Checkout gateway failure. Try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getTierThemeColor = (tier: string) => {
    switch (tier) {
      case "Bronze":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "Silver":
        return "text-slate-700 bg-slate-50 border-slate-200";
      case "Gold":
        return "text-amber-600 bg-amber-50 border-amber-400";
      case "Platinum":
        return "text-purple-600 bg-purple-50 border-purple-400";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row overflow-hidden selection:bg-[#112F20] selection:text-white">
      
      {/* LEFT SIDEBAR (aside) - Persistent on Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        {/* Brand Logo Header */}
        <div className="p-5 border-b border-slate-100 bg-[#E2ECE9]/20">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white border border-slate-200 rounded-xl shrink-0 flex items-center justify-center shadow-sm">
              <img 
                src="https://res.cloudinary.com/dka0498ns/image/upload/v1782841143/Lees_chemicals_logo_oza96j.png"
                alt="LEES CHEMICALS Logo" 
                className="w-8 h-8 object-contain shrink-0"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left">
              <span className="text-sm font-black tracking-tight text-slate-950 uppercase block font-sans">LEES CHEMICALS</span>
              <span className="text-[8px] bg-[#112F20] text-[#FFFDE8] font-mono font-bold px-1.5 py-0.5 rounded tracking-wide uppercase border border-black block mt-0.5 w-max">
                Active Ledger
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Sidebar List */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <button
            onClick={() => setActiveTab("home")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
              activeTab === "home"
                ? "bg-[#112F20] text-white font-extrabold border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                : "text-slate-600 hover:bg-[#E2ECE9]/40 hover:text-slate-900"
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab("store")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
              activeTab === "store"
                ? "bg-[#112F20] text-white font-extrabold border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                : "text-slate-600 hover:bg-[#E2ECE9]/40 hover:text-slate-900"
            }`}
          >
            <ShoppingCart className="w-5 h-5 shrink-0" />
            <span>Shop</span>
          </button>

          <button
            onClick={() => setActiveTab("loyalty")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
              activeTab === "loyalty"
                ? "bg-[#112F20] text-white font-extrabold border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                : "text-slate-600 hover:bg-[#E2ECE9]/40 hover:text-slate-900"
            }`}
          >
            <Award className="w-5 h-5 shrink-0" />
            <span>My Rewards</span>
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
              activeTab === "inventory"
                ? "bg-[#112F20] text-white font-extrabold border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                : "text-slate-600 hover:bg-[#E2ECE9]/40 hover:text-slate-900"
            }`}
          >
            <Layers className="w-5 h-5 shrink-0" />
            <span>Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
              activeTab === "analytics"
                ? "bg-[#112F20] text-white font-extrabold border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                : "text-slate-600 hover:bg-[#E2ECE9]/40 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Bottom Plan Promo card */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-[#112F20] rounded-2xl p-4 text-white relative overflow-hidden shadow-md border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-1">Current License</p>
            <p className="text-sm font-black text-[#FFFDE8] mb-3 font-sans leading-none">Scale Plus Enterprise</p>
            <button className="w-full bg-[#FFFDE8] hover:bg-yellow-100 text-slate-950 text-[10px] py-2 rounded-xl font-extrabold transition uppercase tracking-wider border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              UPGRADE
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP BAR HEADER */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-3 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-50 border border-slate-200 rounded-lg shrink-0 flex items-center justify-center">
            <img 
              src="https://res.cloudinary.com/dka0498ns/image/upload/v1782841143/Lees_chemicals_logo_oza96j.png"
              alt="LEES CHEMICALS Logo" 
              className="w-7 h-7 object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-xs sm:text-sm font-black tracking-tight text-slate-950 uppercase font-sans">LEES CHEMICALS</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 bg-slate-50 border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-px active:shadow-none"
          >
            <ShoppingCart className="w-4 h-4 text-slate-700" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#C85A3F] border border-black text-white text-[8px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* RIGHT CONTAINER - Main stage layout */}
      <div className="flex-1 flex flex-col md:h-screen md:overflow-hidden bg-slate-50">
        
        {/* DESKTOP ROW HEADER */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 shrink-0 animate-fade-in">
          
          {/* Decorative / Functional Search Bar */}
          <div className="relative flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-4 py-2 rounded-full w-80 transition focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search items, categories, etc..."
              className="bg-transparent text-xs outline-none w-full font-sans text-slate-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Header Panel Actions */}
          <div className="flex items-center gap-6">
            
            {/* Active Profile Switcher Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans">Active Profile:</span>
              <div className="relative">
                <select
                  value={activeCustomer ? activeCustomer.id : ""}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer shadow-sm transition"
                >
                  <option value="">Guest Shopper (No Loyalty)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      👤 {c.name} ({c.tier})
                    </option>
                  ))}
                  <option value="new" className="text-indigo-600 font-bold">
                    ➕ Add Customer Profile
                  </option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Loyalty points badge */}
            {activeCustomer && (
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow shadow-amber-500/10 rounded-xl px-3.5 py-1.5 flex items-center gap-1.5 text-xs font-black font-mono animate-fade-in">
                <Award className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                <span>{activeCustomer.points.toLocaleString()} pts</span>
              </div>
            )}

            {/* Cart Icon Drawer Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-xl text-slate-700 transition shadow-sm cursor-pointer shrink-0"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow border border-white">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* User Profile info */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right">
                <p className="font-extrabold text-xs text-slate-950 leading-tight">
                  {activeCustomer ? activeCustomer.name : "Guest Shopper"}
                </p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  {activeCustomer ? `${activeCustomer.tier} Member` : "LEES Guest"}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs shadow-inner">
                {activeCustomer ? activeCustomer.name.split(" ").map(n => n[0]).join("") : "GS"}
              </div>
            </div>

          </div>

        </header>

        {/* SUB CONTAINER (Scrollable Active Content Stage) */}
        <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8 space-y-6 overflow-y-auto bg-slate-50">
          
          {/* Quick Metrics Header Grid (Visual Stats Cards matching theme) - Reserved for admin dashboard tabs only */}
          {(activeTab === "analytics" || activeTab === "inventory") && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 animate-fade-in">
              
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-4 text-left">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Revenue</p>
                  <p className="text-base font-black text-slate-950 font-sans mt-0.5">
                    R {analytics ? analytics.totalRevenue.toLocaleString() : "21,430"}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-4 text-left">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Loyalty Members</p>
                  <p className="text-base font-black text-slate-950 font-sans mt-0.5">
                    {customers.length} Members
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-4 text-left">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cart Item Units</p>
                  <p className="text-base font-black text-slate-950 font-sans mt-0.5">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} units
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-4 text-left">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Low Stock Warnings</p>
                  <p className="text-base font-black text-slate-950 font-sans mt-0.5">
                    {products.filter(p => p.inventory <= 5).length} SKUs Alerting
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* Active Tab Content Portal */}
          <div className="bg-slate-50 min-h-0">
            {loadingDB ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/25" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
                </div>
                <p className="text-xs font-bold text-slate-500 font-sans">Spinning up database services...</p>
              </div>
            ) : (
              <>
                {activeTab === "home" && (
                  <CompanyHome
                    onNavigateToStore={() => setActiveTab("store")}
                    onAddToCartByProduct={(name) => {
                      const found = products.find(p => p.name.toLowerCase().includes(name.toLowerCase()));
                      if (found) {
                        handleAddToCart(found, 1);
                      }
                    }}
                  />
                )}

                {activeTab === "store" && (
                  <Storefront
                    products={filteredProducts}
                    activeCustomer={activeCustomer}
                    onAddToCart={handleAddToCart}
                  />
                )}

                {activeTab === "loyalty" && (
                  <LoyaltyPortal
                    activeCustomer={activeCustomer}
                    products={products}
                    onAddToCart={handleAddToCart}
                    onRefreshCustomer={refreshDatabase}
                  />
                )}

                {activeTab === "inventory" && (
                  <InventoryAdmin
                    products={products}
                    onRefreshProducts={refreshDatabase}
                  />
                )}

                {activeTab === "analytics" && (
                  <BusinessAnalytics
                    summary={analytics}
                    loading={false}
                    onRefresh={refreshAnalytics}
                  />
                )}
              </>
            )}
          </div>

          {/* Elegant Footer */}
          <footer className="mt-12 pt-8 border-t border-slate-200/60 text-slate-500 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Company Name</p>
                <p className="font-extrabold text-slate-900 font-sans">LEES CHEMICALS</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Status: In Business</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Enterprise Number</p>
                <p className="font-mono text-slate-800 font-semibold">K2015053620</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Old format: 2015/053620/07</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Incorporation Date</p>
                <p className="font-sans text-slate-800 font-semibold">14 Apr 2015</p>
                <p className="text-[10px] text-slate-400 mt-1">11 years ago</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Jurisdiction</p>
                <p className="font-sans text-slate-800 font-semibold">South Africa</p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400">
              <p>&copy; 2026 LEES CHEMICALS. All rights reserved.</p>
              <p>
                Created by{" "}
                <a
                  href="https://happyhunterdigital.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-slate-500 hover:text-slate-800 transition underline decoration-dotted"
                >
                  happyhunterdigital.com
                </a>
              </p>
            </div>
          </footer>

        </div>

      </div>

      {/* Slide-out Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          {/* Backdrop overlay */}
          <div
            onClick={() => setCartOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-100 flex flex-col justify-between z-10 animate-slide-left">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-950 text-base tracking-tight">Shopping Checkout Cart</h3>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto" />
                  <p className="text-xs text-slate-400 font-semibold">Your cart is empty.</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Go browse the catalogs &rarr;
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${item.loyaltyRedeem ? "l" : "c"}`}
                    className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 max-w-[65%]">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
                        <img src={item.product.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-900 truncate leading-snug">{item.product.name}</p>
                        {item.loyaltyRedeem ? (
                          <span className="inline-block text-[9px] font-black text-amber-600 uppercase tracking-wider mt-0.5">
                            Points Redeem Cost
                          </span>
                        ) : (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            R {item.product.price} each
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Qty controls */}
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-lg">
                        <button
                          onClick={() => handleUpdateCartQty(idx, -1)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black font-mono text-slate-800 w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateCartQty(idx, 1)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right w-16">
                        {item.loyaltyRedeem ? (
                          <p className="text-xs font-bold text-amber-600 font-mono">
                            {item.product.pointsCost ? item.product.pointsCost * item.quantity : 0} Pts
                          </p>
                        ) : (
                          <p className="text-xs font-black text-slate-950 font-mono">
                            R {(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemoveCartItem(idx)}
                        className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Checkout Form Footer */}
            {cart.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50 p-6 space-y-4">
                
                {/* Loyalty Adjustments */}
                {activeCustomer ? (
                  <div className="border-b border-slate-100 pb-3 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-left">
                      Member Discounts & Loyalty Redemptions
                    </span>

                    {/* Vouchers selector */}
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5 text-indigo-500" />
                        Apply Active Voucher:
                      </span>
                      <select
                        value={selectedVoucherId}
                        onChange={(e) => setSelectedVoucherId(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 focus:outline-none max-w-[200px]"
                      >
                        <option value="">No voucher selected</option>
                        {activeCustomer.vouchers
                          .filter((v) => !v.used)
                          .map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.code} (R {v.amount} Off)
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Points direct slider discount */}
                    {activeCustomer.points > 0 && (
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            Redeem Points Direct Discount:
                          </span>
                          <span className="font-mono font-bold text-amber-600">
                            {directPointsAmount} Pts (R {(directPointsAmount / 10).toFixed(2)} Off)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={Math.min(activeCustomer.points, 3000)} // Caps at 3000 points per redemption
                          step="10"
                          value={directPointsAmount}
                          onChange={(e) => setDirectPointsAmount(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <p className="text-[9px] text-slate-400 font-medium">
                          Slide to spend points as cash. Conversion metric: 10 LP points = R 1.00 cash reduction.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-center">
                    <p className="text-[11px] text-indigo-700 leading-normal">
                      💳 Select an existing profile in the header to activate <strong>tier discounts</strong>, <strong>vouchers</strong>, and earn spendable points on this checkout.
                    </p>
                  </div>
                )}

                {/* Pricing totals block */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold">R {cartSubtotal.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</span>
                  </div>

                  {tierDiscountPercent > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span className="flex items-center gap-0.5">
                        <Percent className="w-3 h-3" />
                        {activeCustomer?.tier} Tier Discount ({tierDiscountPercent * 100}%)
                      </span>
                      <span className="font-mono">- R {tierDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {voucherDiscountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Voucher Discount</span>
                      <span className="font-mono">- R {voucherDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {directPointsDiscountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Points Direct Cash Back</span>
                      <span className="font-mono">- R {directPointsDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {totalLoyaltyPointsCost > 0 && (
                    <div className="flex justify-between text-amber-600 font-bold border-b border-dashed border-slate-200 pb-2">
                      <span>Loyalty Exclusives Cost</span>
                      <span className="font-mono">{totalLoyaltyPointsCost.toLocaleString()} Points</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                    <span>Payable Total (VAT Incl)</span>
                    <span className="font-mono text-base">
                      R {cartTotal.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {activeCustomer && (
                    <div className="flex justify-between text-[10px] text-indigo-600 font-bold">
                      <span>Loyalty Points Accumulated on Spent</span>
                      <span className="font-mono">+{pointsEarnedPreview} LP Points</span>
                    </div>
                  )}
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={handleConfirmCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-slate-950 hover:bg-indigo-600 text-white font-bold text-xs py-3.5 rounded-xl transition shadow shadow-slate-900/10 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  {checkoutLoading ? "Processing payment..." : "Confirm & Place Order"}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Invoice Success Receipt Modal */}
      {invoiceOpen && checkoutInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col z-10 animate-scale-up max-h-[90vh]">
            
            {/* Stamp / Icon Header */}
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 text-white p-6 text-center space-y-2 relative">
              <button
                onClick={() => setInvoiceOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-100 fill-emerald-500/20" />
              <h3 className="text-lg font-extrabold tracking-tight">Order Placed Successfully!</h3>
              <p className="text-xs text-emerald-100">Your points and stock distributions have been synced.</p>
            </div>

            {/* Receipt Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow text-slate-800 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="text-left space-y-0.5">
                  <p className="font-bold text-slate-900">Receipt Invoice</p>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {checkoutInvoice.order.id}</p>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-mono">
                  Date: {checkoutInvoice.order.date}
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Order Items</span>
                {checkoutInvoice.order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-slate-600">
                    <span>
                      {item.name} <span className="font-mono text-[10px]">× {item.quantity}</span>
                    </span>
                    <span className="font-mono font-semibold">R {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals Table */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-left">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-mono">R {checkoutInvoice.order.subtotal.toFixed(2)}</span>
                </div>
                {checkoutInvoice.order.discountApplied > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discounts & Redemptions</span>
                    <span className="font-mono">- R {checkoutInvoice.order.discountApplied.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-dashed border-slate-200 pt-2">
                  <span>Grand Total</span>
                  <span className="font-mono">R {checkoutInvoice.order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Loyalty Earnings Notification */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-indigo-900 text-center space-y-2">
                <div className="flex items-center justify-center gap-1 font-extrabold text-xs">
                  <Award className="w-4.5 h-4.5 text-indigo-600 fill-indigo-400" />
                  <span>Loyalty Account Synced</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-1 border-t border-indigo-100/40">
                  <div>
                    <p className="text-[10px] text-indigo-500 uppercase font-bold tracking-wider">Spent Points Earned</p>
                    <p className="text-base font-black font-mono text-indigo-700">+{checkoutInvoice.pointsEarned} Pts</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-indigo-500 uppercase font-bold tracking-wider">New Points Balance</p>
                    <p className="text-base font-black font-mono text-indigo-700">{checkoutInvoice.customer.points.toLocaleString()} Pts</p>
                  </div>
                </div>

                {checkoutInvoice.tierUpgraded && (
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-2.5 mt-2 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-spin" />
                    Tier upgraded to {checkoutInvoice.newTier}!
                  </div>
                )}
              </div>
            </div>

            {/* Footer Done */}
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setInvoiceOpen(false)}
                className="w-full bg-slate-950 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition shadow"
              >
                Close Receipt
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add New Customer Profile Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden flex flex-col z-10 animate-scale-up">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-left">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                <h3 className="font-extrabold text-slate-950 text-sm tracking-tight">Register Loyalty Profile</h3>
              </div>
              <button
                onClick={() => setShowAddCustomer(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addCustError && (
              <div className="mx-6 mt-4 bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 font-medium text-left">
                ⚠️ {addCustError}
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sindi Cele"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sindi.cele@example.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Profile Theme Color</label>
                <div className="flex items-center gap-3">
                  {["emerald", "blue", "purple", "rose", "amber"].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewCustColor(col)}
                      className={`w-6 h-6 rounded-full border-2 ${
                        newCustColor === col ? "border-slate-800 scale-110 shadow-sm" : "border-transparent"
                      } ${
                        col === "emerald" && "bg-emerald-500"
                      } ${
                        col === "blue" && "bg-blue-500"
                      } ${
                        col === "purple" && "bg-purple-500"
                      } ${
                        col === "rose" && "bg-rose-500"
                      } ${
                        col === "amber" && "bg-amber-500"
                      } transition`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-950 hover:bg-indigo-600 text-white font-bold text-xs py-3 rounded-xl transition shadow flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                Register to Member Database
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Subtle bottom footprint */}
      <div className="absolute bottom-4 left-6 hidden md:block text-[9px] text-slate-400 font-mono tracking-wider font-semibold pointer-events-none">
        LEES CHEMICALS System Ledger
      </div>

      {/* MOBILE BOTTOM NAVIGATION TAB BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] px-2 py-2 flex justify-around items-center z-40">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-200 ${
            activeTab === "home" ? "text-[#112F20] font-black scale-105" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === "home" ? "stroke-[2.5px] text-[#112F20]" : "stroke-[1.8px] text-slate-500"}`} />
          <span className="text-[10px] tracking-tight font-sans uppercase font-bold">Home</span>
        </button>
        <button
          onClick={() => setActiveTab("store")}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-200 ${
            activeTab === "store" ? "text-[#112F20] font-black scale-105" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <ShoppingCart className={`w-5 h-5 ${activeTab === "store" ? "stroke-[2.5px] text-[#112F20]" : "stroke-[1.8px] text-slate-500"}`} />
          <span className="text-[10px] tracking-tight font-sans uppercase font-bold">Shop</span>
        </button>
        <button
          onClick={() => setActiveTab("loyalty")}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-200 ${
            activeTab === "loyalty" ? "text-[#112F20] font-black scale-105" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Award className={`w-5 h-5 ${activeTab === "loyalty" ? "stroke-[2.5px] text-[#112F20]" : "stroke-[1.8px] text-slate-500"}`} />
          <span className="text-[10px] tracking-tight font-sans uppercase font-bold">Rewards</span>
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-200 ${
            activeTab === "inventory" ? "text-[#112F20] font-black scale-105" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Layers className={`w-5 h-5 ${activeTab === "inventory" ? "stroke-[2.5px] text-[#112F20]" : "stroke-[1.8px] text-slate-500"}`} />
          <span className="text-[10px] tracking-tight font-sans uppercase font-bold">Inventory</span>
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-200 ${
            activeTab === "analytics" ? "text-[#112F20] font-black scale-105" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeTab === "analytics" ? "stroke-[2.5px] text-[#112F20]" : "stroke-[1.8px] text-slate-500"}`} />
          <span className="text-[10px] tracking-tight font-sans uppercase font-bold">Analytics</span>
        </button>
      </nav>

    </div>
  );
}
