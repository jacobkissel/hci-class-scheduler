var path = require('path'),
    bodyParser = require('body-parser'),
    express = require('express'),
    mongoose = require('mongoose'),
    config = require('./config'),
    classScheduleRouter = require('../routes/classScheduleRoute'),
    teacherEvalsRouter = require('../routes/teacherEvalsRoute'),
    courseEvalRouter = require('../routes/courseEvalsRoute'),
    cors = require('cors');

module.exports.init = function() {
    //connect to database
    mongoose.connect(config.db.uri);

    //initialize app
    var app = express();

    app.use(bodyParser.json());

    app.use(cors());

    app.use('/api/teacher_evals', teacherEvalsRouter);
    app.use('/api/course_schedule', classScheduleRouter);
    app.use('/api/course_evals', courseEvalRouter);

    return app;
};
