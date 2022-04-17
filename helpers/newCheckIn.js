import { MongoClient } from "mongodb"

const newCheckIn = async (checkin, parentid , callback) => {
    MongoClient.connect("mongodb://0.0.0.0:27017/your-story", { useUnifiedTopology: true }, (err, db) => {
        if(err) {
            console.log(err);
            callback(null);
        }
        var dbo = db.db("locat");
            const toInsert = {
                parentid: parentid,
                remarks: checkin.remarks,
                iscute: true
            }

            console.log("Inserting...")
            console.log(toInsert)
            dbo.collection("checkins").insertOne(toInsert, (err, result) => {
                    if(err) {
                        console.log(err);
                        callback(null);
                    }
                    console.log("Result:")
                    console.log(result)
                    callback(result.insertedId)
                })
            
    })
}

export default newCheckIn