files = [ "lexer.js", "parser.js" ]

files|_(wc)|function( out, err ){
    lines = split( out, "\n" );
    for( i = 0; i < len( lines ); i++ ){
        fields = split( lines[0], " " );
        push( fields[ 1 ] );
    }
}|output;

print( output );
