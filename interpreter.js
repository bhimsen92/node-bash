var Token = require( "./token" ),
    Identifier = require( "./nodes" ).Identifier,
    _Number = require( "./nodes" )._Number,
    _String = require( "./nodes" )._String,
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
    if( ( typeof node !== 'undefined' && node != null ) && typeof node.operands !== 'undefined' ){
        var op1 = node.operands[0],
            op2 = node.operands[1],
            op3 = node.operands[2],
            op4 = node.operands[3];
    }
    switch( node.type ){
        case Token.ident:
                    if( this.hasAttribute( context.getHash(), node.name ) ){
                        return context.get( node.name );
                    }                    
                    else{
                        var result = this.resolve( node.name, context );
                        if( result == null ){
                            throw Error( "Undefined symbol: " + node.name );
                        }
                        else{
                            return result;
                        }
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
                                if( stmtList[i].type == Token._return ){
                                    var value = this.evaluate( stmtList[i], context );
                                    return {
                                        "token" : "return",
                                        "rvalue" : value
                                    };
                                }
                                else{
                                    var value = this.evaluate( stmtList[i], context );
                                    if( typeof value == 'object' && value.token == 'return' ){
                                        return value;
                                    }
                                }
                            }
                        }
                        break;
        case Token._if:
                       if( this.evaluate( op1, context ) ){
                            var ifStmtList = op2;
                            for( var i = 0, len = ifStmtList.length; i < len; i++ ){
                                if( ifStmtList[i].type == Token._return ){
                                    var value = this.evaluate( ifStmtList[i], context );
                                    return {
                                        "token" : "return",
                                        "rvalue" : value
                                    };
                                }
                                else{
                                    var value = this.evaluate( ifStmtList[i], context );
                                    if( typeof value == 'object' && value.token == 'return' ){
                                        return value;
                                    }
                                }
                            }
                       }
                       else if( node.operands.length == 3 ){
                            var elseStmtList = op3;
                            for( var i = 0, len = elseStmtList.length; i < len; i++ ){
                                // code getting repeated, i need to rethink but not today.
                                if( elseStmtList[i].type == Token._return ){
                                    var value = this.evaluate( elseStmtList[i], context );
                                    return {
                                        "token" : "return",
                                        "rvalue" : value
                                    };
                                }
                                else{
                                    var value = this.evaluate( elseStmtList[i], context );
                                    if( typeof value == 'object' && value.token == 'return' ){
                                        return value;
                                    }
                                }
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
                        context.addFunct( functName, new UserDefinedFunction( op2, op3, op4 ) );
                        break;
        case Token._return:
                        // check whether return statement is executed in proper context.
                        if( context.tokenExist( "funct" ) ){
                            var rval = this.evaluate( op1, context );
                            return rval;
                        }
                        else{
                            console.warn( "invalid return statement, it can only occur in functions." );
                            throw Error( "return error" );
                        }
                        break;
        case Token.pipe:
                        // create a pipe Buffer
                        context.createPipeBuffer();
                        var pipeBuffer = context.getPipeBuffer();
                        // evaluate the first expression.
                        var node = op1[0];
                        if( node.type != Token.funct_call ){
                            pipeBuffer.enqueue( this.evaluate( node, context ) );
                        }
                        else{
                            this.evaluate( node, context );
                        }
                        for( var i = 1; i < op1.length; i++ ){
                            var data = pipeBuffer.toString();
                            node = op1[i];
                            if( node.type == Token.ident ){
                                this.evaluate( new Operator( Token.equal, node, new _String( data ) ), context );
                                pipeBuffer.enqueue( data );
                            }
                            else if( node.type == Token.funct_call ){
                                var newArgList = [];
                                newArgList.push( node.operands[0] );
                                newArgList.push( [ new _String( data ) ] );
                                node.operands = newArgList;
                                this.evaluate( node, context );
                            }
                            else{
                                throw Error( "pipes intermediate expressions must be either function call or identifier." );
                            }
                        }
                        context.destroyPipeBuffer();
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
        funct, rval = '';
    // get the function.
    funct = context.getFunct( functName );
    // push the current context.
    newContext.addContext( context );
    newContext.setToken( "funct" );
    // evaluate argsList nodes.
    for( var i = 0, len = argsList.length; i < len; i++ ){
        newContext.put( funct.args[i].getName(), this.evaluate( argsList[i], context ) );
    }
    // set unused parameters to undefined.
    for( ; i < funct.args.length; i++ ){
        newContext.put( funct.args[i].getName(), undefined );
    }
    for( i = 0, len = funct.stmtList.length; i < len; i++ ){
        if( typeof funct.stmtList[i] !== 'undefined' && funct.stmtList[i] != null ){
            if( funct.stmtList[i].type == Token._return ){
                var rval = this.evaluate( funct.stmtList[i], newContext );
                break;
            }
            else{
                var stmtRValue = this.evaluate( funct.stmtList[i], newContext );
                if( stmtRValue != null && typeof stmtRValue == 'object' && stmtRValue.token == 'return' ){
                    // destroy current context before returning.
                    rval = stmtRValue.rvalue;
                    break;
                }
            }
        }
    }
    newContext.destroy();
    return rval;
}

Interpreter.prototype.evaluateBuiltInFunction = function( functName, argsList, context ){
    var args = [];
    if( functName == "pipe" ){
        // make sure it is executed in proper context.
        if( context.pipeExist() ){
            args.push( context );
        }
        else{
            throw Error( "pipe function can only be used in pipe statement context." );
        }
    }
    for( var i = 0, len = argsList.length; i < len; i++ ){
        args.push( this.evaluate( argsList[i], context ) );
    }
    return BuiltIns[ functName ].apply( {}, args );
}

Interpreter.prototype.isBuiltInFunction = function( functName ){
    return this.hasAttribute( BuiltIns, functName );
}

Interpreter.prototype.isUserDefined = function( functName, context ){
    if( this.hasAttribute( context.getFunctHash(), functName ) ){
        return true;
    }
    else{
        return this.resolveFunctName( functName, context );
    }
}

Interpreter.prototype.resolve = function( varName, context ){
    var currContext = context.getPLink();
    while( currContext != null ){
        if( this.hasAttribute( currContext.getHash(), varName ) ){
            return currContext.get( varName );
        }
        else{
            currContext = currContext.getPLink();
        }
    }
    return null;
}

Interpreter.prototype.resolveFunctName = function( functName, context ){
    var currContext = context.getPLink();
    while( currContext != null ){
        if( this.hasAttribute( currContext.getFunctHash(), functName ) )
            return true;
        else
            currContext = currContext.getPLink();
    }
    return false;
}
module.exports = Interpreter;
//var interp = new Interpreter( "test.js" );
//interp.execute();
