funct generateData(){
    pipe( "Hello" );
    pipe( "Good morning" );
    pipe( "Nice to meet you!!" );
}

funct output( data ){
    pipe( data );
}

generateData()|output()|dummy;

print( dummy );
