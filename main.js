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

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const color = function(message, args){
    const color = args[0].toLowerCase()
    if (colors[color]) {
        let role = message.guild.roles.find('name', color)
        let rgbcolor = colors[color]
        if (message.member.roles.array().length != 0){
        message.member.roles.array().forEach(element => {
            if (colors[element.name]){
                message.member.removeRole(element)
            }
        });
        }
        if (!role) {
            message.guild.createRole({
                name: color,
                color: rgbToHex(rgbcolor[0], rgbcolor[1], rgbcolor[2]),
            }).then(role => message.member.addRole(role))
        }else{
            message.member.addRole(role)
        }
        message.channel.send("👍")
    }else{
        message.channel.send("that's not a color we do here, !colors")
    }
}

let colorfields = []
let alphabet = {}

Object.keys(colors).forEach(function(item){
    if (alphabet[item.slice(0,1)]) {
        alphabet[item.slice(0,1)] = alphabet[item.slice(0,1)] + "\n" + item
    }else{
        alphabet[item.slice(0,1)] =  item  
    }
})

Object.keys(alphabet).forEach(function(item) {
    console.log(item)
    colorfields.push({
        "name": item,
        "value": alphabet[item],
        "inline": true
    })
})

const colorslist = function(message){
    message.channel.send(`i messaged you a list of colors`)
    message.author.send({"embed": {
        title: "colors",
        fields: colorfields
    }
})
}

let usersmakingrooms = {}
let waitingforinput = {}
let chosennames = {}

const rentroom = function(message, args){
    let authorid = message.author.id
    if (authorid != '188386891182112769') return
    if (waitingforinput[authorid]) return message.channel.send({"embed": {
        title: "You are already creating a room, type !cancel to restart.",
        color: Number("0x"+Math.floor(Math.random()*16777215).toString(16))
    }})
    if (!saveData[authorid]) {saveData[authorid] = {}}
    if (saveData[authorid].room) return message.channel.send({"embed": {
        title: "You are already have a room. Type !manage to manage your current room.",
        color: Number("0x"+Math.floor(Math.random()*16777215).toString(16))
    }})
    waitingforinput[authorid] = "name"
    message.channel.send({"embed": {
        title: "Please enter a name for the room.",
        color: Number("0x"+Math.floor(Math.random()*16777215).toString(16))
    }})
}

const roominput = function(message, args){
    const authorid = message.author.id
    const content = message.content
    const state = waitingforinput[authorid]
    if (state == "name"){
        chosennames[authorid] = content
        message.channel.send({"embed": {
            title: "Confirm name",
            description: content + " (reply with yes/no)",
            color: Number("0x"+Math.floor(Math.random()*16777215).toString(16))
        }})
    }else if (state == "confirmname") {
        if (!chosennames[authorid]) return
        if (!content.toLowerCase().match("no") || !content.toLowerCase().match("yes")) return
        if (content.toLowerCase().match("no")) {
            waitingforinput[authorid] = "name"
            message.channel.send({"embed": {
                title: "Please enter a name for the room.",
                color: Number("0x"+Math.floor(Math.random()*16777215).toString(16))
            }})
        }else{
            waitingforinput[authorid] = "type"
            message.channel.send({"embed": {
                title: "Choose room type",
                description: "(voice/text/both)",
                color: Number("0x"+Math.floor(Math.random()*16777215).toString(16))
            }})
        }
    }else if (state == "type") {
        if (!chosennames[authorid]) return
        if (!content.toLowerCase().match("voice") || !content.toLowerCase().match("text") || !content.toLowerCase().match("text")) return
        const voice = content.toLowerCase().match("voice") || content.toLowerCase().match("both")
        const text = content.toLowerCase().match("text") || content.toLowerCase().match("both")
        message.guild.createRole(chosennames[authorid]).then(function(role){
            message.user.addRole(role)
            message.guild.createChannel(chosennames[authorid], "text", [{
                id: message.guild.id,
                deny: ['READ_MESSAGES', 'SEND_MESSAGES']
            },
            {
                id: role.id,
                allow: ['READ_MESSAGES', 'SEND_MESSAGES']
            }
            ])
            message.guild.createChannel(chosennames[authorid], "voice", [{
                id: message.guild.id,
                deny: ['VIEW_CHANNEL', 'CONNECT']
            },
            {
                id: role.id,
                allow: ['VIEW_CHANNEL', 'CONNECT']
            }
            ])
        })

    }
}

const aliases = {
    "color": color,
    "colors": colorslist,
    "rent": rentroom
}

discordClient.on("message", message => {
    if (message.author.bot) return
    if (message.content.substr(0,prefix.length) != prefix) return
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()
    if (waitingforinput[message.author.id]) return roominput(message, args)
    if (aliases[command]) return aliases[command](message, args)
})
