node-bash
=========

node-bash is an interpreted language written using JavaScript.

Features
=========
1. dynamic typing [ courtsey of JS ].
2. if, if else, while control structures.
3. functions. [ recursion is also supported ]
4. piping similar to bash.

Requirements
============
To run the language, you must need nodejs.

Usage
=====
you can run scripts by executing following script.
node node-bash.js < filename >

Tutorial
========

Keywords and special character used by the language
---------------------------------------------------
and, not, or, if, else, while, funct, |, =, <, >, <=, >=, !=, ==

Variable Creation
-----------------
simple assignment will create variable in the current scope if does not exist.

    a = 10;
    #or
    a = "Hello world";
    #or
    a = 1 + 2;

Operators
---------
The language supports following operations.

1. addition ( + )
2. subtraction ( - )
3. multiplication ( * ) and division ( / )
4. power ( ^ )
5. boolean operations using >, <, <=, >=, !=, ==, and, not, or.
6. function call
7. piping ( | )

Function Definition
-------------------
you can define a function using <b>funct</b> keyword.

    funct main(){
      print( "Hello world" );
    }

Piping
-------
You can use piping similar to unix piping to pass output of one expression to other.

    a = "Good morning";
    a | b;
    print( b );
    #or
    funct generateData(){
      pipe( "This is node-bash lang" );
    }
    generateData() | a;
    print(a);
  
source of the pipe statement must be an expression or anything which generates a value but the destination must always
be a variable or a function call.
Functions can pipe data using <b>pipe</b> built in function.

BuiltIn functions
-----------------
Following are the builtin functions supported by the languge.

1. print( data );
2. extractString( src, string_to_be_extracted ); # returns a string.
3. split( delim );
4. index( array, index ); # returns element at the given index.
5. len( array ) # returns the length of the array.

Examples
========

Fibonacci series Recursively
----------------------------

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
    print( fibo(8) );

Simple arithmatic expressions
-----------------------------
    # addition
    a = 1 + 2; 
    # multiplication
    a = 1 * 2 * 4;
    #division
    a = 4 / 2;
    # exponantiation
    a = 4 ^ 2;
    # subtraction
    a = 4 - 2;
