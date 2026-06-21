const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Model powiadomienia dla użytkownika (np. nowa odpowiedź w Q&A, nowa wiadomość czatu).
// Pole link wskazuje ścieżkę we froncie, do której prowadzi kliknięcie. Relacje w index.js.
const Notification = sequelize.define("Notification", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false }, // np. "chat", "qa"
  text: { type: DataTypes.STRING, allowNull: false },
  link: { type: DataTypes.STRING },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = Notification;
