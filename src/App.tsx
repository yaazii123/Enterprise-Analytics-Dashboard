import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  ChartNoAxesCombined,
  Users,
  Package,
  ShoppingCart,
  FileChartColumn,
  Settings,
  ChevronDown,
  PanelLeftClose,
  Sun,
  Moon,
  LogOut,
  ArrowUpRight,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { store, actions, useAppDispatch, useAppSelector } from "@/store";
import { CATEGORIES, REGIONS, type DatePreset } from "@/types";
import { canAccess, can, type AppRouteKey } from "@/utils/permissions";
import { presetToRange, formatRange } from "@/utils/date";
import { useAnalytics } from "@/services/analytics";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { CustomersPage } from "@/pages/CustomersPage";
import { exportRows } from "@/utils/export";
import { Login } from "@/pages/Login";
import { Brand } from "@/components/brand/Brand";
import { MetricSearch } from "@/components/search/MetricSearch";
import { ExportMenu } from "@/components/exports/ExportMenu";
const client = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });
const nav = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "revenue", label: "Revenue analytics", icon: ChartNoAxesCombined },
  { key: "customers", label: "Customer analytics", icon: Users },
  { key: "products", label: "Product performance", icon: Package },
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "reports", label: "Reports", icon: FileChartColumn },
  { key: "settings", label: "Settings", icon: Settings },
] as const;
function Filters() {
  const filters = useAppSelector((s) => s.filters),
    dispatch = useAppDispatch();
  return (
    <div className="filters">
      <label>
        <span className="sr-only">Date range</span>
        <select
          value={filters.preset}
          onChange={(e) => {
            const preset = e.target.value as DatePreset;
            dispatch(
              actions.filters({
                preset,
                ...(preset !== "custom"
                  ? { range: presetToRange(preset) }
                  : {}),
              }),
            );
          }}
        >
          <option value="today">Today</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="custom">Custom date range</option>
        </select>
      </label>
      {filters.preset === "custom" && (
        <>
          <input
            aria-label="Start date"
            type="date"
            max={filters.range.to}
            value={filters.range.from}
            onChange={(e) => {
              if (e.target.value && e.target.value <= filters.range.to)
                dispatch(
                  actions.filters({
                    range: { ...filters.range, from: e.target.value },
                  }),
                );
            }}
          />
          <input
            aria-label="End date"
            type="date"
            min={filters.range.from}
            value={filters.range.to}
            onChange={(e) => {
              if (e.target.value >= filters.range.from)
                dispatch(
                  actions.filters({
                    range: { ...filters.range, to: e.target.value },
                  }),
                );
            }}
          />
        </>
      )}
      <details>
        <summary>
          <SlidersHorizontal size={14} />
          {filters.regions.length
            ? `${filters.regions.length} regions`
            : "All regions"}
          <ChevronDown size={13} />
        </summary>
        <div className="popover">
          {REGIONS.map((r) => (
            <label key={r}>
              <input
                type="checkbox"
                checked={filters.regions.includes(r)}
                onChange={() =>
                  dispatch(
                    actions.filters({
                      regions: filters.regions.includes(r)
                        ? filters.regions.filter((v) => v !== r)
                        : [...filters.regions, r],
                    }),
                  )
                }
              />
              {r}
            </label>
          ))}
        </div>
      </details>
      <details>
        <summary>
          {filters.categories.length
            ? `${filters.categories.length} categories`
            : "All categories"}
          <ChevronDown size={13} />
        </summary>
        <div className="popover">
          {CATEGORIES.map((c) => (
            <label key={c}>
              <input
                type="checkbox"
                checked={filters.categories.includes(c)}
                onChange={() =>
                  dispatch(
                    actions.filters({
                      categories: filters.categories.includes(c)
                        ? filters.categories.filter((v) => v !== c)
                        : [...filters.categories, c],
                    }),
                  )
                }
              />
              {c}
            </label>
          ))}
        </div>
      </details>
      <button
        className="text-button"
        onClick={() =>
          dispatch(
            actions.filters({
              preset: "30d",
              range: presetToRange("30d"),
              regions: [],
              categories: [],
            }),
          )
        }
      >
        Reset filters
      </button>
      <span className="filter-date">{formatRange(filters.range)}</span>
    </div>
  );
}
function SettingsPage() {
  const { user, compact, theme } = useAppSelector((s) => s),
    dispatch = useAppDispatch();
  const [name, setName] = useState(user!.name),
    [title, setTitle] = useState(user!.title),
    [message, setMessage] = useState("");
  return (
    <div className="report-grid">
      <form
        className="panel form-panel"
        onSubmit={(e) => {
          e.preventDefault();
          dispatch(
            actions.login({ ...user!, name: name.trim(), title: title.trim() }),
          );
          setMessage("Profile saved successfully.");
        }}
      >
        <h2>Profile details</h2>
        <p>Manage how you appear in your workspace.</p>
        <label>
          Full name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Job title
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Email
          <input value={user!.email} readOnly />
        </label>
        <p>
          Workspace role: <b>{user!.role}</b>
        </p>
        <button className="primary" disabled={!name.trim()}>
          Save changes
        </button>
        <span role="status" className="positive">
          {message}
        </span>
      </form>
      <section className="panel form-panel">
        <h2>Workspace preferences</h2>
        <p>Your preferences are saved on this device.</p>
        <label>
          Appearance
          <select
            value={theme}
            onChange={(e) => dispatch(actions.theme(e.target.value))}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={compact}
            onChange={(e) => dispatch(actions.compact(e.target.checked))}
          />
          Compact table density
        </label>
        {can(user?.role, "settings:dashboard") && (
          <div className="callout">
            Dashboard configuration is available through the global date,
            region, and category controls.
          </div>
        )}
        {can(user?.role, "settings:team") && (
          <div className="callout">
            Admin workspace · Switch roles by signing out and choosing a demo
            role at sign-in.
          </div>
        )}
      </section>
    </div>
  );
}
function Workspace() {
  const { user, theme, collapsed, compact } = useAppSelector((s) => s),
    dispatch = useAppDispatch(),
    location = useLocation(),
    navigate = useNavigate(),
    queryClient = useQueryClient();
  const query = useAnalytics();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  if (!user) return <Navigate to="/login" replace />;
  const page = location.pathname.split("/")[1] || "overview";
  const current = nav.find((n) => n.key === page);
  const allowed = current && canAccess(user.role, current.key as AppRouteKey);
  return (
    <div
      className={`workspace ${collapsed ? "collapsed" : ""} ${compact ? "compact" : ""}`}
    >
      <aside className="sidebar">
        <NavLink to="/overview" className="brand">
          <Brand compact />
        </NavLink>
        <span className="nav-label nav-text">WORKSPACE</span>
        <nav>
          {nav
            .filter((n) => canAccess(user.role, n.key))
            .map((n) => (
              <NavLink
                key={n.key}
                to={`/${n.key}`}
                aria-label={n.label}
                title={n.label}
                onClick={() => {
                  void queryClient.invalidateQueries({
                    queryKey: ["analytics", n.key],
                  });
                }}
              >
                <n.icon size={18} />
                <span className="nav-text">{n.label}</span>
              </NavLink>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card nav-text">
            <span className="eyebrow">A LITTLE MORE CLARITY</span>
            <h3>Insights worth sharing.</h3>
            <p>Take your data beyond the dashboard.</p>
            <button
              onClick={() =>
                canAccess(user.role, "reports")
                  ? navigate("/reports")
                  : query.data && exportRows(query.data.rows)
              }
            >
              Explore exports <ArrowUpRight size={14} />
            </button>
          </div>
          <button
            className="sidebar-profile"
            onClick={() => navigate("/settings")}
          >
            <span className="avatar">{user.avatarInitials}</span>
            <span className="nav-text">
              <strong>{user.name}</strong>
              <small>{user.role} workspace</small>
            </span>
            <Settings size={15} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button"
              aria-label="Toggle sidebar"
              aria-expanded={!collapsed}
              onClick={() => dispatch(actions.sidebar())}
            >
              <PanelLeftClose size={18} />
            </button>
            <span>Nexora Analytics</span>
            <span>/</span>
            <strong>{current?.label || "Page not found"}</strong>
          </div>
          <div className="header-tools">
            <MetricSearch />
            <button
              className="icon-button"
              aria-label="Toggle theme"
              onClick={() =>
                dispatch(actions.theme(theme === "dark" ? "light" : "dark"))
              }
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <details>
              <summary className="profile-summary">
                <span className="avatar">{user.avatarInitials}</span>
                <ChevronDown size={13} />
              </summary>
              <div className="popover">
                <strong>{user.name}</strong>
                <small>{user.email}</small>
                <button onClick={(e) => { e.currentTarget.closest("details")?.removeAttribute("open"); navigate("/settings"); }}>
                  <Settings size={14} />
                  Profile & preferences
                </button>
                <button
                  onClick={() => {
                    dispatch(actions.logout());
                    queryClient.clear();
                  }}
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </details>
          </div>
        </header>
        <main key={page} tabIndex={0} aria-label="Dashboard content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">YOUR BUSINESS, AT A GLANCE</span>
              <h1>
                {page === "overview"
                  ? "Analytics overview"
                  : current?.label || "Page not found"}
                <span className="heading-dot">.</span>
              </h1>
              <p>
                {page === "overview"
                  ? "A clear view of your performance. Every metric, one place."
                  : "Explore the details. Find your next opportunity."}
              </p>
            </div>
            <div className="page-actions">
              <button
                aria-label="Refresh analytics"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["analytics"] })
                }
              >
                <RefreshCw size={15} />
                Refresh
              </button>
              <ExportMenu disabled={!query.data} onCsv={() => query.data && exportRows(query.data.rows, "nexora-analytics")} />
            </div>
          </div>
          {allowed ? (
            <>
              {page !== "settings" && <Filters />}
              <div className="section-line">
                <span>
                  <span className="status-dot" />
                  {page === "settings"
                    ? "WORKSPACE SETTINGS"
                    : "PERFORMANCE SNAPSHOT"}
                </span>
                <small>Demo data · USD</small>
              </div>
              {page === "settings" ? (
                <SettingsPage />
              ) : page === "customers" ? (
                <CustomersPage />
              ) : (
                <AnalyticsPage page={page} />
              )}
            </>
          ) : (
            <div className="panel empty">
              <h2>{current ? "Access restricted" : "Page not found"}</h2>
              <p>
                {current
                  ? "Your current role cannot access this page."
                  : "This page does not exist."}
              </p>
              <NavLink to="/overview">Return to overview</NavLink>
            </div>
          )}
          <footer>
            <span>
              © {new Date().getFullYear()} Nexora Analytics · Your data. Your
              direction.
            </span>
            <span>
              <span className="status-dot" /> All systems operational · Mock API
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
export default function App() {
  useEffect(() => {
    const applyTheme = () =>
      document.documentElement.classList.toggle(
        "dark",
        store.getState().theme === "dark",
      );
    applyTheme();
    return store.subscribe(applyTheme);
  }, []);
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={client}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/*" element={<Workspace />} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}
