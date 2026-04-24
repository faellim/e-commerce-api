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

const translations = {
  pt: {
    locale: "pt-BR",
    currency: "BRL",
    languageLabel: "Idioma",
    languages: { pt: "PT", en: "EN", es: "ES" },
    defaultStatus: "Conecte a interface ao backend FastAPI e teste os fluxos da aplicação.",
    eyebrow: "Projeto de Portfólio / Full Stack",
    heroTitle: "Painel de e-commerce para um fluxo full-stack moderno.",
    heroText:
      "Esta interface consome o backend em FastAPI e demonstra o fluxo completo da aplicação: autenticação, catálogo, carrinho, checkout e gestão administrativa de produtos.",
    badgeApi: "API FastAPI",
    badgeAuth: "JWT auth",
    badgeFrontend: "Frontend React",
    badgeDatabase: "PostgreSQL pronto",
    metricProducts: "Produtos carregados",
    metricCart: "Linhas no carrinho",
    metricOrders: "Meus pedidos",
    metricProfile: "Perfil atual",
    apiBaseUrl: "URL base da API",
    adminShort: "Admin",
    userShort: "Usuário",
    statusTitle: "Status do sistema",
    accessTitle: "Acesso",
    logout: "Sair",
    createAccount: "Criar conta",
    loginTitle: "Entrar",
    fullNamePlaceholder: "Nome completo",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Senha",
    registerButton: "Cadastrar",
    loginButton: "Entrar no painel",
    currentUser: "Usuário atual",
    loginToUnlock: "Faça login para liberar carrinho, pedidos e ferramentas de admin.",
    administrator: "Administrador",
    customer: "Cliente",
    catalogTitle: "Catálogo",
    refresh: "Atualizar",
    generalCategory: "Geral",
    stockSuffix: "em estoque",
    addButton: "Adicionar",
    cartTitle: "Carrinho",
    cartEmpty: "Seu carrinho está vazio.",
    remove: "Remover",
    finishCheckout: "Finalizar compra",
    ordersTitle: "Pedidos",
    recordsSuffix: "registros",
    noOrders: "Nenhum pedido ainda.",
    totalLabel: "Total",
    adminZone: "Área admin",
    enabled: "Ativada",
    restricted: "Restrita",
    createProduct: "Criar produto",
    namePlaceholder: "Nome",
    descriptionPlaceholder: "Descrição",
    pricePlaceholder: "Preço",
    stockPlaceholder: "Estoque",
    skuPlaceholder: "SKU",
    categoryPlaceholder: "Categoria",
    saveProduct: "Salvar produto",
    allPlatformOrders: "Todos os pedidos da plataforma",
    loginAdminToInspect: "Faça login como admin para visualizar os pedidos da plataforma.",
    userIdLabel: "ID do usuário",
    itemsSuffix: "item(s)",
    builtBy: "Criado e mantido por",
    createdSuccessfully: (name) => `${name} foi criado com sucesso. Agora faça login para explorar o sistema.`,
    authenticatedSuccessfully: "Autenticação concluída com sucesso.",
    sessionClosed: "Sessão encerrada.",
    loginAsAdmin: "Faça login como admin antes de criar produtos.",
    fillRequiredFields: "Preencha nome, descrição, preço, estoque e SKU antes de salvar.",
    productCreated: "Produto criado com sucesso.",
    createAccountFirst: "Crie uma conta e faça login para adicionar itens ao carrinho.",
    itemAdded: "Item adicionado ao carrinho.",
    itemRemoved: "Item removido do carrinho.",
    checkoutCompleted: "Checkout concluído com sucesso.",
  },
  en: {
    locale: "en-US",
    currency: "USD",
    languageLabel: "Language",
    languages: { pt: "PT", en: "EN", es: "ES" },
    defaultStatus: "Connect the interface to the FastAPI backend and test the main application flows.",
    eyebrow: "Portfolio Project / Full Stack",
    heroTitle: "E-commerce control room for a modern full-stack workflow.",
    heroText:
      "This interface consumes the FastAPI backend and demonstrates the complete application flow: authentication, catalog, cart, checkout, and admin product management.",
    badgeApi: "FastAPI API",
    badgeAuth: "JWT auth",
    badgeFrontend: "React frontend",
    badgeDatabase: "PostgreSQL ready",
    metricProducts: "Products loaded",
    metricCart: "Cart lines",
    metricOrders: "My orders",
    metricProfile: "Current profile",
    apiBaseUrl: "API base URL",
    adminShort: "Admin",
    userShort: "User",
    statusTitle: "System status",
    accessTitle: "Access",
    logout: "Logout",
    createAccount: "Create account",
    loginTitle: "Login",
    fullNamePlaceholder: "Full name",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    registerButton: "Register",
    loginButton: "Enter dashboard",
    currentUser: "Current user",
    loginToUnlock: "Login to unlock cart, orders, and admin tools.",
    administrator: "Administrator",
    customer: "Customer",
    catalogTitle: "Catalog",
    refresh: "Refresh",
    generalCategory: "General",
    stockSuffix: "in stock",
    addButton: "Add",
    cartTitle: "Cart",
    cartEmpty: "Your cart is empty.",
    remove: "Remove",
    finishCheckout: "Finish checkout",
    ordersTitle: "Orders",
    recordsSuffix: "records",
    noOrders: "No orders yet.",
    totalLabel: "Total",
    adminZone: "Admin area",
    enabled: "Enabled",
    restricted: "Restricted",
    createProduct: "Create product",
    namePlaceholder: "Name",
    descriptionPlaceholder: "Description",
    pricePlaceholder: "Price",
    stockPlaceholder: "Stock",
    skuPlaceholder: "SKU",
    categoryPlaceholder: "Category",
    saveProduct: "Save product",
    allPlatformOrders: "All platform orders",
    loginAdminToInspect: "Login as admin to review platform orders.",
    userIdLabel: "User ID",
    itemsSuffix: "item(s)",
    builtBy: "Built and maintained by",
    createdSuccessfully: (name) => `${name} was created successfully. Now log in to explore the system.`,
    authenticatedSuccessfully: "Authenticated successfully.",
    sessionClosed: "Session closed.",
    loginAsAdmin: "Login as admin before creating products.",
    fillRequiredFields: "Fill in name, description, price, stock, and SKU before saving.",
    productCreated: "Product created successfully.",
    createAccountFirst: "Create an account and log in to add items to the cart.",
    itemAdded: "Item added to cart.",
    itemRemoved: "Item removed from cart.",
    checkoutCompleted: "Checkout completed successfully.",
  },
  es: {
    locale: "es-ES",
    currency: "USD",
    languageLabel: "Idioma",
    languages: { pt: "PT", en: "EN", es: "ES" },
    defaultStatus: "Conecta la interfaz al backend en FastAPI y prueba los flujos principales de la aplicación.",
    eyebrow: "Proyecto de Portafolio / Full Stack",
    heroTitle: "Panel de e-commerce para un flujo full-stack moderno.",
    heroText:
      "Esta interfaz consume el backend en FastAPI y demuestra el flujo completo de la aplicación: autenticación, catálogo, carrito, checkout y administración de productos.",
    badgeApi: "API FastAPI",
    badgeAuth: "JWT auth",
    badgeFrontend: "Frontend React",
    badgeDatabase: "PostgreSQL listo",
    metricProducts: "Productos cargados",
    metricCart: "Líneas del carrito",
    metricOrders: "Mis pedidos",
    metricProfile: "Perfil actual",
    apiBaseUrl: "URL base de la API",
    adminShort: "Admin",
    userShort: "Usuario",
    statusTitle: "Estado del sistema",
    accessTitle: "Acceso",
    logout: "Salir",
    createAccount: "Crear cuenta",
    loginTitle: "Iniciar sesión",
    fullNamePlaceholder: "Nombre completo",
    emailPlaceholder: "Correo electrónico",
    passwordPlaceholder: "Contraseña",
    registerButton: "Registrarse",
    loginButton: "Entrar al panel",
    currentUser: "Usuario actual",
    loginToUnlock: "Inicia sesión para habilitar el carrito, los pedidos y las herramientas de admin.",
    administrator: "Administrador",
    customer: "Cliente",
    catalogTitle: "Catálogo",
    refresh: "Actualizar",
    generalCategory: "General",
    stockSuffix: "en stock",
    addButton: "Agregar",
    cartTitle: "Carrito",
    cartEmpty: "Tu carrito está vacío.",
    remove: "Eliminar",
    finishCheckout: "Finalizar compra",
    ordersTitle: "Pedidos",
    recordsSuffix: "registros",
    noOrders: "Todavía no hay pedidos.",
    totalLabel: "Total",
    adminZone: "Zona admin",
    enabled: "Activa",
    restricted: "Restringida",
    createProduct: "Crear producto",
    namePlaceholder: "Nombre",
    descriptionPlaceholder: "Descripción",
    pricePlaceholder: "Precio",
    stockPlaceholder: "Stock",
    skuPlaceholder: "SKU",
    categoryPlaceholder: "Categoría",
    saveProduct: "Guardar producto",
    allPlatformOrders: "Todos los pedidos de la plataforma",
    loginAdminToInspect: "Inicia sesión como admin para revisar los pedidos de la plataforma.",
    userIdLabel: "ID del usuario",
    itemsSuffix: "artículo(s)",
    builtBy: "Creado y mantenido por",
    createdSuccessfully: (name) => `${name} fue creado correctamente. Ahora inicia sesión para explorar el sistema.`,
    authenticatedSuccessfully: "Autenticación completada correctamente.",
    sessionClosed: "Sesión cerrada.",
    loginAsAdmin: "Inicia sesión como admin antes de crear productos.",
    fillRequiredFields: "Completa nombre, descripción, precio, stock y SKU antes de guardar.",
    productCreated: "Producto creado correctamente.",
    createAccountFirst: "Crea una cuenta e inicia sesión para agregar artículos al carrito.",
    itemAdded: "Artículo agregado al carrito.",
    itemRemoved: "Artículo eliminado del carrito.",
    checkoutCompleted: "Checkout completado correctamente.",
  },
};

function App() {
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "pt");
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total_amount: 0 });
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [loginForm, setLoginForm] = useState(emptyLogin);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [statusMessage, setStatusMessage] = useState(translations.pt.defaultStatus);
  const [loading, setLoading] = useState(false);

  const copy = translations[language] || translations.pt;

  function updateStatus(message) {
    setStatusMessage(message);
  }

  function currency(value) {
    return new Intl.NumberFormat(copy.locale, {
      style: "currency",
      currency: copy.currency,
    }).format(Number(value || 0));
  }

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
    setStatusMessage((current) =>
      current === translations.pt.defaultStatus ||
      current === translations.en.defaultStatus ||
      current === translations.es.defaultStatus
        ? copy.defaultStatus
        : current,
    );
  }, [language, copy.defaultStatus]);

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
      updateStatus(error.message);
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
      updateStatus(error.message);
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
      updateStatus(copy.createdSuccessfully(createdUser.full_name));
      await loadProducts();
    } catch (error) {
      updateStatus(error.message);
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
      updateStatus(copy.authenticatedSuccessfully);
    } catch (error) {
      updateStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken("");
    updateStatus(copy.sessionClosed);
  }

  async function handleCreateProduct(event) {
    event.preventDefault();
    if (!token) {
      updateStatus(copy.loginAsAdmin);
      return;
    }

    if (
      !productForm.name.trim() ||
      !productForm.description.trim() ||
      !productForm.sku.trim() ||
      !productForm.price ||
      !productForm.stock
    ) {
      updateStatus(copy.fillRequiredFields);
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
      updateStatus(copy.productCreated);
      await Promise.all([loadProducts(), loadProtectedData(token)]);
    } catch (error) {
      updateStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(productId) {
    if (!token) {
      updateStatus(copy.createAccountFirst);
      return;
    }

    try {
      const data = await apiFetch("/api/v1/cart/items", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      setCart(data);
      updateStatus(copy.itemAdded);
      await loadProtectedData(token);
    } catch (error) {
      updateStatus(error.message);
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
      updateStatus(error.message);
    }
  }

  async function removeCartItem(productId) {
    try {
      const data = await apiFetch(`/api/v1/cart/items/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(data);
      updateStatus(copy.itemRemoved);
      await loadProtectedData(token);
    } catch (error) {
      updateStatus(error.message);
    }
  }

  async function checkout() {
    try {
      await apiFetch("/api/v1/orders/checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      updateStatus(copy.checkoutCompleted);
      await Promise.all([loadProducts(), loadProtectedData(token)]);
    } catch (error) {
      updateStatus(error.message);
    }
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero__copy">
          <div className="hero__top">
            <p className="eyebrow">{copy.eyebrow}</p>
            <div className="language-switcher" aria-label={copy.languageLabel}>
              {Object.entries(copy.languages).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  className={`language-switcher__button ${language === code ? "is-active" : ""}`}
                  onClick={() => setLanguage(code)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <h1>{copy.heroTitle}</h1>
          <p className="hero__text">{copy.heroText}</p>
          <div className="hero__badges">
            <span>{copy.badgeApi}</span>
            <span>{copy.badgeAuth}</span>
            <span>{copy.badgeFrontend}</span>
            <span>{copy.badgeDatabase}</span>
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
              <span>{copy.metricProducts}</span>
            </article>
            <article>
              <strong>{cart.items.length}</strong>
              <span>{copy.metricCart}</span>
            </article>
            <article>
              <strong>{orders.length}</strong>
              <span>{copy.metricOrders}</span>
            </article>
            <article>
              <strong>{currentUser?.is_admin ? copy.adminShort : copy.userShort}</strong>
              <span>{copy.metricProfile}</span>
            </article>
          </div>
          <p className="endpoint">
            {copy.apiBaseUrl}: {API_BASE_URL}
          </p>
        </div>
      </header>

      <section className="status-banner">
        <strong>{copy.statusTitle}</strong>
        <span>{statusMessage}</span>
      </section>

      <main className="dashboard-grid">
        <section className="panel">
          <div className="panel__header">
            <h2>{copy.accessTitle}</h2>
            {currentUser ? (
              <button className="ghost-button" onClick={logout}>
                {copy.logout}
              </button>
            ) : null}
          </div>

          <div className="stack">
            <form className="form-card" onSubmit={handleRegister}>
              <h3>{copy.createAccount}</h3>
              <input
                placeholder={copy.fullNamePlaceholder}
                value={registerForm.full_name}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    full_name: event.target.value,
                  }))
                }
              />
              <input
                placeholder={copy.emailPlaceholder}
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
                placeholder={copy.passwordPlaceholder}
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
                {copy.registerButton}
              </button>
            </form>

            <form className="form-card" onSubmit={handleLogin}>
              <h3>{copy.loginTitle}</h3>
              <input
                placeholder={copy.emailPlaceholder}
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
                placeholder={copy.passwordPlaceholder}
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
                {copy.loginButton}
              </button>
            </form>
          </div>

          <div className="profile-card">
            <h3>{copy.currentUser}</h3>
            {currentUser ? (
              <>
                <p>{currentUser.full_name}</p>
                <p>{currentUser.email}</p>
                <span className="pill">
                  {currentUser.is_admin ? copy.administrator : copy.customer}
                </span>
              </>
            ) : (
              <p>{copy.loginToUnlock}</p>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <h2>{copy.catalogTitle}</h2>
            <button className="ghost-button" onClick={loadProducts}>
              {copy.refresh}
            </button>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-card__top">
                  <span className="product-category">
                    {product.category || copy.generalCategory}
                  </span>
                  <span className={product.stock > 0 ? "stock stock--ok" : "stock"}>
                    {product.stock} {copy.stockSuffix}
                  </span>
                </div>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-card__bottom">
                  <strong>{currency(product.price)}</strong>
                  <button onClick={() => addToCart(product.id)}>{copy.addButton}</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <h2>{copy.cartTitle}</h2>
            <strong>{currency(cart.total_amount)}</strong>
          </div>
          <div className="stack">
            {cart.items.length === 0 ? (
              <p className="empty-state">{copy.cartEmpty}</p>
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
                      {copy.remove}
                    </button>
                  </div>
                </article>
              ))
            )}
            <button onClick={checkout} disabled={!cart.items.length}>
              {copy.finishCheckout}
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <h2>{copy.ordersTitle}</h2>
            <span>
              {orders.length} {copy.recordsSuffix}
            </span>
          </div>
          <div className="stack">
            {orders.length === 0 ? (
              <p className="empty-state">{copy.noOrders}</p>
            ) : (
              orders.map((order) => (
                <article className="order-card" key={order.id}>
                  <div className="order-card__head">
                    <strong>Order #{order.id}</strong>
                    <span className="pill">{order.status}</span>
                  </div>
                  <p>
                    {copy.totalLabel}: {currency(order.total_amount)}
                  </p>
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
            <h2>{copy.adminZone}</h2>
            <span>{currentUser?.is_admin ? copy.enabled : copy.restricted}</span>
          </div>
          <div className="admin-layout">
            <form className="form-card" onSubmit={handleCreateProduct}>
              <h3>{copy.createProduct}</h3>
              <input
                placeholder={copy.namePlaceholder}
                value={productForm.name}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
              <textarea
                placeholder={copy.descriptionPlaceholder}
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
                  placeholder={copy.pricePlaceholder}
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
                  placeholder={copy.stockPlaceholder}
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
                  placeholder={copy.skuPlaceholder}
                  value={productForm.sku}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      sku: event.target.value,
                    }))
                  }
                />
                <input
                  placeholder={copy.categoryPlaceholder}
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
                {copy.saveProduct}
              </button>
            </form>

            <div className="admin-orders">
              <h3>{copy.allPlatformOrders}</h3>
              {allOrders.length === 0 ? (
                <p className="empty-state">{copy.loginAdminToInspect}</p>
              ) : (
                allOrders.map((order) => (
                  <article className="order-card" key={order.id}>
                    <div className="order-card__head">
                      <strong>Order #{order.id}</strong>
                      <span>{currency(order.total_amount)}</span>
                    </div>
                    <p>
                      {copy.userIdLabel}: {order.user_id}
                    </p>
                    <p>
                      {order.items.length} {copy.itemsSuffix}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span className="site-footer__label">{copy.builtBy}</span>
        <strong>codedbyfaellim</strong>
      </footer>
    </div>
  );
}

export default App;
