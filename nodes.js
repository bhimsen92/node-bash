var Token = require( "./token" );

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

module.exports = {
                    "Identifier" : Identifier,
                    "_Number"    :  _Number,
                    "Operator"   : Operator
                 };
