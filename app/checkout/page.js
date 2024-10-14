"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Script from "next/script";

export default function CheckoutPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [cartItems, setCartItems] = useState([]);
  const [contactNumber, setContactNumber] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [isCar, setIsCar] = useState(false); // Toggle for car field
  const [error, setError] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const taxRate = 0.18; // 18% tax rate

  useEffect(() => {
    const items = [];
    const params = Array.from(searchParams.entries());

    for (let i = 0; i < params.length; i += 3) {
      const name = params[i] ? params[i][1] : null;
      const quantity = params[i + 1] ? params[i + 1][1] : null;
      const price = params[i + 2] ? params[i + 2][1] : null;

      if (name && quantity && price) {
        items.push({
          name: decodeURIComponent(name),
          quantity: parseInt(quantity, 10),
          price: parseFloat(price),
        });
      }
    }

    setCartItems(items);
  }, [searchParams]);

  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cartItems]);

  const totalWithTax = totalPrice * (1 + taxRate);

  const sms = (response) => {
    console.log("Payment Successful. Sending SMS...");
    console.log(response);
  };

  const handlePayment = async () => {
    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalWithTax * 100,
          currency: "INR",
          receipt: `receipt#${Math.floor(Math.random() * 1000)}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();

      if (!data || !data.id) {
        setError("Error creating order. Please try again.");
        return;
      }

      openRazorpay(data.id);
    } catch (error) {
      console.error("Error creating payment:", error);
      setError("Payment processing error. Please try again.");
    }
  };

  const openRazorpay = (orderId) => {
    const options = {
      key: "rzp_live_goVduJKgKARu0e",
      amount: totalWithTax * 100,
      currency: "INR",
      name: "MomoLand",
      description: "Payment for order",
      order_id: orderId,
      handler: function (response) {
        alert("Payment successful!");
        console.log("Payment Response:", response);
        sms(response);
      },
      prefill: {
        contact: contactNumber,
        name: isCar ? vehicleNumber : tableNumber,
      },
      theme: {
        color: "#F37254",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!contactNumber || (!isCar && !tableNumber) || (isCar && !vehicleNumber)) {
      setError("Please fill in all the required fields.");
      return;
    }

    if (contactNumber.length !== 10) {
      setError("Contact number must be 10 digits.");
      return;
    }

    setError("");
    handlePayment();
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <div>
        <header className="flex justify-between p-4 bg-gray-800 text-white">
          <div className="logo">Logo</div>
          <div className="cart">
            <button className="flex items-center">
              <span className="mr-2">Cart</span>
              <span className="bg-red-500 px-2 py-1 rounded-full">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </button>
            {/* Toggle for Car */}
            <div className="flex items-center ml-4">
              <label className="mr-2">Car:</label>
              <input
                type="checkbox"
                checked={isCar}
                onChange={() => setIsCar(!isCar)}
              />
            </div>
          </div>
        </header>

        <main className="p-4">
          <h2 className="text-2xl font-bold mb-4">Checkout</h2>

          <form onSubmit={handleSubmit} className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Fill in Your Details</h3>
            <div className="mb-4">
              <label className="block mb-2">Contact Number</label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="border p-2 w-full"
                placeholder="Enter your contact number"
                required
              />
            </div>
            {/* Conditionally render input for vehicle number or table number */}
            {isCar ? (
              <div className="mb-4">
                <label className="block mb-2">Vehicle Number</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="border p-2 w-full"
                  placeholder="Enter your vehicle number"
                  required
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block mb-2">Table Number</label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="border p-2 w-full"
                  placeholder="Enter your table number"
                  required
                />
              </div>
            )}

            {error && <p className="text-red-500 mb-4">{error}</p>}
          </form>

          <h3 className="text-xl font-semibold mb-2">Bill Details</h3>
          <div className="border p-4 mb-4">
            <p>
              <strong>Bill Date:</strong> {new Date().toLocaleString()}
            </p>
            <p>
              <strong>{isCar ? "Vehicle No." : "Table No."}:</strong>{" "}
              {isCar ? vehicleNumber : tableNumber || "Not provided"}
            </p>
            <p>
              <strong>Contact No.:</strong> +91-{contactNumber || "Not provided"}
            </p>

            <h4 className="font-semibold mt-4">Description</h4>
            <ul>
              {cartItems.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span>
                    {item.name} (x{item.quantity})
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <h4 className="font-semibold mt-4">Summary</h4>
            <p>
              <strong>Total excluding Discount & Tax:</strong> ₹{totalPrice.toFixed(2)}
            </p>
            <p>
              <strong>Taxes (SGST (9%) + CGST (9%)):</strong> ₹
              {(totalPrice * taxRate).toFixed(2)}
            </p>
            <p>
              <strong>Total Amount:</strong> ₹{totalWithTax.toFixed(2)}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Proceed to Pay
          </button>
        </main>
      </div>
    </>
  );
}
