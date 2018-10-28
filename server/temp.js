var fs = require('fs'),
    mongoose = require('mongoose'),
    CourseEval = require('./schemas/CourseEvalSchema.js'),
    TeacherEval = require('./schemas/TeacherEvalSchema.js'),
    config = require('./config/config'),
    XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

mongoose.connect(config.db.uri);

var courseEval = {
    code: "COP3502",
    rating: 4.5,
    topInstructors : [
        {
            "name": "Dave Small",
            "rating": 5
        },
        {
            "name": "Rong Zhang",
            "rating": 4
        },
        {
            "name": "Joshua Fox",
            "rating": 3,
        },
        {
            "name": "Johnathan Liu",
            "rating": 2
        }
    ]
};

new CourseEval(courseEval).save();

var teacherEval = {
    "name": "DaveSmall",
    "bio": "I like cats, oop, and teaching good.",
    "feedback": ["I like this teacher.", "His class was difficult but good", "Don't take another hard class at the same time as a Dave class"],
    "courses" : ["COP3502", "COP4331", "COP4600"],
    "overallEvals" : [
        [
            {"term": "F15", "rating": 4.5},
            {"term": "S16", "rating": 4.9},
            {"term": "F16", "rating": 3.5},
            {"term": "S17", "rating": 4.0}
        ],//id 1
        [
            {"term": "F15", "rating": 3.5},
            {"term": "S16", "rating": 4.9},
            {"term": "F16", "rating": 3.5},
            {"term": "S17", "rating": 5.0}
        ],//id 2
        [
            {"term": "F15", "rating": 2.5},
            {"term": "S16", "rating": 4.9},
            {"term": "F16", "rating": 3.5},
            {"term": "S17", "rating": 2.0}
        ],//id 3
        [
            {"term": "F15", "rating": 4.5},
            {"term": "S16", "rating": 3.9},
            {"term": "F16", "rating": 2.5},
            {"term": "S17", "rating": 5.0}
        ],//id 4
        [
            {"term": "F15", "rating": 3.5},
            {"term": "S16", "rating": 3.9},
            {"term": "F16", "rating": 4.5},
            {"term": "S17", "rating": 3.0}
        ],//id 5
        [
            {"term": "F15", "rating": 3.5},
            {"term": "S16", "rating": 4.0},
            {"term": "F16", "rating": 3.1},
            {"term": "S17", "rating": 4.3}
        ],//id 6
        [
            {"term": "F15", "rating": 1.5},
            {"term": "S16", "rating": 3.3},
            {"term": "F16", "rating": 4.5},
            {"term": "S17", "rating": 5.0}
        ],//id 7
        [
            {"term": "F15", "rating": 4.2},
            {"term": "S16", "rating": 4.9},
            {"term": "F16", "rating": 4.6},
            {"term": "S17", "rating": 5.0}
        ]//id 10
    ],
    courseEvals: [
        {
            "courseName" : "COP3502",
            evals: [
                [
                    {"term": "F15", "rating": 4.5},
                    {"term": "S16", "rating": 4.9},
                    {"term": "F16", "rating": 3.5},
                    {"term": "S17", "rating": 4.0}
                ],//id 1
                [
                    {"term": "F15", "rating": 3.5},
                    {"term": "S16", "rating": 4.9},
                    {"term": "F16", "rating": 3.5},
                    {"term": "S17", "rating": 5.0}
                ],//id 2
                [
                    {"term": "F15", "rating": 2.5},
                    {"term": "S16", "rating": 4.9},
                    {"term": "F16", "rating": 3.5},
                    {"term": "S17", "rating": 2.0}
                ],//id 3
                [
                    {"term": "F15", "rating": 4.5},
                    {"term": "S16", "rating": 3.9},
                    {"term": "F16", "rating": 2.5},
                    {"term": "S17", "rating": 5.0}
                ],//id 4
                [
                    {"term": "F15", "rating": 3.5},
                    {"term": "S16", "rating": 3.9},
                    {"term": "F16", "rating": 4.5},
                    {"term": "S17", "rating": 3.0}
                ],//id 5
                [
                    {"term": "F15", "rating": 3.5},
                    {"term": "S16", "rating": 4.0},
                    {"term": "F16", "rating": 3.1},
                    {"term": "S17", "rating": 4.3}
                ],//id 6
                [
                    {"term": "F15", "rating": 1.5},
                    {"term": "S16", "rating": 3.3},
                    {"term": "F16", "rating": 4.5},
                    {"term": "S17", "rating": 5.0}
                ],//id 7
                [
                    {"term": "F15", "rating": 4.2},
                    {"term": "S16", "rating": 4.9},
                    {"term": "F16", "rating": 4.6},
                    {"term": "S17", "rating": 5.0}
                ]//id 10
            ]
        },//COP3502
        {
            "courseName" : "COP4331",
            evals: [
                [
                    {"term": "F15", "rating": 4.5},
                    {"term": "S16", "rating": 4.9},
                    {"term": "F16", "rating": 3.5},
                    {"term": "S17", "rating": 4.0}
                ],//id 1
                [
                    {"term": "F15", "rating": 3.5},
                    {"term": "S16", "rating": 4.9},
                    {"term": "F16", "rating": 3.5},
                    {"term": "S17", "rating": 5.0}
                ],//id 2
                [
                    {"term": "F15", "rating": 2.5},
                    {"term": "S16", "rating": 4.9},
                    {"term": "F16", "rating": 3.5},
                    {"term": "S17", "rating": 2.0}
                ],//id 3
                [
                    {"term": "F15", "rating": 4.5},
                    {"term": "S16", "rating": 3.9},
                    {"term": "F16", "rating": 2.5},
                    {"term": "S17", "rating": 5.0}
                ],//id 4
                [
                    {"term": "F15", "rating": 3.5},
                    {"term": "S16", "rating": 3.9},
                    {"term": "F16", "rating": 4.5},
                    {"term": "S17", "rating": 3.0}
                ],//id 5
                [
                    {"term": "F15", "rating": 3.5},
                    {"term": "S16", "rating": 4.0},
                    {"term": "F16", "rating": 3.1},
                    {"term": "S17", "rating": 4.3}
                ],//id 6
                [
                    {"term": "F15", "rating": 1.5},
                    {"term": "S16", "rating": 3.3},
                    {"term": "F16", "rating": 4.5},
                    {"term": "S17", "rating": 5.0}
                ],//id 7
                [
                    {"term": "F15", "rating": 4.2},
                    {"term": "S16", "rating": 4.9},
                    {"term": "F16", "rating": 4.6},
                    {"term": "S17", "rating": 5.0}
                ]//id 10
            ]
        },//COP4331
        {
            "courseName" : "COP4600",
            evals: [
                [
                    {"term": "F15", "rating": 4.5},
                    {"term": "S16", "rating": 4.9},
                    {"term": "F16", "rating": 3.5},
                    {"term": "S17", "rating": 4.0}
                ],//id 1
                [
                    {"term": "F15", "rating": 3.5},
                    {"term": "S16", "rating": 4.9},
                    {"term": "F16", "rating": 3.5},
                    {"term": "S17", "rating": 5.0}
                ],//id 2
                [
                    {"term": "F15", "rating": 2.5},
                    {"term": "S16", "rating": 4.9},
                    {"term": "F16", "rating": 3.5},
                    {"term": "S17", "rating": 2.0}
                ],//id 3
                [
                    {"term": "F15", "rating": 4.5},
                    {"term": "S16", "rating": 3.9},
                    {"term": "F16", "rating": 2.5},
                    {"term": "S17", "rating": 5.0}
                ],//id 4
                [
                    {"term": "F15", "rating": 3.5},
                    {"term": "S16", "rating": 3.9},
                    {"term": "F16", "rating": 4.5},
                    {"term": "S17", "rating": 3.0}
                ],//id 5
                [
                    {"term": "F15", "rating": 3.5},
                    {"term": "S16", "rating": 4.0},
                    {"term": "F16", "rating": 3.1},
                    {"term": "S17", "rating": 4.3}
                ],//id 6
                [
                    {"term": "F15", "rating": 1.5},
                    {"term": "S16", "rating": 3.3},
                    {"term": "F16", "rating": 4.5},
                    {"term": "S17", "rating": 5.0}
                ],//id 7
                [
                    {"term": "F15", "rating": 4.2},
                    {"term": "S16", "rating": 4.9},
                    {"term": "F16", "rating": 4.6},
                    {"term": "S17", "rating": 5.0}
                ]//id 10
            ]
        },//COP4600
    ]
};

new TeacherEval(teacherEval).save();