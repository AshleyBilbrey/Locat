import { MongoClient } from "mongodb"

const newCat = async (catributes, callback) => {
    MongoClient.connect("mongodb://localhost:27017/your-story", { useUnifiedTopology: true }, (err, db) => {
        if(err) {
            console.log(err);
            callback(null);
        }
        var dbo = db.db("locat");
            const toInsert = {
                name: catributes.name,
                canpet: catributes.canpet ? true : false,
                canfeed: catributes.canfeed ? true : false,
                fixed: catributes.fixed ? true : false,
                healthy: catributes.healthy ? true : false,
                caretaker: catributes.caretaker,
                remarks: catributes.remarks
            }

            console.log("Inserting...")
            console.log(toInsert)
            dbo.collection("cats").insertOne(toInsert, (err, result) => {
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

export default newCat