import React, { useEffect, useState } from 'react';
import { Phone, MessageCircle, X, ExternalLink } from 'lucide-react';

interface PhoneModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function openPhoneModal() {
  window.dispatchEvent(new Event('open_phone_modal'));
}

export default function PhoneModal({ isOpen: externalIsOpen, onClose: externalOnClose }: PhoneModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setInternalIsOpen(true);
    window.addEventListener('open_phone_modal', handleOpen);
    return () => window.removeEventListener('open_phone_modal', handleOpen);
  }, []);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    }
    setInternalIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md bg-[#0a0a0d] border border-[#D4AF37]/50 rounded-2xl shadow-2xl p-6 sm:p-8 text-white font-sans overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#D4AF37]/15 blur-2xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold uppercase tracking-widest text-white">
            Choose Contact Number
          </h3>
          <p className="text-zinc-400 text-xs font-light mt-1">
            Connect directly with AutoSquad Mumbai showroom desk
          </p>
        </div>

        {/* Options List */}
        <div className="space-y-4 relative z-10 font-mono">
          {/* Number 1 */}
          <div className="bg-zinc-900/80 border border-zinc-800 hover:border-[#D4AF37]/50 rounded-xl p-4 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs uppercase text-[#D4AF37] font-semibold tracking-wider block font-sans">Primary Sales Line</span>
                <span className="text-base sm:text-lg font-bold text-white tracking-wider">+91 97696 99655</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 font-sans">
              <a
                href="tel:+919769699655"
                onClick={handleClose}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#D4AF37] hover:bg-[#FCF6BA] text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
              <a
                href="https://wa.me/919769699655"
                target="_blank"
                rel="noreferrer"
                onClick={handleClose}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Number 2 */}
          <div className="bg-zinc-900/80 border border-zinc-800 hover:border-[#D4AF37]/50 rounded-xl p-4 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs uppercase text-[#D4AF37] font-semibold tracking-wider block font-sans">Direct Showroom Desk</span>
                <span className="text-base sm:text-lg font-bold text-white tracking-wider">+91 98216 74631</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 font-sans">
              <a
                href="tel:+919821674631"
                onClick={handleClose}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#D4AF37] hover:bg-[#FCF6BA] text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
              <a
                href="https://wa.me/919821674631"
                target="_blank"
                rel="noreferrer"
                onClick={handleClose}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center text-[11px] text-zinc-500 font-sans">
          3rd Floor Raheja BMC Parking, Agripada, Near Kalapani Police Chokwi, Mumbai
        </div>
      </div>
    </div>
  );
}
