// This file requests APRS data, then call app.js to insert the record into mongoDB.

const request = require("request");

const apiKey = "122052.RM15o9S6clA8Rsa" //aprs api key

let url;
let requestRate; //request APRS data time
let intervalId; //stop/change interval

module.exports = StartAprs = (callsign, rate) =>{
    requestRate = rate * 1000;
    url = `https://api.aprs.fi/api/get?name=${callsign}&what=loc&apikey=${apiKey}&format=json`;
    console.log(`Retrieve APRS data ${callsign} every ${requestRate / 1000} seconds\n`);
    RequestData();
    intervalId = setInterval(RequestData, requestRate);
}

//This function requests and handles data received
function RequestData(){
    console.log(`Requesting APRS data`)
    request(url, (error, response, body) =>{
        if(error){
            console.log("Not able to pull data, trying again");
            RequestData();
        }
        else if(body == null){
            console.log("Reached APRS API rate limit, decreasing request interval by 10 seconds");
            clearInterval(intervalId);
            requestRate += 10000;
            intervalId = setInterval(RequestData, requestRate)
        }
        else{ 
            let data = JSON.parse(body);
            if(!data.entries.length){
                console.log('\tAprs data is empty, not able to save to mongoDB');
            }else{ 
                data = data.entries[0];
                
                if(!data.altitude){
                    data.altitude = 0; //default altitude if no initial altitude
                }

                console.log("  Callsign: " + data.name);
                console.log("  Latitude: " + data.lat);
                console.log("  Longitude: " + data.lng);
                console.log("  Altitude: " + data.altitude);
                
                if(!data.lat || !data.lng){
                    console.log("\tMissing coordinates, not able to save to database...");
                }

				//calling post in app.js
                request.post("http://104.248.57.178:3000/insert", {
                    form:{
                        callsign: data.name,
                        latitude: data.lat,
                        longitude: data.lng,
                        altitude: data.altitude
                    }
                })
            }
        }
    })
}