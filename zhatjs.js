module.exports = () => {
  const ngrok = require('ngrok');
(async function() {
  const url = await ngrok.connect()
  console.log(url)
})();
}