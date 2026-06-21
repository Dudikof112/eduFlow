const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Certificate = sequelize.define("Certificate", {
  code: DataTypes.STRING, // unikalny numer certyfikatu (do okazania/weryfikacji)
  pdfUrl: DataTypes.STRING, // zostawione na przyszłość (gdyby zapisywać plik)
});

module.exports = Certificate;
