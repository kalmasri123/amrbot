module.exports = (dbo, query, collection) => {
    return new Promise((resolve, reject) => {
        dbo.collection(collection).find(query).toArray((err, res) => {
            if(err) throw err
            return resolve(res)
        })
    })
}