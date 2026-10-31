import { useEffect, useMemo, useState } from 'react'
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

const orderSeed: OrderItem[] = [
  { id: 'ORD-2401', customer: 'Maya Santos', total: 3240, status: 'Paid', date: '2026-10-28', channel: 'Web' },
  { id: 'ORD-2402', customer: 'Liam Cruz', total: 1890, status: 'Processing', date: '2026-10-28', channel: 'Marketplace' },
  { id: 'ORD-2403', customer: 'Nina Reyes', total: 4190, status: 'Pending', date: '2026-10-27', channel: 'Web' },
  { id: 'ORD-2404', customer: 'Evan Lee', total: 1330, status: 'Paid', date: '2026-10-27', channel: 'In-store' },
]

const dashboardStats = [
  { label: 'Revenue', value: '₱82.4K', trend: '+12.4%', positive: true },
  { label: 'Orders', value: '1,238', trend: '+8.1%', positive: true },
  { label: 'Conversion', value: '3.8%', trend: '+0.9%', positive: true },
  { label: 'Low stock', value: '18 SKUs', trend: '-5.3%', positive: false },
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
  const [email, setEmail] = useState('hello@example.com')
  const [password, setPassword] = useState('StrongPass123!')
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

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders])
  const paidOrders = orders.filter((order) => order.status === 'Paid').length

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
      <section className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Dashboard</h2>
        </div>
        <button type="button" className="primary-button small-button" onClick={handleExport}>
          <Download size={16} />
          Export data
        </button>
      </section>

      <section className="stats-grid">
        {dashboardStats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <div className="stat-header">
              <span>{stat.label}</span>
              <span className={`trend ${stat.positive ? 'up' : 'down'}`}>{stat.trend}</span>
            </div>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="analytics-grid">
        <article className="panel-card wide-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Performance</p>
              <h3>Sales snapshot</h3>
            </div>
            <span className="status-pill success">+12.4% from last week</span>
          </div>

          <div className="bar-chart" aria-label="Sales chart">
            {[42, 57, 74, 69, 88, 96, 110].map((height, index) => (
              <div key={index} className="bar-column">
                <span style={{ height: `${height}%` }} />
              </div>
            ))}
          </div>

          <div className="mini-legend">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Summary</p>
              <h3>Quick metrics</h3>
            </div>
          </div>

          <div className="summary-list">
            <div>
              <span>Gross sales</span>
              <strong>{formatMoney(totalRevenue)}</strong>
            </div>
            <div>
              <span>Orders paid</span>
              <strong>{paidOrders}</strong>
            </div>
            <div>
              <span>Returning buyers</span>
              <strong>28%</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Activity</p>
            <h3>Recent orders</h3>
          </div>
          <button type="button" className="secondary-button small-button">
            View all
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Channel</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{formatMoney(order.total)}</td>
                  <td>
                    <span className={`status-pill ${order.status === 'Paid' ? 'success' : order.status === 'Processing' ? 'warning' : 'neutral'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.channel}</td>
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

  function updateStatus(id: string, status: OrderItem['status']) {
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, status } : order)))
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
                    <span className={`status-pill ${order.status === 'Paid' ? 'success' : order.status === 'Processing' ? 'warning' : 'neutral'}`}>{order.status}</span>
                  </td>
                  <td className="actions-cell">
                    <button type="button" className="link-button" onClick={() => updateStatus(order.id, 'Paid')}>
                      Mark paid
                    </button>
                    <button type="button" className="link-button" onClick={() => updateStatus(order.id, 'Processing')}>
                      Process
                    </button>
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
