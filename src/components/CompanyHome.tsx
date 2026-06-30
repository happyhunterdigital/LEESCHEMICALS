import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Phone, 
  Clock, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Download, 
  Mail, 
  Check, 
  MapPin, 
  Building, 
  Calendar, 
  Info,
  Sparkles,
  ChevronRight,
  FileText,
  Bookmark,
  Activity,
  Layers
} from "lucide-react";

interface CompanyHomeProps {
  onNavigateToStore: () => void;
  onAddToCartByProduct: (productName: string) => void;
}

export default function CompanyHome({ onNavigateToStore, onAddToCartByProduct }: CompanyHomeProps) {
  // Carousel State
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Lead Capture State
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Quote State
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteService, setQuoteService] = useState("");
  const [quotePhone, setQuotePhone] = useState("");
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  // Carousel slider cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (leadEmail) {
      setLeadSubmitted(true);
      setTimeout(() => {
        setLeadSubmitted(false);
        setLeadName("");
        setLeadEmail("");
      }, 5000);
    }
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSubmitted(true);
    setTimeout(() => {
      setQuoteSubmitted(false);
      setQuoteOpen(false);
      setQuotePhone("");
      setQuoteService("");
    }, 4000);
  };

  // Curated slide assets matching the specifications:
  const SLIDES = [
    {
      title: "PRESTIGE DISHWASHING POWER",
      subtitle: "TOUGH ON GREASE, GENTLE ON HANDS",
      description: "Formulated to cut through tough oils and residues, leaving your dishes sparkling clean and hygienically sanitized.",
      image: "https://res.cloudinary.com/dka0498ns/image/upload/v1782843946/mom_washing_dishes_using_Lees_Chemicals_Dishwashing_Liquid_xwf838.jpg",
      tag: "HOME HYGIENE LEADER",
      caption: "Our premium dishwashing liquid in active daily use."
    },
    {
      title: "ACTIVE AUTOMOTIVE CARE",
      subtitle: "DEEP BLACK TYRE & DASH GLOSS",
      description: "Engineered to protect, seal, and restore tyres and dashboards with a lasting showroom luster.",
      image: "https://res.cloudinary.com/dka0498ns/image/upload/v1782843947/Dad_using_Lees_Chemicals_tyre-dash-official_on_his_tyres_ummvgm.jpg",
      tag: "TYRE & DASH SPECIALIST",
      caption: "Applying Lees Tyre-Dash for a deep premium finish."
    },
    {
      title: "MULTI-SURFACE SANITATION",
      subtitle: "LEE'S PREMIUM CLEANING CREAM",
      description: "Easily lifts stubborn cooking stains, grime, and grease from countertops, tiles, and appliances.",
      image: "https://res.cloudinary.com/dka0498ns/image/upload/v1782843945/mom_cleaning_the_kitchen_counter_using_LeesChemicals_cleaning-cream-BACK_lpzfal.jpg",
      tag: "SURFACE CARE CHAMPION",
      caption: "Wiping counters clean with Lees Multipurpose Cream."
    },
    {
      title: "LAUNDROMAT STRENGTH FORMULAS",
      subtitle: "ACTIVE WASHING POWDER & BLEACH",
      description: "The professional choice for bright, clean whites and vibrant colors, engineered to fight the toughest laundry stains.",
      image: "https://res.cloudinary.com/dka0498ns/image/upload/v1782843948/A_South_African_laundromat_using_LeesChemicals_WASHING-POWDER_and_laundrybleach_l6jcbh.jpg",
      tag: "BULK LAUNDRY EXCELLENCE",
      caption: "Lees commercial range washing laundry fabrics perfectly."
    }
  ];

  return (
    <div className="space-y-12 pb-16 animate-fade-in text-slate-900" id="company-home-tab">
      
      {/* SECTION 1: Above-the-fold & Transparency Header (Full width with overlay slider) */}
      <div className="relative overflow-hidden rounded-3xl min-h-[480px] md:min-h-[520px] flex flex-col justify-between p-4 sm:p-6 md:p-10 shadow-xl border-b-8 border-[#D68C7E] border-2 border-black">
        {/* Background slide images with cross-fade */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              <img 
                src={SLIDES[activeSlide].image}
                alt={SLIDES[activeSlide].title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Overlay for pristine contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-slate-900/40 to-black/10" />
              <div className="absolute inset-0 bg-[#112F20]/15 mix-blend-multiply" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Operational Transparency Header Row - Static on top */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-white/20 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E2ECE9] rounded-xl text-[#112F20] font-black border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[#FFFDE8] uppercase tracking-widest text-[8px] font-bold">Instant Transparency</p>
              <p className="font-bold text-white text-[11px] sm:text-xs drop-shadow-sm">Mon - Fri: 08:00 - 17:00 | Sat: 08:00 - 13:00</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <a 
              href="tel:+27315551042" 
              className="w-full sm:w-auto flex items-center gap-3 bg-[#FFFDE8] hover:bg-yellow-100/90 text-slate-900 px-3.5 py-2 rounded-xl transition cursor-pointer border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]"
            >
              <div className="p-1 bg-[#112F20] rounded-md text-white shrink-0">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="text-slate-500 uppercase tracking-widest text-[8px] font-bold">Direct Click-To-Call</p>
                <p className="font-mono font-black text-[#112F20] text-xs">+27 (0) 31 555 1042</p>
              </div>
            </a>
          </div>
        </div>

        {/* Content Portal on top of Image */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1 py-2 md:py-4">
          <div className="lg:col-span-8 space-y-4 md:space-y-5 text-left">
            <div className="inline-flex items-center gap-2 bg-[#FFFDE8] border-2 border-black text-slate-900 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <Sparkles className="w-3.5 h-3.5 text-[#C85A3F]" />
              Introductory Seasonal Deal
            </div>

            <div className="min-h-[120px] md:min-h-[160px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-3"
                >
                  <p className="text-amber-200 font-black uppercase tracking-widest text-[10px] sm:text-xs font-mono drop-shadow">
                    {SLIDES[activeSlide].tag}
                  </p>
                  
                  <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight leading-none text-white uppercase font-sans drop-shadow-md">
                    {SLIDES[activeSlide].title} <br className="hidden sm:block" />
                    <span className="text-[#FFFDE8] underline decoration-[#D68C7E] decoration-4 underline-offset-4 block sm:inline mt-1.5 sm:mt-0 text-base sm:text-2xl md:text-4xl lg:text-5xl">
                      {SLIDES[activeSlide].subtitle}
                    </span>
                  </h1>

                  <p className="text-slate-200 text-xs md:text-sm leading-relaxed max-w-2xl drop-shadow-sm font-medium">
                    {SLIDES[activeSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <button
                onClick={onNavigateToStore}
                className="w-full sm:w-auto bg-[#FFFDE8] hover:bg-yellow-100 text-slate-950 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-px active:shadow-sm"
              >
                <span>Browse Products & Order</span>
                <ArrowRight className="w-4 h-4 text-slate-950 font-black shrink-0" />
              </button>
              
              <button
                onClick={() => {
                  setQuoteService(SLIDES[activeSlide].title);
                  setQuoteOpen(true);
                }}
                className="w-full sm:w-auto bg-black/50 hover:bg-black/70 backdrop-blur-sm border-2 border-white text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition text-center cursor-pointer"
              >
                Request Custom Quote
              </button>
            </div>
          </div>

          {/* Bottom right floating info badge */}
          <div className="lg:col-span-4 flex flex-col items-end justify-end h-full">
            <div className="bg-[#112F20]/90 backdrop-blur-sm rounded-2xl p-4 border-2 border-black text-left shadow-lg max-w-xs ml-auto self-end hidden lg:block">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[9px] font-black uppercase tracking-widest bg-[#FFFDE8] text-[#112F20] px-2 py-0.5 rounded border border-black font-mono">
                  LIVE PROOF
                </span>
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="font-extrabold text-[#FFFDE8] text-xs mt-1.5 leading-tight font-sans">
                {SLIDES[activeSlide].caption}
              </p>
              <p className="text-[10px] text-emerald-200/80 font-medium">
                Engineered for maximum efficacy and professional sanitization standards.
              </p>
            </div>
          </div>
        </div>

        {/* Footer controls: Slide Dots & navigation indicator */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 mt-4">
          <div className="flex gap-2">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeSlide ? "w-8 bg-[#FFFDE8]" : "w-2 bg-emerald-800/80 hover:bg-emerald-700"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
          <p className="text-[10px] font-mono font-bold text-[#E2ECE9]/60">
            SLIDE {activeSlide + 1} OF {SLIDES.length}
          </p>
        </div>
      </div>


      {/* SECTION 2: Modular Scope Matrix (Services Grid) */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="text-xs font-black text-[#C85A3F] uppercase tracking-widest font-mono">Precision Scope Matrix</p>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 uppercase font-sans">
            MODULAR CLEANING MATRIX
          </h2>
          <p className="text-slate-500 text-xs leading-normal">
            We formulate premium chemical solutions structured across industrial, domestic, and detailing frameworks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Home Hygiene */}
          <div className="bg-[#E2ECE9] rounded-2xl border-2 border-black p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#112F20] text-[#FFFDE8] flex items-center justify-center font-black shadow-md border-2 border-black">
                01
              </div>
              <div className="space-y-2">
                <div className="inline-block bg-[#FFFDE8] px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border border-black font-mono">
                  DOMESTIC RANGE
                </div>
                <h3 className="font-black text-slate-950 text-base uppercase font-sans mt-1">Home Hygiene</h3>
                <p className="text-slate-700 text-xs leading-relaxed">
                  Highly active formulations for laundries, kitchens, and domestic surfaces. Includes concentrated washing powder, ultra-degreaser dishwashing liquid, sanitizing bleach, and cleaning creams.
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-300 mt-6 flex items-center justify-between">
              <button 
                onClick={onNavigateToStore}
                className="text-xs font-black text-[#112F20] hover:text-[#C85A3F] flex items-center gap-1 uppercase tracking-wider transition"
              >
                <span>Order Products</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-slate-500 font-mono font-bold">5 Active Products</span>
            </div>
          </div>

          {/* Card 2: Automotive Care */}
          <div className="bg-[#FFFDE8] rounded-2xl border-2 border-black p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#112F20] text-[#FFFDE8] flex items-center justify-center font-black shadow-md border-2 border-black">
                02
              </div>
              <div className="space-y-2">
                <div className="inline-block bg-[#E2ECE9] px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border border-black font-mono">
                  VEHICLE CARE
                </div>
                <h3 className="font-black text-slate-950 text-base uppercase font-sans mt-1">Automotive Care</h3>
                <p className="text-slate-700 text-xs leading-relaxed">
                  Engineered gloss and restore formulas for professional car detailing centers and personal vehicle maintenance. Includes premium tyre/dash shine, PH-balanced leather cleaners, and gritty hand soaps.
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-300 mt-6 flex items-center justify-between">
              <button 
                onClick={onNavigateToStore}
                className="text-xs font-black text-[#112F20] hover:text-[#C85A3F] flex items-center gap-1 uppercase tracking-wider transition"
              >
                <span>Explore Care Kit</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-slate-500 font-mono font-bold">3 Active Products</span>
            </div>
          </div>

          {/* Card 3: Custom Bulk Formulation */}
          <div className="bg-white rounded-2xl border-2 border-black p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#112F20] text-[#FFFDE8] flex items-center justify-center font-black shadow-md border-2 border-black">
                03
              </div>
              <div className="space-y-2">
                <div className="inline-block bg-[#D68C7E]/20 px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border border-black text-[#C85A3F] font-mono">
                  SPECIALIST COMPOUND
                </div>
                <h3 className="font-black text-slate-950 text-base uppercase font-sans mt-1">Custom Formulas</h3>
                <p className="text-slate-700 text-xs leading-relaxed">
                  Need a bespoke chemical compound, industrial-strength floor stripper, or custom dilution guidance for commercial workshops? Our Durban facility constructs customized batches to order.
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-300 mt-6 flex items-center justify-between">
              <button 
                onClick={() => {
                  setQuoteService("Custom Bulk Formulations");
                  setQuoteOpen(true);
                }}
                className="text-xs font-black text-[#112F20] hover:text-[#C85A3F] flex items-center gap-1 uppercase tracking-wider transition"
              >
                <span>Request Custom Quote</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-[#C85A3F] font-mono font-bold uppercase">Contract Supply</span>
            </div>
          </div>

        </div>
      </div>


      {/* SECTION 3: Transparent Value Tiering (Pricing comparison) */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="text-xs font-black text-[#C85A3F] uppercase tracking-widest font-mono">Transparent Value Tiering</p>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 uppercase font-sans">
            Curated Hygiene Bundles
          </h2>
          <p className="text-slate-500 text-xs leading-normal">
            Simple, transparent side-by-side package tiers. Clear bullet points with frictionless Call-to-Order triggers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
          
          {/* Tier 1: Standard Bundle */}
          <div className="bg-white rounded-3xl border-2 border-black p-6 flex flex-col justify-between text-left shadow-sm hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition">
            <div className="space-y-6">
              <div className="w-full h-44 rounded-2xl overflow-hidden border-2 border-black bg-slate-100 shadow-sm relative">
                <img
                  src="https://res.cloudinary.com/dka0498ns/image/upload/v1782854274/Lees_Concentrated_Washing_Powder_Lees_Whitening_Laundry_Bleach_Degrease_Dishwashing_Liquid_espchl.jpg"
                  alt="Standard Hygiene Pack"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#C85A3F] font-mono">Starter Household</span>
                <h3 className="text-lg font-black text-slate-950 mt-1 uppercase">Standard Hygiene Pack</h3>
                <p className="text-xs text-slate-500 mt-1 leading-normal">Perfect for small households seeking high-strength everyday sanitization.</p>
              </div>

              <div className="flex items-baseline gap-1 py-3 border-y border-slate-200">
                <span className="text-[#112F20] text-sm font-black">R</span>
                <span className="text-4xl font-black text-[#112F20] font-mono">258</span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">/ Pack</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#112F20] shrink-0" />
                  <span>1x Lee's Concentrated Washing Powder (1kg)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#112F20] shrink-0" />
                  <span>1x Lee's Whitening Laundry Bleach (1L)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#112F20] shrink-0" />
                  <span>1x Lee's Ultra-Degreaser Dishwashing Liquid (750ml)</span>
                </li>
                <li className="flex items-center gap-2.5 text-slate-300 line-through">
                  <span>1x All-Purpose Green Cleaner (1L)</span>
                </li>
                <li className="flex items-center gap-2.5 text-slate-300 line-through">
                  <span>1x Professional Tyre & Dash Shine (500ml)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                onAddToCartByProduct("Lee's Concentrated Washing Powder");
                onAddToCartByProduct("Lee's Whitening Laundry Bleach");
                onAddToCartByProduct("Lee's Ultra-Degreaser Dishwashing Liquid");
              }}
              className="mt-8 w-full bg-[#E2ECE9] hover:bg-[#D1E8E2] text-slate-950 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]"
            >
              Add Starter Set (R258)
            </button>
          </div>

          {/* Tier 2: Premium (Most Popular - Styled Slightly Taller) */}
          <div className="bg-[#112F20] text-white rounded-3xl p-6 flex flex-col justify-between text-left shadow-xl border-4 border-black relative lg:-translate-y-2 lg:scale-[1.03] shadow-[#112F20]/10">
            <div className="absolute top-4 right-4 bg-[#FFFDE8] text-slate-950 text-[8px] font-black px-2.5 py-1 rounded border border-black uppercase tracking-widest font-mono z-10">
              Most Popular
            </div>

            <div className="space-y-6">
              <div className="w-full h-44 rounded-2xl overflow-hidden border-2 border-black bg-slate-900 shadow-sm relative">
                <img
                  src="https://res.cloudinary.com/dka0498ns/image/upload/v1782854274/Lees_Concentrated_Washing_Powder_Whitening_Laundry_Bleach__All-Purpose_Green_Cleaner_Ultra-Degreaser_Dishwashing_Liquid_Multi-Surface_Cleaning_Cream_zrvrww.jpg"
                  alt="Premium Hygiene Set"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#D68C7E] font-mono">Complete Home Guard</span>
                <h3 className="text-lg font-black text-slate-100 mt-1 uppercase">Premium Hygiene Set</h3>
                <p className="text-xs text-emerald-100/70 mt-1 leading-normal">Our ultimate deep-clean suite encompassing laundry, grease removal, and surface care.</p>
              </div>

              <div className="flex items-baseline gap-1 py-3 border-y border-emerald-800">
                <span className="text-[#FFFDE8] text-sm font-black">R</span>
                <span className="text-5xl font-black text-[#FFFDE8] font-mono">418</span>
                <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider ml-1">/ Pack</span>
              </div>

              <ul className="space-y-2.5 text-xs text-emerald-100">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FFFDE8] shrink-0" />
                  <span>1x Lee's Concentrated Washing Powder (1kg)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FFFDE8] shrink-0" />
                  <span>1x Lee's Whitening Laundry Bleach (1L)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FFFDE8] shrink-0" />
                  <span>1x Lee's All-Purpose Green Cleaner (1L)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FFFDE8] shrink-0" />
                  <span>1x Lee's Ultra-Degreaser Dishwashing Liquid (750ml)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#FFFDE8] shrink-0" />
                  <span>1x Lee's Multi-Surface Cleaning Cream (500ml)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                onAddToCartByProduct("Lee's Concentrated Washing Powder");
                onAddToCartByProduct("Lee's Whitening Laundry Bleach");
                onAddToCartByProduct("Lee's All-Purpose Green Cleaner");
                onAddToCartByProduct("Lee's Ultra-Degreaser Dishwashing Liquid");
                onAddToCartByProduct("Lee's Multi-Surface Cleaning Cream");
              }}
              className="mt-8 w-full bg-[#FFFDE8] hover:bg-yellow-100 text-slate-950 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]"
            >
              Add Premium Bundle (R418)
            </button>
          </div>

          {/* Tier 3: Elite Care */}
          <div className="bg-[#FFFDE8] rounded-3xl border-2 border-black p-6 flex flex-col justify-between text-left shadow-sm hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition">
            <div className="space-y-6">
              <div className="w-full h-44 rounded-2xl overflow-hidden border-2 border-black bg-slate-100 shadow-sm relative">
                <img
                  src="https://res.cloudinary.com/dka0498ns/image/upload/v1782854274/Lees_Chemicals_tyre-dash-official_Leather_Cleaner_ergbfd.jpg"
                  alt="Elite Automotive Pack"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#C85A3F] font-mono">Workshop & Detailing</span>
                <h3 className="text-lg font-black text-slate-950 mt-1 uppercase">Elite Automotive Pack</h3>
                <p className="text-xs text-slate-500 mt-1 leading-normal">Premium detailing and heavy-grit cleaning products tailored for garages, workshops, and car fans.</p>
              </div>

              <div className="flex items-baseline gap-1 py-3 border-y border-[#F0E6B2]">
                <span className="text-[#112F20] text-sm font-black">R</span>
                <span className="text-4xl font-black text-[#112F20] font-mono">460</span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">/ Pack</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#112F20] shrink-0" />
                  <span>1x Professional Tyre & Dash Shine (500ml)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#112F20] shrink-0" />
                  <span>1x PH-Balanced Premium Leather Cleaner (500ml)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#112F20] shrink-0" />
                  <span>1x Heavy-Duty Hand Grit Cleaner (1kg)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#112F20] shrink-0" />
                  <span>Includes polyurethane exfoliating scrub grit</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#112F20] shrink-0" />
                  <span>Deep UV block protection technology</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                onAddToCartByProduct("Lee's Professional Tyre & Dash Shine");
                onAddToCartByProduct("Lee's Premium Leather Cleaner");
                onAddToCartByProduct("Lee's Heavy-Duty Hand Grit Cleaner");
              }}
              className="mt-8 w-full bg-white hover:bg-slate-50 text-slate-950 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]"
            >
              Add Detailing Set (R460)
            </button>
          </div>

        </div>
      </div>


      {/* SECTION 4: Lead Capture & Authority Social Proof */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
        
        {/* Left Side (Social Proof & Authority) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-black p-6 md:p-8 flex flex-col justify-between text-left shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C85A3F] font-mono">Verified Performance</span>
              <h3 className="text-xl font-black text-slate-950 uppercase font-sans">
                Authority & Client Proof
              </h3>
              <p className="text-xs text-slate-500 leading-normal">
                See why workshop supervisors, laundry specialists, and detailing shops trust the LEES CHEMICALS compound ledger.
              </p>
            </div>

            {/* Testimonials with crisp style */}
            <div className="space-y-4">
              
              <div className="p-4 bg-[#E2ECE9] rounded-2xl border-2 border-black space-y-2 text-left shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-slate-900">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#112F20] text-[#112F20]" />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono bg-white text-[#112F20] font-bold px-2 py-0.5 rounded border border-black uppercase">
                    Fleet Supervisor
                  </span>
                </div>
                <p className="text-slate-800 italic text-xs leading-relaxed">
                  "The Heavy-Duty Hand Grit Cleaner is the finest we've used in the workshop. It easily emulsifies oil, grease, and paint after diesel engine overhauls without skin cracks."
                </p>
                <p className="text-[11px] font-extrabold text-[#112F20]">- Johan Venter, Durban Fleet Logistics</p>
              </div>

              <div className="p-4 bg-[#FFFDE8] rounded-2xl border-2 border-black space-y-2 text-left shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-slate-900">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#112F20] text-[#112F20]" />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono bg-white text-[#112F20] font-bold px-2 py-0.5 rounded border border-black uppercase">
                    Commercial Valet
                  </span>
                </div>
                <p className="text-slate-800 italic text-xs leading-relaxed">
                  "Lee's Tyre & Dash Shine restores deep black shine without the greasy dust-attracting residue. Incredible formulation, customers notice instantly."
                </p>
                <p className="text-[11px] font-extrabold text-[#112F20]">- Sindi Cele, Durban Premium Valets</p>
              </div>

            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-slate-200 mt-6 text-slate-600 text-[11px]">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>SABS Ingredient compliant, Biodegradable Surfactants, Proudly South African</span>
          </div>
        </div>

        {/* Right Side (Lead Nurturing Magnet Form) */}
        <div className="lg:col-span-5 bg-[#112F20] text-white rounded-3xl p-6 md:p-8 flex flex-col justify-between text-left shadow-xl relative overflow-hidden border-b-8 border-[#D68C7E] border-2 border-black">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFFDE8]/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-6">
            <div className="w-10 h-10 rounded-xl bg-[#FFFDE8] text-[#112F20] flex items-center justify-center font-black shadow-md border border-black">
              <FileText className="w-5 h-5" />
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#D68C7E] font-mono">Lead Authority Magnet</span>
              <h3 className="text-lg font-black text-[#FFFDE8] uppercase font-sans">
                Free Handling & Dilution PDF Chart
              </h3>
              <p className="text-xs text-emerald-100/80 leading-normal">
                Optimize your chemical efficiency. Grab our professional Safe Chemical Dilution & Safety Chart to prevent product wastage.
              </p>
            </div>

            {leadSubmitted ? (
              <div className="bg-[#0e2417] border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3 animate-fade-in">
                <div className="w-10 h-10 bg-[#FFFDE8] text-[#112F20] rounded-full flex items-center justify-center font-black mx-auto">
                  ✓
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#FFFDE8] uppercase tracking-wider">Download Initiated</h4>
                  <p className="text-[11px] text-emerald-200/80 mt-1 leading-normal">
                    We've sent the PDF Dilution Ledger & 15% discount coupon to <strong>{leadEmail}</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] text-emerald-200/70 font-bold uppercase tracking-wider mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sindi Cele"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="w-full bg-[#0e2417] border border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#FFFDE8] transition placeholder-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-emerald-200/70 font-bold uppercase tracking-wider mb-1">Corporate Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sindi@premiumvalet.co.za"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full bg-[#0e2417] border border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#FFFDE8] transition placeholder-emerald-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FFFDE8] hover:bg-yellow-100 text-[#112F20] font-black text-xs py-3.5 rounded-xl transition border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] uppercase tracking-widest flex items-center justify-center gap-2 mt-4"
                >
                  <Download className="w-4 h-4" />
                  Download Free Chart Now
                </button>
              </form>
            )}
          </div>

          <p className="text-[9px] text-emerald-200/40 leading-normal text-left mt-6">
            We value your professional security. Zero spam. Safe unsubscribes always supported.
          </p>
        </div>

      </div>


      {/* Custom Quote Request Modal */}
      {quoteOpen && (
        <div className="fixed inset-0 z-50 bg-[#112F20]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 text-left relative space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#FFFDE8] border border-black text-[#112F20] rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-950 uppercase tracking-tight text-sm">
                  Request Custom Quote
                </h3>
              </div>
              <button 
                onClick={() => setQuoteOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold"
              >
                ✕
              </button>
            </div>

            {quoteSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-lg font-black border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  ✓
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-950 uppercase text-xs">Request Handed to Ledger</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">
                    One of our chemical formulation specialists will telephone you shortly on your provided contact number.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Company / Contact Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sindi Cele (Premium Valets)"
                    className="w-full border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">South African Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 031 555 1042"
                    value={quotePhone}
                    onChange={(e) => setQuotePhone(e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-black font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Chemical Focus Service / Product Group</label>
                  <select
                    value={quoteService}
                    onChange={(e) => setQuoteService(e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-black bg-white"
                  >
                    <option value="All-Purpose Chemical Inquiry">All-Purpose Chemical Inquiry</option>
                    <option value="Home Hygiene Bulk">Home Hygiene Bulk Supply</option>
                    <option value="Automotive Detailing Series">Automotive Detailing Series</option>
                    <option value="Custom Formula Development">Custom Chemical Compound Development</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Additional Formulation Needs</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Requesting custom dilution sheets, bulk washing powder delivery cycles, or specialized degreaser compounding."
                    className="w-full border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-black resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#112F20] hover:bg-emerald-950 text-white font-black text-xs py-3.5 rounded-xl transition border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-widest"
                >
                  Submit Quote Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
