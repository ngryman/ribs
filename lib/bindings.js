//module.exports = process.env.NODE_ENV != 'test' ?
//	require('../build/Release/ribs') :
//	require('../test/utils/ribs-mock');
module.exports = require('../build/Release/ribs.node');