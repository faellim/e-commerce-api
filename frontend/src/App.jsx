import { useEffect, useState } from "react";

import { API_BASE_URL, apiFetch, loginRequest } from "./lib/api";

const emptyRegister = {
  full_name: "",
  email: "",
  password: "",
};

const emptyLogin = {
  email: "",
  password: "",
};

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  stock: "",
  sku: "",
  category: "",
};

function currency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total_amount: 0 });
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [loginForm, setLoginForm] = useState(emptyLogin);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [statusMessage, setStatusMessage] = useState("Connect the app to your FastAPI backend and start testing flows.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      loadProtectedData(token);
    } else {
      localStorage.removeItem("token");
      setCurrentUser(null);
      setCart({ items: [], total_amount: 0 });
      setOrders([]);
      setAllOrders([]);
    }
  }, [token]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await apiFetch("/api/v1/products");
      setProducts(data);
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  async function loadProtectedData(activeToken) {
    try {
      const headers = { Authorization: `Bearer ${activeToken}` };
      const [me, cartData, myOrders] = await Promise.all([
        apiFetch("/api/v1/auth/me", { headers }),
        apiFetch("/api/v1/cart", { headers }),
        apiFetch("/api/v1/orders/mine", { headers }),
      ]);
      setCurrentUser(me);
      setCart(cartData);
      setOrders(myOrders);

      if (me.is_admin) {
        const adminOrders = await apiFetch("/api/v1/orders", { headers });
        setAllOrders(adminOrders);
      } else {
        setAllOrders([]);
      }
    } catch (error) {
      setStatusMessage(error.message);
      setToken("");
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const createdUser = await apiFetch("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(registerForm),
      });
      setRegisterForm(emptyRegister);
      setStatusMessage(
        `${createdUser.full_name} created successfully. Now login to explore the system.`,
      );
      await loadProducts();
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await loginRequest(loginForm.email, loginForm.password);
      setToken(data.access_token);
      setLoginForm(emptyLogin);
      setStatusMessage("Authenticated successfully.");
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken("");
    setStatusMessage("Session closed.");
  }

  async function handleCreateProduct(event) {
    event.preventDefault();
    if (!token) {
      setStatusMessage("Login as admin before creating products.");
      return;
    }

    if (
      !productForm.name.trim() ||
      !productForm.description.trim() ||
      !productForm.sku.trim() ||
      !productForm.price ||
      !productForm.stock
    ) {
      setStatusMessage("Fill in name, description, price, stock and SKU before saving.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/v1/products", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...productForm,
          name: productForm.name.trim(),
          description: productForm.description.trim(),
          sku: productForm.sku.trim(),
          category: productForm.category.trim() || null,
          price: Number(productForm.price),
          stock: Number(productForm.stock),
        }),
      });
      setProductForm(emptyProduct);
      setStatusMessage("Product created.");
      await Promise.all([loadProducts(), loadProtectedData(token)]);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(productId) {
    if (!token) {
      setStatusMessage("Create an account and login to add items to cart.");
      return;
    }

    try {
      const data = await apiFetch("/api/v1/cart/items", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      setCart(data);
      setStatusMessage("Item added to cart.");
      await loadProtectedData(token);
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  async function updateCartQuantity(productId, quantity) {
    if (quantity < 1) {
      await removeCartItem(productId);
      return;
    }

    try {
      const data = await apiFetch(`/api/v1/cart/items/${productId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity }),
      });
      setCart(data);
      await loadProtectedData(token);
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  async function removeCartItem(productId) {
    try {
      const data = await apiFetch(`/api/v1/cart/items/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(data);
      setStatusMessage("Item removed from cart.");
      await loadProtectedData(token);
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  async function checkout() {
    try {
      await apiFetch("/api/v1/orders/checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatusMessage("Checkout completed successfully.");
      await Promise.all([loadProducts(), loadProtectedData(token)]);
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Portfolio Project / Full Stack Showcase</p>
          <h1>E-commerce control room for a modern full-stack workflow.</h1>
          <p className="hero__text">
            This interface sits on top of the FastAPI backend and demonstrates the
            complete application flow: authentication, catalog, cart, checkout, and
            admin product management.
          </p>
          <div className="hero__badges">
            <span>FastAPI API</span>
            <span>JWT auth</span>
            <span>React frontend</span>
            <span>PostgreSQL ready</span>
          </div>
        </div>

        <div className="hero__panel">
          <div className="hero__panel-head">
            <span className="dot dot--red" />
            <span className="dot dot--yellow" />
            <span className="dot dot--green" />
          </div>
          <div className="metric-grid">
            <article>
              <strong>{products.length}</strong>
              <span>Products loaded</span>
            </article>
            <article>
              <strong>{cart.items.length}</strong>
              <span>Cart lines</span>
            </article>
            <article>
              <strong>{orders.length}</strong>
              <span>My orders</span>
            </article>
            <article>
              <strong>{currentUser?.is_admin ? "Admin" : "User"}</strong>
              <span>Current profile</span>
            </article>
          </div>
          <p className="endpoint">API base URL: {API_BASE_URL}</p>
        </div>
      </header>

      <section className="status-banner">
        <strong>System status</strong>
        <span>{statusMessage}</span>
      </section>

      <main className="dashboard-grid">
        <section className="panel">
          <div className="panel__header">
            <h2>Access</h2>
            {currentUser ? (
              <button className="ghost-button" onClick={logout}>
                Logout
              </button>
            ) : null}
          </div>

          <div className="stack">
            <form className="form-card" onSubmit={handleRegister}>
              <h3>Create account</h3>
              <input
                placeholder="Full name"
                value={registerForm.full_name}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    full_name: event.target.value,
                  }))
                }
              />
              <input
                placeholder="Email"
                type="email"
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
              <input
                placeholder="Password"
                type="password"
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
              <button type="submit" disabled={loading}>
                Register
              </button>
            </form>

            <form className="form-card" onSubmit={handleLogin}>
              <h3>Login</h3>
              <input
                placeholder="Email"
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
              <input
                placeholder="Password"
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
              <button type="submit" disabled={loading}>
                Enter dashboard
              </button>
            </form>
          </div>

          <div className="profile-card">
            <h3>Current user</h3>
            {currentUser ? (
              <>
                <p>{currentUser.full_name}</p>
                <p>{currentUser.email}</p>
                <span className="pill">
                  {currentUser.is_admin ? "Administrator" : "Customer"}
                </span>
              </>
            ) : (
              <p>Login to unlock cart, orders and admin tools.</p>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <h2>Catalog</h2>
            <button className="ghost-button" onClick={loadProducts}>
              Refresh
            </button>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-card__top">
                  <span className="product-category">
                    {product.category || "General"}
                  </span>
                  <span className={product.stock > 0 ? "stock stock--ok" : "stock"}>
                    {product.stock} in stock
                  </span>
                </div>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-card__bottom">
                  <strong>{currency(product.price)}</strong>
                  <button onClick={() => addToCart(product.id)}>Add</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <h2>Cart</h2>
            <strong>{currency(cart.total_amount)}</strong>
          </div>
          <div className="stack">
            {cart.items.length === 0 ? (
              <p className="empty-state">Your cart is empty.</p>
            ) : (
              cart.items.map((item) => (
                <article className="cart-row" key={item.id}>
                  <div>
                    <h3>{item.product.name}</h3>
                    <p>{currency(item.product.price)}</p>
                  </div>
                  <div className="cart-actions">
                    <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}>
                      +
                    </button>
                    <button
                      className="ghost-button"
                      onClick={() => removeCartItem(item.product.id)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))
            )}
            <button onClick={checkout} disabled={!cart.items.length}>
              Finish checkout
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <h2>Orders</h2>
            <span>{orders.length} records</span>
          </div>
          <div className="stack">
            {orders.length === 0 ? (
              <p className="empty-state">No orders yet.</p>
            ) : (
              orders.map((order) => (
                <article className="order-card" key={order.id}>
                  <div className="order-card__head">
                    <strong>Order #{order.id}</strong>
                    <span className="pill">{order.status}</span>
                  </div>
                  <p>Total: {currency(order.total_amount)}</p>
                  <ul>
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.quantity}x {item.product_name}
                      </li>
                    ))}
                  </ul>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="panel panel--wide">
          <div className="panel__header">
            <h2>Admin zone</h2>
            <span>{currentUser?.is_admin ? "Enabled" : "Restricted"}</span>
          </div>
          <div className="admin-layout">
            <form className="form-card" onSubmit={handleCreateProduct}>
              <h3>Create product</h3>
              <input
                placeholder="Name"
                value={productForm.name}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
              <textarea
                placeholder="Description"
                rows="4"
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
              <div className="two-columns">
                <input
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                />
                <input
                  placeholder="Stock"
                  type="number"
                  value={productForm.stock}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      stock: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="two-columns">
                <input
                  placeholder="SKU"
                  value={productForm.sku}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      sku: event.target.value,
                    }))
                  }
                />
                <input
                  placeholder="Category"
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                />
              </div>
              <button type="submit" disabled={!currentUser?.is_admin || loading}>
                Save product
              </button>
            </form>

            <div className="admin-orders">
              <h3>All platform orders</h3>
              {allOrders.length === 0 ? (
                <p className="empty-state">
                  Login as admin to inspect platform orders.
                </p>
              ) : (
                allOrders.map((order) => (
                  <article className="order-card" key={order.id}>
                    <div className="order-card__head">
                      <strong>Order #{order.id}</strong>
                      <span>{currency(order.total_amount)}</span>
                    </div>
                    <p>User ID: {order.user_id}</p>
                    <p>{order.items.length} item(s)</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span className="site-footer__label">Built and maintained by</span>
        <strong>faellim</strong>
      </footer>
    </div>
  );
}

export default App;
