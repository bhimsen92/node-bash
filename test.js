message = "Hello world";

funct main(){
    print( message );
}

funct fibo( n ){
    if( n == 0 ){
        return 0;
    }
    if( n == 1 ){
        return 1;
    }
    else{
        return fibo( n - 1 ) + fibo( n - 2 );
    }
}

main();

print( fibo( 8 ) );

funct power( n, p ){
    return n ^ p;
}

print( "power: " + power( 5, 2 ) );

addition = 1 + 2 + power( 12, 2 );
print( "addition: " + addition );
