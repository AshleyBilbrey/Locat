//uwu

import express from "express";
import ejs from 'ejs';
import path from "path";
import fs from "fs";
import formidable from "formidable";
import newCat from "./helpers/newCat.js"
import findCat from "./helpers/findCat.js"
import allCats from "./helpers/allCats.js";
import constructMap from "./helpers/setUpMap.js";
import updateLoc from "./helpers/updateLoc.js";

const app = express();
const port = process.env.PORT || 8080;

// Define static assets
app.use(express.static('static'));

// this is where the map itself will be served
app.get("/map", function(req, res){
    // all data that needs to go to the map page will be stored in this mapdata object
    const mapData = constructMap();

    const cheetoImg = "https://www.sacbee.com/latest-news/xz27im/picture231405683/alternates/FREE_1140/CHEETO.jpg";
    const testImg = "https://magazine.ucdavis.edu/wp-content/uploads/2019/09/Cheeto-web-header.jpg"

    mapData.catMarkers = [
        { _id: "jjfjdjeeee", name: "Cheeto", imgUrl: cheetoImg, lat: 38.5449, lng: -121.7405, canpet: true, canfeed: false, healthy: false },
        { _id: "jee333nendje", name: "Joe the Cat", imgUrl: testImg, lat: 38.5469, lng: -121.7465, canfeed: true },
        { _id: "udjj3j3jjj", name: "boebinga", imgUrl: "", lat: 38.5369, lng: -121.7565, healthy: true },
    ]

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
            console.log(files.picture)
            if(files.picture != null) {
                console.log("Image exists")
                if(files.picture.mimetype == "image/jpeg" || files.picture.mimetype == "image/png") {
                    console.log("Image of correct type.")
                    fs.copyFile(files.picture.filepath, "./pawnail/" + catid, (err) => {
                        if(err) {
                            console.log("Copyingerr")
                            console.log(err)
                        }
                        console.log("File copied!")
                    })
                }
            }

            res.redirect("/cat/" + catid);
            
        }

        newCat(fields, sendCat)
        
        
    })
})

app.get("/cat/new",  (req, res) => {
    res.render("newcat.ejs")
});

app.get("/catimage/:id", (req, res) => {
    fs.readFile("./pawnail/" + req.params.id, (err, file) => {
        if(file) {
            res.send(file)
        } else {
            fs.readFile("./static/images/AddCatIcon.png", (err, file2) => {
                if(err) {
                    console.log(err)
                    res.send(null)
                } else {
                    console.log("Sending placeholder...")
                    res.send(file2)
                }
                
            })
        }
        
    })
})

app.get("/cat/:id", (req, res) => {
    function sendCat(catributes) {
        res.render("viewcat.ejs", catributes)
    }

    findCat(req.params.id, sendCat)

})

app.get("/cat", (req, res) => {
    function sendCats(cats) {
        res.send(cats)
    }

    allCats(sendCats)

})

app.get("/", (req, res) => {
    res.redirect("/map")
})

// info page
app.get("/info", function(req, res) {
    res.render("info.ejs");
});

app.use(express.json());

// this is where the map itself will be served
app.get("/map/input/:id", function(req, res){
    const mapData = constructMap();

    mapData.catId = req.params.id;

    res.render("locationInput.ejs", mapData);
});

app.post("/map/input/:id", function(req, res){
    // here we change the location of cat
    console.log(req.body);
    console.log(req.params.id);

    function toRespond(response) {
        res.send(response)
    }

    updateLoc(req.params.id, req.body.lat, req.body.lng, toRespond)
})

app.listen(port);
console.log('Server started at http://localhost:' + port);
