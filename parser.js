var Lexer = require( "./lexer" ),
    Token = require( "./token" );

function Node( type ){
    this.type = type;
}

function Identifier( name ){
    Node.call( this, Token.ident );
    this.name = name;
}

function _Number( value ){
    Node.call( this, Token.number );
    this.value = parseFloat( value );
}

function Operator( op ){
    Node.call( this, op );
    // convert arguments to JS array.
    var operands = Array.prototype.slice.call( arguments );
    // remove op var.
    this.operands = operands.slice(1);
}

function Parser( file ){
    this.lexer = new Lexer( file, true );
    this.interpreter = new Interpreter();
}

Parser.prototype.parse = function(){
    var nodeList = this.statementList();
    for( var i = 0; i < nodeList.length; i++ ){
        this.interpreter.evaluate( nodeList[ i ] );
    }
};
Parser.prototype.statementList = function(){
    var nodeList = [];
    while( true ){
        var node = this.statement();
        nodeList.push( node );
        if( this.lexer.match( Token.eof ) )
            break;
    }
    return nodeList;
};
Parser.prototype.statement = function(){
    var node = null;
    while( true ){
        if( this.lexer.match( Token.semi ) ){
            node = new Operator( Token.semi, null, null );
            this.lexer.advance();
            break;
        }
        else if( this.lexer.match( Token.ident ) ){
            var name = this.lexer.lexeme,
                op, exprNode;
            this.lexer.advance();
            if( this.lexer.match( Token.equal ) ){
                op = Token.equal;
                this.lexer.advance();
                exprNode = this.expression();
                node = new Operator( op, new Identifier( name ), exprNode );
                this.lexer.advance();
                break;
            }
        }
    }
    return node;
};
/**
    expression : term expression'
*/
Parser.prototype.expression = function(){
    var node = null;
    this.term();
    this.expressionPrime();    
};
Parser.prototype.expressionPrime = function(){
}
/**
    term : factor term'
*/
Parser.prototype.term = function(){
    var node = null;
    this.factor();
    this.termPrime();
}
Parser.prototype.termPrime = function(){
    var node = null;
}
/**
    factor: number
            | identifier
            | ( expression )
*/
Parser.prototype.factor = function(){
    var node = null;
    if( this.lexer.match( Token.number ) ){
        node = new _Number( this.lexer.lexeme );
    }
    else if( this.lexer.match( Token.ident ) ){
        node = new Identifier( this.lexer.lexeme );
    }
    else if( this.lexer.match( Token.ob ) ){
        this.lexer.advance();
        var exprNode = this.expression();
        if( this.lexer.match( Token.cb ) ){
            this.lexer.advance();
        }
    }
    return node;
}
function Interpreter(){
    this.symbolTable = {};
}
Interpreter.prototype.evaluate = function( node ){
    switch( node.type ){
        case Token.ident:                    
                    if( Object.prototype.hasOwnProperty.call( this.symbolTable, node.name ) )
                        return this.symbolTable[ node.name ];
                    else
                        throw Error( "Undefined symbol: " + node.name );
                    break;
        case Token.number:
                    return node.value;
        case Token.equal:
                    if( node.operands[0].constructor == Identifier ){
                        return this.symbolTable[ node.operands[0].name ] = this.evaluate( node.operands[1] );
                    }
                    else{
                        throw Error( "Identifier required." );
                    }
    }
};

var parser = new Parser( "test.js" );
parser.lexer.on( "loaded", function(){
    parser.parse();
    console.log( parser.interpreter.symbolTable );
});
