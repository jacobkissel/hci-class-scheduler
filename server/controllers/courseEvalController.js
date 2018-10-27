var mongoose = require('mongoose'),
    CourseEval = require('../schemas/CourseEvalSchema.js'),
    config = require('../config/config.js');

mongoose.connect(config.db.uri);

exports.getCourseEval = async function(code) {
    var courseEval = await CourseEval.findOne({"code" : code})
    if(!courseEval) {
        return -1;
    }
    return courseEval.rating;
};