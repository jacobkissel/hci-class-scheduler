var fs = require('fs'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Course = require('./schemas/CourseSchema.js'),
    CourseEval = require('./schemas/CourseEvalSchema.js'),
    TeacherEval = require('./schemas/TeacherEvalSchema.js'),
    config = require('./config/config');

mongoose.connect(config.db.uri);

var departmentsSet = new Set();
var progLevelSet = new Set();

Course.find(function(err, courses){
    for(var i = 0; i < courses.length; i++) {
        for(var k = 0; k < courses[i].sections.length; k++) {
            departmentsSet.add(courses[i].sections[k].deptName);
            progLevelSet.add(courses[i].sections[k].programLevel);
        }
    }
    console.log(departmentsSet);
    console.log(progLevelSet);
});
