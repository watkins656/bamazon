var columnify = require('columnify')

var columns = columnify([{
  name: 'mod1',
  description: 'some description which happens to be far larger than the max',
  version: '0.0.1',
}, {
  name: 'module-two',
  description: 'another description larger than the max',
  version: '0.2.0',
}], {
  minWidth: 20,
  config: {
    description: {maxWidth: 30}
  }
})
 
console.log(columns)