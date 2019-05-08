//need to change the code to make it different
const flightTracker = require("./flight-tracker");
const AprsModel = require('./aprs-model');
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const session = require('express-session');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

let dbconnected = false;

const app = express();
app.set('port', (process.env.PORT || 3000));

// -- MIDDLE-WARE -- //

// Use body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use Handlebars view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs')
// JK, don't use handlebars
//app.set('views', path.join(__dirname, 'views'));
//app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');

// Set up sessions
app.use(session({
	store: new MongoStore({ mongooseConnection: mongoose.connection }),
    secret: "#$#$^*&GBFSDF&^",
    resave: false,
    saveUninitialized: false,
}));

// -- ROUTES -- //
// Start flight tracker
app.get('/', (req, res) =>{
	req.session.destroy();
	if(!req.session || !req.session.started){
		res.render("index")
	}else{
		res.render('map')
	}
})

// Start flight tracker handler
app.post('/', (req, res)=>{
	if(req.body.name && req.body.time){
		req.session.started = true;
		flightTracker(req.body.name, req.body.time); //start flight tracker
		res.sendStatus(200);
	}else{
		res.render("error", {error: "Invalid request, must pass callsign and refresh rate"})
	}
})

// Display the map
app.get('/map', (req, res) =>{
//	if(!req.session || !req.session.started){
//		res.render('index')
//	}else{
		res.render('map')
//	}
});

// drop the collection from database
app.get('/drop', (req, res) =>{
	res.render('drop')
})

// drop handler
app.post('/drop', (req, res) =>{
	AprsModel.remove({}, () =>{
		console.log('Dropped collection from database')
		res.sendStatus(200)
	})
})

// Insert a new APRS record to the database
app.post("/insert", (req, res) =>{
	if(!req.body.callsign || !req.body.latitude || !req.body.longitude){
		res.status(400).send("Must send: callsign, latitude, longitude, altitude");
		console.log("Bad insert request");
	}else{
		//added 2019
		req.session.started = true;
		//
		let aprsRecord = new AprsModel({
			callsign: req.body.callsign,
			latitude: req.body.latitude,
			longitude: req.body.longitude,
			altitude: req.body.altitude
		})

		aprsRecord.save((err) =>{
			if(err){
				console.log(err);
				res.status(500).send("Could not save record to database.");
			}
			else{
				res.status(200).send('New aprs record saved to the database');
				console.log("New aprs record saved to the database\n");
			}
		});
	}
})

// Get all aprs records from database ordered by ascending date
app.post('/getrecords', (req, res) =>{
	if(dbconnected){
		AprsModel.find({}).sort({date: 'ascending'}).exec((err, docs)=>{ 
			res.send(docs)
		});
	}else{
		res.status(400).send("Database connection has not been established.")
	}
})

// Get the last inserted record in the collection
app.post('/getlastrecord', (req, res) =>{
	if(dbconnected){
		AprsModel.find({}).sort({_id:-1}).limit(1).exec((err, doc)=>{ 
			res.send(doc)
		});
	}else{
		res.status(400).send("Database connection has not been established.")
	}
})


app.listen(app.get('port'), ()=> {
	console.log("web server is running on port: " + app.get('port'));

	//connect to the database
	//let url = "mongodb://localhost:27017/flighttracker"
	//let url = "mongodb+srv://general:123@flighttracker-yyoiq.mongodb.net/test?retryWrites=true";
	//let url = "mongodb://cs321:CS321GMU@ds113134.mlab.com:13134/heroku_ncnd7kfp";
	let url = "mongodb+srv://gen:123@flighttracker-yyoiq.mongodb.net/test?retryWrites=true";
	mongoose.connect(url, {useNewUrlParser: true}).then(() =>{
		console.log("Connected to the database");
		dbconnected = true;
	}).catch((err) =>{
		console.log("Error: could not connect to the database");
	})
});
