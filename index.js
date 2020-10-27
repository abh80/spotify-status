const {Client} = require('spotify-api.js')
const Duplex = require('stream').Duplex;
let stream = new Duplex();
const Canvas = require('canvas')
const express = require('express')
const moment = require('moment')

const app = express();
Canvas.registerFont("./Alata-Regular.ttf",{family: "Alata"})
let token = process.env.token;
const client = new Client(token);
setInterval(async()=>{
const {refresh_token} = await client.oauth.refresh({
  client_id:process.env.client_id,
  client_secret : process.env.client_secret,
  redirect_uri : process.env.uri
  },token)
  token = refresh_token;
},600000)
app.listen(process.env.PORT);

async function MakeCanvas(data){
 const canvas = Canvas.createCanvas(934,282)
 const ctx = canvas.getContext("2d")
 let elap = data.progress_ms;
 let total = data.item.duration_ms;
 let end = moment.utc(total).format("mm:ss");
 const back = await Canvas.loadImage("./img.png")
 let songname = data.item.name
 let artistname = data.item.artists[0].name;
 const img = await Canvas.loadImage(data.item.album.images[0].url)
 ctx.fillStyle= "#000000"
 ctx.drawImage(back,0,0,canvas.width,canvas.height)  
 ctx.drawImage(img,40,45,170,170)
  ctx.fillStyle = "#ffffff"
  ctx.font = "30px Alata"
  ctx.fillText(songname,250,80)
  ctx.font = "25px Alata"
  ctx.fillText(artistname,250,120);
  ctx.fillText(data.item.album.name,250,160)
  ctx.font = "10px Alata"
  ctx.fillText(end,820,235)
  ctx.fillText(moment.utc(elap).format("mm:ss"),257+18.5,235) 
  ctx.fillStyle = "#1DB954"
  ctx.arc(257 + 18.5, 147.5 + 18.5 + 36.25, 18.5, 1.5 * Math.PI, 0.5 * Math.PI, true);
  ctx.fill();
  ctx.fillRect(257 + 18.5, 147.5 + 36.25, (elap/total)*615, 37.5);
  ctx.arc(257 + 18.5 + (elap/total)*615, 147.5 + 18.5 + 36.25, 18.75, 1.5 * Math.PI, 0.5 * Math.PI, false);
  ctx.fill();
  let buffer = canvas.toBuffer()
  let stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  return stream;
}
app.get('/',async(req,res)=>{
  const data = await client.users.player();
  if(!data.item)return res.send("Not listening!")
  const buffer = await MakeCanvas(data);
  buffer.pipe(res);
})
