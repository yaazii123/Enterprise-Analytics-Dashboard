import { useEffect, useRef, useState } from "react";
import { Search, ArrowUpRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store";
import { canAccess, type AppRouteKey } from "@/utils/permissions";
import { metricDefinitions } from "@/services/analytics";

const charts: Record<string, string[]> = {
  overview: [
    "Revenue overview",
    "Revenue by category",
    "User growth",
    "Monthly sales performance",
    "Geographic performance",
    "Traffic sources",
    "Orders by day",
    "Order status distribution",
  ],
  revenue: [
    "Recognized revenue over time",
    "Revenue by category",
    "Order value by status",
    "Regional revenue",
    "Revenue by product",
    "Average order value over time",
  ],
  products: [
    "Revenue by product",
    "Product revenue mix",
    "Units sold by product",
    "Category revenue",
    "Product scorecard",
    "Product refund rates",
    "Product demand by day",
  ],
  customers: [
    "New customer acquisition",
    "New vs. returning customers",
    "Customers by region",
    "Purchase frequency",
    "Customer value distribution",
    "Daily active customers",
    "Customer directory",
  ],
  orders: ["Orders by day", "Order status distribution", "All orders"],
};
const customerMetrics = [
  "Customers in period",
  "New customers",
  "Returning customers",
  "Orders per customer",
  "Revenue per customer",
  "Returning customer rate",
];
const catalog = Object.entries(charts).flatMap(([page, names]) => [
  ...names.map((label) => ({ page, label, kind: "Chart / table" })),
  ...(page === "customers"
    ? customerMetrics
    : metricDefinitions(page).labels
  ).map((label) => ({ page, label, kind: "Metric" })),
]);

export function MetricSearch() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const user = useAppSelector((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const matches = catalog
    .filter(
      (item) =>
        canAccess(user?.role, item.page as AppRouteKey) &&
        item.label.toLowerCase().includes(search.toLowerCase().trim()),
    )
    .slice(0, 12);
  useEffect(() => {
    if (!location.hash) return;
    let label: string;
    try {
      label = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const focus = () => {
      const target = [...document.querySelectorAll("main h2, main .kpi-label")]
        .find((el) => el.textContent?.trim() === label)
        ?.closest<HTMLElement>(".panel");
      if (!target) return false;
      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "center",
      });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      return true;
    };
    if (focus()) return;
    const observer = new MutationObserver(() => {
      if (focus()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timeout = window.setTimeout(() => observer.disconnect(), 10000);
    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, [location.pathname, location.hash, location.key]);
  function choose(index: number) {
    const item = matches[index];
    if (!item) return;
    navigate(`/${item.page}#${encodeURIComponent(item.label)}`);
    setSearch("");
    setOpen(false);
  }
  return (
    <div
      ref={container}
      className="global-search metric-search"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <Search size={16} />
      <input
        placeholder="Search charts or metrics"
        aria-label="Search charts or metrics"
        role="combobox"
        aria-expanded={open && !!search.trim()}
        aria-controls="metric-search-results"
        aria-activedescendant={
          open && search.trim() && matches[active]
            ? `metric-result-${active}`
            : undefined
        }
        autoComplete="off"
        value={search}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setSearch(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, matches.length - 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          }
          if (e.key === "Enter") {
            e.preventDefault();
            choose(active);
          }
        }}
      />
      {open && search.trim() && (
        <div
          className="search-results"
          id="metric-search-results"
          role="listbox"
          aria-label="Matching charts and metrics"
        >
          {matches.map((item, i) => (
            <button
              id={`metric-result-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? "search-active" : ""}
              key={`${item.page}-${item.label}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(i)}
            >
              <span>
                {item.label}
                <small>
                  {item.page} · {item.kind}
                </small>
              </span>
              <ArrowUpRight size={14} />
            </button>
          ))}
          {!matches.length && <p>No matching charts or metrics.</p>}
        </div>
      )}
    </div>
  );
}
