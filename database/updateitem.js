module.exports = (dbo, query, newobj, collection) => {
    return new Promise((resolve, reject) => {
        dbo.collection(collection).updateOne(query, newobj, (err, res) => {
            if (err) throw err
            console.log("Updated")
            return resolve("Done")
        })
    })
}