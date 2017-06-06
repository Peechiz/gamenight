const rp = require('request-promise');
const convert = require('xml-js');


module.exports = function(socket) {

  return function(query) {
    rp({
      method: 'GET',
      uri: 'http://boardgamegeek.com/xmlapi2/search',
      qs: {
        query
      }
    }).catch(err => {
      console.log(err);
      // send error message

    }).then(xml => {
      let games = convert.xml2js(xml, {
        compact: true
      })
      let details = [];

      // full pretty results
      console.log(JSON.stringify(games, null, 2));

      console.log('Found:', games.items._attributes.total);

      // send current results
      socket.emit('results', games)

      // then query for details of each games
      // i.e. games.items.item

    })
  }
}
