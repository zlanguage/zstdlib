function isObject(thing) {
    return thing !== null && (typeof thing === "function" || typeof thing === "object");
}

function typeOf(thing) {
    if (thing === undefined) {
        return "undefined";
    }
    if (thing.type !== undefined && typeof thing.type === "function") {
        let type = thing.type();
        if (typeof type === "string" && type !== "") {
            return type;
        }
    }
    if (thing === null) {
        return "null";
    } else if (Number.isNaN(thing)) {
        return "NaN";
    } else if (Array.isArray(thing)) {
        return "array";
    } else {
        return typeof thing;
    }
}

function $eq(left, right) {
    if (left !== undefined && left.$eq) {
        return left.$eq(right);
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
        case "function":
            return left.toString() === right.toString();
        case "number":
            return Math.abs(left - right) < Number.EPSILON;
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
    if (!isObject(obj)) {
        return obj;
    }
    try {
        JSON.stringify(obj);
    } catch (err) {
        if (err.message === "Converting circular structure to JSON") {
            return obj;
        }
    }
    let res = {};
    Object.entries(obj).forEach(([key, val]) => {
        res[key] = copy(val);
    });
    return res;
}

function log(...things) {
    console.log(...things);
}

function $plus(x, y) {
    if (y["r+"]) {
        return y["r+"](x);
    }
    if (x["+"]) {
        return x["+"](y);
    }
    return Number(x) + Number(y);
}

function $minus(x, y) {
    if (y["r-"]) {
        return y["r-"](x);
    }
    if (x["-"]) {
        return x["-"](y);
    }
    return Number(x) - Number(y);
}

function $star(x, y) {
    if (y["r*"]) {
        return y["r*"](x);
    }
    if (x["*"]) {
        return x["*"](y);
    }
    return Number(x) * Number(y);
}

function $slash(x, y) {
    if (y["r/"]) {
        return y["r/"](x);
    }
    if (x["/"]) {
        return x["/"](y);
    }
    return Number(x) / Number(y);
}

function $carot(x, y) {
    let res = x;
    for (let i = 0; i < y - 1; i++) {
        res = $star(res, x);
    }
    return res;
}

function $lt(x, y) {
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

function $plusplus(x, ...ys) {
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
    $lt,
    $gt$eq,
    $gt,
    $lt$eq,
    not,
    $plus$plus,
    m,
    both,
    either
})