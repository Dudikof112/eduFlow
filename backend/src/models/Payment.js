const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Model płatności. Reprezentuje pojedynczą próbę zakupu kursu przez użytkownika.
// Tworzony przy starcie płatności (status "pending") i aktualizowany po jej potwierdzeniu.
const Payment = sequelize.define("Payment", {
  // Kwota w groszach (jednostka wymagana przez Stripe), np. 4900 = 49,00 zł.
  amount: DataTypes.INTEGER,
  // Waluta płatności, domyślnie "pln".
  currency: {
    type: DataTypes.STRING,
    defaultValue: "pln",
  },
  // Status płatności: "pending" (rozpoczęta), "paid" (opłacona), "failed" (nieudana).
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending",
  },
  // Identyfikator sesji Checkout w Stripe — łączy płatność z transakcją po stronie Stripe.
  stripeSessionId: DataTypes.STRING,
});

module.exports = Payment;
