import { MongoClient, ObjectId } from "mongodb"

const findCat = async (id, callback) => {
    MongoClient.connect("mongodb://0.0.0.0:27017/your-story", { useUnifiedTopology: true }, (err, db) => {
        if(err) {
            console.log(err);
            callback(null);
        }
        var dbo = db.db("locat");
        console.log(id)
        dbo.collection("cats").findOne({_id: ObjectId(id)}, (err, result) => {
            if(err) {
                console.log(err);
                callback(null)
            }
            console.log("Finding cat result...")
            console.log(result)
            callback(result)
        })
            
    })
}

export default findCat