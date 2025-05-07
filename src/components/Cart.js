import React from "react";
import withContext from "../withContext";
import CartItem from "./CartItem";

const Cart = props => {
  const { cart } = props.context;
  const cartKeys = Object.keys(cart || {});
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-center container">
        <h4 className="title">Cart</h4>
       
      </div>
      <br />
      <div className="container">
        {cartKeys.length ? (
          <div className="">
            {cartKeys.map(key => (
              <CartItem
                cartKey={key}
                key={key}
                cartItem={cart[key]}
                removeFromCart={props.context.removeFromCart}
              />
            ))}
            <div className="column is-12 is-clearfix">
              <br />
              <div className="is-pulled-right">
                <button
                  onClick={props.context.clearCart}
                  className="button rounded-pill "
                >
                  Clear cart
                </button>{" "}
                <button
                  className="button rounded-pill"
                  onClick={props.context.checkout}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="container">
            <div className="title has-text-grey-light">No item in cart!</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withContext(Cart);