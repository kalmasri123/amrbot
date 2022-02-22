let MongoClient = require("mongodb").MongoClient
let url = process.env.MONGO_URI
const Discord = require("discord.js")
const Client = new Discord.Client()
var streamBuffers = require('stream-buffers');
const categoryList = ["lunch", "hangout", "dota", "noob", "memes", "arabic"]
const TOKEN = process.env.TOKEN
const tts = require('./tts')
const stream = require("stream")
const fetch = require('node-fetch')
MongoClient.connect(url, (err, db) => {

    if (err) throw err;
    let dbo = db.db("amr")
    let database = new(require("./database/database"))(dbo)
    async function isCommonWord(word) {
        let wordData = await database.getItem({
            name: word
        }, "commonwords")
        return wordData;
    }
    async function getAmrQuote(categoryName) {
        console.log(categoryName)
        let quotes = await database.getItems({
            category: categoryName
        }, "responses")
        if (quotes.length > 0) {
            let selection = quotes[Math.floor(Math.random() * quotes.length)];
            console.log(selection)
            return selection.sentence;

        } else {
            return null;
        }
    }

    function objToArray(object) {
        let array = []
        let keys = Object.keys(object)
        let values = Object.values(object)

        for (let i in keys) {
            let currentKey = keys[i]
            array[i] = {
                category: keys[i],
                power: values[i]
            }
            // array[i][keys[i]] = values[i]
        }
        return array;
    }

    function isArticle(word) {
        let articles = ["the", "an", "a"]
        return articles.indexOf(word) > -1
    }


    function attachIsImage(msgAttach) {
        var url = msgAttach.url;
        //True if this url is a png image.
        return url.indexOf("png", url.length - "png".length /*or 3*/ ) !== -1;
    }

    function isAttachment(message) {
        let content = message.content;
        let isAnAttachment = false;
        console.log()
        if (content.includes("cdn.discordapp.com/attachments/") || content.endsWith(".jpg") || content.endsWith(".png") || content.endsWith(".jpeg") || content.endsWith(".bmp")) {
            isAnAttachment = true;

        }
        return isAnAttachment;
    }



    Client.on('ready', async () => {




    })
    Client.on('message', async (message) => {

        await database.insertItem({
            username: message.author.tag,
            content: message.content,
            date: new Date()
        }, "messagelog")
        if (message.author.bot) return;
        let args = message.content.toLowerCase().split(" ")
        let argsI = message.content.split(" ")
        console.log(message.attachments)
        if (args[0] == "!directmessage" && args.length > 2) {
            let id = argsI[1];
            let words = argsI.slice(2);

            let currentUser = new Discord.User(Client, {
                id: id
            });
            currentUser.send(words.join(" "));
        } else if (message.content.startsWith("!broadcastmessageamr")) {
            let guilds = Client.guilds.filter(guild => message.guild ? guild.id != message.guild.id : guild.id != null)
            let words = argsI.slice(1)
            guilds.forEach((guild, index) => {
                guild.channels.filter(c => c.type == "text").first().send(words.join(" "))

            })
        } else if (message.attachments.size > 0 || isAttachment(message)) {

            let words = args.slice(1)
            let attachmentUrl = (message.attachments.size > 0) ? (new Discord.Attachment(message.attachments.first().url)) : (message.content)
            let guilds = Client.guilds.filter(guild => guild.id != message.guild.id)
            // console.log(guilds)
            return new Promise((resolve, reject) => {
                guilds.forEach((guild, index) => {
                    console.log("CHANNEL", (guild.channels.filter(c => c.type == "text").first()))
                    guild.channels.filter(c => c.type == "text").first().send(attachmentUrl)
                    if (guilds.size == index - 1) {
                        return resolve("DONE")
                    }
                })
            }).then(result => {
                return;
            })
        } else if (args[0] == "!messageamr") {
            if (args.length > 1) {
                let words = args.slice(1)
                Client.users.get(process.env.OWNER).send(words.join(" ").toUpperCase()).then(async message => {
                    console.log(await message.channel.fetchMessages({
                        limit: 10
                    }))
                });
            } else {
                message.reply("**NOT ENOUGH ARGUMENTS**")
            }
        } else if (args[0] == "!feed") {
            if (args.length < 3) {
                return message.reply("Not Enough Arguments")
            }
            let sentence = args.slice(2);
            let category = args[1];
            console.log(category, sentence)
            if (categoryList.indexOf(category) <= -1) {
                return message.reply("IT NOT CATEGORY")
            }
            sentence.forEach(async word => {
                let wordData = await database.getItem({
                    name: word
                }, category);
                if (isArticle(word)) {
                    return;
                }
                if (!wordData) {
                    await database.insertItem({
                        name: word,
                        power: 1
                    }, category)
                } else {
                    await database.updateItem({
                        name: word
                    }, {
                        $set: {
                            power: wordData.power + 1
                        }
                    }, category)
                }
            })
            return message.channel.send("Stored:" + sentence.join(" ") + "\n Under:" + category)

        } else if (args[0] == "!addresponse") {
            if (args.length < 3) {
                return message.reply("Not Enough Arguments")
            }
            let sentence = args.slice(2).join(" ");
            let category = args[1];
            if (categoryList.indexOf(category) <= -1) {
                return message.reply("IT NOT CATEGORY")
            }
            await database.insertItem({
                "category": category,
                "sentence": sentence
            }, "responses")
            return message.channel.send("Stored:" + sentence + "\n Under:" + category)
        } else if (args[0] == "!addcommonwords") {
            let sentence = args.slice(1)
            for (let i in sentence) {
                let wordData = await database.getItem({
                    name: sentence[i]
                }, "commonwords")
                if (!wordData) {
                    await database.insertItem({
                        name: sentence[i]
                    }, "commonwords")
                }
            }
        } else {
            let sentence = message.content.toLowerCase().split(" ");
            sentence = sentence.filter((word) => {
                return !(isArticle(word))
            })
            let powerObj = {}
            for (let i in categoryList) {
                powerObj[categoryList[i]] = 0;
                for (let word in sentence) {
                    let wordData = await database.getItem({
                        name: sentence[word]
                    }, categoryList[i])
                    if (sentence[word] == "amr") {
                        wordData = {
                            name: "amr",
                            power: 3
                        }
                    }


                    if (wordData) {
                        if (await isCommonWord(wordData.name)) {
                            continue;
                        }

                        powerObj[categoryList[i]] += wordData.power
                    }
                }
            }
            console.log(powerObj)
            let objList = objToArray(powerObj)
            objList = objList.sort((a, b) => {
                return b.power - a.power
            })
            console.log(objList)
            if (objList[0].power >= 5 && objList[0].power - objList[1].power > 1) {
                let category = objList[0]
                console.log()
                let amrQuote = await getAmrQuote(category.category)
                if (amrQuote) {
                    message.reply((await getAmrQuote(category.category)).toUpperCase())
                }
            }
        }
    })
})
Client.login(TOKEN)
