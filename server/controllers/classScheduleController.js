var mongoose = require('mongoose'),
    Course = require('../schemas/CourseSchema.js'),
    config = require('../config/config.js'),
    courseEvals = require('./courseEvalController.js');

mongoose.connect(config.db.uri);

function getMeetTimesMap(meetTimes) {
    var map = {"M" : [], "T" : [], "W" : [], "R" : [], "F" : [], "S" : []}
    for(var m = 0; m < meetTimes.length; m++) {
        for(var d = 0; d < meetTimes[m].meetDays.length; d++) {
            var day = meetTimes[m].meetDays[d];
            for(var p = meetTimes[m].startPeriod; p <= meetTimes[m].endPeriod; p++) {
                map[day].push(p);
            }
        }
    }
    return map;
}

exports.search = async function(req, res) {
    //get req body
    console.log(req.body);
    var body = req.body;

    //make a Course object with the search criteria.
    //in the callback, filter by the more specific stuff
    var courseSearch = {};
    //do the top level stuff for the schema first
    //code(CourseNumber), name, levelmin/max
    if(body.CourseNumber) {
        courseSearch['code'] = body.CourseNumber;
    }
    if(body.CourseTitle) {
        courseSearch['name'] = body.CourseTitle;
    }
    if(body.LevelMinimum && body.LevelMaximum) {
        courseSearch['level'] = { $gte: body.LevelMinimum, $lte: body.LevelMaximum  };
    } else if(body.LevelMinimum && !body.LevelMaximum) {
        courseSearch['level'] = { $gte: body.LevelMinimum };
    } else if(!body.LevelMinimum && body.LevelMaximum) {
        courseSearch['level'] = { $lte: body.LevelMaximum };
    }

    //make the section search criteria
    //deptName, empEdProg, programLevel, classNumber, format, instructors,
    //credits, genEd, writingRequirement
    var elemMatch = {};
    var someElem = false;
    if(body.Department) {
        elemMatch['deptName'] = body.Department;
        someElem = true;
    }
    if(body.EmployeeEducationProgram) {
        elemMatch['empEdProg'] = body.EmployeeEducationProgram;
        someElem = true;
    }
    if(body.ProgramLevel) {
        elemMatch['programLevel'] = body.ProgramLevel;
        someElem = true;
    }
    if(body.ClassNumber) {
        elemMatch['sectionNumber'] = body.ClassNumber;
        someElem = true;
    }
    if(body.Format) {
        elemMatch['format'] = body.Format;
        someElem = true;
    }
    if(body.InstructorLastName) {
        var nameRegEx = ".*" + body.InstructorLastName + ".*";
        elemMatch['instructors'] = new RegExp(nameRegEx,"g");
        someElem = true;
    }
    if(body.Credits) {
        elemMatch['credits'] = body.Credits;
        someElem = true;
    }
    if(body.GenEd) {
        elemMatch['genEd'] = [];
        for(var c = 0; c < body.GenEd.length; c++) {
            switch(body.GenEd[c]) {
                case "B" : elemMatch['genEd'].push('Biological Sciences'); break;
                case "C" : elemMatch['genEd'].push('Composition'); break;
                case "D" : elemMatch['genEd'].push('Diversity'); break;
                case "H" : elemMatch['genEd'].push('Humanities'); break;
                case "N" : elemMatch['genEd'].push('International'); break;
                case "M" : elemMatch['genEd'].push('Mathematics'); break;
                case "P" : elemMatch['genEd'].push('Physical Sciences'); break;
                case "S" : elemMatch['genEd'].push('Social and Behavioral'); break;
            }
        }
        someElem = true;
    }
    if(body.WritingRequirment) {
        elemMatch['writingRequirement'] = body.WritingRequirment;
        someElem = true;
    }
    if(someElem) {
        courseSearch['sections'] = {"$elemMatch" : elemMatch}
    }

    var courses = await Course.find(courseSearch);

    //filter functions, that will by default, return true
    var fitCurSched = function(meetTimes) {
        return true;
    };
    var fitRequestedSchedule = function(meetTimes) {
        return true;
    };
    //If this request cares about only getting courses that fit the schedule
    if(body.FitToSchedule) {
        //then redefine the filter function to actually do something
        fitCurSched = function(meetTimes) {
            //TODO
            return true;
        };
    }
    //If this request cares about only getting courses that are in certain times
    if(body.ClassMeeting) {
        //then redefine the filter function to actually do something
        fitRequestedSchedule = function(meetTimes) {
            //TODO
            return true;
        };
    }

    //console.log(courses);
    var retCourses = [];
    for (var i = 0; i < courses.length; i++) {
        var name = courses[i].name;
        var rating = await courseEvals.getCourseEval(courses[i].code);
        for (var j = 0; j < courses[i].sections.length; j++) {
            var meetTimes = getMeetTimesMap(courses[i].sections[j].meetTimes);
            if(fitCurSched(meetTimes) && fitRequestedSchedule(meetTimes)) {
                var instructors = [];
                for (var k = 0; k < courses[i].sections[j].instructors.length; k++) {
                    instructors.push(courses[i].sections[j].instructors[k])
                }
                var instructor = courses[i].sections[j].instructors.length > 0 ? courses[i].sections[j].instructors[0] : "";
                retCourses.push({
                    "Name": name,
                    "Credits": courses[i].sections[j].credits,
                    "Rating": rating,
                    "Professor": instructor,
                    "MeetTimes": meetTimes
                });
            }
        }
    }
    res.json(retCourses);
};
