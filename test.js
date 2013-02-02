funct helloWorld( a ){
    print(a);
    while( a != 10 ){
        a = a + 1;
        print(a);
    }
}
a = 100;
helloWorld( 4 );
print( "outside: " + a );
