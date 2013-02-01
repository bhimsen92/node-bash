var Token = require( "./token" ),
    Identifier = require( "./nodes" ).Identifier,
    _Number = require( "./nodes" )._Number,
    Operator = require( "./nodes" ).Operator,
    Parser = require( "./parser" );

function Interpreter( file ){
    this.symbolTable = {};
    this.file = file;
}

Interpreter.prototype.evaluate = function( node ){
    switch( node.type ){
        case Token.ident:
                    if( this.hasAttribute( this.symbolTable, node.name ) ){
                        return this.symbolTable[ node.name ];
                    }
                    else{
                        throw Error( "Undefined symbol: " + node.name );
                    }
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
        case Token.plus:
                        return this.evaluate( node.operands[0] ) + this.evaluate( node.operands[1] );
        case Token.minus:
                        return this.evaluate( node.operands[0] ) - this.evaluate( node.operands[1] );
        case Token.mul:
                        return this.evaluate( node.operands[0] ) * this.evaluate( node.operands[1] );
        case Token.div:
                        return this.evaluate( node.operands[0] ) / this.evaluate( node.operands[1] );
        case Token.power:
                        return Math.pow( this.evaluate( node.operands[0] ), this.evaluate( node.operands[1] ) );
        case Token.eq:
                        return this.evaluate( node.operands[0] ) == this.evaluate( node.operands[1] );
        case Token.and:
                        return this.evaluate( node.operands[0] ) && this.evaluate( node.operands[1] );
        case Token.or:
                        return this.evalute( node.operands[0] ) && this.evaluate( node.operands[1] );
        case Token.not:
                        return !this.evaluate( node.operands[0] );
        case Token.l:
                        return this.evaluate( node.operands[0] ) < this.evaluate( node.operands[1] );
        case Token.g:
                        return this.evaluate( node.operands[0] ) > this.evaluate( node.operands[1] );
        case Token.ge:
                        return this.evaluate( node.operands[0] ) >= this.evaluate( node.operands[1] );
        case Token.le:
                        return this.evaluate( node.operands[0] ) <= this.evaluate( node.operands[1] );
        case Token._while:
                        while( this.evaluate( node.operands[0] ) ){
                            // evaluate the statement list.
                            console.log( this.symbolTable );
                            var stmtList = node.operands[1];
                            for( var i = 0, len = stmtList.length; i < len; i++ ){
                                this.evaluate( stmtList[i] );                                
                            }
                        }
                        break;        
    }
};

Interpreter.prototype.hasAttribute = function( context, attr ){
    return Object.prototype.hasOwnProperty.call( context, attr );
}

Interpreter.prototype.execute = function(){
    var parser = new Parser( this.file ),
        $this = this;
    parser.lexer.on( "loaded", function(){
        var nodelist = parser.parse();
        for( var i = 0; i < nodelist.length; i++ ){
            $this.evaluate( nodelist[i] );
        }
        console.log( $this.symbolTable );
    });
}

var interp = new Interpreter( "test.js" );
interp.execute();

