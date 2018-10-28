var fs = require('fs'),
    mongoose = require('mongoose'),
    CourseEval = require('./schemas/CourseEvalSchema.js'),
    TeacherEval = require('./schemas/TeacherEvalSchema.js'),
    Course = require('./schemas/CourseSchema.js'),
    config = require('./config/config');

mongoose.connect(config.db.uri);

function getRandomInstructor(currInstructors, instructorSet) {
    //get instructor from instructor set with the least classes, that also isn't in currInstructors
    var min = 1000;
    var randInstructor = "";
    for(const [instructor, courses] of Object.entries(instructorSet)) {
        //if this instructor has less courses than the current min, and currInstructors doesn't have this instructor
        if(courses.length < min && currInstructors.indexOf(instructor) === -1) {
            min = courses.length;
            randInstructor = instructor;
        }
    }
    return randInstructor;
}

function getRandomNumber(min, max) {
    var rnd = ((Math.round(((Math.random() * (max - min)) + min) * 100)) / 100);
    return rnd;
}

function getRandomEvals() {
    var randomEvals = [];
    var terms = ["F16", "S17", "F17", "S18"];
    for(var i = 0; i < 8; i++) {
        randomEvals.push([]);
        for(var j = 0; j < 4; j++) {
            randomEvals[i].push({"term": terms[j], "rating": getRandomNumber(j,j+2)});
        }
    }
    return randomEvals;
}

function getRandomBio() {
    return "I like cats, UF, and teaching good."
}

function getRandomFeedback() {
    return ["I like this teacher.", "His class was difficult but good", "Don't take another hard class at the same time as one of this teacher's classes"]
}

function getAvgRatingFromInstructors(instructors) {
    var curr = 0;
    var i = 0;
    for(; i < instructors.length; i++) {
        curr += instructors[i].rating;
    }
    var avg = (Math.round((curr/(i)) * 100) / 100);
    return avg
}
console.log("Fetching all courses");
Course.find(async function(err, courses) {
    var instructorSet = {};
    var courseSet = {};

    //get all courses and all instructors for this semester
    for(var i = 0; i < courses.length; i++) {
        var course = courses[i];
        //make a new entry in courseSet for this course
        if(courseSet[course.code]){
            console.log("duplicate: " + course.code);
        }
        courseSet[course.code] = [];
        for(var j = 0; j < course.sections.length; j++) {
           var section = course.sections[j];
           for(var k = 0; k < section.instructors.length; k++) {
               //If we haven't seen this instructor for this course yet, add it to the list
               if(courseSet[course.code].indexOf(section.instructors[k] === -1)) {
                   courseSet[course.code].push(section.instructors[k]);
               }
               //if we haven't seen this instructor before, add an entry in the instructors map
               if(!instructorSet[section.instructors[k]]) {
                   instructorSet[section.instructors[k]] = [];
               }
               //If we haven't seen this course for this instructor before, add it to the list
               if(instructorSet[section.instructors[k]].indexOf(course.code) === -1) {
                   instructorSet[section.instructors[k]].push(course.code);
               }
           }
        }
    }

    //Every course needs 4 instructors
    console.log("filling in extra instructors for each course with less than 4 instructors");
    //For every course in our course set
    for(const [course, instructors] of Object.entries(courseSet)) {
       if(instructors.length < 4) {
           for(var m = instructors.length; m < 4; m++) {
               //Get some random instructor that isn't already in the array and put it in
               var newInstructor = getRandomInstructor(instructors,instructorSet);
               instructors.push(newInstructor);
               //Make sure that instructor now also has an entry for this course
               instructorSet[newInstructor].push(course);
           }
       }
    }

    console.log("Saving course evals to DB");
    //For every course in our course set
    for(const [course, instructors] of Object.entries(courseSet)) {
        var topInstructors = [];
        topInstructors.push({
            "name": instructors[0],
            "rating": getRandomNumber(4,5)
        });
        for(var n = 1; n < instructors.length; n++) {
            topInstructors.push({
                "name": instructors[n],
                "rating": getRandomNumber(4-n, topInstructors[n-1].rating)//its rating is no more than the rating of the instructor before it
            });
        }
        var rating = getAvgRatingFromInstructors(topInstructors);
        var courseEval = {
            "code": course,
            "rating": rating,
            "topInstructors": []
        };
        for(var o = 0; o < topInstructors.length; o++){
            courseEval.topInstructors.push(topInstructors[o]);
        }
        var newCourse =  new CourseEval(courseEval);
        var newNewCourse = await newCourse.save();
    }

    console.log("Saving instructor evals to DB");
    //for every instructor in instructor set
    for(const [instructor, courses] of Object.entries(instructorSet)) {
        //for each course they taught, give them a random set of evals
        var courseEvals = [];
        for(var c = 0; c < courses.length; c++) {
            courseEvals.push({"courseName": courses[c], "evals": getRandomEvals()});
        }

        var insEval = {
            "name": instructor,
            "bio": getRandomBio(),
            "feedback": getRandomFeedback(),
            "courses": courses,
            "overallEvals": getRandomEvals(),
            "courseEvals": courseEvals
        };
        var newTeacher = new TeacherEval(insEval);
        var newNewTeacher = await newTeacher.save();
    }
});
