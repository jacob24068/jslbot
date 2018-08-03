const djs = require("discord.js")
const discordClient = new djs.Client()
const { Client } = require('pg');

discordClient.login(process.ENV.botToken)
const pgClient = new Client({
    connectionString: process.ENV.DATABASE_URL,
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

client.on("message", message => {
    if (!client_id){client_id = client.user.id}
    if (message.author.id != client_id) return
    if (config.responses[message.content.toLowerCase()]) return message.channel.send(config.responses[message.content.toLowerCase()])
    if (message.content.substr(0,prefix.length) != prefix) return
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()
    if (aliases[command]) return aliases[command](message, args)
})
