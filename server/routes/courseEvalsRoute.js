var courseEvals = require('../controllers/courseEvalController.js'),
    express = require('express'),
    router = express.Router();

router.route("").get(courseEvals.getEvalData);

module.exports = router;