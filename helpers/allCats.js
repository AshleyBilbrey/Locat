import { MongoClient } from "mongodb"

const allCats = async (callback) => {
    MongoClient.connect("mongodb://0.0.0.0:27017/your-story", { useUnifiedTopology: true }, (err, db) => {
        if(err) {
            console.log(err);
            callback(null);
        }
        var dbo = db.db("locat");
        console.log("Finding all cats")
        dbo.collection("cats").find({}).toArray((err, result) => {
            console.log("Return!")
            if(err) {
                console.log(err);
                callback(null)
            }
            callback(result)
        })
            
    })
}

export default allCats