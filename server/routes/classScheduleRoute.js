var classSchedules = require('../controllers/classScheduleController.js'),
    express = require('express'),
    router = express.Router();

router.route("").post(classSchedules.search);
router.route("/programLevels").get(classSchedules.programLevels);
router.route("/departments").get(classSchedules.departments);

module.exports = router;