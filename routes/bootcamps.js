const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamp");
const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");
// Include other resource routers
const courseRouter = require("./courses");
const router = express.Router();
const { protect } = require("../middleware/auth");
// Re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter);
router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);
router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, createBootcamp);
router.route("/:id/photo").put(protect, bootcampPhotoUpload);
router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, updateBootcamp)
  .delete(protect, deleteBootcamp);
// router.get("/", (req, res) => {
//   res.status(200).json({ success: true, msg: "Show all bootcamps" });
// });
// router.get("/:id", (req, res) => {
//   res.status(200).json({ success: true, msg: `get bootcamp ${req.params.id}` });
// });
// router.post("/", (req, res) => {
//   res.status(200).json({ success: true, msg: "post a  bootcamp" });
// });
// router.put("/:id", (req, res) => {
//   res
//     .status(200)
//     .json({ success: true, msg: `Update bootcamp ${req.params.id}` });
// });
// router.delete("/:id", (req, res) => {
//   res
//     .status(200)
//     .json({ success: true, msg: `delete bootcamp ${req.params.id}` });
// });
module.exports = router;
