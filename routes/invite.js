const express = require("express");
const app = express.Router();

app.get("/:code", async (req, res, next) => {
  
  if (!req.params.code) return res.redirect("/me")
  
  if (!req.session.user) {
    return res.redirect("/login?callback=/contact/add?add=" + req.params.code);
  } else {
    return res.redirect("/contact/add?add=" + req.params.code);
  }
  
})

module.exports = app;