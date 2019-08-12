function isObject(thing) {
    return thing !== null && (typeof thing === "function" || typeof thing === "object");
}

function typeOf(thing) {
    if (thing === undefined) {
        return "undefined";
    }
    if (thing === null) {
        return "null";
    }
    if (thing.type !== undefined && typeof thing.type === "function") {
        const type = thing.type();
        if (typeof type === "string" && type !== "") {
            return type;
        }
    }
    if (Number.isNaN(thing)) {
        return "NaN";
    } else if (Array.isArray(thing)) {
        return "array";
    } else {
        return typeof thing;
    }
}

function typeGeneric(thing) {
    if (thing != null && thing.typeGeneric && typeof thing.typeGeneric === "function") {
        const type = thing.typeGeneric();
        if (typeof type === "string" && type !== "") {
            return type;
        }
    }
    if (Array.isArray(thing)) {
        const types = new Set();
        for (let i = 0; !thing.every(part => types.has(typeGeneric(part))); i++) {
            types.add(typeGeneric(thing[i]))
        }
        return `array<${Array.from(types).join("|")}>`;
    }
    return typeOf(thing)
}

function $eq(left, right) {
    if (right != null && right["r="]) {
        return right["r="](left);
    }
    if (left != null && left["="]) {
        return left["="](right);
    }
    let typeOfLeft = typeOf(left);
    let typeOfRight = typeOf(right);
    if (typeOfLeft !== typeOfRight) {
        return false;
    }
    try {
        JSON.stringify(left);
        JSON.stringify(right);
    } catch (err) {
        if (err.message === "Converting circular structure to JSON") {
            return false;
        }
    }
    switch (typeOfLeft) {
        case "NaN":
        case "null":
        case "undefined":
            return true;
        case "number":
            return Math.abs(left - right) < Number.EPSILON;
        case "function":
        case "string":
        case "boolean":
        case "bigint":
        case "symbol":
            return left === right;
        case "array":
            return (left.length === right.length) && left.every((x, index) => $eq(x, right[index]))
        case "object":
            return (Object.keys(left).length === Object.keys(right).length) && Object.entries(left).every(([key, val]) => $eq(right[key], val))
    }
}

function stone(obj) {
    Object.freeze(obj);
    Object.keys(obj).forEach(key => {
        if (isObject(obj[key]) && !Object.isFrozen(obj[key])) {
            Object.freeze(obj[key]);
        }
    });
    return obj;
}

function copy(obj) {
    if (!isObject(obj) || typeof obj === "function") {
        return obj;
    }
    try {
        JSON.stringify(obj);
    } catch (err) {
        if (err.message === "Converting circular structure to JSON") {
            return obj;
        }
    }
    let res = new(obj.constructor)()
    Object.entries(obj).forEach(([key, val]) => {
        res[key] = copy(val);
    });
    return res;
}

function log(...things) {
    console.log(...things);
}

function $plus(x, y) {
    if (x == null || y == null) {
        return NaN;
    }
    if (y["r+"]) {
        return y["r+"](x);
    }
    if (x["+"]) {
        return x["+"](y);
    }
    return Number(x) + Number(y);
}

function $minus(x, y) {
    if (x == null || y == null) {
        return NaN;
    }
    if (y["r-"]) {
        return y["r-"](x);
    }
    if (x["-"]) {
        return x["-"](y);
    }
    return Number(x) - Number(y);
}

function $star(x, y) {
    if (x == null || y == null) {
        return NaN;
    }
    if (y["r*"]) {
        return y["r*"](x);
    }
    if (x["*"]) {
        return x["*"](y);
    }
    return Number(x) * Number(y);
}

function $slash(x, y) {
    if (x == null || y == null) {
        return NaN;
    }
    if (y["r/"]) {
        return y["r/"](x);
    }
    if (x["/"]) {
        return x["/"](y);
    }
    return Number(x) / Number(y);
}

function $carot(x, y) {
    if (x == null || y == null) {
        return NaN;
    }
    let res = x;
    for (let i = 0; i < y - 1; i++) {
        res = $star(res, x);
    }
    return res;
}

function $percent(x, y) {
    if (x == null || y == null) {
        return NaN;
    }
    if (y["r%"]) {
        return y["r%"](x);
    }
    if (x["%"]) {
        return x["%"](y);
    }
    return Number(x) % Number(y);
}

function $lt(x, y) {
    if (x == null || y == null) {
        return false;
    }
    if (y["r<"]) {
        return y["r<"](x);
    }
    if (x["<"]) {
        return x["<"](y);
    }
    return Number(x) < Number(y);
}

function $gt$eq(x, y) {
    return !$lt(x, y);
}

function $gt(x, y) {
    return !$lt(x, y) && !$eq(x, y);
}

function $lt$eq(x, y) {
    return !$gt(x, y);
}

function $plus$plus(x, ...ys) {
    if (!x.concat) {
        throw new Error(`${x} cannot be concatted.`);
    }
    return x.concat(...ys);
}


function not(x) {
    return !x;
}

function both(x, y) {
    return Boolean(x && y);
}

function either(x, y) {
    return Boolean(x || y);
}

function m(...strs) {
    return strs.join("\n")
}

function assertBool(bool) {
    if (typeof bool === "boolean") {
        return bool;
    }
    throw new Error("Expected Boolean");
}

function assertType(type, val) {
    if (typeOf(val) === type) {
        return val;
    }
    throw new Error(`${val} is not of type ${type}.`)
}

function chan() {
    const mailbox = [];
    return {
        type() {
            return "Channel"
        },
        rcv(val) {
            mailbox.push(val);
        },
        _from() {
            return new Promise(resolve => {
                if (mailbox.length > 0) {
                    resolve(mailbox.pop());
                    return;
                }
                const fromInterval = setInterval(() => {
                    if (mailbox.length > 0) {
                        clearInterval(fromInterval);
                        resolve(mailbox.pop());
                    }
                }, 0);
            });
        }
    }
}
const JS = {
    new(constructor, ...args) {
        return new(constructor)(...args);
    },
    typeof(thing) {
        return typeof thing;
    },
    instanceof(thing, superclass) {
        return thing instanceof superclass
    },
    "+" (x, y) {
        if (y !== undefined) {
            return x + y;
        }
        return +x;
    },
    "-" (x, y) {
        if (y !== undefined) {
            return x - y;
        }
        return -x;
    },
    "*" (x, y) {
        return x * y;
    },
    "**" (x, y) {
        return x ** y;
    },
    "%" (x, y) {
        return x % y;
    },
    "==" (x, y) {
        return x == y;
    },
    "===" (x, y) {
        return x === y;
    },
    "!=" (x, y) {
        return x != y;
    },
    "!==" (x, y) {
        return x !== y;
    },
    ">" (x, y) {
        return x > y;
    },
    "<" (x, y) {
        return x < y;
    },
    ">=" (x, y) {
        return x >= y;
    },
    "<=" (x, y) {
        return x <= y;
    },
    "&&" (x, y) {
        return x && y;
    },
    "||" (x, y) {
        return x || y;
    },
    "!" (x) {
        return !x;
    },
    "&" (x, y) {
        return x & y;
    },
    "|" (x, y) {
        return x | y;
    },
    "^" (x, y) {
        return x ^ y;
    },
    "~" (x) {
        return ~x;
    },
    "<<" (x, y) {
        return x << y;
    },
    ">>" (x, y) {
        return x >> y;
    },
    ">>>" (x, y) {
        return x >>> y;
    }
}

module.exports = Object.freeze({
    $eq,
    isObject,
    typeOf,
    stone,
    log,
    copy,
    assertBool,
    $plus,
    $minus,
    $star,
    $slash,
    $percent,
    $carot,
    pow: $carot,
    $lt,
    $gt$eq,
    $gt,
    $lt$eq,
    not,
    $plus$plus,
    m,
    both,
    either,
    and: both,
    or: either,
    JS,
    assertType,
    typeGeneric,
    chan
})