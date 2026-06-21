const stripe = require("../config/stripe");
const { Payment, Course } = require("../models");
const enrollmentService = require("./enrollmentService");

// Adres frontu, na który Stripe odsyła użytkownika po płatności.
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Funkcja tworzy sesję Stripe Checkout dla płatnego kursu i zwraca URL do przekierowania.
// Zakłada wcześniej rekord płatności o statusie "pending" powiązany z sesją.
const createCheckoutSession = async (user, courseId) => {
  const course = await Course.findByPk(courseId);
  if (!course) {
    const e = new Error("Nie znaleziono kursu");
    e.status = 404;
    throw e;
  }
  if (!course.price || course.price <= 0) {
    const e = new Error("Kurs jest darmowy — zapisz się bez płatności");
    e.status = 400;
    throw e;
  }

  // Blokada ponownego zakupu już posiadanego kursu.
  const enrolled = await enrollmentService.isUserEnrolled(user.id, courseId);
  if (enrolled) {
    const e = new Error("Masz już dostęp do tego kursu");
    e.status = 400;
    throw e;
  }

  // amountGr — kwota w groszach wymagana przez Stripe (cena w zł * 100).
  const amountGr = course.price * 100;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "pln",
          unit_amount: amountGr,
          product_data: { name: course.title },
        },
        quantity: 1,
      },
    ],
    // session_id w success_url pozwala froncie potwierdzić płatność po powrocie.
    success_url: `${CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${CLIENT_URL}/courses/${courseId}`,
    // metadata wykorzystywana przez webhook do powiązania płatności z użytkownikiem i kursem.
    metadata: { userId: String(user.id), courseId: String(courseId) },
  });

  await Payment.create({
    userId: user.id,
    courseId,
    amount: amountGr,
    currency: "pln",
    status: "pending",
    stripeSessionId: session.id,
  });

  return session.url;
};

// Funkcja potwierdza płatność po powrocie z Checkout (ścieżka działająca bez webhooka).
// Pobiera sesję ze Stripe, weryfikuje opłacenie, oznacza płatność jako "paid" i zapisuje na kurs.
const confirmPayment = async (user, sessionId) => {
  if (!sessionId) {
    const e = new Error("Brak identyfikatora sesji");
    e.status = 400;
    throw e;
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const payment = await Payment.findOne({ where: { stripeSessionId: sessionId } });
  if (!payment) {
    const e = new Error("Nie znaleziono płatności");
    e.status = 404;
    throw e;
  }
  // Płatność musi należeć do zalogowanego użytkownika.
  if (Number(payment.userId) !== Number(user.id)) {
    const e = new Error("Brak dostępu do tej płatności");
    e.status = 403;
    throw e;
  }

  if (session.payment_status !== "paid") {
    const e = new Error("Płatność nie została zakończona");
    e.status = 400;
    throw e;
  }

  if (payment.status !== "paid") {
    payment.status = "paid";
    await payment.save();
  }
  await enrollmentService.enrollUser(payment.userId, payment.courseId);

  return { success: true, courseId: payment.courseId };
};

// Funkcja obsługuje zdarzenie webhooka Stripe. Po zdarzeniu "checkout.session.completed"
// oznacza powiązaną płatność jako opłaconą i zapisuje użytkownika na kurs.
const handleWebhookEvent = async (event) => {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const payment = await Payment.findOne({
      where: { stripeSessionId: session.id },
    });
    if (payment && payment.status !== "paid") {
      payment.status = "paid";
      await payment.save();
      await enrollmentService.enrollUser(payment.userId, payment.courseId);
    }
  }
};

module.exports = { createCheckoutSession, confirmPayment, handleWebhookEvent };
