import { useMemo, useState } from "react";
import { Outlet } from "@/types";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Search, X } from "lucide-react";

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
  <span className={`aaravpos-status-badge ${status
    ? "aaravpos-status-open"
    : "aaravpos-status-closed"
    }`}
  >
    {status ? "Open" : "Closed"}
  </span>
);

const OutletCard = ({ item, onSelect, selected }: OutletCardProps) => {
  return (
    <div
      className={`aaravpos-outlet-card
        ${selected ? "selected" : ""}
        ${!item.isOpen ? "closed" : ""}
      `}
      onClick={() => onSelect(String(item?.id))}
    >
      <div className="aaravpos-outlet-card-top">
        <StatusBadge status={item.isOpen} />
      </div>
      <div className="aaravpos-outlet-card-content">
        <div className="aaravpos-outlet-card-inner">
          <h2 className="aaravpos-outlet-card-title">
            {item.outletName}
          </h2>
          <p className="aaravpos-outlet-card-address">
            {item.address}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function ChooseYourOutlet({
  outlets,
  onSelectOutlet,
}: OutletProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const handleSelectOutlet = (id: string) => {
    setSelected(id);
    const selectedOutlet = outlets.find((o) => o.id == id);
    if (selectedOutlet) {
      setTimeout(() => {
        onSelectOutlet(selectedOutlet);
      }, 100);
    }
  };

  const filteredOutlets = useMemo(() => {
    if (!searchTerm.trim()) return outlets;

    const term = searchTerm.toLowerCase();

    return outlets.filter((outlet) => {
      return (
        outlet.outletName?.toLowerCase().includes(term) ||
        outlet.address?.toLowerCase().includes(term)
      );
    });
  }, [outlets, searchTerm]);

  return (
    <div className="arravpos-container">
      <div className="aaravpos-header">
        <div>
          <h1 className="aaravpos-outlet-title">
            Choose Your Outlet
          </h1>
          <div className="aaravpos-outlet-divider" />
        </div>
        <div className="aaravpos-search-wrapper">
          <span className="aaravpos-search-icon">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search outlet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="aaravpos-search-input"
          />
          <div className="aaravpos-search-actions">
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="aaravpos-search-clear"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="aaravpos-outlet-list-wrapper">
        {filteredOutlets.length > 0 ? (
          <div className="aaravpos-outlet-grid">
            <AnimatePresence mode="popLayout">
              {filteredOutlets.map((outlet: Outlet, index: number) => (
                <motion.div
                  key={outlet.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  custom={index}
                  layout="position"
                  style={{ willChange: "transform, opacity" }}
                >
                  <OutletCard
                    item={outlet}
                    onSelect={handleSelectOutlet}
                    selected={selected === outlet.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="aaravpos-empty-state">
            <div className="aaravpos-empty-content">
              <h3 className="aaravpos-empty-title">
                No outlets found
              </h3>
              <p className="aaravpos-empty-text">
                Try searching with a different keyword
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
