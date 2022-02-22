module.exports = async (dbo, query, collection) => {
    return new Promise((resolve, reject) => {
        dbo.collection(collection).deleteOne(query, (err, res) => {
            if (err) throw err;
            return resolve("Done")
        })
    })
}