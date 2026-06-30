import React, { useState, useEffect } from "react";
import { Customer, Product, Recommendation } from "../types";
import { Award, Zap, Sparkles, RefreshCw, Copy, Check, Ticket, ShoppingCart, HelpCircle } from "lucide-react";

interface LoyaltyPortalProps {
  activeCustomer: Customer | null;
  products: Product[];
  onAddToCart: (product: Product, quantity: number, forcePointsOnlyBuy?: boolean) => void;
  onRefreshCustomer: () => void;
}

export default function LoyaltyPortal({
  activeCustomer,
  products,
  onAddToCart,
  onRefreshCustomer,
}: LoyaltyPortalProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiGrounded, setAiGrounded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null);

  // Fetch recommendations for active customer
  const fetchRecommendations = async (customerId: string) => {
    setLoadingAI(true);
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data = await response.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
        setAiGrounded(!!data.aiGrounded);
      }
    } catch (err) {
      console.error("Failed to load recommendations", err);
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    if (activeCustomer) {
      fetchRecommendations(activeCustomer.id);
    } else {
      setRecommendations([]);
    }
    setVoucherError(null);
    setVoucherSuccess(null);
  }, [activeCustomer?.id]);

  if (!activeCustomer) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center max-w-lg mx-auto space-y-4 animate-fade-in my-12">
        <Award className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Select a Profile to Access Rewards</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Please select an existing customer profile or register a new one using the selector at the top to access the loyalty portal, redeem points, and get personalized AI product recommendations.
        </p>
      </div>
    );
  }

  // Tier progress metrics
  const getTierLimits = (tier: string) => {
    switch (tier) {
      case "Bronze":
        return { next: "Silver", targetPoints: 500, label: "0 - 500 Pts" };
      case "Silver":
        return { next: "Gold", targetPoints: 1500, label: "501 - 1,500 Pts" };
      case "Gold":
        return { next: "Platinum", targetPoints: 4000, label: "1,501 - 4,000 Pts" };
      case "Platinum":
        return { next: "Max Tier", targetPoints: 4000, label: "4,001+ Pts" };
      default:
        return { next: "Silver", targetPoints: 500, label: "0" };
    }
  };

  const limits = getTierLimits(activeCustomer.tier);
  const nextTierProgress = Math.min(
    100,
    Math.round((activeCustomer.lifetimePoints / limits.targetPoints) * 100)
  );

  const getTierBadgeStyles = (tier: string) => {
    switch (tier) {
      case "Bronze":
        return "bg-amber-100 text-amber-800 border-amber-200 shadow-amber-500/5";
      case "Silver":
        return "bg-slate-100 text-slate-800 border-slate-200 shadow-slate-500/5";
      case "Gold":
        return "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400 shadow-amber-500/15";
      case "Platinum":
        return "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-purple-500/15";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Convert points to voucher
  const handleRedeemVoucher = async (option: "R50" | "R100" | "R250") => {
    setVoucherError(null);
    setVoucherSuccess(null);
    try {
      const response = await fetch("/api/customers/redeem-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: activeCustomer.id,
          voucherOption: option,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setVoucherSuccess(`Successfully created your ${option} store voucher!`);
        onRefreshCustomer(); // Reload customer points and list
      } else {
        setVoucherError(data.error || "Failed to redeem voucher. Check points balance.");
      }
    } catch (err) {
      setVoucherError("Server error during redemption.");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Tier Overview & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Tier Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-50 rounded-full opacity-50" />
          <div className="space-y-4 relative z-10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Loyalty Profile</span>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg text-slate-700 shadow-inner">
                {activeCustomer.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">{activeCustomer.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{activeCustomer.email}</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold">Active Member Status</span>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${getTierBadgeStyles(activeCustomer.tier)}`}>
                  {activeCustomer.tier} Tier
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 mt-6 pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Available Points</p>
              <p className="text-2xl font-black text-amber-500 font-mono mt-0.5">{activeCustomer.points.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Spendable: R {(activeCustomer.points / 10).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Lifetime Earned</p>
              <p className="text-2xl font-black text-slate-800 font-mono mt-0.5">{activeCustomer.lifetimePoints.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Total spent: R {activeCustomer.totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Next Tier Progress Bar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                Loyalty Tier Milestone Meter
              </h4>
              <span className="text-xs font-bold text-slate-500">{activeCustomer.lifetimePoints.toLocaleString()} / {limits.targetPoints.toLocaleString()} LP</span>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Your membership level is based on your lifetime earned loyalty points (LP). High tiers earn up to <span className="font-bold text-slate-700">2.0x points multiplier</span> and enjoy flat cart checkout discounts!
            </p>

            {activeCustomer.tier === "Platinum" ? (
              <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl text-center space-y-1">
                <p className="text-sm font-bold text-purple-900">🏆 Maximum Tier Reached!</p>
                <p className="text-xs text-purple-700">You are earning 2.0x loyalty points and getting a flat 15% discount on all store items.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full transition-all duration-500"
                    style={{ width: `${nextTierProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Current: {activeCustomer.tier}</span>
                  <span className="text-indigo-600 font-bold">Progress to {limits.next}: {nextTierProgress}%</span>
                  <span>Target: {limits.targetPoints.toLocaleString()} LP</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 leading-normal">
              <strong>Rules:</strong> Bronze (1pt/R10) • Silver (1.2pt/R10, 5% off) • Gold (1.5pt/R10, 10% off) • Platinum (2pt/R10, 15% off)
            </div>
            <a href="#store" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              Shop to earn more points &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* Convert Points to Vouchers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-2">
              <Ticket className="w-5 h-5 text-indigo-500" />
              Redeem Store Vouchers
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Convert your loyalty points into dynamic discount coupon codes you can apply at checkout.
            </p>
          </div>

          {voucherError && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 font-medium">
              ⚠️ {voucherError}
            </div>
          )}

          {voucherSuccess && (
            <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-100 font-medium">
              🎉 {voucherSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Option R50 */}
            <div className="border border-slate-100 hover:border-indigo-100 bg-slate-50/50 p-4 rounded-xl flex flex-col justify-between text-center space-y-3 transition group">
              <div>
                <span className="text-xs font-bold text-slate-400">Coupon</span>
                <p className="text-2xl font-black text-slate-950 group-hover:text-indigo-600 transition">R 50.00</p>
              </div>
              <div className="bg-white py-1.5 px-3 rounded-lg border border-slate-100 text-xs font-mono font-bold text-amber-600">
                500 Points
              </div>
              <button
                onClick={() => handleRedeemVoucher("R50")}
                disabled={activeCustomer.points < 500}
                className={`w-full py-2 rounded-lg font-bold text-xs transition ${
                  activeCustomer.points < 500
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                }`}
              >
                Redeem
              </button>
            </div>

            {/* Option R100 */}
            <div className="border border-slate-100 hover:border-indigo-100 bg-slate-50/50 p-4 rounded-xl flex flex-col justify-between text-center space-y-3 transition group">
              <div>
                <span className="text-xs font-bold text-slate-400">Coupon</span>
                <p className="text-2xl font-black text-slate-950 group-hover:text-indigo-600 transition">R 100.00</p>
              </div>
              <div className="bg-white py-1.5 px-3 rounded-lg border border-slate-100 text-xs font-mono font-bold text-amber-600">
                1,000 Points
              </div>
              <button
                onClick={() => handleRedeemVoucher("R100")}
                disabled={activeCustomer.points < 1000}
                className={`w-full py-2 rounded-lg font-bold text-xs transition ${
                  activeCustomer.points < 1000
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                }`}
              >
                Redeem
              </button>
            </div>

            {/* Option R250 */}
            <div className="border border-slate-100 hover:border-indigo-100 bg-slate-50/50 p-4 rounded-xl flex flex-col justify-between text-center space-y-3 transition group relative">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow">
                Save 12%!
              </span>
              <div>
                <span className="text-xs font-bold text-slate-400">Coupon</span>
                <p className="text-2xl font-black text-slate-950 group-hover:text-indigo-600 transition">R 250.00</p>
              </div>
              <div className="bg-white py-1.5 px-3 rounded-lg border border-slate-100 text-xs font-mono font-bold text-amber-600">
                2,200 Points
              </div>
              <button
                onClick={() => handleRedeemVoucher("R250")}
                disabled={activeCustomer.points < 2200}
                className={`w-full py-2 rounded-lg font-bold text-xs transition ${
                  activeCustomer.points < 2200
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                }`}
              >
                Redeem
              </button>
            </div>
          </div>
        </div>

        {/* Active unused vouchers checklist */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Active Unused Vouchers</h4>
            <p className="text-xs text-slate-500 mt-1">
              Copy any available voucher code and apply it during checkout for an instant discount.
            </p>
          </div>

          <div className="flex-grow overflow-y-auto space-y-3 max-h-[160px] pr-1">
            {activeCustomer.vouchers.filter(v => !v.used).length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                <p className="text-xs text-slate-400">No active vouchers available.</p>
                <p className="text-[10px] text-slate-400 mt-1">Exchange your loyalty points on the left to create one.</p>
              </div>
            ) : (
              activeCustomer.vouchers.filter(v => !v.used).map((voucher) => (
                <div
                  key={voucher.id}
                  className="flex items-center justify-between border border-slate-100 p-3 rounded-xl bg-white hover:border-slate-200 transition shadow-inner"
                >
                  <div className="space-y-0.5 text-left">
                    <p className="text-xs font-extrabold text-slate-900">R {voucher.amount}.00 Discount</p>
                    <p className="text-[10px] text-slate-400">Created: {voucher.dateCreated}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(voucher.code, voucher.id)}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold"
                  >
                    {copiedId === voucher.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{voucher.code}</span>
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendations Panel */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_60%)]" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h3 className="text-base font-extrabold tracking-tight">AI Personalized Recommendations</h3>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Gemini analyzes your purchase history, membership level ({activeCustomer.tier}), and preferences to curate exact matching products.
            </p>
          </div>
          
          <button
            onClick={() => fetchRecommendations(activeCustomer.id)}
            disabled={loadingAI}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow shadow-indigo-600/35 hover:shadow-indigo-600/50 disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAI ? "animate-spin" : ""}`} />
            {loadingAI ? "Analyzing Catalog..." : "Refresh Recommendations"}
          </button>
        </div>

        {loadingAI ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/25" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-400 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-300">Gemini 3.5-Flash personalization active</p>
              <p className="text-[10px] text-slate-500 mt-1">Structuring vector embeddings and evaluating profile matches...</p>
            </div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <p className="text-xs">No matching recommendations found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec) => {
              const matchedProduct = products.find(p => p.id === rec.productId);
              if (!matchedProduct) return null;

              return (
                <div
                  key={rec.productId}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="bg-indigo-950 border border-indigo-800/50 text-indigo-300 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5" />
                        {aiGrounded ? "Gemini Recommendation" : "Engine Matched"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold font-mono">
                        {Math.round(rec.confidence * 100)}% Match
                      </span>
                    </div>

                    <div className="space-y-1 text-left">
                      <h4 className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition line-clamp-1">
                        {matchedProduct.name}
                      </h4>
                      <p className="text-[11px] text-indigo-200/90 leading-relaxed italic bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-900/15">
                        &ldquo;{rec.reason}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-2">
                    <div>
                      {matchedProduct.loyaltyExclusive ? (
                        <span className="text-sm font-black text-amber-500 font-mono">
                          {matchedProduct.pointsCost} Pts
                        </span>
                      ) : (
                        <span className="text-sm font-black text-white">
                          R {matchedProduct.price}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => onAddToCart(matchedProduct, 1, !!matchedProduct.loyaltyExclusive)}
                      disabled={matchedProduct.inventory === 0}
                      className="text-[11px] font-bold text-indigo-400 hover:text-white flex items-center gap-1 border border-indigo-500/30 hover:bg-indigo-600 hover:border-indigo-600 transition px-3 py-1.5 rounded-lg"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
