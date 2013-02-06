var Token = require( "./token" );

var Keywords = {
    "and"   : Token.and,
    "or"    : Token.or,
    "not"   : Token.not,
    "for"   : Token._for,
    "while" : Token._while,
    "if"    : Token._if,
    "else"  : Token._else,
    "funct" : Token.funct,
    "return" : Token._return
},
Ops = {
    equal : '='.charCodeAt(0),
    plus  : '+'.charCodeAt(0),
    minus : '-'.charCodeAt(0),
    mul   : '*'.charCodeAt(0),
    div   : '/'.charCodeAt(0),
    l     : '<'.charCodeAt(0),
    g     : '>'.charCodeAt(0),
    semi  : ';'.charCodeAt(0),
    power : '^'.charCodeAt(0),
    ob    : '('.charCodeAt(0),
    cb    : ')'.charCodeAt(0),
    fob   : '{'.charCodeAt(0),
    fcb   : '}'.charCodeAt(0),
    dquote : '"'.charCodeAt(0),
    quote : "'".charCodeAt(0),
    complement: '!'.charCodeAt(0),
    comma: ",".charCodeAt(0),
    pipe : "|".charCodeAt(0)
},
WhiteSpace = {
    space   : ' '.charCodeAt(0),
    newLine : 10
};

var EventEmitter = require( "events" ).EventEmitter,
    util = require( "util" ),
    fs = require( "fs" );

util.inherits( Lexer, EventEmitter );

function Lexer( source, file ){
    this.begin = this.forward = 0;
    this.lexeme = '';
    if( !( typeof source == 'undefined' ) ){
        if( source.constructor == Buffer ){
            this.source = source;
            this.length = this.source.length;
            this.emit( "loaded" );
        }
        else if( source.constructor == String && !( typeof file == 'undefined' ) ){
            var $this = this;
            fs.stat( source, function( err, stats ){
                if( err ){
                    throw err;
                }
                $this.source = new Buffer( stats.size );
                $this.length = stats.size;
                fs.open( source, "r", function( err, fd ){
                    if( err ){
                        throw err;                        
                    }
                    fs.read( fd, $this.source, 0, stats.size, null, function( err, bytesRead ){
                        if( err || bytesRead < stats.size ){
                            throw err;
                        }                        
                        $this.emit( "loaded" );
                    });
                });
            });
        }
        else{
            this.source = source;
            this.length = this.source.length;
            this.emit( "loaded" );
        }
    }
}

Lexer.prototype.match = function( token ){
    if( typeof this.lookAhead == 'undefined' ){
        this.lookAhead = this.lex();
    }
    return this.lookAhead == token;
}
Lexer.prototype.advance = function(){
    this.lookAhead = this.lex();
}
Lexer.prototype.lex = function(){
    this.lexeme = '';
    while( this.forward < this.length ){
        while( this.forward < this.length && ( this.source[ this.forward ] == WhiteSpace.space 
               || this.source[ this.forward ] == WhiteSpace.newLine ) ){
            this.forward++;
        }
        this.begin = this.forward;
        while( this.forward < this.length ){
            if( this.isDigit( this.source[ this.forward ] ) ){
                return this.readNumber();
            }
            else if( this.isAlpha( this.source[ this.forward ] ) ){
                return this.readIdentifier();
            }
            else if( this.source[ this.forward ] == Ops.dquote ){
                return this.readString( true );
            }
            else{
                return this.readOps();
            }
        }
    }
    return Token.eof;
}

Lexer.prototype.readString = function( withDQuotes ){
    var delim = Ops.dquote;
    if( !withDQuotes ){
        delim = Ops.quote;
    }
    // read quote.
    this.begin = ++this.forward;
    while( this.forward < this.length && this.source[ this.forward ] != delim ){
        this.forward++;
    }
    this.lexeme = this.source.slice( this.begin, this.forward ).toString( 'utf-8' );
    // read quote
    this.forward++;
    if( this.lexem == '' ){
        return Token.eof;
    }
    else{
        return Token.string;
    }
}

Lexer.prototype.readNumber = function(){
    var source = this.source,
        dot = '.'.charCodeAt(0);
    while( this.forward < this.length ){
        if( this.isDigit( source[ this.forward ] ) || dot == source[ this.forward ] )
            this.forward++;
        else
            break;
    }
    this.lexeme = source.slice( this.begin, this.forward ).toString( 'utf-8' );
    if( this.lexeme == '' )
        return Token.eof;
    else
        return Token.number;
}
Lexer.prototype.readIdentifier = function(){
    var source = this.source;
    while( this.forward < this.length ){
        if( this.isAlpha( source[ this.forward ] ) || this.isDigit( source[ this.forward ] ) )
            this.forward++;
        else
            break;
    }
    this.lexeme = source.slice( this.begin, this.forward ).toString( 'utf-8' );
    if( this.lexeme == '' )
        return Token.eof;
    else
        return Object.prototype.hasOwnProperty.call( Keywords, this.lexeme ) ? Keywords[ this.lexeme ] : Token.ident;
}
Lexer.prototype.readOps = function(){
    var nextByteIndex = this.forward + 1,
        source = this.source,
        token;
    switch( source[ this.forward ] ){
        case Ops.equal:
                        token = Token.equal;
                        if( nextByteIndex < this.length && source[ nextByteIndex ] == Ops.equal ){
                            this.forward++;
                            token = Token.eq;
                        }
                        break;
        case Ops.g:
                        token = Token.g;
                        if( nextByteIndex < this.length && source[ nextByteIndex ] == Ops.equal ){
                            this.forward++;
                            token = Token.ge;
                        }
                        break;
        case Ops.l:
                        token = Token.l;
                        if( nextByteIndex < this.length && source[ nextByteIndex ] == Ops.equal ){
                            this.forward++;
                            token = Token.le;
                        }
                        break;
        case Ops.plus:
                        token = Token.plus;
                        if( nextByteIndex < this.length && source[ nextByteIndex ] == Ops.plus ){
                            this.forward++;
                            token = Token.inc;
                        }
                        break;
        case Ops.minus:
                        token = Token.minus;
                        if( nextByteIndex < this.length && source[ nextByteIndex ] == Ops.minus ){
                            this.forward++;
                            token = Token.dec;
                        }
                        break;
        case Ops.mul:
                        token = Token.mul;
                        break;
        case Ops.div:
                        token = Token.div;
                        break;
        case Ops.semi:
                        token = Token.semi;
                        break;
        case Ops.ob:
                        token = Token.ob;
                        break;
        case Ops.cb:
                        token = Token.cb;
                        break;
        case Ops.power:
                        token = Token.power;
                        break;
        case Ops.fob:
                        token = Token.fob;
                        break;
        case Ops.fcb:
                        token = Token.fcb;
                        break;
        case Ops.complement:
                        if( nextByteIndex < this.length && source[ nextByteIndex ] == Ops.equal ){
                            this.forward++;
                            token = Token.neq;
                        }
                        break;
        case Ops.pipe:
                        token = Token.pipe;
                        break;
        case Ops.comma:
                        token = Token.comma;
                        break;
    }
    this.lexeme = source.slice( this.begin, ++this.forward ).toString( 'utf-8' );
    return token;
}

Lexer.prototype.isDigit = function( _char ){
    if( _char >= 48 && _char <= 57 )
        return true;
    else
        return false;
}

Lexer.prototype.isAlpha = function( _char ){
    var A = 'A'.charCodeAt(0),
        Z = 'Z'.charCodeAt(0),
        a = 'a'.charCodeAt(0),
        z = 'z'.charCodeAt(0),
        _ = '_'.charCodeAt(0);
    if( ( _char >= A && _char <= Z ) || ( _char >= a && _char <= z ) || _char == _ )
        return true;
    else
        return false;
}

Lexer.prototype.peek = function( token ){
    // save the state of the lexer.
    var initialBegin = this.begin,
        initialForward = this.forward,
        initialLexeme = this.lexeme,
        initialLookAhead = this.lookAhead;
        rval = false;
    this.advance();
    if( this.match( token ) ){
        rval = true;
    }
    this.begin = initialBegin;
    this.forward = initialForward;
    this.lexeme = initialLexeme;
    this.lookAhead = initialLookAhead;
    return rval;
}

Lexer.prototype.exists = function(){
    for( var i = 0, len = arguments.length; i < len; i++ ){
        if( this.peek( arguments[i] ) ){
            return true;   
        }
    }
    return false;
}
module.exports = Lexer;
