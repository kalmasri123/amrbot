module.exports = (dbo, obj, collection) => {
    return new Promise((resolve, reject) => {
        dbo.collection(collection).insertOne(obj, (err, res) => {
            if (err) throw err;
            return resolve("Done");
        })
    })

}