//uwu

import express from "express";
import ejs from 'ejs';
import path from "path";
import fs from "fs";
import formidable from "formidable";
import exifr from "exifr"
import newCat from "./helpers/newCat.js"
import findCat from "./helpers/findCat.js"
import allCats from "./helpers/allCats.js";
import constructMap from "./helpers/setUpMap.js";
import updateLoc from "./helpers/updateLoc.js";
import updateCheckInLoc from "./helpers/updateCheckInLoc.js";
import newCheckIn from "./helpers/newCheckIn.js";
import searchCatsByName from "./helpers/searchCatsByName.js";
import allCheckIns from "./helpers/allCheckIns.js";

const app = express();
const port = process.env.PORT || 8080;

// Define static assets
app.use(express.static('static'));

const testCats = [
    { _id: "jjfjdjeeee", name: "Cheeto", lat: 38.5449, lng: -121.7405, remarks: "chonk", canpet: true, canfeed: false, healthy: false },
    { _id: "jee333nendje", name: "Joe the Cat", lat: 38.5469, lng: -121.7465, remarks: "boknk", canfeed: true },
    { _id: "udjj3j3jjj", name: "boebinga", lat: 38.5369, lng: -121.7565, remarks: "badonkadong", healthy: true },
]

// this is where the map itself will be served
app.get("/map", function(req, res){
    // all data that needs to go to the map page will be stored in this mapdata object
    const mapData = constructMap();

    mapData.catMarkers = testCats;

    function showcats(results) {
        const tempList = [];

        results.forEach(e => { if(e.lat && e.lng){tempList.push(e)}});

        mapData.catMarkers = tempList;

        res.render("maps.ejs", mapData);
    }

    allCats(showcats);

    // res.render("maps.ejs", mapData);
});

app.post("/cat/new", (req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.log(err)
            return res.status(500).send("Sorry, there was an error processing your request.")
        }

        newCat(fields, (catid) => {
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
                        exifr.gps('./pawnail/' + catid).then((result) => {
                            if(result && result.latitude != null && result.longitude != null) {
                                updateLoc(catid, result.latitude, result.longitude, () => {
                                    res.redirect("/cat/" + catid)
                                })
                            } else {
                                res.redirect("/map/input/" + catid)
                            }
                            
                        })
                    })
                }
            }
        });  
        
    })
})

app.get("/cat/new",  (req, res) => {
    res.render("newcat.ejs", {styles: ['form']});
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

app.get("/checkimg/:id", (req, res) => {
    fs.readFile("./checkimg/" + req.params.id, (err, file) => {
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
    findCat(req.params.id, (catributes) => {
        allCheckIns(req.params.id, (allCheckIns) => {
            const mapData = constructMap();
            mapData.styles = [];
            console.log("Found check ins for kitty:")
            console.log(allCheckIns)
            catributes.checkIns = allCheckIns;
            res.render("viewcat.ejs", Object.assign(catributes, mapData))
        })
        
    })

})

app.get("/cat", (req, res) => {
    allCats(cats => {
        res.render("list.ejs", {cats: cats, styles: ['list']});
    });

    // res.render("list.ejs", {cats: testCats, styles: ['list']});
})

app.post("/cat", (req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.log(err)
            return res.status(500).send("Sorry, there was an error processing your request.")
        }

        // res.render("list.ejs", {cats: searchCatsByName(testCats, fields.search), styles: ['list']});
        
        allCats(cats => {
            const searchedCats = searchCatsByName(cats, rfields.search);
            res.render("list.ejs", {cats: cats, styles: ['list']});
        });
    })
})

app.get("/", (req, res) => {
    res.redirect("/map")
})

app.get("/update/:id", (req, res) => {
    findCat(req.params.id, (catributes) => {
        catributes.styles = ['form'];
        res.render("updateCat.ejs", catributes)
    })
})

app.get("/checkin/:id", (req, res) => {
    findCat(req.params.id, (catributes) => {
        console.log(catributes)
        console.log("Check In Catributes")
        catributes.styles = ['form'];
        res.render("checkin.ejs", catributes)
    })
})

app.post("/checkin/:id", (req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.log(err)
            return res.status(500).send("Sorry, there was an error processing your request.")
        }

        newCheckIn(fields, req.params.id, (checkinid) => {
            console.log(files.picture)
            if(files.picture != null) {
                console.log("Image exists")
                if(files.picture.mimetype == "image/jpeg" || files.picture.mimetype == "image/png") {
                    console.log("Image of correct type.")
                    fs.copyFile(files.picture.filepath, "./checkimg/" + checkinid, (err) => {
                        if(err) {
                            console.log("Copyingerr")
                            console.log(err)
                        }
                        console.log("File copied!")
                        exifr.gps('./checkimg/' + checkinid).then((result) => {
                            if(result && result.latitude != null && result.longitude != null) {
                                updateCheckInLoc(req.params.id, result.latitude, result.longitude, () => {
                                    res.redirect("/cat/" + req.params.id)
                                })
                            } else {
                                res.redirect("/map/checkin/" + checkinid + "/" + req.params.id)
                            }
                            
                        })
                    })
                }
            }
        });  
        
    })
})

// info page
app.get("/info", function(req, res) {
    res.render("info.ejs");
});

app.use(express.json());
// everything below here needs to be here cause of this use thing

// this is where the map itself will be served
app.get("/map/input/:id", function(req, res){
    const mapData = constructMap();

    mapData.catId = req.params.id;
    mapData.styles.push('mapInput');

    res.render("locationInput.ejs", mapData);
});

app.post("/map/input/:id", function(req, res){
    // here we change the location of cat
    console.log(req.body);
    console.log(req.params.id);

    updateLoc(req.params.id, req.body.lat, req.body.lng, (response) => {
        res.send(response);
    })
})

app.get("/map/checkin/:id/:catid", (req, res) => {
    const mapData = constructMap();
    mapData.checkInId = req.params.id;
    mapData.catId = req.params.catid
    res.render("checkInLocation.ejs", mapData);
})

app.post("/map/checkin/:id", (req, res) => {
    updateCheckInLoc(req.params.id, req.body.lat, req.body.lng, (response) => {
        res.send(response);
    })
})

app.listen(port);
console.log('Server started at http://localhost:' + port);
