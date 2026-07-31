import { CarFront, Settings, ChevronRight, Plus, RefreshCw } from 'lucide-react';
import { useVehicles } from '../../context/VehicleContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { vehicles, migrateLocalStorage } = useVehicles();
  const activeCars = vehicles.filter(v => v.status === 'Available').length;
  const soldCars = vehicles.filter(v => v.status === 'Sold').length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2 animate-fadeIn">
      {/* Title & Subtitle Section */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-extrabold text-white tracking-wider uppercase leading-none">
          DEALER DASHBOARD
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm font-mono uppercase tracking-wider">
          SHOWROOM OVERVIEW & QUICK MANAGEMENT CONTROLS.
        </p>
      </div>

      {/* Prominent Add New Vehicle Button */}
      <div className="pt-2">
        <Link 
          to="/dealer-management/inventory/add" 
          className="w-full bg-white hover:bg-zinc-100 text-zinc-950 font-bold tracking-widest text-sm uppercase py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl hover:shadow-2xl transition-all duration-300 transform active:scale-[0.99] font-mono"
        >
          <Plus className="w-5 h-5 text-zinc-950 stroke-[3]" />
          <span>ADD NEW VEHICLE</span>
        </Link>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 my-4" />

      {/* Navigation Cards Stack */}
      <div className="space-y-3.5">
        {/* Manage Inventory Card */}
        <Link 
          to="/dealer-management/inventory"
          className="group bg-zinc-950/80 hover:bg-zinc-900/90 border border-white/10 hover:border-white/20 rounded-2xl p-4 sm:p-5 flex items-center justify-between transition-all duration-300 shadow-md hover:shadow-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-200 group-hover:text-white group-hover:bg-zinc-800 transition-colors shrink-0">
              <CarFront className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight group-hover:text-amber-200 transition-colors">
                Manage Inventory
              </h2>
              <p className="text-xs text-zinc-400 font-mono tracking-wide mt-0.5">
                {vehicles.length} Total Vehicles
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>

        {/* Site Settings Card */}
        <Link 
          to="/dealer-management/settings"
          className="group bg-zinc-950/80 hover:bg-zinc-900/90 border border-white/10 hover:border-white/20 rounded-2xl p-4 sm:p-5 flex items-center justify-between transition-all duration-300 shadow-md hover:shadow-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-200 group-hover:text-white group-hover:bg-zinc-800 transition-colors shrink-0">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight group-hover:text-amber-200 transition-colors">
                Site Settings
              </h2>
              <p className="text-xs text-zinc-400 font-mono tracking-wide mt-0.5">
                Showroom & Hero Config
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Stats Summary Cards */}
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Active Inventory Stat */}
        <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              ACTIVE INVENTORY
            </p>
            <p className="text-3xl font-serif font-extrabold text-white">
              {activeCars}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CarFront className="w-6 h-6" />
          </div>
        </div>

        {/* Vehicles Sold Stat */}
        <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              VEHICLES SOLD
            </p>
            <p className="text-3xl font-serif font-extrabold text-white">
              {soldCars}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
            <CarFront className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Auxiliary Recovery Action */}
      <div className="pt-2">
        <button 
          onClick={async () => {
            const updated = await migrateLocalStorage();
            if (updated) {
              alert('Successfully recovered your previously saved vehicle listings!');
            } else {
              alert('All listings are up-to-date with your database.');
            }
          }}
          className="w-full py-3 px-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-white/5 hover:border-white/15 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recover Local Data Cache</span>
        </button>
      </div>
    </div>
  );
}