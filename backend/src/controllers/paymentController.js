const stripe = require("../config/stripe");
const paymentService = require("../services/paymentService");

// Funkcja rozpoczyna płatność: tworzy sesję Checkout i zwraca URL do przekierowania na Stripe.
const checkout = async (req, res, next) => {
  try {
    const url = await paymentService.createCheckoutSession(
      req.user,
      req.params.courseId
    );
    res.json({ url });
  } catch (err) {
    next(err);
  }
};

// Funkcja potwierdza płatność po powrocie użytkownika ze strony Stripe (na podstawie sessionId).
const confirm = async (req, res, next) => {
  try {
    const result = await paymentService.confirmPayment(
      req.user,
      req.body.sessionId
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Funkcja obsługuje webhook Stripe. Weryfikuje podpis zdarzenia kluczem webhooka,
// a następnie przekazuje zdarzenie do serwisu. Wymaga surowego body (ustawione w app.js).
const webhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  try {
    await paymentService.handleWebhookEvent(event);
  } catch (err) {
    // Błąd przetwarzania nie powinien skutkować ponawianiem przez Stripe w nieskończoność.
    console.error("Błąd obsługi webhooka:", err.message);
  }
  res.json({ received: true });
};

module.exports = { checkout, confirm, webhook };
