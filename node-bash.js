var Interpreter = require( "./interpreter" );

if( process.argv.length != 3 ){
    throw Error( "Usage node node-bash.js <filename>" );
}
file = process.argv[2];
node$bash = new Interpreter( file );
node$bash.execute(); 
