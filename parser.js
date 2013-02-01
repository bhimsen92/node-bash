var Lexer = require( "./lexer" ),
    Token = require( "./token" ),
    Identifier = require( "./nodes" ).Identifier,
    _Number = require( "./nodes" )._Number,
    Operator = require( "./nodes" ).Operator;
    
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
    var nodelist = [];
    while( true ){
        if( this.lexer.match( Token.eof ) ){
            break;
        }
        nodelist.push( this.statement() );
        if( this.lexer.match( Token.semi ) ){
            this.lexer.advance();
        }
        else{
            break;
        }
    }
    return nodelist;
}

Parser.prototype.statement = function(){
    var nodeStack = [],
        n1 = null,
        n2 = null,
        opr, nameNode, exprNode;
    while( true ){
        /**
            stmt : VARIABLE '=' expression;
        */
        if( this.lexer.match( Token.ident ) ){
            nameNode = new Identifier( this.lexer.lexeme );
            this.lexer.advance();
            if( this.lexer.match( Token.equal ) ){
                opr = Token.equal;
                this.lexer.advance();
                exprNode = this.expression();
                nodeStack.push( new Operator( opr, nameNode, exprNode ) );
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
                        }
                    }
                }
            }
        }
        else{
            // === epsilon transition cfg.
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
    power  : factor power'
    power' : ^ factor power'
           | epsilon
*/
Parser.prototype.power = function(){
    var nodeStack = [],
        n1 = null,
        n2 = null, opr;
    n1 = this.factor();
    while( true ){
        if( this.lexer.match( Token.power ) ){
            opr = Token.power;
        }
        else{
            // === epsilon in cfg.
            break;
        }
        this.lexer.advance();
        n2 = this.factor();
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
    factor: number
          | identifier
          | ( expression )
*/
Parser.prototype.factor = function(){
    var node = null;
    if( this.lexer.match( Token.number ) ){
        node = new _Number( this.lexer.lexeme );
        this.lexer.advance();
    }
    else if( this.lexer.match( Token.ident ) ){
        node = new Identifier( this.lexer.lexeme );
        this.lexer.advance();
    }
    else if( this.lexer.match( Token.ob ) ){
        this.lexer.advance();
        node = this.expression();
        if( this.lexer.match( Token.cb ) ){
            this.lexer.advance();
        }
        else{
            console.warn( "missing '(' symbol" );
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
    Grammer took from Dragaon book.
*/
Parser.prototype.boolean = function(){
    var nodeStack = [],
        n1 = null,
        n2 = null, opr;
    if( this.lexer.match( Token.not ) ){
        opr = Token.not;
        this.lexer.advance();
        n1 = this.join();
        nodeStack.push( new Operator( opr, n1 ) );
    }
    else{
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
    this.lexer.advance();
    console.log( "op: " + this.lexer.lexeme );    
    n2 = this.expression();
    
    return new Operator( opr, n1, n2 );
}

module.exports = Parser;
