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

exports.getEvalData = function(req, res) {
    //get code from parameter
    if(!req.query['course']) {
        res.status(400).send("The course parameter is missing, but it is needed in the url to complete this request");
    } else {
        var code = req.query['course'];
        CourseEval.findOne({"code" : code }, function(err, eval) {
            if(err) {
                res.status(400).send(err);
            } else {
                var ret = [];
                if(!eval) {
                    res.json(ret);
                } else {
                    for(var i = 0; i < 4 && i < eval.topInstructors.length; i++) {
                        ret.push({"Name" : eval.topInstructors[i].name, "Rating" : eval.topInstructors[i].rating})
                    }
                    res.json(ret);
                }
            }
        })
    }
};
