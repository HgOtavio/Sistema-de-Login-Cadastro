const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/", auth, admin, UserController.list);
router.get("/:id", auth, UserController.get);
router.put("/:id", auth,  UserController.update);
router.delete("/:id", auth, admin, UserController.remove);

module.exports = router;
