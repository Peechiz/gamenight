const uri = 'http://boardgamegeek.com/xmlapi2/'
const init = {
  method: 'GET',
  mode: 'no-cors'
}

var app = new Vue({
  el: '#search',
  data: {
    input: '',
    list: null
  },
  computed: {
    games: function(){
      return this.list
    }
  },
  methods: {
    searchGames: function(){
      console.log(this.input);

      $.get('/search/' + this.input, data => {
        this.list = data;
      })
    }
  }
})
