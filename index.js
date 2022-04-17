//uwu

const express = require('express');
const ejs = require('ejs');
const path = require('path')

const app = express();
const port = process.env.PORT || 8080;

// Define static assets
app.use(express.static('static'));

// this is where the map itself will be served
app.get("/map", function(req, res){
    // all data that needs to go to the map page will be stored in this mapdata object
    let mapData = {};
    // specify any external js files here
    // mapData.libs = ['maptest'];
    // specify any external css files here
    mapData.styles = ['map'];

    mapData.zoomLevel = 15;

    const gapiOptions = [
        "key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg",
        "callback=initMap",
        "v=weekly",
    ];
    let gapiString = ''
    gapiOptions.forEach(e => gapiString += e + "&");

    mapData.gapiOptions = gapiString;

    mapData.catMarkers = [
        { id: "jjfjdjeeee", name: "Cheeto", imgUrl: "https://localwiki.org/media/cache/8a/5c/8a5cee3ca2abc90ce86363a595e8222a.png", lat: 38.5449, lng: -121.7405 },
        { id: "jee333nendje", name: "Joe the Cat", imgUrl: "", lat: 38.5469, lng: -121.7465 },
        { id: "udjj3j3jjj", name: "boebinga", imgUrl: "", lat: 38.5369, lng: -121.7565 },
    ]

    res.render("maps.ejs", mapData);
});

// info page
app.get("/info", function(req, res) {
    res.render("info.ejs");
});

app.listen(port);
console.log('Server started at http://localhost:' + port);
