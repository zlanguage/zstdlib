"use strict";

const $Z = require("@zlanguage/zstdlib");

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

const templateRegExp = RegExp("\{\{(.+?)(:(.+))?\}\}", "g");
const not = function (val) {
  val = Boolean(val);
  if (assertBool($eq(val, true))) {
    return false;
  }
  return true;
};
const fetchProp = function (propList, obj) {
  if (assertBool($eq(propList["length"], 1))) {
    return obj[propList[0]];
  }
  return fetchProp(propList["slice"](1), obj[propList[0]]);
};
const stdFuncs = {};
const template = function (string, funcs) {
  if (assertBool(not(funcs))) {
    funcs = stdFuncs;
  }
  return {
    ["resolve"]: function (data) {
      return string["replace"](templateRegExp, function (ignore, prop, funcstr) {
        if (assertBool(not(funcstr))) {
          funcstr = "";
        }
        let res = undefined;
        if (assertBool(not(prop["includes"](".")))) {
          res = data[prop];
        } else {
          const propList = prop["split"](".");
          res = fetchProp(propList, data);
        }
        const transformer = funcs[funcstr["slice"](1)];
        if (assertBool($eq(typeOf(transformer), "function"))) {
          res = transformer(res);
        }
        return res;
      });
    }
  };
};
module.exports = stone(template);