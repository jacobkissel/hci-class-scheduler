var teacherEvals = require('../controllers/teacherEvalController.js'),
    express = require('express'),
    router = express.Router();

router.route("").get(teacherEvals.getEvalData);

module.exports = router;