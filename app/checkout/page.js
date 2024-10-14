"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Script from "next/script";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from '../footer'

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
const router = useRouter()
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

  const sms = () => {
    console.log("Payment Successful. Sending SMS...");
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
      key: "rzp_test_jdutmfAZasYbrp",
      amount: totalWithTax * 100,
      currency: "INR",
      name: "MomoLand",
      description: "Payment for order",
      order_id: orderId,
      handler: function (response) {
        
        router.push("/")
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
      <header className="flex justify-between p-4 " style={{backgroundColor:"#f0eae5"}}>
      <div className="logo"><Image src="/img/logo.png" alt="logo" width={50} height={50}/></div>
          <div className="cart flex">
            <button className="flex items-center">
            <span className="mr-2"><i class="fa-solid fa-cart-shopping" style={{color:"#5a0005", fontSize:"1.05em"}}></i></span>
              <span  style={{color:"white", backgroundColor:"#5a0005",width:"20px" , height:"20px",borderRadius:"50%",fontSize:".8em"}}>
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </button>
            {/* Toggle for Car */}
            <div className="flex items-center ml-4">
  <label className="mr-2">Car</label>
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      id="car-toggle"
      className="sr-only"
      checked={isCar}
      onChange={() => setIsCar(!isCar)}
    />
   <div
  className="block w-10 h-6 rounded-full"
  style={{
    backgroundColor: isCar ? "#5a0005" : "gray",
  }}
></div>

    <div
      className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
        isCar ? "transform translate-x-4" : ""
      }`}
    ></div>
  </label>
</div>

          </div>
        </header>
       
        <main className="p-4">
          <h2 className="text-2xl font-bold mb-4 text-center " style={{color:"#5a0005"}}>Checkout</h2>

          <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-100">
            {/* <h3 className="text-xl font-semibold mb-2 text-center">Fill in Your Details</h3> */}
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

          {/* <h3 className="text-xl font-semibold mb-2 text-center">Bill Details</h3> */}
          <div className="border p-4 mb-4">
          <p className="w-full flex justify-between">
  <strong>Bill Date:</strong>
  <span>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
</p>

<p className="w-full flex justify-between">
  <strong>{isCar ? "Vehicle No." : "Table No."}:</strong>
  <span>{isCar ? vehicleNumber : tableNumber || "Not provided"}</span>
</p>
<p className="w-full flex justify-between">
  <strong>Contact No.:</strong>
  <span>+91-{contactNumber || "Not provided"}</span>
</p>
<hr className="mt-4 border-dotted border-1 border-gray-500" />


            <h4 className="font-semibold mt-4">Items</h4>
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
            <hr className="mt-4 border-dotted border-1 border-gray-500" />

            <h4 className="font-semibold mt-4"></h4>
            <p className="w-full flex justify-between">
  <strong>Amount:</strong> 
  <span>₹{totalPrice.toFixed(2)}</span>
</p>
<p className="w-full flex justify-between">
  <strong>Taxes (GST 18%):</strong> 
  <span>₹{(totalPrice * taxRate).toFixed(2)}</span>
</p>
<hr className="mt-4 border-dotted border-1 border-gray-500" />

<p className="w-full flex justify-between mt-4">
  <strong>Total Amount:</strong> 
  <span>₹{totalWithTax.toFixed(2)}</span>
</p>

          </div>

          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded w-full mx-auto"
          >
            Proceed to Pay
          </button>
        </main>
      </div>
    <Footer/>

    </>
  );
}
