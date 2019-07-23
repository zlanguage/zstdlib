"use strict";

const $Z = require("@zlanguage/zstdlib")
const matcher = require("@zlanguage/zstdlib/src/js/matcher");

const $eq = $Z.$eq;
const isObject = $Z.isObject;
const typeOf = $Z.typeOf;
const stone = $Z.stone;
const log = $Z.log;
const copy = $Z.copy;
const assertBool = $Z.assertBool;
const $plus = $Z.$plus;
const $minus = $Z.$minus;
const $star = $Z.$star;
const $slash = $Z.$slash;
const $lt = $Z.$lt;
const $gt$eq = $Z.$gt$eq;
const $gt = $Z.$gt;
const $lt$eq = $Z.$lt$eq;
const not = $Z.not;
const $plus$plus = $Z.$plus$plus;
const m = $Z.m;
const both = $Z.both;
const either = $Z.either;
const JS = $Z.JS;

const _if = function (cond) {
  return {
    ["then"]: function (res) {
      return {
        ["_else"]: function (otherres) {
          if (assertBool(cond)) {
            return res();
          } else {
            return otherres();
          }
        }
      };
    }
  };
};
const _while = function (cond) {
  return function (body) {
    while (true) {
      if (assertBool(not(cond()))) {
        break;
      }
      body();
    }
  };
};
const _do = function (body) {
  return {
    ["_while"]: function (cond) {
      while (true) {
        body();
        if (assertBool(not(cond()))) {
          break;
        }
      }
    }
  };
};
const _for = function (init, cond, step) {
  return function (body) {
    let state = matcher([
      [matcher.type("array", "arr"), function (arr) {
        return arr;
      }],
      [matcher.wildcard("_"), function (_) {
        return [_];
      }]])(init());
    while (true) {
      body(...state);
      state = step(...state);
      if (assertBool(not(cond(...state)))) {
        break;
      }
    }
  };
};
_for(function () {
  return 0;
}, function (i$exclam) {
  return $lt(i$exclam, 10);
}, function (i$exclam) {
  return $plus(i$exclam, 1);
})(function (i) {
  log(i);
});
