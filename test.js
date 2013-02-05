funct fibo( n ){
    if( n == 0 ){
        return 0;
    }
    if( n == 1 ){
        return 1;
    }
    else{
        return fibo( n - 2 ) + fibo( n - 1 );
    }
}

funct fibo_iterative( n ){
    a = 0;
    b = 1;
    c = 0;
    i = 2;
    while( i <= n ){
        c = a + b;
        a = b;
        b = c;
        i = i + 1;
    }
    return c;
}

funct main(){
    return "Bhimsen S K";
}

funct outerFun( n ){
    funct innerFun(){
        return n;
    }
    return innerFun();
}

if( fibo( 8 ) == 21 ){
    print( "test_1 success...." );
}
else{
    print( "test_1 failed..." );
}
if( fibo_iterative( 8 ) == 21 ){
    print( "test_2 success...." );
}
else{
    print( "test_2 failed...");
}
if( main() == "Bhimsen S K" ){
    print( "test_3 success...." );
}
else{
    print( "test_3 failed...." );
}
if( outerFun( 5 ) == 5 ){
    print( "test_4 success...." );
}
else{
    print( "test_4 failed..." );
}
