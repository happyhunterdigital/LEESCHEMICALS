import React, { useState } from "react";
import { Product } from "../types";
import { Plus, Package, RefreshCw, Layers, DollarSign, ShieldAlert, BadgeCheck, FilePlus } from "lucide-react";

interface InventoryAdminProps {
  products: Product[];
  onRefreshProducts: () => void;
}

export default function InventoryAdmin({
  products,
  onRefreshProducts,
}: InventoryAdminProps) {
  // Restock form state
  const [restockAmounts, setRestockAmounts] = useState<{ [productId: string]: number }>({});
  const [restockLoading, setRestockLoading] = useState<{ [productId: string]: boolean }>({});

  // Add Product form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Smart Gear");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [inventory, setInventory] = useState("");
  const [loyaltyExclusive, setLoyaltyExclusive] = useState(false);
  const [pointsCost, setPointsCost] = useState("");

  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleRestockAmountChange = (productId: string, val: string) => {
    const num = Number(val);
    setRestockAmounts((prev) => ({ ...prev, [productId]: num }));
  };

  const handleRestockSubmit = async (productId: string) => {
    const amount = restockAmounts[productId];
    if (!amount || amount <= 0) return;

    setRestockLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      const response = await fetch("/api/products/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: amount,
          operation: "add",
        }),
      });
      if (response.ok) {
        onRefreshProducts();
        setRestockAmounts((prev) => ({ ...prev, [productId]: 0 }));
      }
    } catch (err) {
      console.error("Restock failed", err);
    } finally {
      setRestockLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(null);
    setFormError(null);

    if (!name || !category || !price || !inventory) {
      setFormError("Please fill out all required fields.");
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          price: Number(price),
          description,
          image,
          inventory: Number(inventory),
          loyaltyExclusive,
          pointsCost: loyaltyExclusive ? Number(pointsCost) : undefined,
          rating: 4.5,
        }),
      });

      if (response.ok) {
        setFormSuccess(`Successfully registered "${name}" to database!`);
        setName("");
        setPrice("");
        setDescription("");
        setImage("");
        setInventory("");
        setLoyaltyExclusive(false);
        setPointsCost("");
        onRefreshProducts();
      } else {
        const d = await response.json();
        setFormError(d.error || "Failed to create product.");
      }
    } catch (err) {
      setFormError("Connection error while adding product.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Product List Console */}
      <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            Inventory Stock Records
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Monitor real-time product quantities, cumulative sales units, and inject fast restock supplies directly.
          </p>
        </div>

        <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
          {products.map((product) => {
            const isLow = product.inventory <= 5;
            const isOut = product.inventory === 0;

            return (
              <div
                key={product.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition ${
                  isOut
                    ? "bg-red-50/50 border-red-100"
                    : isLow
                    ? "bg-orange-50/40 border-orange-100"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-left space-y-0.5">
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{product.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-400">
                      <span>Cat: {product.category}</span>
                      <span>•</span>
                      <span>Price: R {product.price}</span>
                      {product.loyaltyExclusive && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600">Points: {product.pointsCost} Pts</span>
                        </>
                      )}
                    </div>
                    
                    {/* Live Stock Indicators */}
                    <div className="flex items-center gap-2 pt-1">
                      {isOut ? (
                        <span className="bg-red-100 text-red-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                          Sold Out!
                        </span>
                      ) : isLow ? (
                        <span className="bg-orange-100 text-orange-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase animate-pulse">
                          Low Stock: {product.inventory}
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-semibold px-1.5 py-0.5 rounded">
                          Stock: {product.inventory} Units
                        </span>
                      )}
                      <span className="text-slate-400 text-[10px] font-medium">
                        (Sold: {product.sales} | Revenue: R {product.sales * product.price})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Restock action */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <input
                    type="number"
                    min="1"
                    placeholder="+ Qty"
                    value={restockAmounts[product.id] || ""}
                    onChange={(e) => handleRestockAmountChange(product.id, e.target.value)}
                    className="w-20 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-500 font-mono text-center font-bold"
                  />
                  <button
                    onClick={() => handleRestockSubmit(product.id)}
                    disabled={restockLoading[product.id]}
                    className="bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${restockLoading[product.id] ? "animate-spin" : ""}`} />
                    <span>Restock</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Product Console */}
      <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-6">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-2">
            <FilePlus className="w-5 h-5 text-indigo-500" />
            Add Custom Retail Product
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Register new physical configurations, pricing limits, and loyalty exclusives directly into the server database.
          </p>
        </div>

        {formSuccess && (
          <div className="bg-emerald-50 text-emerald-800 text-xs p-3.5 rounded-xl border border-emerald-100 font-medium flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        {formError && (
          <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-xl border border-red-100 font-medium">
            ⚠️ {formError}
          </div>
        )}

        <form onSubmit={handleAddProductSubmit} className="space-y-4 text-left flex-grow">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Aero Sound Pods"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-indigo-500"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-indigo-500 bg-white"
              >
                <option value="Smart Gear">Smart Gear</option>
                <option value="Lifestyle & Coffee">Lifestyle & Coffee</option>
                <option value="Home Hygiene">Home Hygiene</option>
                <option value="Automotive Care">Automotive Care</option>
                <option value="Electronics">Electronics</option>
                <option value="Loyalty Exclusives">Loyalty Exclusives</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price (ZAR R) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 1200"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-indigo-500 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Initial Stock *</label>
              <input
                type="number"
                required
                placeholder="e.g. 50"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-indigo-500 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product Description</label>
            <textarea
              rows={2}
              placeholder="Brief description of product features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-indigo-500 font-mono"
            />
          </div>

          {/* Loyalty Exclusive controls */}
          <div className="border border-slate-100 p-3 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800">Is Loyalty Exclusive Item?</label>
                <p className="text-[10px] text-slate-400">Can be purchased using points cost instead of cash.</p>
              </div>
              <input
                type="checkbox"
                checked={loyaltyExclusive}
                onChange={(e) => setLoyaltyExclusive(e.target.checked)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
              />
            </div>

            {loyaltyExclusive && (
              <div className="animate-fade-in">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Redeem Points Cost (LP) *</label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={pointsCost}
                  onChange={(e) => setPointsCost(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-indigo-500 font-mono font-bold text-amber-600 bg-amber-50/20"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs py-3 rounded-xl transition shadow shadow-slate-900/10 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {formLoading ? "Saving Product..." : "Register Product to Catalog"}
          </button>
        </form>
      </div>

    </div>
  );
}
