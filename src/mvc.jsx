var DetailsRow = React.createClass({
  render : function() {
    return(
      <tr>
        <td>{ this.props.k }</td>
        <td>{ this.props.v }</td>
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
            return <DetailsRow k={ element[0] } v={ element[1] } key={ index }/>
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