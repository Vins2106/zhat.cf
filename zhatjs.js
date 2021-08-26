module.exports = () => {
  const ngrok = require('ngrok');
(async function() {
  const url = await ngrok.connect({
    subdomain: "alex"
  });
  console.log(url)
})();
}