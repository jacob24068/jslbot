const djs = require("discord.js")
const discordClient = new djs.Client()
const { Client } = require('pg');

discordClient.login(process.env.botToken)
const pgClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  })
pgClient.connect();

let saveData = {}

pgClient.query(`SELECT * FROM userdata`, null, (err, res) => {
    if (!err) {
        saveData = JSON.parse(res.rows[0].info)
  }
})

const save = function() {
    pgClient.query(`DELETE FROM userdata`, null, (err, res) => {
      if (err) {console.log(err.stack)}
    })
    pgClient.query(`INSERT INTO userdata(info) VALUES($1)`, [JSON.stringify(saveData)], (err, res) => {
      if (err) {console.log(err.stack)}
    })
}

const color = function(message, args){
    console.log(args)  
}

const aliases = {
    "color": color
}

discordClient.on("message", message => {
    if (message.author.bot) return
    if (message.content.substr(0,prefix.length) != prefix) return
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()
    if (aliases[command]) return aliases[command](message, args)
})
const djs = require("discord.js")
const discordClient = new djs.Client()
const { Client } = require('pg');

discordClient.login(process.env.botToken)
const pgClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  })
pgClient.connect();

let saveData = {}

/*pgClient.query(`SELECT * FROM userdata`, null, (err, res) => {
    if (!err) {
        saveData = JSON.parse(res.rows[0].info)
  }
})*/

const save = function() {
    pgClient.query(`DELETE FROM userdata`, null, (err, res) => {
      if (err) {console.log(err.stack)}
    })
    pgClient.query(`INSERT INTO userdata(info) VALUES($1)`, [JSON.stringify(saveData)], (err, res) => {
      if (err) {console.log(err.stack)}
    })
}

const color = function(message, args){
    console.log(args)  
}

const aliases = {
    "color": color
}

discordClient.on("message", message => {
    if (message.author.bot) return
    if (message.content.substr(0,prefix.length) != prefix) return
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()
    if (aliases[command]) return aliases[command](message, args)
})

save()
