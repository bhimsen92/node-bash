var Token = require( "./token" ),
    Identifier = require( "./nodes" ).Identifier,
    _Number = require( "./nodes" )._Number,
    Operator = require( "./nodes" ).Operator,
    Parser = require( "./parser" ),
    BuiltIns = require( "./builtins" ),
    util = require( "util" );

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
        case Token.string:
                    return node.value.toString();
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
        case Token.neq:
                        return this.evaluate( node.operands[0] ) != this.evaluate( node.operands[1] );
        case Token.and:
                        return this.evaluate( node.operands[0] ) && this.evaluate( node.operands[1] );
        case Token.or:
                        return this.evaluate( node.operands[0] ) || this.evaluate( node.operands[1] );
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
        case Token.uminus:
                        return -this.evaluate( node.operands[0] );
        case Token._while:
                        while( this.evaluate( node.operands[0] ) ){                            
                            // evaluate the statement list.
                            var stmtList = node.operands[1];
                            for( var i = 0, len = stmtList.length; i < len; i++ ){
                                this.evaluate( stmtList[i] );                     
                            }
                        }
                        break;
        case Token._if:             
                       if( this.evaluate( node.operands[0] ) ){
                            var ifStmtList = node.operands[1];
                            for( var i = 0, len = ifStmtList.length; i < len; i++ ){
                                this.evaluate( ifStmtList[i] );
                            }
                       }
                       else if( node.operands.length == 3 ){
                            var elseStmtList = node.operands[2];
                            for( var i = 0, len = elseStmtList.length; i < len; i++ ){
                                this.evaluate( elseStmtList[i] );
                            }
                       }  
                       break;
        case Token.funct_call:
                        if( node.operands[0].constructor == Identifier ){
                            var functName = node.operands[0].getName();
                            // first check whether it is user defined function.
                            if( this.isUserDefined( functName ) ){
                                return this.evaluateUserDefinedFunction( functName, node.operands[1] );
                            }
                            else if( this.isBuiltInFunction( functName ) ){
                                return this.evaluateBuiltInFunction( functName, node.operands[1] );
                            }
                            else{
                                console.warn( "undefined function: " + functName );
                            }
                        }
                        else{
                            console.warn( "function name must be an identifer." );
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
    });
}

Interpreter.prototype.evaluateUserDefinedFunction = function( functName, argsList ){
}

Interpreter.prototype.evaluateBuiltInFunction = function( functName, argsList ){
    var args = [];
    for( var i = 0, len = argsList.length; i < len; i++ ){
        args.push( this.evaluate( argsList[i] ) );
    }
    return BuiltIns[ functName ].apply( {}, args );
}

Interpreter.prototype.isBuiltInFunction = function( functName ){
    return this.hasAttribute( BuiltIns, functName );
}

Interpreter.prototype.isUserDefined = function( functName ){
    return false;
}

var interp = new Interpreter( "test.js" );
interp.execute();
