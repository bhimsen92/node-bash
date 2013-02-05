var Interpreter = require( "./lib/interpreter" );

if( process.argv.length != 3 ){
	throw Error( "Usage node node-bash.js <file>" );
}
file = process.argv[2];
interp = new Interpreter( file );

interp.execute();
