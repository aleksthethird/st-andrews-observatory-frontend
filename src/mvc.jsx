// This file contains 90% of the important code in this project
// it is built using react which is and MVC library. Read more about it in the readme.md
// individual functions are documented with their functionality

var SunCalc = require('suncalc'),
  coords = [56.337123,-2.81655],
  astroTimes = SunCalc.getTimes(new Date(), coords[0], coords[1]),
  epoch = function(unixEpoch) { return unixEpoch*1000 },
  moment = require('moment'),
  config = require('../config.js'),
  DataLoader = require('./DataLoader.js'),
  dataRoot = 'data/';

// take a fits field description and put it into a prettier format
makeFitsReadable = function(string) {
  var translations = {
    'TEL-DEC' : [ 1, 'Declination', ''],
    'TEL-RA' : [ 1, 'Right Ascention', ''],
    'AIRMASS' : [ 1,  'Air Mass', 'Air mass indicates the amount of atmosphere is present between the telescope and the observed object. It is affected by the angle and direction of the telescope. Light is affected more if it has to travel through more atmosphere to reach the lense.'],
    'FILTER' : [ 1, 'Filter'],
    'DATE-OBS' : [ 1, 'Date observed']
  }
  return translations[string] == undefined ? [ 0, string] : translations[string]
}

// filter fits header, only outputting useful headers
var filterFitsMeta = function(headers){
  return Object.keys(headers).map(function(e) {
    var readable = makeFitsReadable(e)
    return {
      'cols' : [ readable[1], headers[e]['data'] ],
      'alt' : readable[2],
      'visible' : readable[0]
    } 
  });
};

// make time into a readable string from unix epoch
var timeString = function(unixEpoch) {
  time = new Date(unixEpoch); // bug?
  timeNow = new Date();
  if(time.getDate() == timeNow.getDate()){
    return moment(time).fromNow();
  }
  return ('0' + time.getHours()).slice(-2) + '00 ' + time.getDate() + '/' + time.getMonth()
}

// generate times for weather forecast header
var generateTimes = function(start, length) {
  var times = [];
  times[0] = start;
  for (var i = 1; i < (length-1); i++) {
    times.push(new Date(times[i-1]))
    times[i].setHours(times[i-1].getHours() + 1)
  }
  return times.map(function(e, i) {
    if(i == 0) return 'now';
    return timeString(e)
  })
}

// parse out met forecast for each time interval
var parseMet = function(metForecast) {
  return metForecast.map(function(element, index, array){
    return {
      'interval': 3,
      'data': [
        [<i key='{ index }' alt='Humidity' key='{ index }' className='wi-sprinkles'></i>, element['humidity'], <span>%</span>],
        [<i key='{ index }' alt='Wind speed' key='{ index }' className='wi-windy'></i>, element['wind']['speed'], <span>mph</span>],
        [<i key='{ index }' alt='Conditions'  key='{ index }' className='wi-cloud'></i>, element['cloud'], <span></span>]
      ]
    }
  })
}

// parse out YrNo forecast for each time interval
var parseYrNo = function(yrNoForecast) {
  return yrNoForecast.map(function(element, index, array){
    return {
      'interval': 1,
      'data': [
        [<i key={ index } alt='Humidity' className='wi-sprinkles'></i>, element['humidity'], <span>%</span>],
        [<i key={ index } alt='Wind speed' className='wi-windy'></i>, Math.round(element['wind']['speed'] * 2.237), <span>mph</span>],
        [<i key={ index } alt='Cloud cover' className='wi-cloud'></i>, element['cloud']['cover'], <span>%</span>]
      ]
    }
  })
}

// chop forecast into desired time interval
var sliceForecast = function(startTime, lengthHours, forecast) {
  var selection = [],
    startTime = startTime ? startTime : (new Date).getTime()/1000,
    endTime = startTime + (60*60*lengthHours);
  return forecast.reduce(function(prev, cur, i) {
      console.log(startTime, cur.time, endTime)
      if (cur.time > startTime && cur.time < endTime ) return prev.concat(cur);
      return prev;
  }, []).slice(0,6);
}

// produce forecast rows
var parseForecastIntoTable = function(forecast, startTime, length) {
  var rows = [
    [''].concat(generateTimes(startTime, length)),
    ['MET'].concat(parseMet(sliceForecast(undefined, length, forecast['met']))),
    ['Yr.No'].concat(parseYrNo(sliceForecast(undefined, length, forecast['yr.no'])))
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

// this component appears next to the image and shows a collapsible list of FITS metadata.

var DetailsTable = React.createClass({
  getInitialState : function() {
    return { 'data' : [] }
  },

  componentWillReceiveProps : function() {
    $.get(this.props.source, function(result) {
    	this.setState({ 'data' : filterFitsMeta(result['headers']), 'hideSome' : 1 })
    }.bind(this))
  },

  toggle : function() {
    this.setState({ hideSome : !this.state.hideSome })
  },

  render : function () {
    return(
      <span>
        <a onClick={ this.toggle }>Show { this.state.hideSome ? 'more' : 'less' }</a>
        <table className="table table-striped">
          <tbody>
            {
              this.state.data.map(function(element, index) {
                if(!this.state.hideSome || element.visible) {
                  return <DetailsRow d={ element.cols } key={ index }/>
                }
              }.bind(this))
            }
          </tbody>
        </table>
      </span>
    )
  }
})

var ViewerController = React.createClass({
  change : function(inc, event) {
    var next = this.props.parent.state.current + inc
    if(next > 0 && next < this.props.parent.state.index.length){
      this.props.parent.setState({ current : next })
    }
  },

  render : function() {
    return(
      <div className="text-center">
        <button onClick={ this.change.bind(this, +1) } type="button" className="btn btn-default">Previous</button>
        <button onClick={ this.change.bind(this, -1) } type="button" className="btn btn-default">Next</button>
      </div>
    )
  }
})

var TelescopeViewer = React.createClass({
  getInitialState : function() {
    return {'index' : ['1397939237'], 'root' : dataRoot + 'images/', current : 0 }
  },

  componentDidMount : function() {
    $.get(this.props.source, function(result) {
      this.setState({ 'index' : result, 'current' : 0 })
    }.bind(this))
  },

  render : function() {
    return (
        <div>
          <div className="col-md-4">
            <ViewerController parent={ this }/>
            <DetailsTable source={ this.state.root + this.state.index[this.state.current] + '.json' } />
          </div>
          <div className="col-md-8 text-center">
            <img className="img-responsive" src= { this.state.root + this.state.index[this.state.current] + '.png' } />
          </div>
        </div>
      )
  }
})

React.renderComponent(
  <TelescopeViewer source={dataRoot + '/images/index.json'}/>,
  document.getElementById('telescope-viewer')
)

var ForecastRow = React.createClass({
  render : function() {
    console.log(this.props.data);
    return <tr>
      {
        this.props.data.map(function(e, i) {
          if(typeof e == 'string'){
            return <td key={ i }> { e } </td>
          } else {
            return <td key={ i } colSpan={ e.interval }> {
              e.data.map(function(f, j){
                return <p> { f[0] } { f[1] } { f[2] } </p>
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
    var self = this;
    $.get(self.props.source, function(index) {
      $.get(dataRoot + 'weather/' + index[0] + '.json', function(weather) {
        console.log(weather)
        self.setState({ 'data' : parseForecastIntoTable(weather, new Date(), 7)})
      })
    })
  },

  render : function() {
    var times = []
    return (
      <table className="table table-striped">
        <tbody>
          <DetailsRow d={ times } />
          {
            this.state.data.map(function(e, i) {
              console.log(e)
              return <ForecastRow key={ i } data={ e }/>
            }.bind(this))
          }
        </tbody>
      </table>
    )
  }
})

React.renderComponent(
  <ForecastTable source={ dataRoot + 'weather/index.json' }/>,
  document.getElementById('weather')
)

// component displays sun at night, moon at day

var Sun = React.createClass({
  getInitialState : function() {
    return { 'isNight' : astroTimes.nightEnd > new Date() > astroTimes.night }
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

// React.renderComponent(
//   <Conditions />,
//   document.getElementById('conditions')
// )
