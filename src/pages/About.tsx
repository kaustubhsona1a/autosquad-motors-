import { Star, X, ChevronLeft, ChevronRight, Maximize2, MapPin, ShieldCheck, Sparkles, Award, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useVehicles } from '../context/VehicleContext';
import { MOCK_REVIEWS } from '../data/mockData';
import React, { useState } from 'react';

export default function About() {
  const { siteConfig } = useVehicles();
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const deliveries = siteConfig.clientDeliveries || [];

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deliveries.length === 0) return;
    setActivePhotoIndex((prev) => (prev !== null ? (prev + 1) % deliveries.length : 0));
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deliveries.length === 0) return;
    setActivePhotoIndex((prev) => (prev !== null ? (prev - 1 + deliveries.length) % deliveries.length : 0));
  };

  return (
    <div className="bg-transparent text-zinc-300 font-sans min-h-screen">
      <Helmet>
        <title>About AutoSquad | Premium Pre-Owned Car Dealership Mumbai</title>
        <meta name="description" content="Learn about AutoSquad, Mumbai's trusted pre-owned luxury and premium car dealer located in Agripada. Explore client delivery highlights and our commitment to quality." />
      </Helmet>

      {/* Client Deliveries Section */}
      <section className="pt-32 pb-24 bg-transparent relative z-10">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-20 animate-fade-in">
            <span className="text-white tracking-[0.25em] uppercase text-xs font-bold mb-3 block font-mono">
              MOMENTS OF JOY
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-extrabold text-white tracking-widest uppercase mb-4">
              MEMORIES <span className="text-zinc-400">ON</span> THE <span className="text-white">ROAD</span>
            </h2>
            <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed font-light">
              Real, candid snapshots of happy keys and vehicle handovers outside our Boutique. Feel the legacy we've built, one smile at a time!
            </p>
          </div>

          {/* Modern Cinematic Photo Wall */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
            {deliveries.map((img, i) => {
              const captions = [
                "🔑 Milestone Handover",
                "✨ Premium Acquisition",
                "🚗 Driving Dream Home",
                "🌟 Exceptional Delivery",
                "🖤 Bespoke Client Celebration",
                "🔥 Pure Motoring Passion"
              ];

              const currentCaption = captions[i % captions.length];

              return (
                <div 
                  key={i} 
                  id={`patron-card-${i}`}
                  onClick={() => setActivePhotoIndex(i)}
                  className="edgy-card-wrapper cursor-pointer group hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="edgy-card bg-[#080808]/95 p-4 flex flex-col justify-between h-full backdrop-blur-md">
                    {/* Photo Canvas Frame with Zoom Effect */}
                    <div className="relative overflow-hidden edgy-card-sm bg-zinc-950 aspect-[4/3] w-full">
                      <img 
                        src={img} 
                        alt={`Client Delivery ${i + 1}`} 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800" }}
                      />

                      {/* Minimal styled VERIFIED badge */}
                      <div className="absolute top-3 right-3 bg-[#050505]/90 text-[#FCF6BA] border border-[#D4AF37]/50 font-serif text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 edgy-card-sm shadow-md select-none">
                        ✓ DELIVERED
                      </div>
                    </div>

                    {/* Sleek Metadata & Caption */}
                    <div className="pt-4 px-1 flex flex-col justify-between flex-grow">
                      <div>
                        <span className="text-[10px] font-mono text-[#D4AF37] font-semibold tracking-widest uppercase block mb-1">
                          PATRON ARCHIVE #{i + 1}
                        </span>
                        <p className="font-serif text-white text-sm md:text-base font-bold tracking-wide select-none">
                          {currentCaption}
                        </p>
                      </div>

                      {/* Modern Clean Tag Footer */}
                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-between items-center text-[10px] font-mono text-zinc-400 select-none">
                        <span>ESTD. 2019</span>
                        <span className="text-zinc-400 font-medium">MUMBAI, INDIA</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Modern Cinematic Lightbox Modal */}
      {activePhotoIndex !== null && (
        <div 
          id="patron-lightbox-backdrop"
          onClick={() => setActivePhotoIndex(null)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-4 md:p-8"
        >
          {/* Top Control Bar */}
          <div className="absolute top-5 inset-x-0 px-6 flex justify-between items-center text-zinc-400 font-mono text-xs z-10 max-w-7xl mx-auto">
            <div>
              <span className="text-[#C8A64A] font-bold">AUTOSQUAD</span>
              <span className="mx-2 font-light">|</span>
              <span>PATRON ARCHIVE {activePhotoIndex + 1} OF {deliveries.length}</span>
            </div>
            
            <button 
              onClick={() => setActivePhotoIndex(null)}
              className="p-3 bg-zinc-900 border border-white/5 rounded-full text-zinc-400 hover:text-white hover:border-white transition-all flex items-center justify-center cursor-pointer shadow-lg hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Visual Centerpiece */}
          <div className="relative w-full max-w-5xl aspect-[16/10] md:max-h-[70vh] flex items-center justify-center group/lightbox my-auto">
            {/* Navigations inside group */}
            <button
              onClick={handlePrevPhoto}
              className="absolute left-4 p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-white hover:bg-black/90 text-white transition-all transform -translate-x-12 opacity-0 group-hover/lightbox:translate-x-0 group-hover/lightbox:opacity-100 z-20 cursor-pointer hidden md:flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img 
              src={deliveries[activePhotoIndex]} 
              alt="Immersive Celebration"
              onClick={(e) => e.stopPropagation()}
              className="w-full h-full max-h-[70vh] object-contain rounded-2xl border border-white/5 shadow-2xl animate-scale-up"
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format=crop&q=80&w=800" }}
            />

            <button
              onClick={handleNextPhoto}
              className="absolute right-4 p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-white hover:bg-black/90 text-white transition-all transform translate-x-12 opacity-0 group-hover/lightbox:translate-x-0 group-hover/lightbox:opacity-100 z-20 cursor-pointer hidden md:flex items-center justify-center"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Fast-Tapper Overlay controls */}
          <div className="flex md:hidden gap-6 mt-4 z-10">
            <button
               onClick={handlePrevPhoto}
               className="px-6 py-3 rounded-xl bg-zinc-900 border border-white/5 text-white text-xs font-mono font-bold uppercase tracking-wider"
            >
              PREV ARCHIVE
            </button>
            <button
               onClick={handleNextPhoto}
               className="px-6 py-3 rounded-xl bg-zinc-900 border border-white/5 text-white text-xs font-mono font-bold uppercase tracking-wider"
            >
              NEXT ARCHIVE
            </button>
          </div>

          {/* Informational Footer */}
          <div className="mt-6 text-center max-w-xl z-10 px-4">
            <p className="text-[#D4AF37] font-serif text-[10px] tracking-[0.3em] uppercase font-bold">MUMBAI DELIVERIES</p>
            <h4 className="text-white font-serif text-xl font-bold mt-1">Acquisition Milestone Celebration</h4>
            <p className="text-zinc-400 text-xs mt-2 font-light leading-relaxed">
              Every photograph is a direct capture of an esteemed patron receiving delivery of their handpicked, verified performance car from our secure gallery at 3rd Floor Raheja BMC Parking, Agripada, near Kalapani Police Chokwi.
            </p>
          </div>
        </div>
      )}

      {/* Our Heritage & Core Pillars Section */}
      <section className="py-24 bg-transparent border-t border-zinc-900 relative z-10">
        <div className="container mx-auto max-w-7xl px-4">
          {/* Main Story Header */}
          <div className="mb-20 animate-fade-in text-center lg:text-left max-w-3xl">
            <span className="text-zinc-400 tracking-[0.3em] uppercase text-xs font-bold mb-3 block font-mono">
              OUR FOUNDING STORY
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight font-bold leading-tight uppercase">
              REDEFINING THE <span className="text-zinc-400">AUTOMOBILE</span> JOURNEY
            </h2>
            <div className="h-[2px] w-20 bg-white mt-6 hidden lg:block"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Narrative Column - Pure Editorial Design */}
            <div className="lg:col-span-7 space-y-10 text-left animate-fade-in">
              <div className="border-l-2 border-[#C8A64A] pl-6 md:pl-8 space-y-4">
                <p className="text-lg md:text-xl text-white font-serif leading-relaxed italic font-medium">
                  "AutoSquad was founded in 2019 by Rakshit Bangera and Dipen Shah, backed by over 20 years of collective automotive industry experience, with one clear vision—to make buying a car an experience people genuinely enjoy."
                </p>
              </div>

              <div className="space-y-6 text-zinc-400 font-light text-base md:text-lg leading-relaxed">
                <p>
                  Having spent over 20 years working closely with leading automobile brands across Mumbai, we realized that customers deserved better. Better prices than conventional showrooms, shorter waiting periods, honest guidance, and a process that felt effortless from start to finish.
                </p>
                <p className="font-serif text-[#C8A64A] text-lg tracking-wide italic py-2">
                  That's how AutoSquad began.
                </p>
                <p>
                  Over the years, we've had the privilege of helping hundreds of customers drive home their new cars with confidence. As our journey grew, so did our commitment. Today, alongside new cars, we also specialize in carefully selected pre-owned vehicles that meet the same standards we'd expect for ourselves. Every car is thoroughly inspected, impeccably maintained, and chosen for its quality, reliability, and value.
                </p>
                <p>
                  To us, a car is never just a transaction. It's someone's first car, a family upgrade, a lifelong dream, or the beginning of a new chapter. We believe those moments deserve honesty, attention to detail, and an experience that feels personal.
                </p>
              </div>

              {/* Bold Closing Philosophy Banner */}
              <div className="edgy-card-wrapper">
                <div className="edgy-card bg-[#080808]/90 p-8 text-zinc-300 relative overflow-hidden backdrop-blur-md">
                  <div className="relative z-10 space-y-3">
                    <span className="font-serif text-xs text-[#D4AF37] font-bold uppercase tracking-widest block">OUR FOCUS</span>
                    <p className="text-zinc-300 font-light text-base leading-relaxed">
                      From your first conversation with us to the moment we hand over the keys, our focus remains the same—to make the entire journey smooth, transparent, and memorable.
                    </p>
                    <p className="text-white font-serif text-xl md:text-2xl font-bold tracking-tight pt-2">
                      At AutoSquad, we're not here to sell you a car. We're here to help you find the right one.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Founders & Pillars Grid */}
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
              {/* Pillars Box */}
              <div className="edgy-card-wrapper">
                <div className="edgy-card bg-[#080808]/90 p-8 space-y-6 backdrop-blur-md">
                  <h3 className="text-[#D4AF37] font-serif text-lg font-bold tracking-wide border-b border-zinc-800 pb-4">
                    The AutoSquad Standard
                  </h3>

                  <div className="space-y-5">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 edgy-card-sm bg-zinc-900 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-xs uppercase tracking-wider font-serif">20+ Years Experience</h4>
                        <p className="text-zinc-400 text-xs font-light mt-1 leading-relaxed">
                          Over two decades of combined hands-on automotive expertise in luxury procurement, technical diagnostics, and transparent operations.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 edgy-card-sm bg-zinc-900 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-xs uppercase tracking-wider font-serif">Elite Network</h4>
                        <p className="text-zinc-400 text-xs font-light mt-1 leading-relaxed">
                          Extensive industry connections and insider knowledge to secure exceptional pricing and swift delivery.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 edgy-card-sm bg-zinc-900 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-xs uppercase tracking-wider font-serif">Careful Curation</h4>
                        <p className="text-zinc-400 text-xs font-light mt-1 leading-relaxed">
                          Pre-owned cars vetted to the same rigorous standards we would expect for our personal vehicles.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-transparent border-t border-zinc-900/40 relative z-10">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <span className="text-[#D4AF37] tracking-[0.25em] uppercase text-xs font-bold mb-3 block font-serif">Unbiased Endorsements</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-wide mb-4">Google Business Ratings</h2>
            <div className="w-24 h-[1px] bg-[#D4AF37]/40 mx-auto mt-4 mb-4"></div>
            <p className="text-zinc-400 text-xs max-w-2xl mx-auto tracking-widest font-mono uppercase">
              Direct verification from our esteemed client community across Mumbai.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_REVIEWS.map((review, i) => {
              return (
                <div key={i} className="edgy-card-wrapper">
                  <div className="edgy-card bg-[#080808]/90 p-8 flex flex-col h-full justify-between backdrop-blur-md">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-1">
                          {[...Array(review.rating)].map((_, idx) => (
                            <Star key={idx} className="w-4 h-4 fill-current text-[#D4AF37]" />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-300 font-light italic leading-relaxed mb-8">"{review.text}"</p>
                    </div>
                    <div className="flex items-center pt-4 border-t border-zinc-800 gap-4">
                      <div className="w-10 h-10 edgy-card-sm flex items-center justify-center font-serif font-bold text-base text-[#D4AF37] border border-[#D4AF37]/30 bg-[#D4AF37]/10">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-white font-serif font-bold text-sm tracking-wide">{review.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{review.date}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 flex justify-center">
            <a 
              href="https://share.google/lolTXlsqZR1EaCrGJ" 
              target="_blank" 
              rel="noreferrer"
              className="group flex items-center justify-between gap-6 px-8 py-4 bg-[#080808] border border-[#D4AF37]/50 hover:border-[#FCF6BA] text-[#D4AF37] hover:text-[#FCF6BA] edgy-card text-xs font-bold tracking-[0.2em] uppercase font-serif transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-xl max-w-md w-full sm:w-auto"
            >
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 fill-current text-[#D4AF37] group-hover:text-[#FCF6BA] transition-colors" />
                <span>Write or View Google Reviews</span>
              </div>
              <span className="text-sm font-light transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </a>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-transparent text-center border-t border-zinc-900 relative z-10 animate-fade-in overflow-hidden">
        {/* Background gradient blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-white/5 via-zinc-400/5 to-zinc-550/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto max-w-3xl px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-5 tracking-wide">Experience Ultimate Procurement</h2>
          <p className="text-zinc-400 mb-10 font-light tracking-wide text-lg">We welcome you to our secure, private bypass showroom to inspect our pristine, handpicked stock offline.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-xs tracking-widest uppercase font-mono font-bold">
            <div className="diamond-btn-wrapper w-[220px] h-[52px]">
              <Link to="/inventory" className="diamond-btn-content text-[#D4AF37] hover:text-[#FCF6BA] flex items-center justify-center px-6 font-bold tracking-widest">
                <span>Browse Collection</span>
              </Link>
            </div>
            <a href="/#contact" className="bg-[#111111] text-zinc-300 hover:text-white hover:border-[#D4AF37] px-8 py-4 transition-all duration-300 rounded-xl border border-zinc-800 shadow-sm flex items-center gap-2">
              <span>Contact Our Team</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

