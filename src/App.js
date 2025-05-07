import React, { Component } from "react";
import { Routes, Route, BrowserRouter as Router, NavLink } from "react-router-dom";

import AddProduct from './components/AddProduct';
import Cart from './components/Cart';
import Login from './components/Login';
import ProductList from './components/ProductList';

import Context from "./Context";

import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import HomePage from "./components/HomePage";
import ContactUs from "./components/ContactUs";
import Footer from "./components/SharedUtils/Footer";
import Register from "./components/Register";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      cart: {},
      products: [],
      showMenu: false,
      showPhoneModal: false, 
      phoneNumberInput: ''   
    };
    this.routerRef = React.createRef();
  }

 
  async componentDidMount() {
    let user = localStorage.getItem("user");
    let cart = localStorage.getItem("cart");
  
    const products = await axios.get('https://ecom-backend-0dq5.onrender.com/products');
    user = user ? JSON.parse(user) : null;
    cart = cart? JSON.parse(cart) : {};
  
    this.setState({ user,  products: products.data, cart });
  }

  login = async (email, password) => {
    const res = await axios.post(
      'https://ecom-backend-0dq5.onrender.com/login',
      { email, password },
    ).catch((res) => {
      return { status: 401, message: 'Unauthorized' }
    })
  
    if(res.status === 200) {
      const { email } = jwtDecode(res.data.accessToken)
      const user = {
        email,
        token: res.data.accessToken,
        accessLevel: email === 'admin@example.com' ? 0 : 1
      }
  
      this.setState({ user });
      localStorage.setItem("user", JSON.stringify(user));
      return true;
    } else {
      return false;
    }
  }

  register = async (email, password) => {
    const res = await axios.post(
      'https://ecom-backend-0dq5.onrender.com/register',
      { email, password },
    ).catch((res) => {
      return { status: 400, message: 'Registration failed' }
    });

    if(res.status === 201) {
      return this.login(email, password);
    } else {
      return false;
    }
  };
  
  logout = e => {
    e.preventDefault();
    this.setState({ user: null });
    localStorage.removeItem("user");
  };

  addProduct = (product, callback) => {
    let products = this.state.products.slice();
    products.push(product);
    this.setState({ products }, () => callback && callback());
  };

  addToCart = cartItem => {
    let cart = this.state.cart;
    if (cart[cartItem.id]) {
      cart[cartItem.id].amount += cartItem.amount;
    } else {
      cart[cartItem.id] = cartItem;
    }
    if (cart[cartItem.id].amount > cart[cartItem.id].product.stock) {
      cart[cartItem.id].amount = cart[cartItem.id].product.stock;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });
  };

  removeFromCart = cartItemId => {
    let cart = this.state.cart;
    delete cart[cartItemId];
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });
  };
  
  clearCart = () => {
    let cart = {};
    localStorage.removeItem("cart");
    this.setState({ cart });
  };

  contact = async (contactData) => {
    try {
      const response = await axios.post('https://ecom-backend-0dq5.onrender.com/contact', contactData);
      return response.data;
    } catch (error) {
      console.error('Contact form submission error:', error);
      throw error;
    }
  };

  checkout = async () => {
    if (!this.state.user) {
      this.routerRef.current.history.push("/login");
      return;
    }

    const cart = this.state.cart;
    // Calculate total cost
    const totalCost = Object.values(cart).reduce((sum, item) => 
      sum + (item.amount * item.product.price), 0);
    console.log(totalCost)

    // Show modal if no phone number in user state
    if (!this.state.phoneNumberInput) {
      this.setState({ showPhoneModal: true });
      return;
    }

    try {
      // Get phone number from user (you might want to add this to user state or get it from a form)
      const phoneNumber = this.state.phoneNumberInput;      
      // Send payment request
      const paymentResponse = await axios.post('https://ecom-backend-0dq5.onrender.com/payment', {
        amount: totalCost,
        number: phoneNumber,
        Order_ID: Date.now().toString() // Simple order ID generation
      });

      // Function to check payment and proceed with verification
    const checkPaymentAndProceed = () => {
      return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 5;
        const interval = 10000; // 10 seconds

        const checkResponse = () => {
          if (paymentResponse.data.CheckoutRequestID) {

            // Send receipt after successful payment verification
            this.verifyAndSendReceipt(paymentResponse.data.CheckoutRequestID, {
              email: this.state.user.email,
              totalCost,
              cartItems: Object.values(cart),
              orderId: paymentResponse.data.Order_ID
            });

               resolve(true);
          } else {
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(checkResponse, interval);
            } else {
              resolve(false);
            }
          }
        };

        // Start checking immediately
        checkResponse();
      });
    };

    // Wait for payment verification with timeout
    const paymentVerified = await checkPaymentAndProceed();
    if (!paymentVerified) {
      throw new Error('Payment verification timed out after 30 seconds');
    }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed. Please try again.');
    }
  };

  verifyAndSendReceipt = async (checkoutId, receiptData) => {
    let attempts = 0;
    const maxAttempts = 10;
    const interval = 1000; // 1 second

    const checkPayment = async () => {
      try {
        const response = await axios.post('https://ecom-backend-0dq5.onrender.com/payment-callback/', {
          CheckoutRequestID: checkoutId
        });

        if (response.status === 200 && response.data.ResultDesc === 'The service request is processed successfully.') {
          // Payment successful, send receipt
          await axios.post('https://ecom-backend-0dq5.onrender.com/send-receipt', {
            email: receiptData.email,
            checkoutId: checkoutId,
            totalCost: receiptData.totalCost,
            cartItems: receiptData.cartItems,
            orderId: receiptData.orderId
          });

          // Update products stock
          const cart = this.state.cart;

        const products = this.state.products.map(p => {
          if (cart[p.name]) {
            p.stock = p.stock - cart[p.name].amount;
            axios.put(`https://ecom-backend-0dq5.onrender.com/products/${p.id}`, { ...p });
          }
          return p;
        });
        this.setState({ products });
        this.clearCart();
        
          alert('Payment successful! Receipt sent to your email.');
          return true;
        }
      } catch (error) {
        console.error('Verification error:', error);
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkPayment, interval);
      } else {
        alert('Payment verification timed out. Please check your payment status.');
      }
      return false;
    };

    return checkPayment();
  };

  // Add these methods to handle modal interactions
handlePhoneSubmit = () => {
  if (this.state.phoneNumberInput.match(/^\+?2547\d{8}$/)) {
    this.setState(prevState => ({
      showPhoneModal: false,
    }), () => this.checkout()); // Continue checkout after valid input
  } else {
    alert('Please enter a valid Kenyan phone number (e.g., 2547XXXXXXXX)');
  }
};

handlePhoneInputChange = (e) => {
  this.setState({ phoneNumberInput: e.target.value });
};

handleCloseModal = () => {
  this.setState({ showPhoneModal: false });
};


  render() {
    return (
      <Context.Provider
        value={{
          ...this.state,
          removeFromCart: this.removeFromCart,
          addToCart: this.addToCart,
          login: this.login,
          register: this.register,
          addProduct: this.addProduct,
          clearCart: this.clearCart,
          checkout: this.checkout,
          contact: this.contact,
        }}
      >
        <Router ref={this.routerRef}>
        <div className="App p-2">
          {/* Modal for phone number input */}
          {this.state.showPhoneModal && (
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content shadow-lg" style={{ elevation: '10' }}>
                  <div className="modal-header">
                    <h5 className="modal-title">Enter Phone Number</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      aria-label="Close"
                      onClick={this.handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>Please provide your phone number for payment processing</p>
                    <div className="mb-3">
                      <label htmlFor="phoneInput" className="form-label">
                        Phone Number (e.g., 2547XXXXXXXX)
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phoneInput"
                        value={this.state.phoneNumberInput}
                        onChange={this.handlePhoneInputChange}
                        placeholder="2547XXXXXXXX"
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="rounded-pill bg-secondary p-2" 
                      onClick={this.handleCloseModal}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="rounded-pill p-2" 
                      onClick={this.handlePhoneSubmit}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <nav
            className="navbar navbar-expand-lg position-relative container-fluid rounded p-2 m-2"
            role="navigation"
            aria-label="main navigation"
          >
            <div className="navbar-brand">
              <img className="navbar-item is-size-4 object-fit-contain App-logo " src={process.env.PUBLIC_URL + '/logo.png'} alt="logo"/>
              <label
                role="button"
                class="navbar-burger burger"
                aria-label="menu"
                aria-expanded="false"
                data-target="navbarBasicExample"
                onClick={e => {
                  e.preventDefault();
                  this.setState({ showMenu: !this.state.showMenu });
                }}
              >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
              </label>
            </div>
              <div className={`navbar-menu container-fluid d-flex justify-content-center ${
                  this.state.showMenu ? "is-active" : ""
                }`}>
                <ul className="nav nav-pills navbar-item ">
                  <li className="nav-item m-2">
                    <NavLink
                      to="/"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'active' : ''}`
                      }
                    >
                      Home
                    </NavLink>
                  </li>
                  <li className="nav-item m-2" >
                    <NavLink
                      to="/products"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'active' : ''}`
                      }
                    >
                      Products
                    </NavLink>
                  </li>
                  {this.state.user && this.state.user.accessLevel < 1 && (
                    <li className="nav-item m-2">
                      <NavLink
                        to="/add-product"
                        className={({ isActive }) =>
                          `nav-link ${isActive ? 'active' : ''}`
                        }
                      >
                        Add Product
                      </NavLink>
                    </li>
                  )}
                  
                  
                  <li className="nav-item m-2">
                    <NavLink
                      to="/cart"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'active' : ''}`
                      }
                    >
                      Cart
                      <span
                        className="tag is-primary"
                        style={{ marginLeft: '5px' }}
                      >
                        {Object.keys(this.state.cart).length}
                      </span>
                    </NavLink>
                  </li>

                  <li className="nav-item m-2">
                    <NavLink
                      to="/contact"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'active' : ''}`
                      }
                    >
                      Contact Us
                    </NavLink>
                  </li>
                </ul>
                  
              </div>

              {!this.state.user ? (
                    <div  className="position-absolute top-0 end-0 d-flex">
                      <button className="navbar-item rounded-pill text-nowrap p-2 m-1" type='button'>
                      <NavLink
                        to="/login"
                        className={({ isActive }) =>
                          `nav-link ${isActive ? 'active' : ''}`
                        }
                      >
                        Log in
                      </NavLink>
                    </button>

                    <button className="navbar-item rounded-pill p-2 m-1" style={{ right: '100px' }}>
                    <NavLink
                      to="/register"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'active' : ''}`
                      }
                    >
                      Register
                    </NavLink>
                    </button>
                    </div>
                    
                  ) : (
                    <button className="position-absolute top-0 end-0 d-flex navbar-item rounded-pill">
                      <NavLink
                        to="/"
                        onClick={this.logout}
                        className={({ isActive }) =>
                          `nav-link ${isActive ? 'active' : ''}`
                        }
                      >
                        Log out
                      </NavLink>
                    </button>
                  )}
                
            </nav>
            
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/contact" element={<ContactUs />} />
            </Routes>
          </div>
          <Footer/>
        </Router>
        
      </Context.Provider>
    );
  }
}