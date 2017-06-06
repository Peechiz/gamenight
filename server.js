const express = require('express');
const rp = require('request-promise');
const convert = require('xml-js');

let app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const socket = require('./socket/connection')(io);

app.use('/search/:term', (req,res) => {
  const query = req.params.term;

  rp({
    method: 'GET',
    uri: 'http://boardgamegeek.com/xmlapi2/search',
    qs: {
      query
    }
  }).catch(err => {
    console.log(err);
  }).then(xml => {
    let games = convert.xml2js(xml, {compact: true})
    let details = [];

    function makeRequest(arr, i, cb){
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
          i++
          details.push(detail)
          setTimeout(makeRequest, 1000, arr, i, cb);
        })
      } else {
        return cb()
      }
    }

    console.log('Found ' + games.items.item.length + ' games.');

    makeRequest(games.items.item, 0, function(){
      // convert from xml
      details = details.map(d => convert.xml2js(d, {compact: true}));

      // remove irrelevent data from JSON
      details = details.reduce((arr, detail) => {
        let item = detail.items.item;
        arr.push({
          img: {
            tn: item.thumbnail ? 'http:' + item.thumbnail._text : null,
            large: item.image ? 'http:' + item.image._text : null
          },
          name: item.name[0] ? item.name[0]._attributes.value : item.name._attributes.value,
          type: item._attributes.type,
          year: item.yearpublished._attributes.value,
          desc: item.description._text.replace(/&#10;/g, '<br />'),
          minplayers: item.minplayers._attributes.value,
          maxplayers: item.maxplayers._attributes.value,
          playtime: item.playingtime._attributes.value
        })
        return arr;
      },[])

      res.send(details)
    })

  })
})

app.use(express.static(__dirname + '/public'));

const port = process.env.PORT || 9001;
server.listen(port, ()=>{
  console.log(`Listening on ${port}`);
})
