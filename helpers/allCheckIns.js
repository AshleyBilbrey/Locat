import { MongoClient } from "mongodb"

const allCheckIns = async (parent, callback) => {
    MongoClient.connect("mongodb://localhost:27017/your-story", { useUnifiedTopology: true }, (err, db) => {
        if(err) {
            console.log(err);
            callback(null);
        }
        var dbo = db.db("locat");
        dbo.collection("checkins").find({parentid: parent}).toArray((err, result) => {
            console.log("Return!")
            if(err) {
                console.log(err);
                callback(null)
            }
            callback(result)
        })
            
    })
}

export default allCheckIns