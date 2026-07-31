import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock, MessageCircle, Instagram, Twitter, Menu, X, Star, Upload, Image, Check, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { useVehicles, sanitizeHeroImage } from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';
import PhoneModal, { openPhoneModal } from '../components/PhoneModal';

let globalVideoFinished = false;

export default function CustomerLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  const { siteConfig } = useVehicles();
  const { loginAsDealer } = useAuth();
  const isHomePage = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const desktopVideoRef = React.useRef<HTMLVideoElement>(null);
  const mobileVideoRef = React.useRef<HTMLVideoElement>(null);
  const hasPlayedRef = React.useRef(false);
  const [isFading, setIsFading] = React.useState(false);

  const handleVideoEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    globalVideoFinished = true;
    setIsFading(false);
    video.pause();
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (globalVideoFinished && video.duration && !isNaN(video.duration)) {
      video.currentTime = video.duration;
    }
  };

  React.useEffect(() => {
    if (isHomePage) {
      if (globalVideoFinished) {
        if (desktopVideoRef.current && !isNaN(desktopVideoRef.current.duration)) {
          desktopVideoRef.current.pause();
          desktopVideoRef.current.currentTime = desktopVideoRef.current.duration;
        }
        if (mobileVideoRef.current && !isNaN(mobileVideoRef.current.duration)) {
          mobileVideoRef.current.pause();
          mobileVideoRef.current.currentTime = mobileVideoRef.current.duration;
        }
        return;
      }

      if (scrollY > 5) {
        if (!hasPlayedRef.current) {
          hasPlayedRef.current = true;
          desktopVideoRef.current?.play().catch(() => {});
          mobileVideoRef.current?.play().catch(() => {});
        }
      }
    }
  }, [scrollY, isHomePage]);

  // Custom multi-tap tracker for dealer console access on mobile (esp. iPhone Safari)
  const tapCountRef = React.useRef(0);
  const lastTapTimeRef = React.useRef(0);
  const isTouchRef = React.useRef(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const handleSecretLogin = () => {
    setNotification('Redirecting to Dealer Portal login...');
    setTimeout(() => {
      navigate('/dealer-management');
      setNotification('');
    }, 1000);
  };

  const registerTap = () => {
    const now = Date.now();
    const lastTapTime = lastTapTimeRef.current;
    const currentTapCount = tapCountRef.current;

    if (now - lastTapTime < 800) {
      const nextCount = currentTapCount + 1;
      if (nextCount >= 3) {
        handleSecretLogin();
        tapCountRef.current = 0;
      } else {
        tapCountRef.current = nextCount;
      }
    } else {
      tapCountRef.current = 1;
    }
    lastTapTimeRef.current = now;
  };

  const handleCopyrightClick = (e: React.MouseEvent) => {
    if (isTouchRef.current) {
      // Handled by touch event, reset flag and skip click to avoid double registering
      isTouchRef.current = false;
      return;
    }
    registerTap();
  };

  const handleCopyrightTouch = (e: React.TouchEvent) => {
    isTouchRef.current = true;
    registerTap();
  };

  const showVideo = false;
  const showMobileVideo = false;

  return (
    <div className="min-h-screen flex flex-col font-sans text-zinc-300 relative bg-[#02020a]">
      {/* Dynamic secret greeting/bypass notification */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] bg-zinc-900 text-white font-semibold text-xs tracking-widest uppercase font-mono px-8 py-5 rounded-full shadow-2xl border border-zinc-800 flex items-center space-x-3 transition-all animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>{notification}</span>
        </div>
      )}

      {/* Global Fixed Showcase Background - Full clarity with slight dark tint luxury backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {(siteConfig.homeHeroImage || siteConfig.homeHeroMobileImage) && (
          <div className="absolute inset-0 overflow-hidden">
            <picture className="w-full h-full block">
              {siteConfig.homeHeroMobileImage && (
                <source media="(max-width: 767px)" srcSet={siteConfig.homeHeroMobileImage} />
              )}
              <img 
                src={siteConfig.homeHeroImage || siteConfig.homeHeroMobileImage} 
                alt="Showroom Background" 
                className={`w-full h-full object-cover object-center transition-all duration-700 ${
                  isHomePage 
                    ? (isScrolled ? 'opacity-70 brightness-50 blur-md scale-105' : 'opacity-100 brightness-100 blur-none scale-100')
                    : 'opacity-65 brightness-45 blur-md scale-105'
                }`}
              />
            </picture>
            {/* Dark overlay gradient - crystal clear on top, blurred & darkened backdrop when scrolled or on subpages */}
            <div className={`absolute inset-0 transition-all duration-700 ${
              isHomePage 
                ? (isScrolled ? 'bg-gradient-to-b from-[#02020a]/60 via-[#02020a]/75 to-[#02020a]/95' : 'bg-gradient-to-b from-black/20 via-transparent to-[#02020a]/30')
                : 'bg-gradient-to-b from-[#02020a]/65 via-[#02020a]/80 to-[#02020a]/95'
            }`} />
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col flex-grow min-h-screen">
        {/* Main Navbar - Dark Tint Translucent Header Bar */}
        <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/85 backdrop-blur-md border-zinc-800/80 shadow-2xl' 
            : 'bg-black/75 backdrop-blur-md border-white/10 shadow-lg'
        }`}>
          <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 flex justify-between items-center">
            
            {/* Left Side: Branding Text (Slightly smaller with dark tint) */}
            <Link to="/" className="flex items-center shrink-0 select-none mr-2 sm:mr-4 group">
              <div className="flex flex-col items-start leading-none">
                <span className="text-base sm:text-lg md:text-xl font-black italic tracking-wider uppercase font-sans">
                  <span className="text-zinc-300 group-hover:text-white transition-colors">AUTO</span>
                  <span className="text-[#b88c3e] group-hover:text-[#d2a353] transition-colors">SQUAD</span>
                </span>
                <span className="text-[7px] sm:text-[8px] font-extrabold uppercase tracking-[0.25em] text-zinc-400/90 font-sans mt-0.5">PRE OWNED CARS</span>
              </div>
            </Link>

            {/* Desktop Header Group: Phone | Socials | Location | Nav Items */}
            <div className="hidden md:flex items-center space-x-3.5 lg:space-x-5 xl:space-x-7 text-xs sm:text-sm lg:text-base font-sans">
              
              {/* Contact & Location Badges */}
              <div className="flex items-center">
                {/* Phone + Numbers */}
                <div className="flex items-center space-x-1.5 text-white">
                  <Phone 
                    onClick={openPhoneModal} 
                    className="w-4 h-4 lg:w-4.5 lg:h-4.5 text-[#d2a353] stroke-[1.8] shrink-0 cursor-pointer hover:scale-110 transition-transform" 
                    title="Select Contact Number"
                  />
                  <div className="flex items-center space-x-1.5 font-medium tracking-[0.08em] text-xs lg:text-sm whitespace-nowrap">
                    <a href="tel:+919769699655" className="hover:text-[#d2a353] transition-colors duration-200">+91 97696 99655</a>
                    <span className="text-zinc-500">/</span>
                    <a href="tel:+919821674631" className="hover:text-[#d2a353] transition-colors duration-200">+91 98216 74631</a>
                  </div>
                </div>

                {/* Vertical Line Separator with Balanced Margins */}
                <div className="h-4 w-[1px] bg-zinc-600/70 shrink-0 mx-3.5 sm:mx-4 lg:mx-5" />

                {/* Socials & Location */}
                <div className="flex items-center space-x-3.5 lg:space-x-4.5">
                  {/* Instagram Icon */}
                  <a 
                    href="https://www.instagram.com/autosquad_cars/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-zinc-300 hover:text-white transition-colors duration-200 shrink-0 p-1"
                    title="Instagram @autosquad_cars"
                  >
                    <Instagram className="w-4 h-4 lg:w-4.5 lg:h-4.5 stroke-[1.8]" />
                  </a>

                  {/* WhatsApp / Chat Icon */}
                  <a 
                    href="https://wa.me/919769699655" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-zinc-300 hover:text-white transition-colors duration-200 shrink-0 p-1"
                    title="WhatsApp Assistant"
                  >
                    <MessageCircle className="w-4 h-4 lg:w-4.5 lg:h-4.5 stroke-[1.8]" />
                  </a>

                  {/* Map Pin + MUMBAI */}
                  <a 
                    href="https://maps.app.goo.gl/D6y6jmfmthu22fyY9" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center space-x-1.5 text-zinc-300 hover:text-white transition-colors duration-200 pl-1"
                  >
                    <MapPin className="w-4 h-4 lg:w-4.5 lg:h-4.5 text-[#d2a353] stroke-[1.8] shrink-0" />
                    <span className="font-medium tracking-[0.16em] uppercase text-zinc-300 text-[11px] lg:text-xs whitespace-nowrap">
                      MUMBAI
                    </span>
                  </a>
                </div>
              </div>

              {/* Navigation Items (Title Case, Golden active tab, Crisp white hover tabs) */}
              <div className="flex items-center space-x-4 lg:space-x-6 xl:space-x-8 text-xs sm:text-sm lg:text-base font-semibold font-sans pl-2 lg:pl-4">
                <Link to="/" className={`transition-all duration-200 whitespace-nowrap ${
                  location.pathname === '/' 
                    ? 'text-[#d2a353] font-bold' 
                    : 'text-white hover:text-[#d2a353]'
                }`}>Home</Link>

                <Link to="/inventory" className={`transition-all duration-200 whitespace-nowrap ${
                  location.pathname.startsWith('/inventory') 
                    ? 'text-[#d2a353] font-bold' 
                    : 'text-white hover:text-[#d2a353]'
                }`}>Showroom</Link>

                <Link to="/sell" className={`transition-all duration-200 whitespace-nowrap ${
                  location.pathname === '/sell' 
                    ? 'text-[#d2a353] font-bold' 
                    : 'text-white hover:text-[#d2a353]'
                }`}>Sell Your Car</Link>

                <Link to="/about" className={`transition-all duration-200 whitespace-nowrap ${
                  location.pathname === '/about' 
                    ? 'text-[#d2a353] font-bold' 
                    : 'text-white hover:text-[#d2a353]'
                }`}>About</Link>

                <a href="#contact" className="text-white hover:text-[#d2a353] transition-all duration-200 whitespace-nowrap">
                  Contact
                </a>
              </div>

            </div>

            {/* Mobile Contact Logos & Hamburger Toggle */}
            <div className="flex md:hidden items-center ml-auto">
              {/* Mobile Header Quick Icons */}
              <div className="flex items-center space-x-2.5 sm:space-x-3.5 mr-2 sm:mr-3">
                <button onClick={openPhoneModal} className="p-1 text-[#d2a353] hover:text-white transition-colors" title="Call Us">
                  <Phone className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.8]" />
                </button>
                <a href="https://www.instagram.com/autosquad_cars/" target="_blank" rel="noreferrer" className="p-1 text-zinc-300 hover:text-white transition-colors" title="Instagram">
                  <Instagram className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.8]" />
                </a>
                <a href="https://wa.me/919769699655" target="_blank" rel="noreferrer" className="p-1 text-zinc-300 hover:text-white transition-colors" title="WhatsApp">
                  <MessageCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.8]" />
                </a>
                <a href="https://maps.app.goo.gl/D6y6jmfmthu22fyY9" target="_blank" rel="noreferrer" className="p-1 text-[#d2a353] hover:text-white transition-colors" title="Location">
                  <MapPin className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.8]" />
                </a>
              </div>

              {/* Mobile Menu Toggle */}
              <button className="p-1 transition-colors duration-300 focus:outline-none text-zinc-300 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                {isMenuOpen ? <X className="w-5 h-5 stroke-[1.8]" /> : <Menu className="w-5 h-5 stroke-[1.8]" />}
              </button>
            </div>

          </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-b border-zinc-800/80 px-6 py-6 flex flex-col space-y-5 font-semibold text-sm font-sans shadow-2xl">
            <Link to="/" onClick={closeMenu} className={location.pathname === '/' ? 'text-[#d2a353]' : 'text-white hover:text-[#d2a353]'}>Home</Link>
            <Link to="/inventory" onClick={closeMenu} className={location.pathname.startsWith('/inventory') ? 'text-[#d2a353]' : 'text-white hover:text-[#d2a353]'}>Showroom</Link>
            <Link to="/sell" onClick={closeMenu} className={location.pathname === '/sell' ? 'text-[#d2a353]' : 'text-white hover:text-[#d2a353]'}>Sell Your Car</Link>
            <Link to="/about" onClick={closeMenu} className={location.pathname === '/about' ? 'text-[#d2a353]' : 'text-white hover:text-[#d2a353]'}>About</Link>
            <a href="#contact" onClick={closeMenu} className="text-white hover:text-[#d2a353]">Contact</a>

            <div className="pt-4 border-t border-zinc-700/60 flex flex-wrap items-center gap-4 text-xs font-sans">
              <div className="flex flex-col space-y-1 text-white">
                <a href="tel:+919769699655" className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-[#d2a353]" />
                  <span className="tracking-[0.08em]">+91 97696 99655</span>
                </a>
                <a href="tel:+919821674631" className="flex items-center space-x-2 pl-6">
                  <span className="tracking-[0.08em]">+91 98216 74631</span>
                </a>
              </div>
              <a href="https://www.instagram.com/autosquad_cars/" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 text-zinc-300 hover:text-white">
                <Instagram className="w-4 h-4 text-zinc-300" />
                <span>Instagram</span>
              </a>
              <a href="https://wa.me/919769699655" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 text-zinc-300 hover:text-white">
                <MessageCircle className="w-4 h-4 text-zinc-300" />
                <span>WhatsApp</span>
              </a>
              <a href="https://maps.app.goo.gl/D6y6jmfmthu22fyY9" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 text-zinc-300">
                <MapPin className="w-4 h-4 text-[#d2a353]" />
                <span className="font-semibold tracking-wider">MUMBAI</span>
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-gradient-to-b from-[#02020a]/30 via-[#02020a]/60 to-[#02020a]/80 backdrop-blur-md border-t border-[rgba(200,166,74,0.25)] text-zinc-400 pt-24 pb-12 px-4 mt-20 relative overflow-hidden">
        {/* Ambient Subtle background monochrome pulse */}
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#C8A64A]/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10 text-zinc-300">
          <div className="space-y-6 md:col-span-1">
            <div className="flex items-center inline-flex mb-4">
              <img 
                src={siteConfig.logo} 
                alt="AutoSquad" 
                className="h-10 w-auto object-contain mr-3 max-w-[150px]" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden flex-col items-start nv-logo-text">
                <h1 className="text-lg font-orbitron tracking-[0.18em] leading-none font-black uppercase text-white">
                  AUTOSQUAD
                </h1>
                <p className="text-[8px] uppercase tracking-[0.5em] text-[#C8A64A] font-mono mt-1 font-bold">EST. 2019</p>
              </div>
            </div>
            <p className="text-sm tracking-wide leading-relaxed text-zinc-400 font-light">
              Quality Vehicles. Honest Deals. Complete Peace Of Mind.<br/>
              AutoSquad is a premium pre-owned car dealership dedicated to delivering quality vehicles, transparent pricing and a hassle-free buying experience. Every vehicle is carefully inspected and selected to ensure complete customer confidence.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-white font-serif tracking-wider text-xs font-semibold uppercase border-b border-zinc-900 pb-2">Quick Links</h3>
            <ul className="space-y-3.5 text-xs tracking-widest uppercase font-semibold font-mono text-zinc-400">
              <li><Link to="/inventory" className="hover:text-[#C8A64A] transition-colors duration-300">Browse Collection</Link></li>
              <li><Link to="/sell" className="hover:text-[#C8A64A] transition-colors duration-300">Sell Your Car</Link></li>
              <li><Link to="/about" className="hover:text-[#C8A64A] transition-colors duration-300">About Us</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-white font-serif tracking-wider text-xs font-semibold uppercase border-b border-zinc-900 pb-2">Support Info</h3>
            <ul className="space-y-4 text-sm tracking-wide text-zinc-400 font-light">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-[#C8A64A] mr-3 shrink-0 mt-1" />
                <a href="https://maps.app.goo.gl/D6y6jmfmthu22fyY9" target="_blank" rel="noreferrer" className="hover:text-[#D4AF37] transition-colors duration-300 leading-relaxed font-light text-zinc-400">
                  3rd Floor Raheja BMC Parking, Agripada, Near Kalapani Police Chokwi
                </a>
              </li>
              <li className="flex items-start">
                <Phone className="w-5 h-5 text-[#C8A64A] mr-3 shrink-0 mt-0.5" />
                <div className="flex flex-col space-y-1 font-mono">
                  <a href="tel:+919769699655" className="hover:text-[#C8A64A] transition-colors duration-300">+91 97696 99655</a>
                  <a href="tel:+919821674631" className="hover:text-[#C8A64A] transition-colors duration-300">+91 98216 74631</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl mt-20 pt-8 border-t border-[rgba(200,166,74,0.15)] text-[10px] tracking-widest uppercase text-zinc-500 flex flex-col md:flex-row justify-between items-center font-mono font-semibold">
          <p 
            onClick={handleCopyrightClick}
            onTouchStart={handleCopyrightTouch}
            role="button"
            tabIndex={0}
            className="select-none text-zinc-500 cursor-pointer touch-manipulation hover:text-[#C8A64A] outline-none active:text-[#C8A64A] transition-colors"
          >
            &copy; 2026 AutoSquad. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-zinc-500">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white flex items-center">Terms</a>
          </div>
        </div>
      </footer>
      <PhoneModal />
      </div>
    </div>
  );
}
