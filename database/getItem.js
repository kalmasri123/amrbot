module.exports = (dbo, query, collection) => {
    return new Promise((resolve, reject) => {
        dbo.collection(collection).findOne(query, (err, result) => {
            if (err) throw err;
            return resolve(result);
        })
    })
}