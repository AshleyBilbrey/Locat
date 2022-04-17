//uwu

import express from "express";
import ejs from 'ejs';
import path from "path";
import fs from "fs";
import formidable from "formidable";
import newCat from "./helpers/newCat.js"

const app = express();
const port = process.env.PORT || 8080;

// Define static assets
app.use(express.static('static'));
// included on all pages
app.use('/js/libs', express.static(path.join(process.cwd(), 'node_modules/jquery/dist'), { maxAge: 31557600000 }));

// this is where the map itself will be served
app.get("/map", function(req, res){
    // all data that needs to go to the map page will be stored in this mapdata object
    let mapData = {};
    // specify any external js files here
    // mapData.libs = ['maptest'];
    // specify any external css files here
    mapData.styles = ['maptest'];

    mapData.zoomLevel = 12;

    const gapiOptions = [
        "key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg",
        "callback=initMap",
        "v=weekly",
    ];
    let gapiString = ''
    gapiOptions.forEach(e => gapiString += e + "&");

    mapData.gapiOptions = gapiString;

    mapData.catMarkers = [
        { name: "cheeto", lat: 38.5449, lng: -121.7405 },
        { name: "joe_cat", lat: 38.5469, lng: -121.7465 },
        { name: "boebinga", lat: 38.5369, lng: -121.7565 },
    ]

    mapData.exampleVar = 'testing joe mama';
    res.render("maps.ejs", mapData);
});

app.post("/cat/new", (req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.log(err)
            return res.status(500).send("Sorry, there was an error processing your request.")
        }

        function sendCat(catid) {
            res.send("Received your new cat! " + catid)
        }

        const catid = newCat(fields, sendCat)
        
        
    })
})

app.get("/cat/new",  (req, res) => {
    res.render("newcat.ejs")
});

app.listen(port);
console.log('Server started at http://localhost:' + port);
