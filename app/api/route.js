import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: "rzp_live_goVduJKgKARu0e", // Replace with your actual Razorpay key ID
    key_secret: "WE48UVKxlJmdHLmtNYZhEtJg", // Replace with your actual Razorpay key secret
  });
  

export async function POST(req) {
  const { amount, currency, receipt } = await req.json(); // Parse JSON body

  try {
    const options = {
      amount, // amount in paise
      currency,
      receipt,
    };
    const order = await razorpay.orders.create(options);
    return new Response(JSON.stringify(order), { status: 200 });
  } catch (error) {
    console.error("Error creating order:", error);
    return new Response(JSON.stringify({ error: "Failed to create order" }), { status: 500 });
  }
}
