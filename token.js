var counter = 0;
var Token = {
    number : ++counter,
    ident  : ++counter,
    and    : ++counter,
    or     : ++counter,
    not    : ++counter,
    _for   : ++counter,
    _while : ++counter,
    _if    : ++counter,
    _else  : ++counter,
    l      : ++counter,
    g      : ++counter,
    minus  : ++counter,
    div    : ++counter,
    mul    : ++counter,
    plus   : ++counter,
    equal  : ++counter,
    semi   : ++counter,
    eof    : ++counter };
module.exports = Token;
