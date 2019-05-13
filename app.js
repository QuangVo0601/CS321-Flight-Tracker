// This file handles inserting, dropping, retrieving, etc. records to mongoDB

const bodyParser = require("body-parser");
const session = require('express-session');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const flightTracker = require("./flight-tracker");
const AprsModel = require('./aprs-model');
const express = require('express');
const path = require('path');

let dbconnected = false;

// The app runs on port 3000
const app = express();
app.set('port', (process.env.PORT || 3000));

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handlebars
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs')

// Session setup
app.use(session({
	store: new MongoStore({ mongooseConnection: mongoose.connection }),
    secret: "#$#$^*&GBFSDF&^",
    resave: false,
    saveUninitialized: false,
}));

// Start flight tracker app with either index.hbs or map.hbs
app.get('/', (req, res) =>{
	req.session.destroy();
	if(!req.session.started || !req.session){
		res.render("index")
	}
	else{
		res.render('map')
	}
})

// Open the map
app.get('/map', (req, res) =>{
		res.render('map')
});

// Drop all the data from mongoDB
app.get('/drop', (req, res) =>{
	res.render('drop')
})

// Pass name and time to flight-tracker.js
app.post('/', (req, res)=>{
	if(req.body.name && req.body.time){
		req.session.started = true;
		flightTracker(req.body.name, req.body.time); 
		res.sendStatus(200);
	}
	else{
		res.render("error", {error: "Must pass callsign and refresh rate"})
	}
})

// Handle drop request
app.post('/drop', (req, res) =>{
	AprsModel.deleteMany({}, () =>{
		console.log('Dropped all records from mongoDB')
		res.sendStatus(200)
	})
})

// Insert a new record to mongoDB
app.post("/insert", (req, res) =>{
	if(!req.body.callsign || !req.body.latitude || !req.body.longitude){
		res.status(400).send("Must send: callsign, latitude, longitude, altitude");
		console.log("Invalid insert request");
	}
	else{
		
		req.session.started = true;
		
		let aprsRecord = new AprsModel({
			callsign: req.body.callsign,
			latitude: req.body.latitude,
			longitude: req.body.longitude,
			altitude: req.body.altitude
		})

		aprsRecord.save((err) =>{
			if(err){
				console.log(err);
				res.status(500).send("Not able to save the record to mongoDB.");
			}
			else{
				res.status(200).send('The record was saved to mongoDB');
				console.log("The record was saved to mongoDB\n");
			}
		});
	}
})

// Retrieve all records in the collection from mongoDB
app.post('/getrecords', (req, res) =>{
	if(dbconnected){
		AprsModel.find({}).sort({date: 'ascending'}).exec((err, docs)=>{ 
			res.send(docs)
		});
	}
	else{
		res.status(400).send("No database connection. Try again")
	}
})

// Retrieve the latest record inserted to the collection from mongoDB
app.post('/getlastrecord', (req, res) =>{
	if(dbconnected){
		AprsModel.find({}).sort({_id:-1}).limit(1).exec((err, doc)=>{ 
			res.send(doc)
		});
	}
	else{
		res.status(400).send("No database connection. Try again")
	}
})

// Connect to the database
app.listen(app.get('port'), ()=> {
	console.log("web server is running on port: " + app.get('port'));

	let url = "mongodb+srv://gen:123@flighttracker-yyoiq.mongodb.net/test?retryWrites=true";
	
	mongoose.connect(url, {useNewUrlParser: true}).then(() =>{
		console.log("Successfully connected to the database");
		dbconnected = true;
	}).catch((err) =>{
		console.log("Error: fail to connect to the database");
	})
});
