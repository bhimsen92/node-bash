function print(){
    for( var i = 0, len = arguments.length; i < len; i++ ){
        console.log( arguments[i] );
    }
}

function extractString( source, target ){
    var len = target.length,
        index, rval = '';
    index = source.indexOf( target );
    if( index != -1 ){
        rval = source.substr( index, len );
    }
    return rval;
}

function pipe( context, data ){
    var pipeBuffer = context.getPipeBuffer();
    pipeBuffer.enqueue( data );
}

function _split( string, delim ){
    if( string.constructor == String ){
        return string.split( delim );
    }
    else{
        throw Error( "parameter must be a string object" );
    }
}

function index( array, i ){
    if( array.constructor == Array ){
        return array[ i ];
    }
    else{
        throw Error( "parameter must be an array" );
    }
}

function len( object ){
    if( typeof object.length !== 'undefined' ){
        return object.length;
    }
    else{
        return 0;
    }
}

var BuiltIns = {
    "print" : print,
    "extractString" : extractString,
    "pipe": pipe,
    "split" : _split,
    "index" : index,
    "len" : len
};

module.exports = BuiltIns;
