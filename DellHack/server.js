var express      = require('express');
var cookieParser = require('cookie-parser');
const pug        = require('pug');

var app          = express();
var bodyParser   = require('body-parser');
var session      = require('express-session');
var fs           = require('fs');
var path         = require('path')

var contents = fs.readFileSync("responses.json");
var jsonResponses = JSON.parse(contents);

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', './views');
app.set('view engine', 'html');
app.use(cookieParser());

// This is the port the server is running on
app.listen(8000);

app.engine('html', require('ejs').renderFile);

// This parses the body of the HTML file
app.use(bodyParser.urlencoded({
        extended: true
    }
));


// This creates a new session for each user that logs in
// It's not being used effectively now but it might come in handy later if multiple users run the program at a time.
app.use(session({
    secret: "Ehh",
    resave: true,
    saveUninitialized: true
}));

app.use(express.static('/styles.css'));

// Get for main page
app.get('/', function (req, res) {
    console.log("get");
    res.status(200);
    res.set({
        'Content-Type': 'text/html',
        'Set-Cookie': 'now='+Date.now()
    });
    res.render('welcome_portal'); // You only need to write the name of the file and not its extension. Searches . first
});

// User passes through here first before going on to the survey
// This is part of the MIDDLEWARE
app.post('/login', function (req, res) {

    console.log("login");// console.log() prints to the console

    //Creates a new session for each user that logs into the system\
    req.session.fname = req.body.fname; //fname is the "fname" of the input value on the login page
    req.session.lname = req.body.lname;
    req.session.email = req.body.email;
    req.session.password = req.body.password;

    req.session.questNum = 0;
    req.session.icecream = req.body.icecream;

    let sentinel = false;

    // Loop to check if the user already exists
    for (let i = 0; i < jsonResponses.users.length; i++){
        if (jsonResponses.users[i].email === req.session.email){
            sentinel = (jsonResponses.users[i].password === req.session.password);
            break;
        }
    }

    console.log("user email after loop "+ req.session.email );

    if(sentinel === false) {
        res.redirect("/login");
    }
    else {
        res.redirect(307, '/profile');
    }
    // 307 is a HTTP code making the call a POST instead of the default GET
});

// User passes through here first before going on to the surevey
// This is part of the MIDDLEWARE
app.post('/signup', function (req, res) {

    console.log("login");// console.log() prints to the console

    //Creates a new session for each user that logs into the system\
    req.session.fname = req.body.fname; //fname is the "fname" of the input value on the login page
    req.session.lname = req.body.lname;
    req.session.email = req.body.email;
    req.session.password = req.body.password;

    req.session.questNum = 0;

    let sentinel = false;

    // Loop to check if the user already exists
    for (let i = 0; i < jsonResponses.users.length; i++){
        if (jsonResponses.users[i].email === req.session.email){
            sentinel = true;
            break;
        }
    }

    console.log("user email after loop "+ req.session.email );

    if(sentinel === false) {
        // Probably a good idea to hash this in the far future
        jsonResponses.users.push({
            "fname": req.session.fname,
            "lname": req.session.lname,
            "email": req.session.email,
            "password": req.session.password
        });
    }

    // Turns the node json into readable json text
    JSON.stringify(jsonResponses);
    // Writes the readable json file to our responses.json file
    fs.writeFileSync('responses.json', JSON.stringify(jsonResponses));
    // 307 is a HTTP code making the call a POST instead of the default GET
    res.redirect('/survey');
});


app.post('/survey', function (req, res) {

    console.log("post survey");// console.log() prints to the console

    //Creates a new session for each user that logs into the system\
    req.session.CS = req.body.CS;
    req.session.dessert = req.body.dessert;
    req.session.exercise = req.body.exercise;
    req.session.language = req.body.language;

    req.session.questNum = 0;
    // Loop to check if the user already exists
    for (let i = 0; i < jsonResponses.users.length; i++){
        if (jsonResponses.users[i].email === req.session.email){
            jsonResponses.users[i]["fname"] = req.session.fname;
            jsonResponses.users[i]["lname"] = req.session.lname;
            jsonResponses.users[i]["email"] = req.session.email;
            jsonResponses.users[i]["password"] = req.session.password;
            jsonResponses.users[i]["CS"] = req.session.CS;
            jsonResponses.users[i]["dessert"] = req.session.dessert;
            jsonResponses.users[i]["exercise"] = req.session.exercise;
            jsonResponses.users[i]["language"] = req.session.language;
            break;
        }
    }

    res.redirect(307, '/profile');
    // 307 is a HTTP code making the call a POST instead of the default GET
});

// This is the main page for the survey
app.post('/profile', function (req, res) {
    let q = req.session.questNum;
    /*let index = 0;

    console.log("session name: " + req.session.userName);

    // Reads through the json file to get the right user.
    // This is another check in case more than one users are using the server at once
    for (let i = 0; i < jsonResponses.users.length; i++){
        if (jsonResponses.users[i].email === req.session.email){
            console.log("user email here "+ req.session.email );
            index = i;
            break;
        }
    }

    console.log("index " + index);

    jsonResponses.users[index].fname = req.body.fname;
    jsonResponses.users[index].lname = req.body.lname;
    jsonResponses.users[index].email = req.body.email;
    jsonResponses.users[index].password = req.body.password;
*/
    // Pro Tip: Putting Sync at the end of writeFile makes it synchronous
    fs.writeFileSync('responses.json', JSON.stringify(jsonResponses));

    res.render('profile');

});

app.get('/profile', function (req, res) {
    let q = req.session.questNum;
    let index = 0;

    console.log("session name: " + req.session.userName);

    // Reads through the json file to get the right user.
    // This is another check in case more than one users are using the server at once
    for (let i = 0; i < jsonResponses.users.length; i++){
        if (jsonResponses.users[i].email === req.session.email){
            console.log("user email here "+ req.session.email );
            index = i;
            break;
        }
    }

    console.log("index " + index);

    jsonResponses.users[index].fname = req.body.fname;
    jsonResponses.users[index].lname = req.body.lname;
    jsonResponses.users[index].email = req.body.email;
    jsonResponses.users[index].password = req.body.password;

    // Pro Tip: Putting Sync at the end of writeFile makes it synchronous
    fs.writeFileSync('responses.json', JSON.stringify(jsonResponses));

    res.render('profile');

});


// Links to login page
app.post('/registered', function (req, res) {
    res.type('html');
    res.redirect(307, '/profile');
});


// Links to login page
app.get('/login', function (req, res) {
    res.type('html');
    res.render('login');
});

// Links to sign up page
app.get('/signup', function (req, res) {
    res.type('html');
    res.render('signup');

});

app.get('/survey', function (req,res) {
    res.type('html')
    res.render('survey')
})


// 404 ERROR
app.get('/*',function(req, res){
    var response =  "<html><head></head><body><p> 404 Error test</p></body></html>";
    res.type('html');
    res.end(response);
});

