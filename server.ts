import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- M-Pesa Integration ---
  const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
  const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
  const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || "174379";
  const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
  const MPESA_CALLBACK_URL = `${process.env.APP_URL}/api/mpesa/callback`;

  const getMpesaToken = async () => {
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");
    const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` },
    });
    return response.data.access_token;
  };

  app.post("/api/mpesa/stkpush", async (req, res) => {
    const { phone, amount, orderId } = req.body;
    try {
      const token = await getMpesaToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
      const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64");

      const response = await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
          BusinessShortCode: MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: phone, // e.g., 2547XXXXXXXX
          PartyB: MPESA_SHORTCODE,
          PhoneNumber: phone,
          CallBackURL: MPESA_CALLBACK_URL,
          AccountReference: `Tiketi-${orderId}`,
          TransactionDesc: "Event Ticket Payment",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      res.json(response.data);
    } catch (error: any) {
      console.error("M-Pesa STK Push Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to initiate STK Push" });
    }
  });

  app.post("/api/mpesa/callback", (req, res) => {
    const callbackData = req.body.Body.stkCallback;
    console.log("M-Pesa Callback Received:", JSON.stringify(callbackData, null, 2));
    
    // In a real app, you'd update Firestore here.
    // Since we're in a sandbox, we'll just log it.
    // The frontend will poll for status or we'd use a webhook to update the order.
    
    res.json({ ResultCode: 0, ResultDesc: "Success" });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
