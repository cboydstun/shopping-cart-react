import React, { useContext, useEffect, useRef } from "react";
import { ShopContext } from "../../context/shop-context";
import { PRODUCTS } from "../../products";
import { CartItem } from "./cart-item";
import { useNavigate } from "react-router-dom";

import "./cart.css";

export const Cart = () => {
  const { cartItems, getTotalCartAmount, checkout } = useContext(ShopContext);
  const totalAmount = getTotalCartAmount();

  const navigate = useNavigate();

  const paypalRef = useRef();
  const paypalButtonRef = useRef(null); // Reference to store the PayPal button instance

  useEffect(() => {
    if (window.paypal && totalAmount > 0 && !paypalButtonRef.current) {
      paypalButtonRef.current = window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                description: "Your purchase from our shop",
                amount: {
                  currency_code: "USD",
                  value: totalAmount,
                },
              },
            ],
          });
        },
        onApprove: async (data, actions) => {
          await actions.order.capture();
          checkout();
          navigate("/");
        },
        onError: (err) => {
          console.error(err);
        },
      });

      paypalButtonRef.current.render(paypalRef.current);
    }

    // Cleanup - this will run when the component unmounts or if totalAmount changes
    return () => {
      if (paypalButtonRef.current) {
        paypalButtonRef.current.close();
        paypalButtonRef.current = null;
      }
    };
  }, [totalAmount, checkout, navigate]);

  return (
    <div className="cart">
      <div>
        <h1>Your Cart Items</h1>
      </div>
      <div className="cart">
        {PRODUCTS.map((product) => {
          if (cartItems[product.id] !== 0) {
            return <CartItem key={product.id} data={product} />;
          }
          return null;
        })}
      </div>

      {totalAmount > 0 ? (
        <div className="checkout">
          <p> Subtotal: ${totalAmount} </p>
          <button onClick={() => navigate("/")}> Continue Shopping </button>
          <div ref={paypalRef}></div>
        </div>
      ) : (
        <h1> Your Shopping Cart is Empty</h1>
      )}
    </div>
  );
};
