import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import {
  Activity,
  Download,
  FolderKanban,
  Layers3,
  LogOut,
  MoonStar,
  Package,
  ShoppingCart,
  SunMedium,
  Tag,
  Users,
} from 'lucide-react'
import './App.css'
import { loginWithEmailPassword, loginWithOAuth } from './lib/auth'
import type { CategoryItem, CollectionItem, OrderItem, ProductItem, SessionUser } from './types'

const STORAGE_KEY = 'snug-rebel-admin-session'
const THEME_KEY = 'snug-rebel-admin-theme'

const productSeed: ProductItem[] = [
  { id: 'prd-101', name: 'Oversized Tee', category: 'Streetwear', price: 1299, stock: 42, status: 'Active', sku: 'SR-OT-01', variants: 4 },
  { id: 'prd-102', name: 'Utility Cargo', category: 'Essentials', price: 1899, stock: 11, status: 'Low stock', sku: 'SR-UC-11', variants: 3 },
  { id: 'prd-103', name: 'Lightweight Shell', category: 'Outerwear', price: 2399, stock: 28, status: 'Active', sku: 'SR-LS-09', variants: 5 },
  { id: 'prd-104', name: 'Cotton Crew', category: 'Basics', price: 999, stock: 0, status: 'Draft', sku: 'SR-CC-22', variants: 2 },
]

const categorySeed: CategoryItem[] = [
  { id: 'ctg-1', name: 'Streetwear', slug: 'streetwear', products: 18, status: 'Active' },
  { id: 'ctg-2', name: 'Essentials', slug: 'essentials', products: 24, status: 'Active' },
  { id: 'ctg-3', name: 'Outerwear', slug: 'outerwear', products: 9, status: 'Hidden' },
]

const collectionSeed: CollectionItem[] = [
  { id: 'col-1', name: 'Summer Drop', products: 12, status: 'Live', launch: '2026-10-25' },
  { id: 'col-2', name: 'City Layers', products: 8, status: 'Scheduled', launch: '2026-11-10' },
]

const orderStatusOptions = ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'] as const

const orderSeed: OrderItem[] = [
  {
    id: 'ORD-2401',
    customer: 'Maya Santos',
    total: 3240,
    status: 'Paid',
    date: '2026-10-28',
    channel: 'Web',
    shippingAddress: 'BGC, Taguig, Metro Manila',
    paymentMethod: 'Card',
    items: [
      { name: 'Oversized Tee', qty: 1, price: 1499 },
      { name: 'Utility Cargo', qty: 1, price: 1899 },
      { name: 'Shipping', qty: 1, price: 240 },
    ],
  },
  {
    id: 'ORD-2402',
    customer: 'Liam Cruz',
    total: 1890,
    status: 'Processing',
    date: '2026-10-28',
    channel: 'Marketplace',
    shippingAddress: 'Mandaluyong, Metro Manila',
    paymentMethod: 'GCash',
    items: [
      { name: 'Cotton Crew', qty: 2, price: 999 },
      { name: 'Shipping', qty: 1, price: 150 },
    ],
  },
  {
    id: 'ORD-2403',
    customer: 'Nina Reyes',
    total: 4190,
    status: 'Pending',
    date: '2026-10-27',
    channel: 'Web',
    shippingAddress: 'Davao City, Davao del Sur',
    paymentMethod: 'Maya',
    items: [
      { name: 'Lightweight Shell', qty: 1, price: 2399 },
      { name: 'Utility Cargo', qty: 1, price: 1899 },
    ],
  },
  {
    id: 'ORD-2404',
    customer: 'Evan Lee',
    total: 1330,
    status: 'Shipped',
    date: '2026-10-27',
    channel: 'In-store',
    shippingAddress: 'Cebu Business Park, Cebu',
    paymentMethod: 'Bank transfer',
    items: [
      { name: 'Cotton Crew', qty: 1, price: 999 },
      { name: 'Shipping', qty: 1, price: 331 },
    ],
  },
]

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5146'

const activityFilters = ['All', 'Delivered', 'Pending', 'Processing']

const defaultAnalytics = {
  minimumNumber: 0,
  averageNumber: 0,
  maximumNumber: 0,
  monthLabel: 'This month',
  days: [] as Array<{ date: string; value: number; orders: number; total: number; isCurrentDay: boolean }>,
}

function buildCalendarCells(days: typeof defaultAnalytics.days, monthDate = new Date()) {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const leadingDays = firstOfMonth.getDay()
  const startDate = new Date(firstOfMonth)
  startDate.setDate(firstOfMonth.getDate() - leadingDays)

  const dayMap = new Map(days.map((day) => [day.date, day]))
  const cells: Array<{ date: string; dayNumber: number; inMonth: boolean; entry?: typeof defaultAnalytics.days[number]; isCurrentDay: boolean }> = []

  for (let index = 0; index < 35; index += 1) {
    const cellDate = new Date(startDate)
    cellDate.setDate(startDate.getDate() + index)
    const dateKey = cellDate.toISOString().slice(0, 10)
    const entry = dayMap.get(dateKey)
    cells.push({
      date: dateKey,
      dayNumber: cellDate.getDate(),
      inMonth: cellDate.getMonth() === monthDate.getMonth(),
      entry,
      isCurrentDay: dateKey === new Date().toISOString().slice(0, 10),
    })
  }

  return cells
}

const defaultShipmentTable = [
  { id: 'ORD-2401', category: 'Streetwear', weight: '1,280 g', company: 'Snug Rebel Studio', time: '31 Oct, 2026', route: 'Makati - Cebu', value: '₱5,678.00', status: 'Delivered' },
  { id: 'ORD-2402', category: 'Essentials', weight: '920 g', company: 'Northwind Apparel', time: '29 Oct, 2026', route: 'Quezon City - Davao', value: '₱2,940.00', status: 'Processing' },
  { id: 'ORD-2403', category: 'Outerwear', weight: '1,760 g', company: 'City Layers', time: '27 Oct, 2026', route: 'Pasig - Iloilo', value: '₱8,120.00', status: 'Pending' },
  { id: 'ORD-2404', category: 'Accessories', weight: '640 g', company: 'Drift & Co', time: '26 Oct, 2026', route: 'BGC - Cagayan', value: '₱3,410.00', status: 'Delivered' },
]

const navItems = [
  { to: '/', label: 'Dashboard', icon: Activity },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/collections', label: 'Collections', icon: Layers3 },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/customers', label: 'Customers', icon: Users },
]

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value)
}

function exportCsv(filename: string, rows: Record<string, string | number>[]) {
  if (!rows.length) {
    return
  }

  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          const safeValue = String(value ?? '').replace(/"/g, '""')
          return `"${safeValue}"`
        })
        .join(','),
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem(THEME_KEY)
    return stored === 'dark' ? 'dark' : 'light'
  })
  const [session, setSession] = useState<SessionUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as SessionUser) : null
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [session])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage session={session} onLogin={setSession} theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />}
        />
        <Route element={<ProtectedLayout session={session} onLogout={() => setSession(null)} theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
        </Route>
        <Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function ProtectedLayout({
  session,
  onLogout,
  theme,
  onToggleTheme,
}: {
  session: SessionUser | null
  onLogout: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}) {
  if (!session) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">SR</div>
          <div>
            <p className="eyebrow">Operations</p>
            <h2>Snug Rebel</h2>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <p className="eyebrow">Admin account</p>
          <strong>{session.user.firstName} {session.user.lastName}</strong>
          <small>{session.user.role}</small>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1>Admin control center</h1>
          </div>

          <div className="topbar-actions">
            <button type="button" className="icon-button" onClick={onToggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
            </button>
            <button type="button" className="logout-button" onClick={onLogout}>
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  )
}

function LoginPage({
  session,
  onLogin,
  theme,
  onToggleTheme,
}: {
  session: SessionUser | null
  onLogin: (session: SessionUser) => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@snugrebel.com')
  const [password, setPassword] = useState('snUgr3bel@0902')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true })
    }
  }, [navigate, session])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await loginWithEmailPassword(email, password)
      const nextSession: SessionUser = {
        user: {
          pkUserId: user.pkUserId,
          userEmail: user.userEmail,
          firstName: user.firstName || 'Admin',
          lastName: user.lastName || 'User',
          phoneNumber: user.phoneNumber,
          role: user.role || 'Customer',
          isActive: user.isActive ?? true,
        },
        provider: 'email',
      }
      onLogin(nextSession)
      navigate('/', { replace: true })
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : 'Unable to sign in.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setError('')
    try {
      await loginWithOAuth(provider)
    } catch (oauthError) {
      const message = oauthError instanceof Error ? oauthError.message : 'OAuth is not ready yet.'
      setError(message)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-panel">
        <div className="login-header">
          <div className="brand-mark large">SR</div>
          <div>
            <p className="eyebrow">Admin Access</p>
            <h2>Snug Rebel</h2>
          </div>
        </div>

        <div className="login-actions-top">
          <button type="button" className="icon-button" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h1>Sign in</h1>
            <p>Use your staff credentials to manage catalog, orders, and reports.</p>
          </div>

          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@snugrebel.com" />
          </label>

          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
          </label>

          {error ? <div className="error-banner">{error}</div> : null}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="divider"><span>or continue with</span></div>

          <div className="oauth-grid">
            <button type="button" className="secondary-button" onClick={() => handleOAuth('google')}>
              Google
            </button>
            <button type="button" className="secondary-button" onClick={() => handleOAuth('github')}>
              GitHub
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DashboardPage() {
  const [orders] = useState<OrderItem[]>(orderSeed)
  const [activeFilter, setActiveFilter] = useState('All')
  const [analytics, setAnalytics] = useState(defaultAnalytics)
  const [notifications, setNotifications] = useState(defaultShipmentTable)
  const calendarCells = buildCalendarCells(analytics.days)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [analyticsResponse, activitiesResponse] = await Promise.all([
          fetch(`${API_BASE}/api/Dashboard/analytics`),
          fetch(`${API_BASE}/api/Dashboard/activities`),
        ])

        if (analyticsResponse.ok) {
          const analyticsPayload = await analyticsResponse.json()
          setAnalytics({
            minimumNumber: analyticsPayload.minimumNumber ?? defaultAnalytics.minimumNumber,
            averageNumber: analyticsPayload.averageNumber ?? defaultAnalytics.averageNumber,
            maximumNumber: analyticsPayload.maximumNumber ?? defaultAnalytics.maximumNumber,
            monthLabel: analyticsPayload.monthLabel ?? defaultAnalytics.monthLabel,
            days: Array.isArray(analyticsPayload.days) ? analyticsPayload.days : defaultAnalytics.days,
          })
        }

        if (activitiesResponse.ok) {
          const activitiesPayload = await activitiesResponse.json()
          const nextItems = (activitiesPayload.items ?? []).map((item: any) => ({
            id: item.orderId ?? item.orderNumber ?? 'unknown',
            category: item.category ?? 'General',
            weight: item.weight ?? '0 g',
            company: item.company ?? 'Unknown',
            time: item.arrivalTime ? new Date(item.arrivalTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A',
            route: item.route ?? 'N/A',
            value: item.price ? `₱${Number(item.price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₱0.00',
            status: item.status ?? 'Pending',
          }))

          if (nextItems.length > 0) {
            setNotifications(nextItems)
          }
        }
      } catch {
        // Keep the seeded dashboard values if the backend is unavailable.
      }
    }

    loadDashboardData()
  }, [])

  const filteredShipments =
    activeFilter === 'All'
      ? notifications
      : notifications.filter((shipment) => shipment.status === activeFilter)

  function handleExport() {
    exportCsv(
      'snug-rebel-dashboard.csv',
      orders.map((order) => ({
        id: order.id,
        customer: order.customer,
        total: order.total,
        status: order.status,
        date: order.date,
        channel: order.channel,
      })),
    )
  }

  return (
    <div className="page-stack">
      <section className="page-header dashboard-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Tracking Orders List</h2>
        </div>
        <button type="button" className="primary-button small-button" onClick={handleExport}>
          <Download size={16} />
          Export data
        </button>
      </section>

      <section className="database-panel panel-card">
        <div className="database-head">
          <div className="database-title">
            <div className="database-icon" aria-hidden="true">◌</div>
            <div>
              <p className="eyebrow">Orders database</p>
              <strong>Today - 31 July, 2025</strong>
            </div>
          </div>

          <div className="database-actions">
            <div className="notice-pill">You got 5 pending shipments</div>
            <button type="button" className="secondary-button small-button">Download report</button>
            <button type="button" className="primary-button small-button">Create shipment</button>
          </div>
        </div>
      </section>

      <section className="analytics-grid single-analytic">
        <article className="panel-card analytic-panel">
          <div className="panel-head analytic-head">
            <div>
              <p className="eyebrow">Analytics</p>
              <h3>Analytic view</h3>
            </div>
            <div className="segmented-control" aria-label="Analytics timeframe selector">
              <button type="button" className="segment active">Day</button>
              <button type="button" className="segment">Week</button>
              <button type="button" className="segment">Month</button>
              <button type="button" className="segment">Quarter</button>
              <button type="button" className="segment">Year</button>
            </div>
          </div>

          <div className="analytic-metrics">
            <div className="analytic-metric">
              <strong>{analytics.minimumNumber}</strong>
              <span>minimum number</span>
            </div>
            <div className="analytic-metric">
              <strong>{analytics.averageNumber}</strong>
              <span>average number</span>
            </div>
            <div className="analytic-metric">
              <strong>{analytics.maximumNumber}</strong>
              <span>maximum number</span>
            </div>
          </div>

          <div className="heatmap-calendar-wrapper" aria-label="Analytic heat map calendar">
            <div className="heatmap-weekday-row">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <span key={day} className="heatmap-weekday">{day}</span>
              ))}
            </div>

            <div className="heatmap-calendar-grid">
              {calendarCells.map((cell) => (
                <div
                  key={cell.date}
                  className={`heatmap-calendar-cell ${!cell.inMonth ? 'blank' : ''} ${cell.isCurrentDay ? 'current' : ''}`}
                  style={{
                    opacity: cell.entry ? 1 : 0.55,
                    background: cell.entry
                      ? `linear-gradient(180deg, rgba(105,208,144,${0.25 + (cell.entry.value || 0) * 0.75}), rgba(20,89,47,${0.82 + (cell.entry.value || 0) * 0.18}))`
                      : 'rgba(139, 160, 148, 0.08)',
                  }}
                >
                  <div className="calendar-cell-content">
                    <span className="calendar-day-number">{cell.dayNumber}</span>
                    {cell.entry ? (
                      <>
                        <span className="calendar-badge">{cell.entry.orders}</span>
                        <span className="calendar-total">{Math.round(cell.entry.total)}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="panel-card activity-panel">
        <div className="panel-head activity-head">
          <div>
            <p className="eyebrow">Notifications</p>
            <h3>Recent activities</h3>
          </div>

          <div className="activity-filters">
            {activityFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`activity-filter ${filter === activeFilter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Category</th>
                <th>Weight</th>
                <th>Company</th>
                <th>Arrival time</th>
                <th>Route</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td>{shipment.id}</td>
                  <td>{shipment.category}</td>
                  <td>{shipment.weight}</td>
                  <td>{shipment.company}</td>
                  <td>{shipment.time}</td>
                  <td>{shipment.route}</td>
                  <td>{shipment.value}</td>
                  <td>
                    <span className={`status-pill ${shipment.status === 'Delivered' ? 'success' : shipment.status === 'Processing' ? 'warning' : 'neutral'}`}>
                      {shipment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>(productSeed)
  const [form, setForm] = useState({
    name: '',
    category: 'Streetwear',
    price: '1499',
    stock: '20',
    status: 'Active' as ProductItem['status'],
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  function handleChange(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextProduct: ProductItem = {
      id: editingId ?? `prd-${Date.now()}`,
      name: form.name || 'New product',
      category: form.category,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      status: form.status,
      sku: `SR-${(Math.random() + 1).toString(36).slice(2, 6).toUpperCase()}`,
      variants: 2,
    }

    if (editingId) {
      setProducts((current) => current.map((item) => (item.id === editingId ? nextProduct : item)))
    } else {
      setProducts((current) => [nextProduct, ...current])
    }

    setForm({ name: '', category: 'Streetwear', price: '1499', stock: '20', status: 'Active' })
    setEditingId(null)
  }

  function handleEdit(product: ProductItem) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      status: product.status,
    })
  }

  function handleDelete(id: string) {
    setProducts((current) => current.filter((item) => item.id !== id))
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h2>Products</h2>
        </div>
        <button type="button" className="secondary-button small-button" onClick={() => exportCsv('products-export.csv', products.map((item) => ({ id: item.id, name: item.name, category: item.category, price: item.price, stock: item.stock, status: item.status })))}>
          <Download size={16} />
          Export CSV
        </button>
      </section>

      <div className="content-grid two-column">
        <section className="panel-card">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Inventory</p>
              <h3>{editingId ? 'Edit product' : 'Add product'}</h3>
            </div>
          </div>

          <form className="entity-form" onSubmit={handleSubmit}>
            <label>
              <span>Product name</span>
              <input value={form.name} onChange={(event) => handleChange('name', event.target.value)} placeholder="Oversized Tee" />
            </label>

            <div className="inline-form">
              <label>
                <span>Category</span>
                <select value={form.category} onChange={(event) => handleChange('category', event.target.value)}>
                  <option>Streetwear</option>
                  <option>Essentials</option>
                  <option>Outerwear</option>
                  <option>Basics</option>
                </select>
              </label>

              <label>
                <span>Status</span>
                <select value={form.status} onChange={(event) => handleChange('status', event.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Low stock">Low stock</option>
                  <option value="Draft">Draft</option>
                </select>
              </label>
            </div>

            <div className="inline-form">
              <label>
                <span>Price</span>
                <input type="number" value={form.price} onChange={(event) => handleChange('price', event.target.value)} />
              </label>

              <label>
                <span>Stock</span>
                <input type="number" value={form.stock} onChange={(event) => handleChange('stock', event.target.value)} />
              </label>
            </div>

            <button type="submit" className="primary-button">
              {editingId ? 'Update product' : 'Create product'}
            </button>
          </form>
        </section>

        <section className="panel-card">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Catalog</p>
              <h3>Current items</h3>
            </div>
          </div>

          <div className="table-wrap compact">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>State</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{formatMoney(product.price)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`status-pill ${product.status === 'Active' ? 'success' : product.status === 'Low stock' ? 'warning' : 'neutral'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button type="button" className="link-button" onClick={() => handleEdit(product)}>Edit</button>
                      <button type="button" className="link-button danger" onClick={() => handleDelete(product.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

function CategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>(categorySeed)

  function handleAdd() {
    const next: CategoryItem = {
      id: `ctg-${Date.now()}`,
      name: 'New category',
      slug: 'new-category',
      products: 0,
      status: 'Active',
    }
    setItems((current) => [next, ...current])
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Catalog setup</p>
          <h2>Categories</h2>
        </div>
        <button type="button" className="primary-button small-button" onClick={handleAdd}>
          <FolderKanban size={16} />
          Add category
        </button>
      </section>

      <section className="panel-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.slug}</td>
                  <td>{item.products}</td>
                  <td>
                    <span className={`status-pill ${item.status === 'Active' ? 'success' : 'neutral'}`}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function CollectionsPage() {
  const [items, setItems] = useState<CollectionItem[]>(collectionSeed)

  function handleAdd() {
    const next: CollectionItem = {
      id: `col-${Date.now()}`,
      name: 'New collection',
      products: 0,
      status: 'Scheduled',
      launch: '2026-11-15',
    }
    setItems((current) => [next, ...current])
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Marketing</p>
          <h2>Collections</h2>
        </div>
        <button type="button" className="primary-button small-button" onClick={handleAdd}>
          <Layers3 size={16} />
          Add collection
        </button>
      </section>

      <section className="panel-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Products</th>
                <th>Launch</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.products}</td>
                  <td>{item.launch}</td>
                  <td>
                    <span className={`status-pill ${item.status === 'Live' ? 'success' : 'warning'}`}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>(orderSeed)
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null)

  function updateStatus(id: string, status: OrderItem['status']) {
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, status } : order)))
    setSelectedOrder((current) => (current && current.id === id ? { ...current, status } : current))
  }

  function handleExport() {
    exportCsv(
      'orders-export.csv',
      orders.map((order) => ({
        id: order.id,
        customer: order.customer,
        total: order.total,
        status: order.status,
        date: order.date,
        channel: order.channel,
      })),
    )
  }

  function getStatusTone(status: OrderItem['status']) {
    if (status === 'Paid' || status === 'Shipped' || status === 'Delivered') {
      return 'success'
    }
    if (status === 'Processing' || status === 'Pending') {
      return 'warning'
    }
    return 'neutral'
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Monitoring</p>
          <h2>Orders</h2>
        </div>
        <button type="button" className="primary-button small-button" onClick={handleExport}>
          <Download size={16} />
          Export orders
        </button>
      </section>

      <section className="panel-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{formatMoney(order.total)}</td>
                  <td>
                    <span className={`status-pill ${getStatusTone(order.status)}`}>{order.status}</span>
                  </td>
                  <td className="actions-cell">
                    <button type="button" className="link-button" onClick={() => setSelectedOrder(order)}>
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedOrder ? (
        <div className="order-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(event) => event.stopPropagation()}>
            <div className="order-modal-header">
              <div>
                <p className="eyebrow">Order details</p>
                <h3>{selectedOrder.id}</h3>
              </div>
              <button type="button" className="icon-button" onClick={() => setSelectedOrder(null)} aria-label="Close order details">
                ×
              </button>
            </div>

            <div className="order-modal-grid">
              <div className="order-detail-block">
                <div className="order-identity">
                  <strong>{selectedOrder.customer}</strong>
                  <span>{selectedOrder.channel}</span>
                </div>
                <div className="detail-list">
                  <div>
                    <label>Date</label>
                    <span>{selectedOrder.date}</span>
                  </div>
                  <div>
                    <label>Shipping</label>
                    <span>{selectedOrder.shippingAddress ?? 'Not provided'}</span>
                  </div>
                  <div>
                    <label>Payment</label>
                    <span>{selectedOrder.paymentMethod ?? 'Card'}</span>
                  </div>
                  <div>
                    <label>Total</label>
                    <span>{formatMoney(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <div className="order-detail-block">
                <label>
                  <span>Current status</span>
                  <select value={selectedOrder.status} onChange={(event) => updateStatus(selectedOrder.id, event.target.value as OrderItem['status'])}>
                    {orderStatusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <div className="detail-list compact">
                  <div>
                    <label>Order status</label>
                    <span className={`status-pill ${getStatusTone(selectedOrder.status)}`}>{selectedOrder.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-items-header">
              <h4>Items</h4>
              <strong>{selectedOrder.items?.length ?? 0} line items</strong>
            </div>

            <div className="order-items-list">
              {(selectedOrder.items ?? []).map((item) => (
                <div key={`${selectedOrder.id}-${item.name}`} className="order-item-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span>Qty {item.qty}</span>
                  </div>
                  <span>{formatMoney(item.price)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CustomersPage() {
  const customers = [
    { id: 'USR-1001', name: 'Maya Santos', email: 'maya@demo.com', orders: 16, lifetime: 28360 },
    { id: 'USR-1002', name: 'Liam Cruz', email: 'liam@demo.com', orders: 8, lifetime: 15420 },
    { id: 'USR-1003', name: 'Nina Reyes', email: 'nina@demo.com', orders: 11, lifetime: 22500 },
  ]

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">People</p>
          <h2>Customers</h2>
        </div>
      </section>

      <section className="panel-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Lifetime</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.orders}</td>
                  <td>{formatMoney(customer.lifetime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default App
