var PipeBuffer = require( "./pipebuffer" );

function Context(){
    this.current = {};
    this.current.__userdfs = {};
    this.token = {};
    this.plink = null;
    this.pipeBuffer = null;
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
    var funct = this.current.__userdfs[ functName ],
        context;
    if( typeof funct === 'undefined' ){
        context = this.plink;
        while( context != null ){
            funct = context.current.__userdfs[ functName ];
            if( typeof funct !== 'undefined' )
                return funct;
            else
                context = context.plink;
        }
    }
    return funct;
}

Context.prototype.getFunctHash = function(){
    return this.current.__userdfs;
}

Context.prototype.getPLink = function(){
    return this.plink;
}

Context.prototype.setToken = function( tok ){
    this.token[ tok ] = true;
}

Context.prototype.tokenExist = function( tok ){
    if( typeof this.token[ tok ] != 'undefined' ){
        return this.token[ tok ];
    }
    return false;
}

Context.prototype.destroy = function(){
    this.current.__userdfs = null;
    this.current = this.plink = this.token = null;
}

Context.prototype.createPipeBuffer = function(){
    this.pipeBuffer = new PipeBuffer(); 
}

Context.prototype.destroyPipeBuffer = function(){
    this.pipeBuffer = null;
}

Context.prototype.getPipeBuffer = function(){
    var currContext = this;
    while( currContext != null ){
        if( currContext.pipeBuffer != null ){
            return currContext.pipeBuffer;
        }
        else{
            currContext = currContext.plink;
        }
    }
    return null;
}

Context.prototype.pipeExist = function(){
    var currContext = this;
    while( currContext != null ){
        if( currContext.pipeBuffer != null ){
            return true;
        }
        else{
            currContext = currContext.plink;
        }
    }
    return false;
}

module.exports = Context;
