var DetailsRow = React.createClass({
  render : function() {
    return(
      <tr>
        {
          this.props.d.map(function(element, index) {
            return <td>{ element }</td>
          }) 
        }
      </tr>
      )
  }
})

var DetailsTable = React.createClass({
  getInitialState : function() {
    return { 'rows' : [] }
  },

  componentDidMount : function() {
    $.get(this.props.source, function(result) {
      this.setState(result)
    }.bind(this))
  },

  render : function () {
    return(
      <table className="table">
        {
          this.state.rows.map(function(element, index) {
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