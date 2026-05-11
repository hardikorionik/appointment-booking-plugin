import { useState } from "react";
import { Outlet } from "@/types";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface OutletProps {
  outlets: Outlet[];
  onSelectOutlet: (outlet: Outlet) => void;
}

interface OutletCardProps {
  item: Outlet;
  onSelect: (id: string) => void;
  selected: boolean;
}

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    transform: "translateY(14px)",
  },
  visible: (index: number) => ({
    opacity: 1,
    transform: "translateY(0px)",
    transition: {
      delay: index * 0.05,
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  exit: {
    opacity: 0,
    transform: "translateY(8px)",
    transition: { duration: 0.2 },
  },
};

const StatusBadge = ({ status }: { status: boolean }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-sm border ${status ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-400 border-red-200"}`}
  >
    {status ? "Open" : "Closed"}
  </span>
);

const OutletCard = ({ item, onSelect, selected }: OutletCardProps) => {
  return (
    <div
      className={`group cursor-pointer overflow-hidden relative flex flex-col justify-between bg-white rounded-sm border transition-all duration-300 
            ${selected ? "border-black shadow-lg ring-1 ring-black" : !item.isOpen ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-400 hover:shadow-md"}`}
      onClick={() => onSelect(item.id)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-5">
          <StatusBadge status={item.isOpen} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 line-clamp-1">
            {item.outletName}
          </h2>
          <p className="text-sm text-neutral-500 mt-1 break-all line-clamp-2 min-h-10">
            {item.address}
          </p>
        </div>
        <button
          className={`mt-5 cursor-pointer w-full py-3 text-[11px] font-bold uppercase tracking-[0.2em] border transition-all duration-200 ${selected ? "bg-btn-bg text-btn-text border-btn-bg" : "bg-white text-btn-bg-hover border-btn-bg-hover group-hover:bg-btn-bg-hover group-hover:text-btn-text"}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item.id);
          }}
        >
          {selected ? "✓ Selected" : "Select Outlet"}
        </button>
      </div>
    </div>
  );
};

export default function ChooseYourOutlet({
  outlets,
  onSelectOutlet,
}: OutletProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelectOutlet = (id: string) => {
    setSelected(id);
    const selectedOutlet = outlets.find((o) => o.id === id);
    if (selectedOutlet) {
      onSelectOutlet(selectedOutlet);
    }
  };
  return (
    <div className="min-h-screen bg-[#f3f1ee] px-4 py-10 sm:px-8 lg:px-16">
      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-gray-900 mb-3">
          Choose Your Outlet
        </h1>
        <div className="w-14 h-0.75 bg-red-600" />
      </div>
      <div className="py-2 max-h-[80vh] overflow-auto scrollbar-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {outlets?.map((outlet: Outlet, index: number) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={index}
                layout="position"
                style={{ willChange: "transform, opacity" }}
              >
                <OutletCard
                  key={index}
                  item={outlet}
                  onSelect={handleSelectOutlet}
                  selected={selected === outlet.id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
