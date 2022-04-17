import { MongoClient, ObjectId } from "mongodb"

const updateCat = async (id, canpet, canfeed, fixed, healthy, remarks, callback) => {
    MongoClient.connect("mongodb://0.0.0.0:27017/your-story", { useUnifiedTopology: true }, (err, db) => {
        if(err) {
            console.log(err);
            callback({success: false});
        }
        var dbo = db.db("locat");
        dbo.collection("cats").updateOne({_id: ObjectId(id)}, { $set: { canpet: canpet, canfeed: canfeed, fixed: fixed, healthy: healthy, remarks: remarks }}, (err, result) => {
            let toRet = err ? {success: false} : {success: true}
            callback(toRet);
        })
            
    })
}

export default updateCat