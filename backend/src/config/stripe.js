const Stripe = require("stripe");

// Klient Stripe inicjalizowany kluczem tajnym pobieranym ze zmiennych środowiskowych (.env).
// Jeśli klucz nie jest ustawiony, wywołania API Stripe zwrócą błąd autoryzacji (obsługiwany wyżej).
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

module.exports = stripe;
