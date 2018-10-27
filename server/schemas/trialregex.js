var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

var data = null;

var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
        var text = this.responseText;
        var regexR = /(?:x-data-evalid=")(.*)(?:")/g;
        var m = regexR.exec(text);
        while(m != null) {
            console.log(m[1])
            m = regexR.exec(text);
        }
    }
});

xhr.open("GET", "https://evaluations.ufl.edu/results/instructor.aspx?ik=1360056335");

xhr.send(data);
