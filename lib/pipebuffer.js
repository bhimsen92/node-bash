function Node( data ){
    this.data = data;
    this.nlink = this.plink = null;
}

Node.prototype.getData = function(){
    return this.data;
}

function Q(){
    this.front = this.rare = null;
}
Q.prototype.enqueue = function( data ){
    var node = new Node( data );
    if( this.front == null ){
        this.front = this.rare = node;
    }
    else{
        this.rare.nlink = node;
        node.plink = this.rare;
        this.rare = node;
    }
}
Q.prototype.dequeue = function(){
    var rval = this.front;
    if( rval === null ){
        throw Error( "Q is empty" );
    }
    this.front = rval.nlink;
    return rval;
}

Q.prototype.toString = function(){
    var rval = [],
        data;
    while( !this.qEmpty() ){
        data = this.dequeue().getData().toString();
        rval.push( data );
    }
    return rval.join( "\n" );
}

Q.prototype.qEmpty = function(){
    return this.front == null;
}

module.exports = Q;
