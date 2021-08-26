module.exports = () => {
  const express = require("express");
  const app = express();
  const bodyParser = require("body-parser");
  
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())  
  
  app.get("/newmessage", async (req, res) => {
    console.log(req.body)
  })
  
  app.listen(3030)
  
  const ngrok = require('ngrok');
(async function() {
  const url = await ngrok.connect(3030)
  console.log(url)
})();
}