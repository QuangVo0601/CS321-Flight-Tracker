import request, { post } from "request";

const apiKey = "122052.RM15o9S6clA8Rsa"
let intervalId; //used to stop/change interval
let requestRate; //Request APRS data time in ms
let url;

export default StartAprs = (callsign, rate) =>{
    requestRate = rate * 1000;
    url = `https://api.aprs.fi/api/get?name=${callsign}&what=loc&apikey=${apiKey}&format=json`;
    console.log(`Getting APRS data ${callsign} every ${requestRate / 1000} seconds\n`);
    RequestData();
    intervalId = setInterval(RequestData, requestRate);
}

function RequestData(){
    console.log(`Requesting APRS data`)
    request(url, (error, response, body) =>{
        if(error){
            console.log("Could not pull data, retrying");
            RequestData();
        }
        else if(body == null){
            console.log("APRS API Rate limit reached, decreasing request interval by 10 seconds");
            clearInterval(intervalId);
            requestRate += 10000;
            intervalId = setInterval(RequestData, requestRate)
        }
        else{ // handle data received
            let data = JSON.parse(body);
            if(!data.entries.length){
                console.log('\tEmpty Aprs data, not saving to database');
            }else{ //save to database
                data = data.entries[0];
                // Aprs data might initially not contain altitute data
                if(!data.altitude){
                    data.altitude = 0;
                }

                console.log("  Callsign: " + data.name);
                console.log("  Latitude: " + data.lat);
                console.log("  Longitude: " + data.lng);
                console.log("  Altitude: " + data.altitude);
                if(!data.lat || !data.lng){
                    console.log("\tAprs data is missing location lata, not saving to database...");
                }

                post("http://104.248.57.178:3000/insert", {
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