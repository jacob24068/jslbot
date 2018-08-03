const djs = require("discord.js")
const discordClient = new djs.Client()
const { Client } = require('pg');
const prefix = "!"
const colors = require('color-name')

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

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const color = function(message, args){
    const color = args[0]
    if (colors[color]) {
        let role = message.guild.roles.find('name', color)
        let rgbcolor = colors[color]
        message.member.roles.array.forEach(element => {
            if (colors[element.name]){
                message.member.removeRole(element)
            }
        });
        if (!role) {
            message.guild.createRole({
                name: color,
                color: rgbToHex(rgbcolor[0], rgbcolor[1], rgbcolor[2]),
            }).then(r => role)
        }
        message.member.addRole(role)
    }else{
        message.channel.send("that's not a real color idiot, !colors")
    }
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
