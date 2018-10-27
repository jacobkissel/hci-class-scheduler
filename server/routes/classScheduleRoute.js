var classSchedules = require('../controllers/classScheduleController.js'),
    express = require('express'),
    router = express.Router();

router.route("").post(classSchedules.search);

module.exports = router;