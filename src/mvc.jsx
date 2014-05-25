var SunCalc = require('suncalc')
var coords = [56.337123,-2.81655]
var astroTimes = SunCalc.getTimes(new Date(), coords[0], coords[1])
var epoch = function(unixEpoch) { return unixEpoch*1000 }

var DetailsRow = React.createClass({
  render : function() {
    return(
      <tr>
        {
          this.props.d.map(function(element, index) {
            return <td key={ index }>{ element }</td>
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
      this.setState(result)
    }.bind(this))
  },

  render : function () {
    return(
      <table className="table table-striped">
        {
          this.state.data.map(function(element, index) {
            return <DetailsRow d={ element } key={ index }/>
          })
        }
      </table>
    )
  }
})


React.renderComponent(
  <DetailsTable source="../test-files/details.json"/>,
  document.getElementById('details')
)

var ForecastRow = React.createClass({
  render : function() {
    return <tr>
      <td>{ this.props.forecaster }</td>
      {
        this.props.data.map(function(e, i) {
          return <td key={ i } colSpan={ this.props.cs }>{ e['humidity'] }</td>
        }.bind(this))
      }
    </tr>
  }
})

var ForecastTable = React.createClass({
  getInitialState : function() {
    return { 'data' : {} }
  },

  componentDidMount : function() {
    $.get(this.props.source, function(result) {
      this.setState({ 'data' : result})
    }.bind(this))
  },

  render : function() {
    var times = []
    if(this.state.data.hasOwnProperty('yr.no')){
      times = this.state.data['yr.no'].map(function(e){
        return new Date(epoch(e['time'])).getHours()
      }).slice(0, 10)
    }
    return (
      <table className="table">
        <DetailsRow d={ times } />
        {
          Object.keys(this.state.data).map(function(e, i) {
            if(typeof this.state.data[e] == typeof []) { 
              var interval = e == 'met' ? '1' : '3'
              var slice = this.state.data[e].slice(0,(10/interval))
              return <ForecastRow key={ i } cs={ interval } data={ slice } forecaster={ e }/>
            }
          }.bind(this))
        }
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