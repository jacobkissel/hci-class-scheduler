var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var courseEvalSchema = new Schema({
    code: {type: String, required: true},
    rating: {type: Number, required: true},
    topInstructors: [{
        "name": {type: String, required: true},
        "rating": {type: Number, required: true},
    }]
});

var CourseEval = mongoose.model('CourseEval', courseEvalSchema);

module.exports = CourseEval;