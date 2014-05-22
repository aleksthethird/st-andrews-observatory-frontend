var SunCalc = require('suncalc')
var coords = [56.337123,-2.81655]
var astroTimes = SunCalc.getTimes(new Date(), coords[0], coords[1]);

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

React.renderComponent(
  <DetailsTable source="../test-files/weather.json"/>,
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