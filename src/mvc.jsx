var SunCalc = require('suncalc')
var coords = [56.337123,-2.81655]
var astroTimes = SunCalc.getTimes(new Date(), coords[0], coords[1])
var epoch = function(unixEpoch) { return unixEpoch*1000 }

var makeFitsReadable = function(string) {
  var readable = {
    'TEL-DEC' : 'Declination',
    'TEL-RA' : 'Righ Ascention',
    'AIRMASS' : 'Air Mass',

  }
}

var timeString = function(unixEpoch) {
  time = new Date(unixEpoch)
  timeNow = new Date()
  if(time.getDate() == timeNow.getDate()){
    return time.getHours() + '00'
  } else if(time.getDate() == timeNow.setDate(timeNow.getDate() + 1)){
    return time.getHours() + '00 tomorrow'
  }
  return time.getHours() + '00 ' + time.getDate() + '/' + time.getMonth()
}

var generateTimes = function(start, length) {
  var times = new Array(length)
  times[0] = start
  for (var i = 1; i < times.length; i++) {
    times[i] = times[i-1]
    times[i].setHours(times[i-1].getHours() + 1)
  }
  return times.map(function(e) {
    return timeString(e)
  })
}


var parseMet = function(metForecast) {
  return metForecast.map(function(element, index, array){
    return {
      'interval': 3,
      'data': [
        [<i alt='Humidity' key='{ index }' className='wi-sprinkles'></i>, element['humidity']],
        [<i alt='Wind speed' key='{ index }' className='wi-windy'></i>, element['wind']['speed']],
        [<i alt='Conditions'  key='{ index }' className='wi-cloud'></i>, element['cloud']]
      ]
    }
  })
}

var parseYrNo = function(yrNoForecast) {
  return yrNoForecast.map(function(element, index, array){
    return {
      'interval': 1,
      'data': [
        [<i key='{ index }' alt='Humidity' className='wi-sprinkles'></i>, element['humidity']],
        [<i key='{ index }' alt='Wind speed' className='wi-windy'></i>, element['wind']['speed']],
        [<i key='{ index }' alt='Cloud cover' className='wi-cloud'></i>, element['cloud']['cover']]
      ]
    }
  })
}


var parseForecastIntoTable = function(forecast, startTime, length) {
  var rows = [
    [''].concat(generateTimes(startTime, length)),
    ['MET'].concat(parseMet(forecast['met']).slice(0,length/3)),
    ['Yr.No'].concat(parseYrNo(forecast['yr.no']).slice(0,length))
  ]
  return rows
}

var DetailsRow = React.createClass({
  render : function() {
    return(
      <tr>
        {
          this.props.d.map(function(element, index) {
            return (
              <td key={ index }>{ element }</td>
            )
          }) 
        }
      </tr>
      )
  }
})

var DetailsTable = React.createClass({
  getInitialState : function() {
    return { 'data' : [] }
  },

  componentDidMount : function() {
    $.get(this.props.source, function(result) {
      this.setState({ 'data' : Object.keys(result["headers"]).map(function(e){
        return [
          e,
          result["headers"][e]["data"]
        ]
      })}) 
    }.bind(this))
  },

  render : function () {
    return(
      <div className="col-md-4">
        <table className="table table-striped">
          <tbody>
            {
              this.state.data.map(function(element, index) {
                return <DetailsRow d={ element } key={ index }/>
              })
            }
          </tbody>
        </table>
      </div>
    )
  }
})

var ViewerController = React.createClass({

  change : function(inc) {
    var current = this.props.parent.state.current
    this.props.parent.setState({ current : current += inc })
  },

  render : function() {
    return(
      <div>
        <button onClick={ this.change.bind(this, +1) } type="button" className="btn btn-default">Previous</button>
        <button onClick={ this.change.bind(this, -1) } type="button" className="btn btn-default">Next</button>
      </div>
    )
  }
})

var TelescopeViewer = React.createClass({
  getInitialState : function() {
    return {'index' : ['1397939237'], 'root' : '../test-files/test-db/', current : 0 }
  },

  componentDidMount : function() {
    $.get(this.props.source, function(result) {
      this.setState({ 'index' : result, 'current' : 0 })
    }.bind(this))
  },

  render : function() {
    return (
        <div>
          <DetailsTable source={ this.state.root + this.state.index[this.state.current] + '.json' } />
          <div className="col-md-8">
            <img width="600px" src= { this.state.root + this.state.index[this.state.current] + '.png' } />
            <ViewerController parent={ this }/>
          </div>
        </div>
      )
  }
})


React.renderComponent(
  <TelescopeViewer source="../test-files/test-db/index.json"/>,
  document.getElementById('telescope-viewer')
)

var ForecastRow = React.createClass({
  render : function() {
    return <tr>
      {
        this.props.data.map(function(e, i) {
          if(typeof e == 'string'){
            return <td key={ i }> { e } </td>
          } else {
            return <td key={ i } colSpan={ e.interval }> {
              e.data.map(function(f, j){
                return <p> { f[0] } { f[1] } </p>
              })
            }
            </td>
          }
        }.bind(this))
      }
    </tr>
  }
})

var ForecastTable = React.createClass({
  getInitialState : function() {
    return { 'data' : [] }
  },

  componentDidMount : function() {
    $.get(this.props.source, function(result) {
      this.setState({ 'data' : parseForecastIntoTable(result, new Date(), 9)})
    }.bind(this))
  },

  render : function() {
    var times = []
    return (
      <table className="table table-striped">
        <tbody>
          <DetailsRow d={ times } />
          {
            this.state.data.map(function(e, i) {
              return <ForecastRow key={ i } data={ e }/>
            }.bind(this))
          }
        </tbody>
      </table>
    )
  }
})

React.renderComponent(
  <ForecastTable source="../test-files/1400862978.71.json"/>,
  document.getElementById('weather')
)


var Sun = React.createClass({
  getInitialState : function() {
    return { 'isNight' : astroTimes.night < new Date() < astroTimes.nightEnd }
  },

  render : function() {
    return (
      <div className="col-md-3">
        <i className={ "fa fa-" + (this.state.isNight ? 'moon' : 'sun') + "-o fa-4x"} ></i>
        <div>{ this.state.isNight ? 'Night' : 'Day' }</div>
      </div>
    )
  }
})

var Conditions = React.createClass({  
  render : function() {
    return (
      <Sun />
    )
  }
})

React.renderComponent(
  <Conditions />,
  document.getElementById('conditions')
)