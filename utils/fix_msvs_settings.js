var fs = require('fs');

var data = fs.readFile('./build/ribs.vcxproj', 'utf8', function(err, data) {
	var result = data.replace(/<\/Link>/g, '<ImageHasSafeExceptionHandlers>false<\/ImageHasSafeExceptionHandlers><\/Link>');
	fs.writeFileSync('./build/ribs.vcxproj', result, 'utf8');
});