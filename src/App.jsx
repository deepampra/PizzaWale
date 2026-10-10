import { useEffect, useState } from "react";
import "./App.css";



const categories = [
  { name: "All", icon: "🍽️" },
  { name: "Pizza", icon: "🍕" },
  { name: "Burgers", icon: "🍔" },
  { name: "Sides", icon: "🍟" },
  { name: "Drinks", icon: "🥤" },
];

function App() {
  const fetchMyOrders = async () => {
    console.log("FETCH MY ORDERS CLICKED");
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    alert("Please login first.");
    return;
  }
  

  try {
    const response = await fetch("http://127.0.0.1:8000/api/orders/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("API RESPONSE:", response.status);

    const data = await response.json();

    if (response.ok) {
      setMyOrders(data);
      setShowOrders(true);
    } else {
      alert("Please login Failed to load orders.");
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong.");
  }
};



  const [cart, setCart] = useState([]);
const [activeCategory, setActiveCategory] = useState("All");
const [searchTerm, setSearchTerm] = useState("");
const [mobileMenu, setMobileMenu] = useState(false);
const [cartOpen, setCartOpen] = useState(false);
const [checkoutOpen, setCheckoutOpen] = useState(false);

const [pizzas, setPizzas] = useState([]);
const [customerName, setCustomerName] = useState("");
const [mobile, setMobile] = useState("");
const [address, setAddress] = useState("");
const [orderStatus, setOrderStatus] = useState("");
const [orderId, setOrderId] = useState(null);
const [latitude, setLatitude] = useState(null);
const [longitude, setLongitude] = useState(null);
const [showSignup, setShowSignup] = useState(false);
const [signupUsername, setSignupUsername] = useState("");
const [signupPassword, setSignupPassword] = useState("");
const [showLogin, setShowLogin] = useState(false);
const [loginUsername, setLoginUsername] = useState("");
const [loginPassword, setLoginPassword] = useState("");


  const [showOrders, setShowOrders] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  useEffect(() => {
  if (!showOrders) return;

  const interval = setInterval(() => {
    fetchMyOrders();
  }, 5000);

  return () => clearInterval(interval);
}, [showOrders]);
  

  // baaki tumhare states...
const [isLoggedIn, setIsLoggedIn] = useState(
  !!localStorage.getItem("accessToken")
);
const signupUser = async () => {
  if (!signupUsername || !signupPassword) {
    alert("Please enter username and password.");
    return;
  }

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/signup/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: signupUsername,
          password: signupPassword,
        }),
      }
    );
          const data = await response.json();

      if (response.ok) {
        alert("Account created successfully!");
        setShowSignup(false);
        setSignupUsername("");
        setSignupPassword("");
      } else {
        alert(data.error || "Signup failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };
    const loginUser = async () => {
  if (!loginUsername || !loginPassword) {
    alert("Please enter username and password.");
    return;
  }

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/login/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("accessToken", data.access);
      setIsLoggedIn(true);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("username", data.username);
      localStorage.setItem("username", data.username);

      alert("Login successful!");

      setShowLogin(false);
      setLoginUsername("");
      setLoginPassword("");
    } else {
      alert(data.error || "Login failed.");
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong.");
  }
};



useEffect(() => {
  fetch("https://pizzawale-backend.onrender.com/api/pizzas/")
    .then((response) => response.json())
    .then((data) => {
      setPizzas(data);
    })
    .catch((error) => {
      console.error("Error fetching pizzas:", error);
    });
}, []);

const getLocation = () => {
  if (!navigator.geolocation) {
    alert("Location is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );

    const data = await response.json();

    if (data.display_name) {
      setAddress(data.display_name);
      alert("Location detected successfully!");
    } else {
      setAddress(`Latitude: ${latitude}, Longitude: ${longitude}`);
      alert("Location detected, but address could not be found.");
    }
  } catch (error) {
    console.error(error);
    setAddress(`Latitude: ${latitude}, Longitude: ${longitude}`);
    alert("Unable to convert location into address.");
  }
},
    
    () => {
      alert("Unable to get your location. Please allow location access.");
    }
  );
};
const placeOrder = async () => {
  const accessToken = localStorage.getItem("accessToken");

if (!accessToken) {
  alert("Please login first to place an order.");
  setShowLogin(true);
  return;
}
  if (!customerName || !mobile || !address) {
    alert("Please fill all delivery details.");
    return;
  }

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const orderData = {
  customer_name: customerName,
  mobile: mobile,
  address: address,
  latitude: latitude,
  longitude: longitude,
  total_amount: cartTotal + 30,
  payment_method: "COD",
    items: cart.map((item) => ({
      pizza: item.id,
      quantity: item.quantity,
      price: item.price,
    })),
  };
  

  try {
    const response = await fetch("http://127.0.0.1:8000/api/orders/", {
      method: "POST",
      headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
},
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (response.ok) {
  setOrderStatus(data.status);
  setOrderId(data.id);
  alert(`Order placed successfully! Order #${data.id}\nPayment Method: Cash on Delivery (COD)`);
  setCart([]);
setCheckoutOpen(false);
} else {
      console.error(data);
      alert("Please Log In.");
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong.");
  }
};
const checkOrderStatus = async (orderId) => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) return;

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/orders/${orderId}/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) return;

    const data = await response.json();
    setOrderStatus(data.status);
  } catch (error) {
    console.error("Status check failed:", error);
  }
};

useEffect(() => {
  if (!orderId) return;

  const interval = setInterval(() => {
    checkOrderStatus(orderId);
  }, 5000);

  return () => clearInterval(interval);
}, [orderId]);



  const addToCart = (pizza) => {
  setCart((current) => {
    const existingItem = current.find(
      (item) => item.id === pizza.id
    );

    if (existingItem) {
      return current.map((item) =>
        item.id === pizza.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    return [...current, { ...pizza, quantity: 1 }];
  });
};
const increaseQuantity = (id) => {
  setCart((current) =>
    current.map((item) =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  );
};

const decreaseQuantity = (id) => {
  setCart((current) =>
    current
      .map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
};

const removeFromCart = (id) => {
  setCart((current) =>
    current.filter((item) => item.id !== id)
  );
};

  const cartTotal = cart.reduce(
  (total, item) => total + item.price * item.quantity,
  0
);
const handleSearch = () => {
  const term = searchTerm.trim().toLowerCase();

  if (!term) {
    setActiveCategory("All");
    return;
  }

  const foundPizza = pizzas.find((pizza) =>
    pizza.name.toLowerCase().includes(term)
  );

  if (foundPizza) {
    setActiveCategory("All");

    setTimeout(() => {
      document
        .getElementById(`pizza-${foundPizza.id}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 100);
  } else {
    alert("Pizza not found. Try another name.");
  }
};
  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">
        <div className="navbar-inner">

          <a className="brand" href="#">
            <div className="brand-icon">🍕</div>
            <div>
              <strong>Pizza<span>Wale</span></strong>
              <small>Fresh • Fast • Local</small>
            </div>
          </a>

          <nav className={`nav-links ${mobileMenu ? "show" : ""}`}>
            <a href="#home">Home</a>
            <a href="#menu">Menu</a>
            <a href="#offers">Offers</a>
            <a href="#about">About</a>
          </nav>

          <div className="nav-actions">
            <button className="location-mini">
              <span>📍</span>
              <div>
                <small>Deliver to</small>
                <strong>Select location</strong>
              </div>
            </button>

             {!isLoggedIn && (
  <>
    <button
      className="signup-button"
      onClick={() => setShowSignup(true)}
    >
      Sign Up
    </button>

    <button
      className="signup-button"
      onClick={() => setShowLogin(true)}
    >
      Login
    </button>
  </>
)}



{isLoggedIn && (
  <button
    className="signup-button"
    onClick={fetchMyOrders}
  >
    My Orders
  </button>
)}
<button
  className="signup-button"
  onClick={() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
  }}
>
  Logout
</button>
<button
  className="cart-button"
  onClick={() => setCartOpen(true)}
>
  🛒
</button>           
  
             

            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              ☰
            </button>
          </div>

        </div>
      </header>

      {/* HERO */}
      <main>

        <section className="hero" id="home">
          <div className="hero-container">

            <div className="hero-content">

              <div className="delivery-badge">
                <span>⚡</span>
                Fast delivery in your area
              </div>

              <h1>
                Your favorite pizza,
                <span> delivered hot.</span>
              </h1>

              <p>
                Freshly baked pizzas made with quality ingredients,
                delivered straight to your doorstep.
              </p>

              
<div className="hero-search">
  <span>🔎</span>
  <input
    type="text"
    placeholder="Search for pizza, burger or drinks..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleSearch();
    }}
  />
  <button onClick={handleSearch}>Search</button>
</div>


              <div className="hero-stats">
                <div>
                  <strong>20+</strong>
                  <span>Menu items</span>
                </div>

                <div>
                  <strong>30 min</strong>
                  <span>Average delivery</span>
                </div>

                <div>
                  <strong>4.8 ⭐</strong>
                  <span>Customer rating</span>
                </div>
              </div>

            </div>

            <div className="hero-image-area">
              <div className="hero-circle"></div>

              <img
                src="https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1000&q=90"
                alt="Fresh pizza"
              />

              <div className="floating-card rating-card">
                <span>⭐</span>
                <div>
                  <strong>4.8/5</strong>
                  <small>Top rated</small>
                </div>
              </div>

              <div className="floating-card offer-card">
                <span>🔥</span>
                <div>
                  <strong>20% OFF</strong>
                  <small>On first order</small>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* LOCATION */}
        <section className="location-section">
          <div className="location-card">

            <div className="location-symbol">
              📍
            </div>

            <div className="location-text">
              <small>DELIVERY LOCATION</small>
              <h3>Where should we deliver?</h3>
              <p>
                Select your location to check delivery availability.
              </p>
            </div>

            <button
  className="location-button"
  onClick={getLocation}
>
  📍 Use My Location
</button>

          </div>
        </section>

        {/* CATEGORIES */}
        <section className="section" id="menu">

          <div className="section-header">
            <div>
              <small className="section-label">EXPLORE</small>
              <h2>What are you craving?</h2>
            </div>

            <a href="#menu">View all →</a>
          </div>

          <div className="categories">
            {categories.map((category) => (
              <button
                key={category.name}
                className={
                  activeCategory === category.name
                    ? "category active"
                    : "category"
                }
                onClick={() => setActiveCategory(category.name)}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

        </section>

        {/* PIZZAS */}
        <section className="section pizza-section">

          <div className="section-header">
            <div>
              <small className="section-label">CUSTOMER FAVORITES</small>
              <h2>Popular near you</h2>
            </div>

            <button className="view-menu">
              View full menu →
            </button>
          </div>

          <div className="pizza-grid">

            {pizzas.map((pizza) => (
              <article
  className="pizza-card"
  key={pizza.id}
  id={`pizza-${pizza.id}`}
>
                <div className="pizza-photo">

                  <img
                    src={pizza.image}
                    alt={pizza.name}
                  />

                  <span className="discount">
                    {Math.round(
                      ((pizza.oldPrice - pizza.price) /
                        pizza.oldPrice) *
                        100
                    )}
                    % OFF
                  </span>

                  <button className="heart">
                    ♡
                  </button>

                </div>

                <div className="pizza-details">

                  <div className="pizza-title">
                    <div>
                      <span className="veg-dot"></span>
                      <h3>{pizza.name}</h3>
                    </div>

                    <span className="rating">
                      ★ 4.8
                    </span>
                  </div>

                  <span className="pizza-category">
                    {pizza.category}
                  </span>

                  <p>{pizza.description}</p>

                  <div className="pizza-footer">

                    <div className="price">
                      <strong>₹{pizza.price}</strong>
                      <del>₹{pizza.old_price}</del>
                    </div>

                    <button
                      className="add-button"
                      onClick={() => addToCart(pizza)}
                    >
                      + Add
                    </button>

                  </div>

                </div>

              </article>
            ))}

          </div>

        </section>

        {/* OFFER */}
        <section className="offer-section" id="offers">

          <div className="offer-content">
            <span className="offer-label">LIMITED TIME OFFER</span>

            <h2>
              Get 20% off on your
              <br />
              first order.
            </h2>

            <p>
              Use code <strong>WELCOME20</strong> at checkout
              and enjoy your first pizza with us.
            </p>

            <button>
              Order now →
            </button>
          </div>

          <div className="offer-pizza">
            🍕
          </div>

        </section>

        {/* WHY US */}
        <section className="why-section" id="about">

          <div className="section-header centered">
            <div>
              <small className="section-label">WHY PIZZA WALE</small>
              <h2>Made for your cravings</h2>
            </div>
          </div>

          <div className="why-grid">

            <div className="why-card">
              <span>🍕</span>
              <h3>Freshly Made</h3>
              <p>
                Every order is prepared fresh after you place it.
              </p>
            </div>

            <div className="why-card">
              <span>⚡</span>
              <h3>Fast Delivery</h3>
              <p>
                We deliver hot and fresh food right to your door.
              </p>
            </div>

            <div className="why-card">
              <span>💯</span>
              <h3>Quality Ingredients</h3>
              <p>
                We use fresh ingredients and premium cheese.
              </p>
            </div>

            <div className="why-card">
              <span>❤️</span>
              <h3>Local & Trusted</h3>
              <p>
                Your local pizza shop, made for your neighborhood.
              </p>
            </div>

          </div>

        </section>

      </main>

      {/* CART DRAWER */}

{cartOpen && (
  <div
    className="cart-overlay"
    onClick={() => setCartOpen(false)}
  >
    <div
      className="cart-drawer"
      onClick={(e) => e.stopPropagation()}
    >

      {/* Header */}
      <div className="cart-header">
        <div>
          <h2>Your Cart</h2>
          <p>{cart.length} item(s)</p>
        </div>

        <button
          className="close-cart"
          onClick={() => setCartOpen(false)}
        >
          ×
        </button>
      </div>

      {/* Cart Items */}
      {cart.length === 0 ? (

        <div className="empty-cart">
          <div>🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add something delicious to get started.</p>

          <button
            onClick={() => setCartOpen(false)}
          >
            Browse Menu
          </button>
        </div>

      ) : (

        <>
          <div className="cart-items">

            {cart.map((item) => (
              <div className="cart-item" key={item.id}>

                <img
                  src={item.image}
                  alt={item.name}
                />

                <div className="cart-item-info">

                  <h3>{item.name}</h3>

                  <strong>
                    ₹{item.price * item.quantity}
                  </strong>

                  <div className="quantity">

                    <button
                      onClick={() =>
                        decreaseQuantity(item.id)
                      }
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        increaseQuantity(item.id)
                      }
                    >
                      +
                    </button>

                  </div>

                </div>

                <button
                  className="remove-item"
                  onClick={() =>
                    removeFromCart(item.id)
                  }
                >
                  🗑️
                </button>

              </div>
            ))}

          </div>

          {/* Summary */}
          <div className="cart-summary">

            <div>
              <span>Subtotal</span>
              <strong>₹{cartTotal}</strong>
            </div>

            <div>
              <span>Delivery</span>
              <strong>₹30</strong>
            </div>

            <div className="cart-total">
              <span>Total</span>
              <strong>₹{cartTotal + 30}</strong>
            </div>

            <button
              className="checkout-button"
               onClick={() => {
              setCartOpen(false);
                setCheckoutOpen(true);
                 }}
>
  Proceed to Checkout →
</button>

          </div>
        </>

      )}

    </div>
  </div>
)}
{/* CHECKOUT */}
{showSignup && (
  <div className="checkout-overlay">
    <div className="checkout-box">

      <div className="checkout-header">
        <div>
          <h2>Create Account</h2>
          <p>Sign up to track your orders</p>
        </div>

        <button
          className="close-cart"
          onClick={() => setShowSignup(false)}
        >
          ×
        </button>
      </div>

      <div className="checkout-content">

        <input
          type="text"
          placeholder="Username"
          value={signupUsername}
          onChange={(e) => setSignupUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={signupPassword}
          onChange={(e) => setSignupPassword(e.target.value)}
        />

        <button
          className="place-order-button"
          onClick={signupUser}
        >
          Create Account →
        </button>

      </div>

    </div>
  </div>
)}
{showLogin && (
  <div className="checkout-overlay">
    <div className="checkout-box">

      <div className="checkout-header">
        <div>
          <h2>Welcome Back</h2>
          <p>Login to your account</p>
        </div>

        <button
          className="close-cart"
          onClick={() => setShowLogin(false)}
        >
          ×
        </button>
      </div>

      <div className="checkout-content">

        <input
          type="text"
          placeholder="Username"
          value={loginUsername}
          onChange={(e) => setLoginUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
        />

        <button
          className="place-order-button"
          onClick={loginUser}
        >
          Login →
        </button>

      </div>

    </div>
  </div>
)}
{checkoutOpen && (
  <div className="checkout-overlay">
    <div className="checkout-box">

      <div className="checkout-header">
        <div>
          <h2>Checkout</h2>
          <p>Complete your order</p>
        </div>

        <button
          className="close-cart"
          onClick={() => setCheckoutOpen(false)}
        >
          ×
        </button>
      </div>

      <div className="checkout-content">
      {orderStatus && (
  <div className="order-tracking">
    <strong>Order Status</strong>

    <div className="tracking-steps">

      <div className={`tracking-step ${["pending", "accepted", "preparing", "out_for_delivery", "delivered"].includes(orderStatus) ? "active" : ""}`}>
        <span>1</span>
        <p>Order Received</p>
      </div>

      <div className={`tracking-step ${["accepted", "preparing", "out_for_delivery", "delivered"].includes(orderStatus) ? "active" : ""}`}>
        <span>2</span>
        <p>Accepted</p>
      </div>

      <div className={`tracking-step ${["preparing", "out_for_delivery", "delivered"].includes(orderStatus) ? "active" : ""}`}>
        <span>3</span>
        <p>Preparing</p>
      </div>

      <div className={`tracking-step ${["out_for_delivery", "delivered"].includes(orderStatus) ? "active" : ""}`}>
        <span>4</span>
        <p>Out for Delivery</p>
      </div>

      <div className={`tracking-step ${orderStatus === "delivered" ? "active" : ""}`}>
        <span>5</span>
        <p>Delivered</p>
      </div>

    </div>
  </div>
)}
{orderId && (
  <div className="order-info">
    <strong>Order #{orderId}</strong>

    <p>
      {orderStatus === "pending" &&
        "We have received your order."}

      {orderStatus === "accepted" &&
        "The shop has accepted your order."}

      {orderStatus === "preparing" &&
        "Your pizza is being prepared. 🍕"}

      {orderStatus === "out_for_delivery" &&
        "Your order is on the way. 🛵"}

      {orderStatus === "delivered" &&
        "Enjoy your pizza! 🎉"}

      {orderStatus === "cancelled" &&
        "This order has been cancelled."}
    </p>
  </div>
)}
        <h3>Delivery Details</h3>

        <input
  type="text"
  placeholder="Your Name"
  value={customerName}
  onChange={(e) => setCustomerName(e.target.value)}
/>

       <input
  type="tel"
  placeholder="Mobile Number"
  value={mobile}
  onChange={(e) => setMobile(e.target.value)}
/>

        <textarea
  placeholder="Enter your complete delivery address"
  rows="4"
  value={address}
  onChange={(e) => setAddress(e.target.value)}
/>

        <button
  className="location-button"
  onClick={getLocation}
>
  📍 Use My Location
</button>

        <h3>Order Summary</h3>

        {cart.map((item) => (
          <div className="checkout-item" key={item.id}>
            <span>
              {item.name} × {item.quantity}
            </span>

            <strong>
              ₹{item.price * item.quantity}
            </strong>
          </div>
        ))}

        <div className="checkout-total">
          <span>Total</span>
          <strong>₹{cartTotal + 30}</strong>
        </div>

        <button
  className="place-order-button"
  onClick={placeOrder}
>
  Place Order →
</button>

      </div>
    </div>
  </div>
)}
      {cart.length > 0 && (
        <div className="cart-bar">

          <div>
            <strong>{cart.length} item{cart.length > 1 ? "s" : ""}</strong>
            <span>₹{cartTotal}</span>
          </div>

          <button onClick={() => setCartOpen(true)}>
  View Cart →
</button>

        </div>
      )}

      {/* FOOTER */}
      <footer>

        <div className="footer-main">

          <div className="footer-brand">
            <a className="brand">
              <div className="brand-icon">🍕</div>
              <div>
                <strong>Pizza<span>Wale</span></strong>
                <small>Fresh • Fast • Local</small>
              </div>
            </a>

            <p>
              Your local pizza shop serving fresh,
              delicious food right to your doorstep.
            </p>
          </div>

          <div>
            <h4>Company</h4>
            <a href="#about">About us</a>
            <a href="#">Contact</a>
            <a href="#">Careers</a>
          </div>

          <div>
            <h4>Help</h4>
            <a href="#">FAQs</a>
            <a href="#">Delivery</a>
            <a href="#">Privacy</a>
          </div>

          <div>
            <h4>Contact</h4>
            <p>📍 Your Local Area</p>
            <p>📞 +91 XXXXX XXXXX</p>
            <p>🕐 11:00 AM – 11:00 PM</p>
          </div>

        </div>

        <div className="footer-bottom">
          <span>© 2026 PizzaWale</span>
          <span>Made with ❤️ for pizza lovers</span>
        </div>

      </footer>
    

    {showOrders && (
      <div className="orders-overlay">
        <div className="orders-box">
          <button
            className="close-cart"
            onClick={() => setShowOrders(false)}
          >
            ✕
          </button>

          <h2>My Orders</h2>

          {myOrders.length === 0 ? (
  <p>No orders found.</p>
) : (
  myOrders.map((order) => (
    <div className="order-card" key={order.id}>
      <h3>Order #{order.id}</h3>

      <p>
        <strong>Status:</strong>{" "}
<span className={`status-badge status-${order.status}`}>
  {order.status.replaceAll("_", " ")}
</span>
      </p>
      <div className="order-timeline">
  <div className={order.status === "pending" ? "active" : ""}>
    🟡 <span>Pending</span>
  </div>

  <div className={order.status === "accepted" ? "active" : ""}>
    🔵 <span>Accepted</span>
  </div>

  <div className={order.status === "preparing" ? "active" : ""}>
    🟠 <span>Preparing</span>
  </div>

  <div className={order.status === "out_for_delivery" ? "active" : ""}>
    🟣 <span>Out for Delivery</span>
  </div>

  <div className={order.status === "delivered" ? "active" : ""}>
    🟢 <span>Delivered</span>
  </div>
</div>

      <p>
        <strong>Total:</strong> ₹{order.total_amount}
      </p>

      <p>
        <strong>Address:</strong> {order.address}
      </p>

      <p>
        <strong>Items:</strong>
      </p>

      {order.items.map((item, index) => {
  const pizza = pizzas.find((p) => p.id === item.pizza);

  return (
    <div key={index}>
      {pizza ? pizza.name : "Pizza"} × {item.quantity} — ₹{item.price}
    </div>
  );
})}

      <small>
        {new Date(order.created_at).toLocaleString()}
      </small>
    </div>
  ))
)}
        </div>
      </div>
    )}

  </div>
);
}

export default App;