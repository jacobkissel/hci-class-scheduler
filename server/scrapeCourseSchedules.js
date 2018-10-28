var fs = require('fs'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Course = require('./schemas/CourseSchema.js'),
    config = require('./config/config'),
    XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

mongoose.connect(config.db.uri);


function parseCourses(courses) {
    //console.log(courses);
    var courses_array = [];
    for (var i = 0; i < courses.length; i++) {
        var course = courses[i];
        //console.log(course);
        courses_array.push({
            code: course.code,
            name: course.name,
            uniqueId: course.courseId,
            description: course.description,
            prerequisites: course.prerequisites,
            sections: []
        });
        //Parse the course level
        for(var ind = 0; ind < course.code.length; ind++) {
            if(!isNaN(parseInt(course.code.substring(ind,course.code.length)))) {
                courses_array[i].level = parseInt(course.code.substring(ind,course.code.length));
                break;
            }
        }
        //Parse each section from the sections array
        for(var j = 0; j < course.sections.length; j++){
            var section = course.sections[j];
            courses_array[i].sections.push({//put in the stuff that is already there
                sectionNumber: section.number,
                deptName: section.deptName,
                classNumber: section.classNumber,
                instructors: [],
                meetTimes: [],
                credits: section.credits,
                genEd: []
            });
            //Parse the instructors array
            for(var k = 0; k < section.instructors.length; k++) {
                courses_array[i].sections[j].instructors.push(section.instructors[k].name);
            }
            //parse the meet times array
            for(var m = 0; m < section.meetTimes.length; m++){
                meet_time = section.meetTimes[m];
                courses_array[i].sections[j].meetTimes.push({
                    meetDays: meet_time.meetDays,
                    startPeriod: meet_time.meetPeriodBegin,
                    endPeriod: meet_time.meetPeriodEnd,
                    building: meet_time.building,
                    room: meet_time.room
                })
            }
            //parse the genEd's array
            for(var n = 0; n < section.genEd.length; n++) {
                courses_array[i].sections[j].genEd.push(section.genEd[n]);
            }
            //parse the empEdProg
            if(section.EEP === "Y"){
                courses_array[i].sections[j].empEdProg = true;
            } else {
                courses_array[i].sections[j].empEdProg = false;
            }
            //parse the format
            if(section.sectWeb === "PC") {
                courses_array[i].sections[j].format = 3;
            } else if(section.sectWeb === "HB") {
                courses_array[i].sections[j].format = 2;
            } else if(section.sectWeb === "PD") {
                courses_array[i].sections[j].format = 1;
            } else if(section.sectWeb === "AD") {
                courses_array[i].sections[j].format = 0;
            }
            //parse the writing req
            if(section.grWriting === "N") {
                courses_array[i].sections[j].writingRequirement = 0;
            } else if(section.grWriting === "2") {
                courses_array[i].sections[j].writingRequirement = 2;
            } else if(section.grWriting === "4") {
                courses_array[i].sections[j].writingRequirement = 4;
            } else if(section.grWriting === "6") {
                courses_array[i].sections[j].writingRequirement = 6;
            }
            //parse the programLEvel
            if(section.acadCareer === "UGRD") {
                courses_array[i].sections[j].programLevel = "Undergraduate";
            } else if(section.acadCareer === "GRAD") {
                courses_array[i].sections[j].programLevel = "Graduate";
            } else if(section.acadCareer === "LAW") {
                courses_array[i].sections[j].programLevel = "Law";
            } else if(section.acadCareer === "MED") {
                courses_array[i].sections[j].programLevel = "Medical School";
            } else if(section.acadCareer === "PHM") {
                courses_array[i].sections[j].programLevel = "Pharmacy";
            } else if(section.acadCareer === "PA") {
                courses_array[i].sections[j].programLevel = "Physician Assistant";
            } else if(section.acadCareer === "PROF") {
                courses_array[i].sections[j].programLevel = "Professional";
            } else if(section.acadCareer === "VEM") {
                courses_array[i].sections[j].programLevel = "Veterinary Medicine";
            }
        }
    }
    return courses_array;
}

function courseListsRequest(num, callback) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    var res_json = {};

    xhr.open("GET", "https://one.uf.edu/apix/soc/schedule/?category=CWSP&class-num=&course-code=&course-title=&cred-srch=&credits=&day-f=&day-m=&day-r=&day-s=&day-t=&day-w=&days=false&dept=+&eep=&fitsSchedule=false&ge=&ge-b=&ge-c=&ge-d=&ge-h=&ge-m=&ge-n=&ge-p=&ge-s=&hons=false&instructor=&last-control-number=" + num + "&level-max=--&level-min=--&no-open-seats=false&online-a=&online-c=&online-h=&online-p=&period-b=&period-e=&prog-level=+&term=2191&wr-2000=&wr-4000=&wr-6000=&writing=");
    xhr.setRequestHeader("Content-Type", "application/json");
    console.log("sending request");
    xhr.send();
    console.log("sent request");
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
            res_json = JSON.parse(xhr.responseText);
            var ret = [];
            ret.push(parseCourses(res_json[0]['COURSES']));
            ret.push(res_json[0]['LASTCONTROLNUMBER']);
            callback(null, ret)
        }
    };
}

var all_courses = [];

async function callBackFunc(err, courses) {
    //console.log(courses[0]);
    console.log(courses[1]);
    if(courses[1] !== 0){
        courseListsRequest(courses[1], callBackFunc);
        for (var i = 0; i < courses[0].length; i++) {
            var course = courses[0][i];
            //console.log(course);
            var dupeCourse = await Course.findOne({"code": course.code});
            if(dupeCourse) {
                console.log("Duplicate attempt failed for course: " + course.code);
                continue;
            }
            var cours = await new Course(course).save();
        }
    }
}

console.log("loop");
courseListsRequest(0, async function (err, courses) {
    await callBackFunc(err, courses);
});
