import React, { useState, useEffect } from "react";
import { AnalyticsSummary, CategorySales, DailySales, Product } from "../types";
import { DollarSign, ShoppingBag, Users, Award, ShieldAlert, BadgePercent, ArrowUpRight, TrendingUp } from "lucide-react";

interface BusinessAnalyticsProps {
  summary: AnalyticsSummary | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function BusinessAnalytics({
  summary,
  loading,
  onRefresh,
}: BusinessAnalyticsProps) {
  const [hoveredDay, setHoveredDay] = useState<DailySales | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    onRefresh();
  }, []);

  if (loading || !summary) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4 animate-fade-in">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/25" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
        </div>
        <p className="text-xs font-bold text-slate-500">Compiling real-time transaction ledger...</p>
      </div>
    );
  }

  // Find max values for scaling the custom SVG trend chart
  const maxRevenue = Math.max(...summary.dailySales.map((d) => d.revenue), 1000);
  const chartHeight = 160;
  const chartWidth = 500;
  const padding = 20;

  // Compute points coordinates for 7 days
  const points = summary.dailySales.map((d, index) => {
    const x = padding + (index * (chartWidth - 2 * padding)) / (summary.dailySales.length - 1);
    // Invert Y since (0,0) is top-left
    const y = chartHeight - padding - (d.revenue / maxRevenue) * (chartHeight - 2 * padding);
    return { x, y, data: d };
  });

  // Build the SVG path (using smooth curves/Bezier approximations)
  let linePath = "";
  let areaPath = "";

  if (points.length > 0) {
    // Start point
    linePath = `M ${points[0].x} ${points[0].y}`;
    areaPath = `M ${points[0].x} ${chartHeight - padding} L ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p = points[i];
      // Control points for smooth curves
      const cpX1 = p0.x + (p.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p.x - p0.x) / 2;
      const cpY2 = p.y;

      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
      areaPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }

    // Close area path
    areaPath += ` L ${points[points.length - 1].x} ${chartHeight - padding} Z`;
  }

  const maxCategoryRevenue = Math.max(...summary.categoryBreakdown.map((c) => c.revenue), 1);

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sales</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-left">
            <p className="text-xl font-black text-slate-950 font-mono">
              R {summary.totalRevenue.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>Direct Ledger</span>
            </p>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Orders</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="text-left">
            <p className="text-xl font-black text-slate-950 font-mono">
              {summary.totalOrders}
            </p>
            <p className="text-[10px] text-indigo-600 font-bold mt-1">
              Live Transactions
            </p>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customers</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-left">
            <p className="text-xl font-black text-slate-950 font-mono">
              {summary.totalCustomers}
            </p>
            <p className="text-[10px] text-purple-600 font-bold mt-1">
              Database Records
            </p>
          </div>
        </div>

        {/* Points Issued */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Points Issued</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="w-4 h-4 text-amber-500 fill-amber-300" />
            </span>
          </div>
          <div className="text-left">
            <p className="text-xl font-black text-slate-950 font-mono">
              {summary.pointsIssued.toLocaleString()}
            </p>
            <p className="text-[10px] text-amber-600 font-bold mt-1">
              Issued to Members
            </p>
          </div>
        </div>

        {/* Points Redeemed */}
        <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Points Redeemed</span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <BadgePercent className="w-4 h-4" />
            </span>
          </div>
          <div className="text-left">
            <p className="text-xl font-black text-slate-950 font-mono">
              {summary.pointsRedeemed.toLocaleString()}
            </p>
            <p className="text-[10px] text-rose-600 font-bold mt-1">
              Used For Discounts
            </p>
          </div>
        </div>
      </div>

      {/* Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Custom SVG Trend Line Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between relative">
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              7-Day Revenue Trend Timeline
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Aggregated daily sales ledger records showing standard and loyalty points purchase allocations.
            </p>
          </div>

          <div className="relative w-full my-6 flex justify-center">
            {/* Native Inline Responsive SVG */}
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" />
              <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" />
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Shaded Area */}
              {areaPath && <path d={areaPath} fill="url(#salesGrad)" />}

              {/* Trend Line */}
              {linePath && (
                <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />
              )}

              {/* Data dots / Interactive points */}
              {points.map((p, index) => (
                <g key={index}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredDay?.date === p.data.date ? "6" : "3.5"}
                    fill={hoveredDay?.date === p.data.date ? "#4f46e5" : "#ffffff"}
                    stroke="#4f46e5"
                    strokeWidth="2"
                    className="transition-all duration-150 cursor-pointer"
                    onMouseEnter={(e) => {
                      setHoveredDay(p.data);
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                </g>
              ))}

              {/* X Axis Labels */}
              {points.map((p, index) => (
                <text
                  key={index}
                  x={p.x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  fill="#94a3b8"
                  className="text-[8px] font-semibold font-sans"
                >
                  {p.data.date}
                </text>
              ))}
            </svg>

            {/* Float Tooltip */}
            {hoveredDay && (
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-left space-y-1 z-20 pointer-events-none animate-fade-in">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{hoveredDay.date}</p>
                <p className="text-sm font-black font-mono text-indigo-400">R {hoveredDay.revenue.toLocaleString()}</p>
                <p className="text-[10px] text-slate-300 font-semibold">{hoveredDay.orders} orders placed</p>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-medium text-left border-t border-slate-50 pt-3">
            * Hover over the timeline nodes to audit exact financial distributions and ticket counts.
          </div>
        </div>

        {/* Category Breakdown list */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Sales Allocation by Category</h4>
            <p className="text-xs text-slate-500 mt-1">
              Performance analysis showing category share allocation.
            </p>
          </div>

          <div className="space-y-4 my-6">
            {summary.categoryBreakdown.map((cat) => {
              const percentage = Math.round((cat.revenue / maxCategoryRevenue) * 100);
              return (
                <div key={cat.category} className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span className="text-slate-800">{cat.category}</span>
                    <span className="font-mono text-slate-900">
                      R {cat.revenue.toLocaleString()} ({cat.units} units)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 font-medium text-left border-t border-slate-50 pt-3">
            Optimizing supply-chain parameters is recommended for maximum velocity categories.
          </div>
        </div>

      </div>

      {/* Grid for top selling & low stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Top selling products list */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Top Performing Products</h4>
            <p className="text-xs text-slate-500 mt-1">
              Retail ranking sorted by gross unit sales volumes.
            </p>
          </div>

          <div className="space-y-3">
            {summary.topSellingProducts.map((p, index) => (
              <div key={p.id} className="flex items-center justify-between border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 flex items-center justify-center">
                    #{index + 1}
                  </span>
                  <p className="text-xs font-bold text-slate-900">{p.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-800 font-mono">R {p.revenue.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{p.sales} units sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock alerts dashboard */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5 text-orange-600">
              <ShieldAlert className="w-4.5 h-4.5" />
              Low Stock Alert Ledger
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Critical indicator warning that these SKUs contain less than 5 units.
            </p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[160px] pr-1">
            {summary.lowStockItems.length === 0 ? (
              <div className="text-center py-8 bg-slate-50/50 border border-dashed border-slate-100 rounded-xl">
                <p className="text-xs text-slate-400 font-semibold">✅ All product inventory levels healthy</p>
                <p className="text-[10px] text-slate-400 mt-0.5">No low-stock indicators active at this time.</p>
              </div>
            ) : (
              summary.lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border border-orange-100/60 p-3 rounded-xl bg-orange-50/20"
                >
                  <div className="text-left space-y-0.5">
                    <p className="text-xs font-extrabold text-slate-900">{item.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Category: {item.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-2.5 py-1 rounded-md">
                      {item.inventory === 0 ? "OUT OF STOCK" : `${item.inventory} Left!`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
