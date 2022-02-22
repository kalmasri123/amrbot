const getItem = require("./getItem")
const insertItem = require("./insertitem")
const dropItem = require('./dropitem')
const getItems = require("./getitems")
const updateItem = require("./updateitem")
module.exports.getItem = (dbo, query) => { getItem(dbo, query) };

class Database {
    constructor(dbo) {
        this.dbo = dbo
    }
    async getItem(query, collection) { return await getItem(this.dbo, query, collection) }
    async dropItem(query, collection) { return await dropItem(this.dbo, query, collection) }
    async getItems(query, collection) { return await getItems(this.dbo, query, collection) }
    async insertItem(obj, collection) { return await insertItem(this.dbo, obj, collection) }
    async updateItem(query, newobj, collection) { return await updateItem(this.dbo, query, newobj, collection) }

}
module.exports = Database 