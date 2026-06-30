import React, { useState, useMemo } from "react";
import { Product, Customer } from "../types";
import { ShoppingCart, Star, Award, ShieldAlert, SlidersHorizontal, RotateCcw, Zap } from "lucide-react";

interface StorefrontProps {
  products: Product[];
  activeCustomer: Customer | null;
  onAddToCart: (product: Product, quantity: number, forcePointsOnlyBuy?: boolean) => void;
}

export default function Storefront({
  products,
  activeCustomer,
  onAddToCart,
}: StorefrontProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [maxPrice, setMaxPrice] = useState<number>(200);

  // Apply filters over already searched/passed products
  const finalFilteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchPrice = product.price <= maxPrice;
      return matchCategory && matchPrice;
    });
  }, [products, selectedCategory, maxPrice]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="text-left">
          <h2 className="text-xl font-bold text-slate-950 font-sans tracking-tight">Active Retail Catalogue</h2>
          <p className="text-sm text-slate-500">
            Browse our catalog of premium smart home gear, specialty accessories, and loyalty exclusives.
          </p>
        </div>
        {activeCustomer && (
          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-4 py-3 rounded-xl text-left">
            <Award className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Your Loyalty Tier Benefit</p>
              <p className="text-sm font-bold text-indigo-950">
                {activeCustomer.tier === "Bronze" && "Bronze Member: Earn points on cash spent"}
                {activeCustomer.tier === "Silver" && "Silver Member: Flat 5% discount on everything"}
                {activeCustomer.tier === "Gold" && "Gold Member: Flat 10% discount + Priority shipping"}
                {activeCustomer.tier === "Platinum" && "Platinum Member: Flat 15% discount + Platinum Support"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SEARCH AND FILTERS COMPONENT GRID */}
      <div className="bg-white rounded-2xl border-2 border-black p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#E2ECE9] rounded-xl text-[#112F20] border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="font-black text-slate-950 text-sm uppercase tracking-tight">Refine Catalogue</h3>
              <p className="text-[11px] text-slate-500">Target premium disinfectants and automotive blends instantly</p>
            </div>
          </div>

          {(selectedCategory !== "All" || maxPrice < 200) && (
            <button
              onClick={() => {
                setSelectedCategory("All");
                setMaxPrice(200);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#C85A3F] hover:text-[#b04f37] transition bg-[#FFFDE8] border-2 border-black px-3.5 py-1.5 rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-px active:shadow-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Category Filter */}
          <div className="md:col-span-7 space-y-2.5 text-left">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Filter by Category
            </label>
            <div className="flex flex-wrap gap-2">
              {["All", "Home Hygiene", "Automotive Care"].map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-px active:shadow-none ${
                      isActive
                        ? "bg-[#112F20] text-white"
                        : "bg-slate-50 text-slate-700 hover:bg-[#E2ECE9]/40 hover:text-slate-900"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="md:col-span-5 space-y-2.5 text-left">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Max Price Budget
              </label>
              <span className="font-mono font-black text-xs text-[#112F20] bg-[#FFFDE8] border-2 border-black px-2.5 py-0.5 rounded shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                R {maxPrice}
              </span>
            </div>
            <div className="pt-1.5">
              <input
                type="range"
                min="40"
                max="200"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#112F20] border border-slate-200"
              />
              <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1.5 font-mono">
                <span>R 40</span>
                <span>R 120</span>
                <span>R 200</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-left text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            Showing <strong className="text-slate-950 font-black">{finalFilteredProducts.length}</strong> of{" "}
            <strong className="text-slate-700 font-bold">{products.length}</strong> catalog items matching current search terms.
          </span>
          {finalFilteredProducts.length === 0 && (
            <span className="text-[#C85A3F] font-black uppercase tracking-wider text-[10px]">No results match filters!</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {finalFilteredProducts.map((product) => {
          const isLowStock = product.inventory > 0 && product.inventory <= 5;
          const isOutOfStock = product.inventory === 0;

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 overflow-hidden flex flex-col group relative"
            >
              {/* Image & Badges */}
              <div className="relative h-48 w-full bg-slate-50 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                
                {/* Category Badge */}
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                  {product.category}
                </span>

                {/* Loyalty Exclusive Ribbon */}
                {product.loyaltyExclusive && (
                  <span className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Loyalty Exclusive
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-700">{product.rating}</span>
                </div>

                <h3 className="font-bold text-slate-950 group-hover:text-indigo-600 transition text-base tracking-tight mb-1">
                  {product.name}
                </h3>
                
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {product.description}
                </p>

                {/* Pricing & Stock indicators */}
                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      {product.loyaltyExclusive ? (
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-slate-400 line-through">R {product.price}</p>
                          <p className="text-lg font-black text-amber-600 flex items-center gap-1 font-mono">
                            {product.pointsCost} <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Pts</span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-xl font-black text-slate-950 font-sans">
                          R {product.price.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>

                    {/* Stock level badge */}
                    <div>
                      {isOutOfStock ? (
                        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-red-100">
                          <ShieldAlert className="w-3 h-3" />
                          Sold Out!
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-orange-100 animate-pulse">
                          Low Stock: {product.inventory}
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-1 rounded-md border border-emerald-100">
                          In Stock: {product.inventory}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Actions */}
                  <div>
                    {product.loyaltyExclusive ? (
                      <button
                        onClick={() => onAddToCart(product, 1, true)}
                        disabled={isOutOfStock || !activeCustomer || activeCustomer.points < (product.pointsCost || 0)}
                        className={`w-full flex items-center justify-center gap-2 font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all duration-200 ${
                          isOutOfStock
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : !activeCustomer
                            ? "bg-slate-100 text-slate-500 cursor-not-allowed hover:bg-slate-200"
                            : activeCustomer.points < (product.pointsCost || 0)
                            ? "bg-amber-50 border border-amber-200 text-amber-700 cursor-not-allowed"
                            : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-200/50 hover:shadow-md"
                        }`}
                      >
                        <Award className="w-4 h-4" />
                        {!activeCustomer
                          ? "Select Profile to Redeem"
                          : activeCustomer.points < (product.pointsCost || 0)
                          ? `Need ${((product.pointsCost || 0) - activeCustomer.points)} more Pts`
                          : "Redeem with Loyalty Points"}
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onAddToCart(product, 1, false)}
                          disabled={isOutOfStock}
                          className={`flex-1 flex items-center justify-center gap-1.5 font-bold text-xs py-2.5 px-3 rounded-xl transition-all duration-200 shadow-sm ${
                            isOutOfStock
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4 shrink-0" />
                          <span>{isOutOfStock ? "Sold Out" : "Add to Cart"}</span>
                        </button>
                        
                        <button
                          onClick={() => onAddToCart(product, 1, false)}
                          disabled={isOutOfStock}
                          className={`flex-1 flex items-center justify-center gap-1.5 font-black text-xs py-2.5 px-3 rounded-xl transition-all duration-200 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-px active:shadow-none ${
                            isOutOfStock
                              ? "bg-slate-50 text-slate-400 cursor-not-allowed border-slate-300 shadow-none"
                              : "bg-[#FFFDE8] hover:bg-yellow-100 text-slate-950"
                          }`}
                        >
                          <Zap className="w-4 h-4 shrink-0 text-amber-500 fill-amber-500" />
                          <span>Quick Buy</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
