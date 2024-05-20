"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
var fs = require("fs");
function createIndexIfNotExists(collection) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, collection.createIndex({ _id: 1 })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Index creation failed:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function flattenDocument(doc, parentKey, sep) {
    if (parentKey === void 0) { parentKey = ''; }
    if (sep === void 0) { sep = '.'; }
    var items = {};
    for (var _i = 0, _a = Object.entries(doc); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        var newKey = parentKey ? "".concat(parentKey).concat(sep).concat(key) : key;
        if (value && typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                items[newKey] = 'array';
            }
            else {
                Object.assign(items, flattenDocument(value, newKey, sep));
            }
        }
        else {
            items[newKey] = typeof value;
        }
    }
    return items;
}
function processDocuments(dbName, collectionName) {
    return __awaiter(this, void 0, void 0, function () {
        var client, db, collection, totalDocuments, batchSize, fieldTypeCounts, startTime_all, i, startTime, cursor, batchDocs, _i, batchDocs_1, doc, flattenedDoc, _a, _b, _c, field, fieldType, fieldTypePair, endTime, iterationTime, endTime_all, fullTime, threshold, thresholdFieldTypes, csvOutput, _d, _e, _f, fieldType, count, _g, field, dataType, percentage;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    client = new mongodb_1.MongoClient('mongodb+srv://admin:awesome@cluster0.kzdrfb1.mongodb.net/');
                    return [4 /*yield*/, client.connect()];
                case 1:
                    _h.sent();
                    db = client.db(dbName);
                    collection = db.collection(collectionName);
                    return [4 /*yield*/, createIndexIfNotExists(collection)];
                case 2:
                    _h.sent();
                    return [4 /*yield*/, collection.countDocuments()];
                case 3:
                    totalDocuments = _h.sent();
                    batchSize = 1000;
                    fieldTypeCounts = {};
                    startTime_all = Date.now();
                    i = 0;
                    _h.label = 4;
                case 4:
                    if (!(i < totalDocuments)) return [3 /*break*/, 7];
                    startTime = Date.now();
                    cursor = collection.find({}).skip(i).limit(batchSize).project({ _id: 0 });
                    return [4 /*yield*/, cursor.toArray()];
                case 5:
                    batchDocs = _h.sent();
                    for (_i = 0, batchDocs_1 = batchDocs; _i < batchDocs_1.length; _i++) {
                        doc = batchDocs_1[_i];
                        flattenedDoc = flattenDocument(doc);
                        for (_a = 0, _b = Object.entries(flattenedDoc); _a < _b.length; _a++) {
                            _c = _b[_a], field = _c[0], fieldType = _c[1];
                            fieldTypePair = "".concat(field, ":").concat(fieldType);
                            if (fieldTypeCounts[fieldTypePair]) {
                                fieldTypeCounts[fieldTypePair] += 1;
                            }
                            else {
                                fieldTypeCounts[fieldTypePair] = 1;
                            }
                        }
                    }
                    endTime = Date.now();
                    iterationTime = (endTime - startTime) / 1000;
                    console.log("Time taken for batch starting at ".concat(i, ": ").concat(iterationTime.toFixed(2), " seconds"));
                    _h.label = 6;
                case 6:
                    i += batchSize;
                    return [3 /*break*/, 4];
                case 7:
                    endTime_all = Date.now();
                    fullTime = (endTime_all - startTime_all) / 1000;
                    console.log("Time taken for all documents: ".concat(fullTime.toFixed(2), " seconds"));
                    threshold = 0;
                    thresholdFieldTypes = [];
                    csvOutput = fs.createWriteStream('output.csv');
                    csvOutput.write('Field,Data Type,Document Count\n');
                    for (_d = 0, _e = Object.entries(fieldTypeCounts); _d < _e.length; _d++) {
                        _f = _e[_d], fieldType = _f[0], count = _f[1];
                        _g = fieldType.split(':'), field = _g[0], dataType = _g[1];
                        percentage = count / totalDocuments;
                        if (percentage >= threshold) {
                            csvOutput.write("".concat(field, ",").concat(dataType, ",").concat(count, "\n"));
                        }
                    }
                    return [4 /*yield*/, client.close()];
                case 8:
                    _h.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var dbName = 'sample_mflix';
var collectionName = 'movies';
processDocuments(dbName, collectionName).catch(function (error) { return console.error(error); });
