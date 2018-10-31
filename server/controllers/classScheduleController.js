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
            for(var p = parseInt(meetTimes[m].startPeriod); p <=  parseInt(meetTimes[m].endPeriod); p++) {
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
    var fitAroundCurSched = function(courseMeetTimes) {
        return true;
    };
    var fitIntoRequestedSchedule = function(courseMeetTimes) {
        return true;
    };
    //If this request cares about only getting courses that fit the schedule
    if(body.FitToSchedule) {
        //then redefine the filter function to actually do something
        fitAroundCurSched = function(courseMeetTimes) {
            var currSched = body.FitToSchedule;
            for(const [day, times] of Object.entries(courseMeetTimes)) {
                if(!currSched[day]) {continue;}
                for(var t = 0; t < times.length; t++) {
                    //assert that the current schedule does not contain any of the
                    //new classes meet times
                    if(currSched[day].indexOf(times[t]) !== -1) {
                        return false;
                    }
                }
            }
            return true;
        };
    }
    //If this request cares about only getting courses that are in certain times
    if(body.ClassMeeting) {
        //then redefine the filter function to actually do something
        fitIntoRequestedSchedule = function(courseMeetTimes) {
            var requestedSched = body.ClassMeeting;
            for(const [day, times] of Object.entries(courseMeetTimes)) {
                if(!requestedSched[day]) {
                    //if the requested schedule doesn't have a certain day,
                   if(times.length > 0) {
                       //and the class meets at least once on that day
                       return false;
                   } else {
                       //if the class doesn't meet on that day
                       continue;
                   }
                }
                for(var t = 0; t < times.length; t++) {
                    //assert that all of the classes meet times exist
                    //in the current schedule
                    if(requestedSched[day].indexOf(times[t]) === -1) {
                        return false;
                    }
                }
            }
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
            if(fitAroundCurSched(meetTimes) && fitIntoRequestedSchedule(meetTimes)) {
                var instructors = [];
                for (var k = 0; k < courses[i].sections[j].instructors.length; k++) {
                    instructors.push(courses[i].sections[j].instructors[k])
                }
                var instructor = courses[i].sections[j].instructors.length > 0 ? courses[i].sections[j].instructors[0] : "";
                retCourses.push({
                    "Name": name,
                    "Code": courses[i].code,
                    "Credits": courses[i].sections[j].credits,
                    "Rating": rating,
                    "Professor": instructor,
                    "MeetTimes": meetTimes,
                    "Section": courses[i].sections[j].sectionNumber
                });
            }
        }
    }
    res.json(retCourses);
};

exports.programLevels = function(req, res) {
    res.json(["Undergraduate", "Graduate", "Medical School", "Law", "Professional", "Physician Assistant", "Pharmacy", "Veterinary Medicine"]);
};

exports.departments = function(req,res) {
    res.json(["Agricultural and Biological Engineering", "Accounting, Fisher School of", "Food and Resource Economics", "Advertising", "Mass Communication", "Agricultural Education and Communication", "African American Studies", "Soil and Water Science", "Agronomy", "History", "Military Science-Air Force", "African Studies", "Entomology and Nematology", "Agricultural & Life Sciences-General", "Anthropology", "Languages, Literatures & Cultures-Akan", "English", "Animal Sciences", "Languages, Literatures & Cultures-Amharic", "Applied Physiology & Kinesiology", "Agricultural Operations Management", "Languages, Literatures & Cultures-Arabic", "Architecture, School of", "Art and Art History", "New World School of the Arts-Visual Arts", "Astronomy", "Speech, Language, and Hearing Sciences", "Food Science and Human Nutrition", "Medicine-Biochemistry/Molecular Biology", "Construction Management, Rinker School of", "Environmental Horticulture", "Biomedical Engineering", "Chemical Engineering", "Medicine-General", "Medicine-Physiology", "Botany", "Microbiology and Cell Science", "Biological Sciences", "Medicine-Radiation Oncology", "Management", "Medicine-Anatomy", "Computer & Information Science & Engineering", "Criminology", "Civil and Coastal Engineering", "Engineering-General", "Languages, Literatures & Cultures-Chinese", "Chemistry", "Psychology", "Clinical/Health Psychology", "Written & Oral Communication, Dial Center", "Classics", "Industrial and Systems Engineering", "Political Science", "Theatre and Dance", "Environmental Engineering Science", "Languages, Literatures & Cultures-Czech", "New World School of the Arts-Dance", "New World School of the Arts-Theatre", "Design, Construction & Planning-General", "Dentistry-Orthodontics", "Dentistry-Periodontics", "Dentistry-Prosthodontics", "Dentistry-Oral & Maxillofacial Diagnostic Sci", "Dentistry-General", "Dentistry-Oral Biology", "Dentistry-Endodontics", "Flexible Learning", "Digital Worlds Institute", "Mechanical/Aerospace Engineering", "Linguistics", "Economics", "Education-Human Devel and Org Studies in Ed", "Education-Teaching and Learning", "Education-Spec Ed/Schl Psych/Early Child Stu", "Electrical and Computer Engineering", "Materials Science and Engineering", "Writing Program", "Medicine-Radiology", "Geology", "European Studies", "Natural Resources and Environment, School of", "Fisheries & Aquatic Science - SFRC", "Finance", "Forest Resources and Conservation - SFRC", "Horticultural Sciences", "Languages, Literatures & Cultures-French", "Family, Youth, and Community Sciences", "Business Admin-General", "Geography", "Languages, Literatures & Cultures-German", "Behavioral Science & Community Health", "Geomatics - SFRC", "Medicine-Molecular Genetics & Microbiology", "Medicine-Neuroscience", "Medicine-Pharmacology & Therapeutics", "Medicine-Aging/Geriatric Research", "Medicine-Pathology", "Medicine-Psychiatry", "Pharmacy-Pharmacy Practice", "Medicine-Health Outcomes and Policy", "Tourism Recreation and Sport Management", "Health Education and Behavior", "Languages, Literatures & Cultures-Haitian/Creo", "Classics-Greek Studies", "Languages, Literatures & Cultures-Hebrew", "Health Services Administration", "Public Health & Health Professions - Undergrad", "Arts-General", "Honors Office", "Innovation Academy", "Interdisciplinary Studies", "Interior Design", "First Year Florida", "Info Systems and Operations Management", "Spanish", "Journalism", "Languages, Literatures & Cultures-Italian", "Languages, Literatures & Cultures-Japanese", "Jewish Studies", "Landscape Architecture", "Latin American Studies", "Law", "Classics-Latin", "Law-Taxation", "Mathematics", "Languages, Literatures & Cultures", "Marketing", "Medieval & Early Modern Studies", "Telecommunication", "Military Science-Army", "New World School of the Arts-Music", "Music", "Nursing", "Military Science-Navy", "Occupational Therapy", "Medicine-School of Physician Assistant Studies", "Zoology", "Pharmacy-Pharmacy Outcomes and Policy", "Pharmacy-Medicinal Chemistry", "Pharmacy-Pharmaceutics", "College of Public Health & Health Professions", "Epidemiology", "Biostatistics", "Philosophy", "Environmental and Global Health", "Physical Therapy", "Physics", "Packaging Sciences", "Plant Pathology", "Portuguese", "Languages, Literatures & Cultures-Polish", "Public Relations", "Religion", "Rehabilitation Science Doctoral Program", "Languages, Literatures & Cultures-Russian", "Statistics", "Languages, Literatures & Cultures-Swahili", "Sociology", "Urban and Regional Planning", "Physiological Science", "Comparative, Diagnostic & Population Medicine", "Pathobiology", "Small Animal Clinic Science", "Veterinary Medical Sciences", "Wildlife Ecology and Conservation", "Womens Studies", "Languages, Literatures & Cultures-Wolof", "Languages, Literatures & Cultures-Yoruba"]);
};
