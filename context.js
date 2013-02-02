function Context(){
    this.current = {};
    this.current.__userdfs = {};
    this.plink = null;
}

Context.prototype.addContext = function( context ){   
    this.plink = context;
}

Context.prototype.put = function( key, value ){
    this.current[ key ] = value;
}

Context.prototype.get = function( key ){
    return this.current[ key ];
}

Context.prototype.getHash = function(){
    return this.current;
}

Context.prototype.addFunct = function( functName, funct ){
    this.current.__userdfs[ functName ] = funct
}

Context.prototype.getFunct = function( functName ){
    return this.current.__userdfs[ functName ];
}

Context.prototype.getFunctHash = function(){
    return this.current.__userdfs;
}

Context.prototype.destroy = function(){
    this.current = this.plink = null;
}

module.exports = Context;
