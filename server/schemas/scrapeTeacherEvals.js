var fs = require('fs'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    TeacherEval = require('./schemas/TeacherEvalSchema.js'),
    config = require('./config'),
    XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

// for each course in courseDatabase {
//     Get instructors that teach that course
//     teachers = https://evaluations.ufl.edu/results/default.aspx/GetInstructorsByCourse?query=CourseCode
//     For each teacher in teachers {
//         if(teachersDB does not already have that teacher) {
//             get html page for the teachers key
//             page = https://evaluations.ufl.edu/results/instructor.aspx?ik=teacher.key\
//             use regex loop to get all the sections with evals for this teacher\
//                 for each section in sections {
//                     get evaluation data
//                     https://evaluations.ufl.edu/results/Instructor.aspx/GetEvaluation?e=x-data-evalid
//                        if temp teacher obj already has this course code in their courses array
//                             if temp teacher obj alreayd has this semester in their evals[0].term
//                                 update averages to reflect new value
//                             else
//                                 add new entry in
//                 }
//         }
//     }
// }

