import { MongoClient, ObjectId } from "mongodb"

const updateCheckInLoc = async (id, lat, lng, callback) => {
    MongoClient.connect("mongodb://localhost:27017/your-story", { useUnifiedTopology: true }, (err, db) => {
        if(err) {
            console.log(err);
            callback({success: false});
        }
        var dbo = db.db("locat");
        dbo.collection("checkins").updateOne({_id: ObjectId(id)}, { $set: { lat: lat, lng: lng }}, (err, result) => {
            let toRet = err ? {success: false} : {success: true}
            callback(toRet);
        })
            
    })
}

export default updateCheckInLoc