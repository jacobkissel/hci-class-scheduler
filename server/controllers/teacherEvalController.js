var mongoose = require('mongoose'),
    TeacherEval = require('../schemas/TeacherEvalSchema.js'),
    config = require('../config/config.js');

mongoose.connect(config.db.uri);

exports.getEvalData = async function(req, res) {
    if(req.query['name']) {
        var teachName = req.query['name'].replace(/,/g," ");
        var teacherEval = await TeacherEval.findOne({"name" : teachName});
        if(!teacherEval) {
            res.status(400).send("There does not exist eval data for the teacher with the name: " + req.query['name']);
            return;
        }
        if(req.query['course']) {//if they are looking for a specific teachers course evals
            var ret = [];
            var c = -1;
            for(var i = 0; i < teacherEval.courseEvals.length; i++) {
                if(teacherEval.courseEvals[i].courseName === req.query['course']) {
                    c = i;
                }
            }
            if(c === -1) {
                res.status(400).send("The teacher: " + req.query['name'] + " does not have any ratings for the class: " + req.query['course']);
                return;
            }
            console.log("courseEvals: " + teacherEval.courseEvals[c].evals);
            console.log("courseEvals.length: " + teacherEval.courseEvals[c].evals.length);
            for(var j = 0; j < teacherEval.courseEvals[c].evals.length; j++) {
                console.log("teacherEval.courseEvals[c].evals[j]: " + teacherEval.courseEvals[c].evals[j]);
                ret.push([]);
                for(var k = 0; k < teacherEval.courseEvals[c].evals[j].length; k++) {
                    ret[j].push({
                        "Term" : teacherEval.courseEvals[c].evals[j][k].term,
                        "Rating" : teacherEval.courseEvals[c].evals[j][k].rating
                    });
                }
            }
            res.json(ret);
        } else {//if they are just looking for the teacher evals
            var ret = {};
            ret['Bio'] = teacherEval.bio;
            ret['Feedback'] = [];
            for(var f = 0; f < teacherEval.feedback.length; f++) {
                ret['Feedback'].push(teacherEval.feedback[f]);
            }
            ret['Courses'] = [];
            for(var c = 0; c < teacherEval.courses.length; c++) {
                ret['Courses'].push(teacherEval.courses[c]);
            }
            ret['OverallEvals'] = [];
            for(var i = 0; i < teacherEval.overallEvals.length; i++) {
                ret['OverallEvals'].push([]);
                for(var j = 0; j < teacherEval.overallEvals[i].length; j++) {
                    ret['OverallEvals'][i].push({
                        "Term" : teacherEval.overallEvals[i][j].term,
                        "Rating" : teacherEval.overallEvals[i][j].rating
                    });
                }
            }
            res.json(ret);
        }
    } else {
        res.status(400).send("No url parameters are present. At least the name parameter is necessary for this request");
    }
};