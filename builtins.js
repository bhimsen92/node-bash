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

var BuiltIns = {
    "print" : print,
    "extractString" : extractString
};

module.exports = BuiltIns;
