var Token = require( "./token" ),
    Identifier = require( "./nodes" ).Identifier,
    _Number = require( "./nodes" )._Number,
    Operator = require( "./nodes" ).Operator,
    Parser = require( "./parser" ),
    BuiltIns = require( "./builtins" ),
    Context = require( "./context" ),
    UserDefinedFunction = require( "./userdfs" ),
    util = require( "util" );

function Interpreter( file ){
    this.file = file;
}

Interpreter.prototype.evaluate = function( node, context ){
    // typeof node !== 'undefined' && typeof node.operands !== 'undefined'
    // the above hack is introduced as i was using op1, op2, op3 vars for simplicity but some times node will not have
    // operands attribute as in Token.ident, Token.string, Token.number.    
    if( typeof node !== 'undefined' && typeof node.operands !== 'undefined' ){
        var op1 = node.operands[0],
            op2 = node.operands[1],
            op3 = node.operands[2];
    }
    switch( node.type ){
        case Token.ident:
                    if( this.hasAttribute( context.getHash(), node.name ) ){
                        return context.get( node.name );
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
                    if( op1.constructor == Identifier ){
                        return context.put( op1.name, this.evaluate( op2, context ) );
                    }
                    else{
                        throw Error( "Identifier required." );
                    }
        case Token.plus:
                        return this.evaluate( op1, context ) + this.evaluate( op2, context );
        case Token.minus:
                        return this.evaluate( op1, context ) - this.evaluate( op2, context );
        case Token.mul:
                        return this.evaluate( op1, context ) * this.evaluate( op2, context );
        case Token.div:
                        return this.evaluate( op1, context ) / this.evaluate( op2, context );
        case Token.power:
                        return Math.pow( this.evaluate( op1, context ), this.evaluate( op2, context ) );
        case Token.eq:
                        return this.evaluate( op1, context ) == this.evaluate( op2, context );
        case Token.neq:
                        return this.evaluate( op1, context ) != this.evaluate( op2, context );
        case Token.and:
                        return this.evaluate( op1, context ) && this.evaluate( op2, context );
        case Token.or:
                        return this.evaluate( op1, context ) || this.evaluate( op2, context );
        case Token.not:
                        return !this.evaluate( op1, context );
        case Token.l:
                        return this.evaluate( op1, context ) < this.evaluate( op2, context );
        case Token.g:
                        return this.evaluate( op1, context ) > this.evaluate( op2, context );
        case Token.ge:
                        return this.evaluate( op1, context ) >= this.evaluate( op2, context );
        case Token.le:
                        return this.evaluate( op1, context ) <= this.evaluate( op2, context );
        case Token.uminus:
                        return -this.evaluate( op1, context );
        case Token._while:
                        while( this.evaluate( op1, context ) ){
                            // evaluate the statement list.
                            var stmtList = op2;
                            for( var i = 0, len = stmtList.length; i < len; i++ ){
                                this.evaluate( stmtList[i], context );
                            }
                        }
                        break;
        case Token._if:             
                       if( this.evaluate( op1, context ) ){
                            var ifStmtList = op2;
                            for( var i = 0, len = ifStmtList.length; i < len; i++ ){
                                this.evaluate( ifStmtList[i], context );
                            }
                       }
                       else if( node.operands.length == 3 ){
                            var elseStmtList = op3;
                            for( var i = 0, len = elseStmtList.length; i < len; i++ ){
                                this.evaluate( elseStmtList[i], context );
                            }
                       }  
                       break;
        case Token.funct_call:
                        if( op1.constructor == Identifier ){
                            var functName = op1.getName();
                            // first check whether it is user defined function.
                            if( this.isUserDefined( functName, context ) ){
                                return this.evaluateUserDefinedFunction( functName, op2, context );
                            }
                            else if( this.isBuiltInFunction( functName ) ){
                                return this.evaluateBuiltInFunction( functName, op2, context );
                            }
                            else{
                                console.warn( "undefined function: " + functName );
                            }
                        }
                        else{
                            console.warn( "function name must be an identifer." );
                        }
                        break;
        case Token.funct:
                        var functName = op1.getName();
                        context.addFunct( functName, new UserDefinedFunction( op2, op3 ) );
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
        var context = new Context();
        for( var i = 0; i < nodelist.length; i++ ){
            $this.evaluate( nodelist[i], context );
        }
    });
}

Interpreter.prototype.evaluateUserDefinedFunction = function( functName, argsList, context ){
    var newContext = new Context(),
        funct;
    // get the function.
    funct = context.getFunct( functName );       
    // push the current context.
    newContext.addContext( context );
    // evaluate argsList nodes.
    for( var i = 0, len = argsList.length; i < len; i++ ){
        newContext.put( funct.args[i].getName(), this.evaluate( argsList[i], context ) );
    }
    // set unused parameters to undefined.
    for( ; i < funct.args.length; i++ ){
        newContext.put( funct.args[i].getName(), undefined );
    }
    for( i = 0, len = funct.stmtList.length; i < len; i++ ){
        if( typeof funct.stmtList[i] !== 'undefined' ){
            this.evaluate( funct.stmtList[i], newContext );
        }
    }
}

Interpreter.prototype.evaluateBuiltInFunction = function( functName, argsList, context ){
    var args = [];
    for( var i = 0, len = argsList.length; i < len; i++ ){
        args.push( this.evaluate( argsList[i], context ) );
    }
    return BuiltIns[ functName ].apply( {}, args );
}

Interpreter.prototype.isBuiltInFunction = function( functName ){
    return this.hasAttribute( BuiltIns, functName );
}

Interpreter.prototype.isUserDefined = function( functName, context ){
    return this.hasAttribute( context.getFunctHash(), functName );
}

var interp = new Interpreter( "test.js" );
interp.execute();
