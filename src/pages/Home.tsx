import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Banknote, FileText, Star, MapPin, Phone, Car, Gauge, Fuel, Cog, Settings2, Compass, ExternalLink, Instagram, Video, ChevronDown, Gem, Award, Landmark, Building2 } from 'lucide-react';
import { formatPrice, MOCK_REVIEWS } from '../data/mockData';
import { useVehicles } from '../context/VehicleContext';
import { Helmet } from 'react-helmet-async';

const CARD_THEMES = [
  {
    glow: "hover:border-white/50 hover:shadow-lg hover:shadow-white/5",
    textHover: "group-hover:text-white",
    price: "text-white",
    badge: "text-white border-white/20 bg-white/10 shadow-sm backdrop-blur-md",
    btn: "group-hover:border-white group-hover:text-zinc-950 group-hover:bg-white group-hover:shadow-sm",
    icon: "text-white",
    border: "border-white/10 hover:border-white/30"
  },
  {
    glow: "hover:border-zinc-300/50 hover:shadow-lg hover:shadow-zinc-300/5",
    textHover: "group-hover:text-zinc-200",
    price: "text-white",
    badge: "text-zinc-300 border-zinc-300/20 bg-white/10 shadow-sm backdrop-blur-md",
    btn: "group-hover:border-zinc-300 group-hover:text-zinc-950 group-hover:bg-zinc-200 group-hover:shadow-sm",
    icon: "text-zinc-300",
    border: "border-white/10 hover:border-zinc-300/30"
  },
  {
    glow: "hover:border-zinc-400/50 hover:shadow-lg hover:shadow-zinc-400/5",
    textHover: "group-hover:text-zinc-300",
    price: "text-white",
    badge: "text-zinc-400 border-zinc-400/20 bg-white/10 shadow-sm backdrop-blur-md",
    btn: "group-hover:border-zinc-400 group-hover:text-zinc-950 group-hover:bg-zinc-300 group-hover:shadow-sm",
    icon: "text-zinc-400",
    border: "border-white/10 hover:border-zinc-400/30"
  },
  {
    glow: "hover:border-zinc-500/50 hover:shadow-lg hover:shadow-zinc-500/5",
    textHover: "group-hover:text-zinc-400",
    price: "text-white",
    badge: "text-zinc-500 border-zinc-500/20 bg-white/10 shadow-sm backdrop-blur-md",
    btn: "group-hover:border-zinc-500 group-hover:text-zinc-950 group-hover:bg-zinc-400 group-hover:shadow-sm",
    icon: "text-zinc-500",
    border: "border-white/10 hover:border-zinc-500/30"
  }
];

export default function Home() {
  const { vehicles, siteConfig, loading } = useVehicles();
  const featuredCars = vehicles.filter(v => v.status === 'Available').slice(0, 3);
  
  const siteUrl = "https://instagram.com/autosquad_cars";
  const defaultDesc = "AutoSquad | Explore premium pre-owned vehicles at Mumbai's premier enthusiast showroom. Quality inventory, transparent pricing and an enthusiast-focused buying experience.";

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-zinc-300 font-sans">
      <Helmet>
        <title>AutoSquad | Premium Pre-Owned Cars Mumbai</title>
        <meta name="description" content={defaultDesc} />
        <meta property="og:title" content="AutoSquad | Premium Pre-Owned Cars Mumbai" />
        <meta property="og:description" content={defaultDesc} />
        <meta property="og:image" content={siteConfig.homeHeroImage} />
        <meta property="og:url" content={siteUrl} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Hero Space - Styled with quick action buttons using gold minimalist style */}
      <section className="relative h-[calc(100vh-100px)] sm:h-[calc(100vh-80px)] min-h-[440px] sm:min-h-[500px] max-h-[850px] flex flex-col items-start justify-center pb-8 sm:pb-24 overflow-hidden px-3.5 sm:px-12 md:px-16 lg:px-24 text-left z-20">
        <div className="max-w-5xl w-full relative z-30 flex flex-row items-center justify-start gap-3 sm:gap-6 md:gap-8 flex-wrap sm:flex-nowrap -translate-y-[95%] sm:-translate-y-[15%]">
          
          {/* Logo Hero Branding with Sunshine Type Effect */}
          <div className="sunshine-wrapper relative shrink-0 select-none animate-fade-in my-1">
            {/* Sunshine background glow & rotating sunbeams */}
            <div className="sunshine-glow-bg" />
            <div className="sunshine-rays" />

            {siteConfig.logo ? (
              <img 
                src={siteConfig.logo} 
                alt="AutoSquad Pre Owned Cars" 
                className="relative z-10 w-auto max-w-[60vw] sm:max-w-[440px] md:max-w-[540px] lg:max-w-[600px] max-h-[135px] sm:max-h-[210px] md:max-h-[260px] lg:max-h-[300px] object-contain filter drop-shadow-[0_0_25px_rgba(255,215,0,0.5)] drop-shadow-[0_10px_30px_rgba(0,0,0,0.95)]" 
              />
            ) : (
              <h1 className="relative z-10 text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.8rem] font-black italic tracking-tight sm:tracking-normal uppercase font-sans drop-shadow-[0_8px_24px_rgba(0,0,0,0.9)] leading-none flex items-center justify-start">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-zinc-400">
                  AUTO
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5C0] via-[#E2B738] to-[#997210]">
                  SQUAD
                </span>
              </h1>
            )}
          </div>

          {/* Browse Inventory Diamond Button (Positioned adjacent to logo on mobile & desktop) */}
          <div className="diamond-btn-wrapper w-[145px] sm:w-[195px] md:w-[215px] h-[38px] sm:h-[42px] group shrink-0 relative z-30 my-1">
            <Link 
              to="/inventory" 
              className="diamond-btn-content text-[#D4AF37] hover:text-[#FCF6BA] font-bold tracking-[0.11em] sm:tracking-[0.14em] uppercase text-[10px] sm:text-xs font-serif px-2.5 sm:px-3 flex items-center justify-center whitespace-nowrap text-center"
            >
              <span className="whitespace-nowrap">Browse Inventory</span>
            </Link>
          </div>

        </div>
      </section>

      {/* Why Choose Us */}
      <section className="pt-20 pb-16 sm:py-24 bg-transparent relative z-10">
         <div className="container mx-auto max-w-7xl px-4">
           <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
             <span className="text-[#D4AF37] tracking-[0.25em] uppercase text-xs sm:text-sm font-bold mb-3 block font-serif">Certified Quality Standards</span>
             <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white tracking-tight font-bold">Uncompromising Assurance</h2>
           </div>

           {/* Top Financing Tie-Up Card */}
           <div className="mb-6 sm:mb-8">
             <div className="group relative rounded-2xl p-5 sm:p-7 bg-gradient-to-r from-[#0a0a0d]/95 via-[#14120a]/95 to-[#0a0a0d]/95 border border-[#D4AF37]/50 hover:border-[#D4AF37] backdrop-blur-md transition-all duration-300 shadow-xl shadow-black/80 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
               <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                 <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center shrink-0 shadow-lg shadow-[#D4AF37]/10">
                   <Landmark className="w-6 h-6 sm:w-8 sm:h-8 text-[#D4AF37]" />
                 </div>
                 <div>
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#FCF6BA] text-[10px] sm:text-xs font-serif font-bold uppercase tracking-widest mb-1.5">
                     <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                     <span>National Banking Partners</span>
                   </div>
                   <h3 className="text-base sm:text-xl md:text-2xl font-bold tracking-widest text-white uppercase font-serif">
                     Tie-Up For Financing With All Leading Banks
                   </h3>
                   <p className="text-zinc-300 text-xs sm:text-sm mt-1.5 max-w-2xl font-light leading-relaxed">
                     HDFC Bank, ICICI Bank, Axis Bank, State Bank of India (SBI), IndusInd & major NBFCs. Instant approvals, attractive ROI & tailored EMI loan assistance.
                   </p>
                 </div>
               </div>
               <div className="shrink-0">
                 <a 
                   href="tel:+919769699655" 
                   className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#FCF6BA] text-black font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-[#D4AF37]/20"
                 >
                   <span>Enquire Finance</span>
                   <ArrowRight className="w-4 h-4" />
                 </a>
               </div>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
             {[
               { icon: ShieldCheck, title: "150-Point Inspection", desc: "Rigorous technical diagnostic, road test, and structure verification conducted by certified master technicians.", iconColor: "text-[#D4AF37]", titleColor: "text-[#D4AF37]", borderColor: "group-hover:border-[#D4AF37]" },
               { icon: Award, title: "Verified Lineage", desc: "Comprehensive background screening guaranteeing non-accidental status, genuine mileage, and clean legal titles.", iconColor: "text-[#D4AF37]", titleColor: "text-[#D4AF37]", borderColor: "group-hover:border-[#D4AF37]" },
               { icon: FileText, title: "Pristine Transfer", desc: "Complete oversight and physical management of all ownership paperwork, RTO clearances, and transfers.", iconColor: "text-[#D4AF37]", titleColor: "text-[#D4AF37]", borderColor: "group-hover:border-[#D4AF37]" }
             ].map((feature, i) => (
               <div key={i} className="group relative rounded-2xl p-5 sm:p-8 bg-[#0a0a0d]/95 border border-[#D4AF37]/40 hover:border-[#D4AF37] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col items-center text-center h-full">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-zinc-900/90 border border-[#D4AF37]/30 group-hover:border-[#D4AF37]/70 transition-all duration-300 flex items-center justify-center mb-4 sm:mb-6 shadow-inner">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold tracking-widest text-white mb-2 sm:mb-3 uppercase font-serif">{feature.title}</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-light">{feature.desc}</p>
                </div>
             ))}
           </div>
         </div>
       </section>
 
       {/* Testimonials */}
       <section className="py-16 sm:py-24 bg-transparent animate-fade-in relative z-10">
         <div className="container mx-auto max-w-7xl px-4">
           <div className="text-center mb-10 sm:mb-20">
             <span className="text-[#D4AF37] tracking-[0.25em] uppercase text-xs sm:text-sm font-bold mb-2 block font-serif">Valued Feedback</span>
             <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white tracking-tight font-bold">Client Testimonials</h2>
             <div className="w-20 sm:w-24 h-[1px] bg-[#D4AF37]/40 mx-auto mt-3 sm:mt-4"></div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
             {MOCK_REVIEWS.map((review) => (
                <div key={review.id} className="group relative rounded-2xl p-5 sm:p-7 bg-[#0a0a0d]/95 border border-[#D4AF37]/40 hover:border-[#D4AF37] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between h-full">
                  <div>
                    <div className="flex mb-3 sm:mb-4 space-x-1">
                      {[...Array(review.rating)].map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-[#D4AF37]" />
                      ))}
                    </div>
                    <p className="text-zinc-300 italic text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6 flex-grow font-sans">"{review.text}"</p>
                  </div>
                  <div className="border-t border-zinc-800/80 pt-3.5 sm:pt-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-serif font-bold tracking-wider text-xs sm:text-sm uppercase">{review.name}</h3>
                      <p className="text-[9px] sm:text-[10px] text-zinc-500 font-mono tracking-wider">{review.date}</p>
                    </div>
                    <span className="text-[9px] sm:text-[10px] bg-[#D4AF37]/10 text-[#FCF6BA] font-serif font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-[#D4AF37]/30">Verified</span>
                  </div>
                </div>
              ))}
           </div>

           <div className="mt-10 sm:mt-16 flex justify-center">
            <a 
              href="https://share.google/lolTXlsqZR1EaCrGJ" 
              target="_blank" 
              rel="noreferrer"
              className="group flex items-center justify-between gap-4 sm:gap-6 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#080808] border border-[#D4AF37]/50 hover:border-[#FCF6BA] text-[#D4AF37] hover:text-[#FCF6BA] rounded-xl text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase font-serif transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-xl max-w-md w-full sm:w-auto"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-[#D4AF37] group-hover:text-[#FCF6BA] transition-colors" />
                <span>Write or View Google Reviews</span>
              </div>
              <span className="text-xs sm:text-sm font-light transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </a>
          </div>
         </div>
       </section>

      {/* Instagram Reels Showcase Section */}
      {siteConfig.instagramReels && siteConfig.instagramReels.length > 0 && (
        <section className="py-24 bg-transparent relative z-10 border-t border-zinc-900/40">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-16">
              <span className="text-[#D4AF37] tracking-[0.25em] uppercase text-xs font-bold mb-3 block font-serif">Social Showcase</span>
              <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight font-bold">Featured Instagram Highlights</h2>
              <div className="w-24 h-[1px] bg-[#D4AF37]/40 mx-auto mt-4"></div>
              <p className="text-zinc-400 text-xs mt-3 uppercase tracking-wider font-mono">
                Interactive video reels direct from our linked{" "}
                <a 
                  href="https://www.instagram.com/autosquad_cars/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[#D4AF37] underline hover:text-[#FCF6BA] transition-all font-bold"
                >
                  @autosquad_cars
                </a>{" "}
                channel
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center items-stretch">
              {siteConfig.instagramReels.map((url, idx) => {
                const match = url.match(/(?:\/p\/|\/reel\/|\/tv\/)([A-Za-z0-9_-]+)/);
                const reelId = match ? match[1] : null;
                
                if (!reelId) return null;

                return (
                  <div key={idx} className="group relative rounded-2xl p-4 bg-[#0a0a0d]/95 border border-[#D4AF37]/40 hover:border-[#D4AF37] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between h-full">
                    <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-zinc-950/80 shadow-inner">
                      <iframe 
                        src={`https://www.instagram.com/reel/${reelId}/embed`}
                        className="absolute inset-0 w-full h-full border-0 rounded-xl"
                        allowtransparency="true"
                        allow="encrypted-media"
                        scrolling="no"
                      />
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between font-mono text-[9px] text-zinc-400 uppercase tracking-widest px-1">
                      <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5 text-[#D4AF37]" /> Reel #{idx + 1}</span>
                      <a href={url} target="_blank" rel="noreferrer" className="text-[#D4AF37] hover:text-[#FCF6BA] flex items-center gap-1 font-bold font-serif">
                        PLAY ON APP <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-20 flex flex-col justify-center items-center bg-transparent border-t border-zinc-900/40 relative overflow-hidden z-10" id="contact">
        {/* Background elements */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2"></div>
 
        <div className="w-full max-w-4xl flex flex-col justify-center px-8 text-center relative z-10">
          <span className="text-[#D4AF37] tracking-[0.25em] uppercase text-xs font-bold mb-4 block font-serif">Our Showroom</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white font-bold mb-16 tracking-tight">Visit Us In-Person</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="group rounded-2xl border border-[#D4AF37]/45 hover:border-[#D4AF37] bg-[#0a0a0d]/95 p-8 sm:p-10 flex flex-col items-center h-full text-zinc-300 backdrop-blur-md transition-all duration-300 shadow-xl shadow-black/80 hover:-translate-y-1">
              <div className="bg-[#D4AF37]/10 p-4 rounded-xl border border-[#D4AF37]/40 mb-6">
                <MapPin className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="tracking-widest text-xs uppercase text-[#D4AF37] mb-4 font-serif font-bold">Showroom Address</h3>
              <p className="text-zinc-300 text-base leading-relaxed tracking-wide font-light">
                2nd Floor Raheja BMC Parking,<br/>
                Agripada, Near Kalapani Police Choke,<br/>
                Mumbai, Maharashtra 400011
              </p>
              <a 
                href="https://maps.app.goo.gl/D6y6jmfmthu22fyY9" 
                target="_blank" 
                rel="noreferrer" 
                className="mt-8 text-[#D4AF37] hover:text-[#FCF6BA] text-xs tracking-widest uppercase font-serif font-bold border-b border-[#D4AF37]/40 hover:border-[#D4AF37] pb-1 transition-all inline-flex items-center gap-2"
              >
                <span>Get Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            
            <div className="group rounded-2xl border border-[#D4AF37]/45 hover:border-[#D4AF37] bg-[#0a0a0d]/95 p-8 sm:p-10 flex flex-col items-center h-full text-zinc-300 backdrop-blur-md transition-all duration-300 shadow-xl shadow-black/80 hover:-translate-y-1">
              <div className="bg-[#D4AF37]/10 p-4 rounded-xl border border-[#D4AF37]/40 mb-6">
                <Phone className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="tracking-widest text-xs uppercase text-[#D4AF37] mb-4 font-serif font-bold">Contact Us</h3>
              <a href="tel:+919769699655" className="text-zinc-200 text-2xl tracking-wide hover:text-[#FCF6BA] transition-all font-mono font-bold my-auto">+91 97696 99655</a>
              <a 
                href="tel:+919769699655" 
                className="mt-8 text-[#D4AF37] hover:text-[#FCF6BA] text-xs tracking-widest uppercase font-serif font-bold border-b border-[#D4AF37]/40 hover:border-[#D4AF37] pb-1 transition-all"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
