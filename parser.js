var Lexer = require( "./lexer" ),
    Token = require( "./token" ),
    Identifier = require( "./nodes" ).Identifier,
    _Number = require( "./nodes" )._Number,
    Operator = require( "./nodes" ).Operator,
    _String = require( "./nodes" )._String,
    util = require( "util" );
    
function Parser( file ){
    this.lexer = new Lexer( file, true );
}

Parser.prototype.parse = function(){
    return this.program();
};

Parser.prototype.program = function(){
    return this.statementList();
};

Parser.prototype.statementList = function(){
    var nodelist = [],
        node;
    while( true ){
        //console.log( "statements" );
        node = this.statement();
        if( node != null && node != undefined ){
            nodelist.push( node );
        }
        else{
            // no statements to read, the end of statments.
            break;
        }
        if( this.lexer.match( Token.eof ) ){
            break;
        }/*
        if( this.lexer.match( Token.semi ) ){
            this.lexer.advance();
        }
        else{
            break;
        }*/
    }
    return nodelist;
}

Parser.prototype.statement = function(){
    var nodeStack = [],
        n1 = null,
        n2 = null,
        n3 = null,
        n4 = null,
        opr, nameNode, exprNode;
    while( true ){
        /**
            stmt : VARIABLE '=' expression;
        */
        if( this.lexer.match( Token.ident ) && !this.lexer.peek( Token.ob ) ){
            nameNode = new Identifier( this.lexer.lexeme );
            this.lexer.advance();
            if( this.lexer.match( Token.equal ) ){
                opr = Token.equal;
                this.lexer.advance();
                exprNode = this.expression();
                if( this.lexer.match( Token.semi ) ){
                    this.lexer.advance();
                    nodeStack.push( new Operator( opr, nameNode, exprNode ) );
                    break;
                }
                else{
                    console.warn( "missing ';' character" );
                }
            }
            else{
                // valid ==> a;
                nodeStack.push( nameNode );
                // === epsilon transition cfg.
                break;
            }
        }
        /**
            stmt : WHILE '(' boolean ')' '{' stmt_list '}';
        */
        else if( this.lexer.match( Token._while ) ){
            opr = Token._while;
            this.lexer.advance();
            if( this.lexer.match( Token.ob ) ){
                this.lexer.advance();
                n1 = this.boolean();
                if( this.lexer.match( Token.cb ) ){
                    this.lexer.advance();
                    if( this.lexer.match( Token.fob ) ){
                        this.lexer.advance();
                        n2 = this.statementList();
                        if( this.lexer.match( Token.fcb ) ){
                            this.lexer.advance();                            
                            nodeStack.push( new Operator( opr, n1, n2 ) );
                            break;
                        }
                    }
                }
            }
        }
        /**
            stmt : IF '(' boolean ')' '{' stmt_list '}'
                 | IF '(' boolean ')' '{' stmt_list '}' else '{' stmt_list '}'
        */
        else if( this.lexer.match( Token._if ) ){
            opr = Token._if;
            this.lexer.advance();
            if( this.lexer.match( Token.ob ) ){
                this.lexer.advance();
                n1 = this.boolean();
                if( this.lexer.match( Token.cb ) ){
                    this.lexer.advance();
                    if( this.lexer.match( Token.fob ) ){
                        this.lexer.advance();
                        n2 = this.statementList();
                        if( this.lexer.match( Token.fcb ) ){
                            this.lexer.advance();
                            if( this.lexer.match( Token._else ) ){
                                this.lexer.advance();
                                if( this.lexer.match( Token.fob ) ){
                                    this.lexer.advance();
                                    n3 = this.statementList();
                                    if( this.lexer.match( Token.fcb ) ){
                                        this.lexer.advance();
                                        nodeStack.push( new Operator( opr, n1, n2, n3 ) );
                                        break;
                                    }
                                }
                            }
                            else{
                                nodeStack.push( new Operator( opr, n1, n2 ) );
                                break;
                            }
                        }
                    }
                }
            }
        }
        /**
            stmt: funct name '(' args_list ')' '{' stmt_list '}'
        */
        else if( this.lexer.match( Token.funct ) ){
            opr = Token.funct;
            this.lexer.advance();
            if( this.lexer.match( Token.ident ) ){
                n1 = new Identifier( this.lexer.lexeme );
                this.lexer.advance();
                if( this.lexer.match( Token.ob ) ){
                    this.lexer.advance();
                    n2 = this.functionParameterList();
                    if( this.lexer.match( Token.cb ) ){
                        this.lexer.advance();
                        if( this.lexer.match( Token.fob ) ){
                            this.lexer.advance();
                            //console.log( "in_funct def" );
                            n3 = this.statementList();
                            //console.log( "out_funct def" );
                            if( this.lexer.match( Token.fcb ) ){
                                this.lexer.advance();
                                //console.log( "seen }" );
                                nodeStack.push( new Operator( opr, n1, n2, n3 ) );
                                break;
                            }
                            else{
                                console.warn( "missing '}' in function definition: " + n1.getName() );
                            }
                        }
                        else{
                            console.warn( "missing '{' in function definition: " + n1.getName() );
                        }
                    }
                    else{
                        console.warn( "missing ')' in function definition: " + n1.getName() );
                    }
                }
                else{
                    console.warn( "missing '(' in function definition:" + n1.getName() );
                }
            }
            else{
                console.warn( "function name must be an identfier." );
            }
        }
        /**
            stmt : expression;
        */
        else{
            /**
                !this.lexer.match( Token.fcb ) hack to stop from reading past '{' while parsing while and if else conditions.
            */
            if( this.lexer.exists( Token.number, Token.string, Token.ident, Token.ob ) && !this.lexer.match( Token.fcb ) ){
                //console.log( "lexeme: " + this.lexer.lexeme );
                nodeStack.push( this.expression() );
                if( this.lexer.match( Token.semi ) ){
                    this.lexer.advance();
                }
                else{
                    console.warn( "missing ';' at the end of the expression" );
                }
            }
            break;
        }
    }
    if( nodeStack.length > 0 ){
        return nodeStack.pop();
    }
    else{
        return null;
    }
};
/**
    expression : term expression'
    experssion' : + term expression'
                | - term expression'
                | epsilon
*/
Parser.prototype.expression = function(){
    var nodeStack = [],
        n1 = null,
        n2 = null, opr;
        
    n1 = this.term();
    while( true ){
        if( this.lexer.match( Token.plus ) ){
            opr = Token.plus;
        }
        else if( this.lexer.match( Token.minus ) ){
            opr = Token.minus;
        }
        else{
            // === epsilon in cfg.
            break;
        }
        this.lexer.advance();
        n2 = this.term();
        if( nodeStack.length > 0 ){
            n1 = nodeStack.pop();
        }
        nodeStack.push( new Operator( opr, n1, n2 ) );
    }
    if( nodeStack.length > 0 ){
        return nodeStack.pop();
    }
    else{
        return n1;
    }
};

/**
    term  : power term'
    term' : * power term'
          | / power term'
          | epsilon
*/
Parser.prototype.term = function(){
    var nodeStack = [],
        n1 = null,
        n2 = null, opr;
    n1 = this.power();
    while( true ){
        if( this.lexer.match( Token.mul ) ){
            opr = Token.mul;
        }
        else if( this.lexer.match( Token.div ) ){
            opr = Token.div;
        }
        else{
            // === epsilon in cfg.
            break;
        }
        this.lexer.advance();
        n2 = this.power();
        if( nodeStack.length > 0 ){
            n1 = nodeStack.pop();
        }
        nodeStack.push( new Operator( opr, n1, n2 ) );
    }
    if( nodeStack.length > 0 ){
        return nodeStack.pop();
    }
    else{
        return n1;
    }
}

/**
    power  : unary power'
    power' : ^ unary power'
           | epsilon
*/
Parser.prototype.power = function(){
    var nodeStack = [],
        n1 = null,
        n2 = null, opr;
    n1 = this.unary();
    while( true ){
        if( this.lexer.match( Token.power ) ){
            opr = Token.power;
        }
        else{
            // === epsilon in cfg.
            break;
        }
        this.lexer.advance();
        n2 = this.unary();
        if( nodeStack.length > 0 ){
            n1 = nodeStack.pop();
        }
        nodeStack.push( new Operator( opr, n1, n2 ) );
    }
    if( nodeStack.length > 0 ){
        return nodeStack.pop();
    }
    else{
        return n1;
    }
}

/**
    unary: not unary
          | - unary
          | factor    
*/
Parser.prototype.unary = function(){
    var oprStack = [],
        node = null,
        opr;
    while( true ){
        if( this.lexer.match( Token.not ) ){
            oprStack.push( Token.not );
            this.lexer.advance();
        }
        else if( this.lexer.match( Token.minus ) ){
            oprStack.push( Token.uminus );
            this.lexer.advance();
        }
        else{
            node = this.factor();
            break;
        }
    }
    if( oprStack.length > 0 ){
        while( oprStack.length > 0 ){
            opr = oprStack.pop();
            node = new Operator( opr, node );
        }
    }
    return node;
}

/**
    factor: number
          | string
          | identifier
          | identifier( args_list ) !! function call.
          | ( boolean )
*/
Parser.prototype.factor = function(){
    var node = null,
        argsList = null;
    if( this.lexer.match( Token.number ) ){
        node = new _Number( this.lexer.lexeme );
        this.lexer.advance();
    }
    else if( this.lexer.match( Token.string ) ){
        node = new _String( this.lexer.lexeme );
        this.lexer.advance();
    }
    else if( this.lexer.match( Token.ident ) ){
        //console.log( "in_factor: " + this.lexer.lexeme );
        node = new Identifier( this.lexer.lexeme );
        this.lexer.advance();
        if( this.lexer.match( Token.ob ) ){
            this.lexer.advance();
            argsList = this.argsList();
            //console.log( "good in factor" );
            if( this.lexer.match( Token.cb ) ){
                this.lexer.advance();
                node = new Operator( Token.funct_call, node, argsList );
            }
            else{
                console.warn( "function_call, missing ')' character" );
            }
        }
    }
    else if( this.lexer.match( Token.ob ) ){
        this.lexer.advance();
        node = this.boolean();
        if( this.lexer.match( Token.cb ) ){
            this.lexer.advance();
        }
        else{
            console.warn( "missing ')' symbol" );
            // throw error.
        }
    }
    else{
        console.warn( "illegal character: " + this.lexer.lexeme );
        // throw error.
    }
    return node;
}

/**
    argslist  : expr argslist'
    argslist' : , expr argslist'
*/
Parser.prototype.argsList = function(){
    // i got no better name for this.
    var argslist = [];
    // !this.lexer.match( Token.cb ) hack is for parsing empty args list. eg: helloWorld()
    if( !this.lexer.match( Token.cb ) ){
        argslist.push( this.expression() );
        while( true ){
            if( this.lexer.match( Token.comma ) ){
                this.lexer.advance();
                argslist.push( this.expression() );
            }
            else{
                break;
            }
        }
    }
    return argslist;
}

/**
    funct_parameter : ident funct_parameter'
    funct_parameter : , ident funct_parameter'
*/
Parser.prototype.functionParameterList = function(){
    var paralist = [];
    if( this.lexer.match( Token.ident ) ){
        paralist.push( new Identifier( this.lexer.lexeme ) );
        this.lexer.advance();
        while( true ){
            if( this.lexer.match( Token.comma ) ){
                this.lexer.advance();
                if( this.lexer.match( Token.ident ) ){
                    paralist.push( new Identifier( this.lexer.lexeme ) );
                    this.lexer.advance();
                }
                else{
                    console.warn( "function parameter: identifier is required." );
                }
            }
            else{
                break;
            }
        }
    }
    else if( !this.lexer.match( Token.cb ) ){
        console.warn( "parameter must be an identifier" );
    }
    return paralist;
}

/**
    Grammer took from Dragaon book.
*/
Parser.prototype.boolean = function(){
    var nodeStack = [],
        n1 = null,
        n2 = null, opr;
    n1 = this.join();
    while( true ){
        if( this.lexer.match( Token.or ) ){
            opr = Token.or;
        }
        else{
            break;
        }
        this.lexer.advance();
        n2 = this.join();
        if( nodeStack.length > 0 ){
            n1 = nodeStack.pop();
        }
        nodeStack.push( new Operator( opr, n1, n2 ) );
    }
    if( nodeStack.length > 0 ){
        return nodeStack.pop();
    }
    else{
        return n1;
    }
}

Parser.prototype.join = function(){
    var nodeStack = [],
        n1 = null,
        n2 = null, opr;
    n1 = this.equality();
    while( true ){
        if( this.lexer.match( Token.and ) ){
            opr = Token.and;
        }
        else{
            break;
        }
        this.lexer.advance();
        n2 = this.equality();
        if( nodeStack.length > 0 ){
            n1 = nodeStack.pop();
        }
        nodeStack.push( new Operator( opr, n1, n2 ) );
    }
    if( nodeStack.length > 0 ){
        return nodeStack.pop();
    }
    else{
        return n1;
    }
}

Parser.prototype.equality = function(){
    var nodeStack = [],
        n1 = null,
        n2 = null, opr;    
    n1 = this.relation();
    while( true ){
        if( this.lexer.match( Token.eq ) ){
            opr = Token.eq;
        }
        else if( this.lexer.match( Token.neq ) ){
            opr = Token.neq;
        }
        else{
            break;
        }
        this.lexer.advance();
        n2 = this.relation();
        if( nodeStack.length > 0 ){
            n1 = nodeStack.pop();
        }
        nodeStack.push( new Operator( opr, n1, n2 ) );
    }
    if( nodeStack.length > 0 ){
        return nodeStack.pop();
    }
    else{
        return n1;
    }
}

Parser.prototype.relation = function(){
    var nodeStack = [],
        n1 = null,
        n2 = null, opr;
    n1 = this.expression();
    if( this.lexer.match( Token.l ) ){
        opr = Token.l;        
    }
    else if( this.lexer.match( Token.g ) ){
        opr = Token.g;
    }
    else if( this.lexer.match( Token.le ) ){
        opr = Token.le;
    }
    else if( this.lexer.match( Token.ge ) ){
        opr = Token.ge;
    }
    else{
        return n1;
    }
    this.lexer.advance();
    n2 = this.expression();
    return new Operator( opr, n1, n2 );
}

module.exports = Parser;
