funct getData(){
	pipe( "Good Morning" );
	pipe( "Bad Morning" );
	pipe( "Hello Good Morning" );
}

funct filter( out ){
    lines = split( out, "\n" );
    i = 0;
    length = len( lines );
    while( i < length ){
        data = extractString( index( lines, i ), "Good" );
        if( data == "Good" ){
            pipe( index( lines, i ) );
        }
        i = i + 1;
    }
}

getData() | filter() | output;
print( output );

