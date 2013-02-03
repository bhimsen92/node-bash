funct fibo( n ){
    a = 0;
    b = 1;
    c = 0;
    i = 2;
    while( i <= n ){
        c = a + b;
        if( i == 5 ){
            return c;
        }
        a = b;
        b = c;
        i = i + 1;
    }
    return c;
}

print( "fibo of 8: " + fibo( 8 ) );
