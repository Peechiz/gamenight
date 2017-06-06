const uri = 'http://boardgamegeek.com/xmlapi2/'
const init = {
  method: 'GET',
  mode: 'no-cors'
}

var app = new Vue({
  el: '#search',
  data: {
    input: '',
    game_data: null
  },
  created: function(){
    var v = this;
    socket.on('results', function(games){
      console.log('WE GOT SOME');
      v.game_data = games
    })
  },
  computed: {
    games: function(){
      // console.dir(this.game_data);
      // only update if there is stuff to show
      if (this.game_data && this.game_data.items.item.length){
        return this.game_data.items.item.reduce((arr, game) => {
          arr.push({
            name: game.name._attributes.value,
            year: game.yearpublished._attributes.value,
            id: game._attributes.id,
            detail: null
          })
          return arr
        },[])
      }

    },
    total: function(){
      return this.game_data ? this.game_data.items._attributes.total : null
    }
  },
  methods: {
    searchGames: function(){
      console.log('searching:',this.input);

      socket.emit('search', this.input)
    }
  }
})

// handle 'results' and 'detail' events
