# CS 321 Flight Tracker 2019

**Description**<br>
This program uses aprs.fi to request arps data from an object at a rate of 1 HZ. The data is kept in remote mongoDB database, and a record will be inserted after each aprs.fi request. The data will be displayed on an interactive 3D map.

**How To Use**<br>
Visit https://cs321-flight-tracker-2019.herokuapp.com
This will open a page to enter the APRS station name you want to track from aprs.fi and time between requests in seconds (min: 60 seconds). Click **start** and the map will automatically open and update everytime a request is made to arps.fi

