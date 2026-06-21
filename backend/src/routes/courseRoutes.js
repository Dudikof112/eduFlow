const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const auth = require("../middlewares/authMiddleware");
const optionalAuth = require("../middlewares/optionalAuthMiddleware");
const role = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validate");
const controller = require("../controllers/courseController");

// PUBLIC: lista kursów (+ ?search= &tag= &language= &minRating= &sort=)
router.get("/", controller.list);

// PUBLIC: lista wszystkich tagów – PRZED "/:id"
router.get("/tags", controller.tags);

// PUBLIC: lista wszystkich języków – PRZED "/:id"
router.get("/languages", controller.languages);

// PUBLIC: lista prowadzących (do filtra) – PRZED "/:id"
router.get("/instructors", controller.instructors);

// PANEL NAUCZYCIELA: kursy zalogowanego prowadzącego – PRZED "/:id"
router.get("/mine", auth, role(["creator", "admin"]), controller.mine);

// FULL DASHBOARD (wymaga logowania) – PRZED "/:id"
router.get("/:courseId/dashboard", auth, controller.getDashboard);

// PUBLIC: podobne kursy – PRZED "/:id"
router.get("/:id/recommendations", controller.recommendations);

// PUBLIC: pojedynczy kurs + lekcje (wideo tylko dla zalogowanych -> optionalAuth)
router.get("/:id", optionalAuth, controller.getOne);

// PANEL NAUCZYCIELA: utworzenie / edycja / usunięcie kursu (prowadzący/admin)
router.post(
  "/",
  auth,
  role(["creator", "admin"]),
  [body("title").trim().notEmpty().withMessage("Tytuł kursu jest wymagany")],
  validate,
  controller.create
);
router.put("/:id", auth, role(["creator", "admin"]), controller.update);
router.delete("/:id", auth, role(["creator", "admin"]), controller.remove);

module.exports = router;
