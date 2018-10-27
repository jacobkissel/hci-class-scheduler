var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var courseSchema = new Schema({
    code: {type: String, required: true},
    name: {type: String, required: true},
    uniqueId: {type: String, required: true},
    description: {type: String},
    prerequisites: {type: String},
    level: {type: Number, required: true},
    sections: [{
        sectionNumber: {type: String, required: true},
        deptName: String,
        empEdProg: Boolean,
        programLevel: String,
        classNumber: String,
        format: Number,
        instructors: [String],
        meetTimes: [{
            meetDays: [{type: String, required: true}],
            startPeriod: {type: String, required: true},
            endPeriod: {type: String, required: true},
            building: String,
            room: String
        }],
        credits: String,
        genEd: [String],
        writingRequirement: Number
    }]
});


var Course = mongoose.model('Course', courseSchema);

module.exports = Course;
