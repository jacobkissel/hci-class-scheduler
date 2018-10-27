var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var teacherEvalSchema = new Schema({
    name: {type: String, required: true},
    bio: String, //a paragraph about professor
    feedback: [String], //array of comments on professor
    courses: [String], //list of course codes that this professor has taught
    overallEvals:
        [//an entry for each eval category 0-7
            [//an entry for each of the last 4 semesters
                {
                    term: String,
                    rating: Number
                }
            ]
        ],
    courseEvals:
        [//an entry for each course they have taught
            {
                courseName: String,
                evals:
                    [//an entry for each eval category 0-7
                        [//an entry for each of the last 4 times teaching it
                            {
                                term: String,
                                rating: Number
                            }
                        ]
                    ],
            }
        ]
});


var TeacherEval = mongoose.model('TeacherEval', teacherEvalSchema);

module.exports = TeacherEval;
