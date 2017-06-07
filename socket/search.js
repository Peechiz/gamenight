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
      console.log('Found:', games.items._attributes.total);
      // console.log(JSON.stringify(games, null, 2));

      // send current results
      socket.emit('results', games)

      // then query for details of each games
      // i.e. games.items.item

      detailRequest(games.items.item, 0, socket)

    })
  }
}

function detailRequest(arr, i, socket){
  if (i<arr.length) {
    console.log(`\t ${i+1}: ` + arr[i]._attributes.id);
    rp({
      uri: 'https://boardgamegeek.com/xmlapi2/thing',
      qs: {
        id: arr[i]._attributes.id
      }
    }).catch(err=>{
      console.log(err);
    }).then((detail)=>{
      detail = convert.xml2js(detail, {compact: true});

      let item = detail.items.item;
      let parsed = {
        id: item._attributes.id,
        img: {
          tn: item.thumbnail ? item.thumbnail._text : 'http://fillmurray.com/105/150',
          large: item.image ? + item.image._text : null
        },
        type: item._attributes.type,
        desc: item.description._text.replace(/&#10;/g, '<br />'),
        minplayers: item.minplayers._attributes.value,
        maxplayers: item.maxplayers._attributes.value,
        playtime: item.playingtime._attributes.value,
        detail: true
      }
      socket.emit('detail', parsed);
      i++
      setTimeout(detailRequest, 1000, arr, i, socket);
    })
  } else {
    return console.log('Details complete!');
  }
}
