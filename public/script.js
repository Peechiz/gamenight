const uri = 'http://boardgamegeek.com/xmlapi2/'
const init = {
  method: 'GET',
  mode: 'no-cors'
}

var app = new Vue({
  el: '#search',
  data: {
    input: '',
    games: null
  },
  created: function(){
    var v = this;

    socket.on('results', function(games){
      v.addGames(games)
    })

    socket.on('detail', function(detail){
      v.updateGames(detail);
    })

  },
  computed: {
    total: function(){
      return this.games ? this.games.length : null
    }
  },
  methods: {
    addGames: function(games){

      if (games.items.item.length){
        this.games = games.items.item.reduce((arr, game) => {
          arr.push({
            name: game.name._attributes.value,
            year: game.yearpublished._attributes.value,
            id: game._attributes.id,
            detail: false
          })
          return arr
        },[])
      } else {
        console.log('no games found');
      }
    },
    updateGames: function(detail){

      this.games = this.games.map(game => {
        if (game.id === detail.id){
          Object.keys(detail).forEach( key => {
            if (key !== 'id'){
              game[key] = detail[key];
            }
          })
        }
        return game
      })
    },
    searchGames: function(){
      console.log('searching:',this.input);
      socket.emit('search', this.input)
    }
  }
})

// handle 'results' and 'detail' events
