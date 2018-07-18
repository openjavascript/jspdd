'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _deepDiff = require('deep-diff');

var _deepDiff2 = _interopRequireDefault(_deepDiff);

var _jspddKind = require('jspdd-kind');

var _jspddKind2 = _interopRequireDefault(_jspddKind);

var _jspddBasedata = require('jspdd-basedata');

var _jspddBasedata2 = _interopRequireDefault(_jspddBasedata);

var _jsonTraverser = require('json-traverser');

var _jsonTraverser2 = _interopRequireDefault(_jsonTraverser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
const KIND = {
    'new':              'N'
    , 'delete':         'D'
    , 'edit':           'E'
    , 'array':          'A'
};
*/

/*
    Differences are reported as one or more change records. 
        Change records have the following structure:

    kind - indicates the kind of change; will be one of the following:
        N - indicates a newly added property/element
        D - indicates a property/element was deleted
        E - indicates a property/element was edited
        A - indicates a change occurred within an array

    path - the property path (from the left-hand-side root)

    lhs - the value on the left-hand-side of the comparison 
        (undefined if kind === 'N')

    rhs - the value on the right-hand-side of the comparison 
        (undefined if kind === 'D')

    index - when kind === 'A', indicates the array index where the 
        change occurred

    item - when kind === 'A', contains a nested change record indicating the 
        change that occurred at the array index
*/

var JSPDD = function (_BaseData) {
    _inherits(JSPDD, _BaseData);

    function JSPDD(srcData, newData, descData) {
        _classCallCheck(this, JSPDD);

        /*
        console.log( 'JSPDD', Date.now() );
         console.log( 'srcData:', srcData );
        console.log( 'newData:', newData );
        console.log( 'descData:', descData  );
        */
        var _this = _possibleConstructorReturn(this, (JSPDD.__proto__ || Object.getPrototypeOf(JSPDD)).call(this));

        _this.reset();

        _this.srcData = srcData;
        _this.newData = newData;
        _this.descData = descData;
        return _this;
    }

    _createClass(JSPDD, [{
        key: 'clone',
        value: function clone(data) {
            return JSON.parse(JSON.stringify(data));
        }
    }, {
        key: 'proc',
        value: function proc() {
            var _this2 = this;

            this.reset();

            //console.log( 'descDAta', this.descData );
            this.makeDict(this.descData);

            this.diffData = (0, _deepDiff2.default)(this.srcData, this.newData);

            !(this.diffData && this.diffData.length) && (this.diffData = []);

            this.diffData.map(function (v, k) {
                _this2.resolvePath(v);
                _this2.makeMapData(v);

                _this2.procPort(v);
            });

            return this.result();
        }
    }, {
        key: 'procPort',
        value: function procPort(item) {
            switch (item.kind) {
                case _jspddKind2.default['new']:
                    {
                        this.N.push(this.procNew(item));
                        break;
                    }
                case _jspddKind2.default['delete']:
                    {
                        this.D.push(this.procDel(item));
                        break;
                    }
                case _jspddKind2.default['edit']:
                    {
                        this.E.push(this.procEdit(item));
                        break;
                    }
                case _jspddKind2.default['array']:
                    {
                        if ('index' in item && typeof item.index == 'number' && item.index != item.path[item.path.legnth - 1]) {
                            item.path.push(item.index);
                        }

                        switch (item.item.kind) {
                            case _jspddKind2.default['new']:
                                {
                                    this.N.push(this.procArrayNew(item));
                                    break;
                                }
                            case _jspddKind2.default['delete']:
                                {
                                    this.D.push(this.procArrayDel(item));
                                    break;
                                }
                            case _jspddKind2.default['edit']:
                                {
                                    this.E.push(this.procArrayEdit(item));
                                    break;
                                }
                        }

                        break;
                    }
            }
        }
    }, {
        key: 'procArrayNew',
        value: function procArrayNew(item) {
            var r = this.descDataItem(item, 1),
                dict = this.getDictData(item),
                dateItemUnit = this.getDataItemUnit(item);
            r.action = 'add';
            r.actiontype = 'array';

            if (dict && dict.fulllabel && dict.fulllabel.length) {
                r.label = dict.fulllabel;
            }

            r.desc.push(JSPDD.TEXT.DATA_PATH + ': ' + r.datakey.join('.'));

            if (r.label.length) {
                r.indict = 1;

                r.label.slice(0, -1).length && r.desc.push('' + r.label.slice(0, -1).join(', '));

                r.desc.push('' + JSPDD.TEXT.NEW + dateItemUnit + ': ' + r.datakey.slice(-1).join(''));
                r.desc.push(JSPDD.TEXT.FIELD_DETAIL + ': ' + r.label.slice(-1).join(''));
            } else {
                r.label.slice(0, -1).length && r.desc.push('' + r.datakey.slice(0, -1).join('.'));
                r.desc.push('' + JSPDD.TEXT.NEW + dateItemUnit + ': ' + r.datakey.slice(-1).join(''));
            }
            r.desc.push(JSPDD.TEXT.DATA_TYPE + ': ' + Object.prototype.toString.call(r.val));
            r.desc.push('' + dateItemUnit + JSPDD.TEXT.VAL + ': ' + this.getDataLiteral(r.val));

            this.itemCommonAction(r, dict, item);

            return r;
        }
    }, {
        key: 'descDataItem',
        value: function descDataItem(item, isArray) {
            var valField = item;
            isArray && (valField = item.item);
            var ts = Date.now(),
                r = {
                "label": [],
                "datakey": (item || []).path.slice(),
                "desc": [],
                "val": valField.rhs,
                "_val": valField.lhs,
                "indict": 0
            };

            r.datakey && this.datakey_prefix && r.datakey.unshift(this.datakey_prefix);

            return r;
        }
    }, {
        key: 'procNew',
        value: function procNew(item) {
            var r = this.descDataItem(item),
                dict = this.getDictData(item),
                dateItemUnit = this.getDataItemUnit(item);
            r.action = 'add';

            if (dict && dict.fulllabel && dict.fulllabel.length) {
                r.label = dict.fulllabel;
            }

            r.desc.push(JSPDD.TEXT.DATA_PATH + ': ' + r.datakey.join('.'));

            if (r.label.length) {
                r.indict = 1;

                r.label.slice(0, -1).length && r.desc.push('' + r.label.slice(0, -1).join(', '));

                r.desc.push('' + JSPDD.TEXT.NEW + dateItemUnit + ': ' + r.datakey.slice(-1).join(''));
                r.desc.push(JSPDD.TEXT.FIELD_DETAIL + ': ' + r.label.slice(-1).join(''));
            } else {
                r.label.slice(0, -1).length && r.desc.push('' + r.datakey.slice(0, -1).join('.'));
                r.desc.push('' + JSPDD.TEXT.NEW + dateItemUnit + ': ' + r.datakey.slice(-1).join(''));
            }
            r.desc.push(JSPDD.TEXT.DATA_TYPE + ': ' + Object.prototype.toString.call(r.val));
            r.desc.push(dateItemUnit + '\u503C: ' + this.getDataLiteral(r.val));

            this.itemCommonAction(r, dict, item);

            return r;
        }
    }, {
        key: 'getDictData',
        value: function getDictData(item) {
            var r = this.DICT[item.fullpath];

            if (!r && /[0-9]/.test(item.fullpath)) {
                var tmp = [];
                item.path.map(function (v) {
                    typeof v == 'string' && tmp.push(v);
                    typeof v == 'number' && tmp.push('_array');
                });
                /*
                if( 'index' in item && typeof item.index == 'number' ) {
                    tmp.push( '_array' );
                }
                */
                tmp.length && (item.abspath = tmp.join('.'));

                item.abspath && (r = this.DICT[item.abspath]);
            }

            if (!(r && r.fulllabel && r.fulllabel.length) && item.fullpath) {
                var _tmp = this.DICT[item.fullpath + '._array'];
                if (_tmp && _tmp.fulllabel && _tmp.fulllabel.length) {
                    r = _tmp;
                }
            }

            return r;
        }
    }, {
        key: 'procDel',
        value: function procDel(item) {
            var r = this.descDataItem(item),
                dict = this.getDictData(item),
                dateItemUnit = this.getDataItemUnit(item);
            r.action = 'delete';

            if (dict && dict.fulllabel && dict.fulllabel.length) {
                r.label = dict.fulllabel;
            }

            r.desc.push(JSPDD.TEXT.DATA_PATH + ': ' + r.datakey.join('.'));

            var label = r.label;

            //console.log( label, item, dict );

            if (label.length) {
                r.indict = 1;

                label.slice(0, -1).length && r.desc.push('' + label.slice(0, -1).join(', '));

                r.desc.push('' + JSPDD.TEXT.DELETE + dateItemUnit + ': ' + r.datakey.slice(-1).join(''));
                r.desc.push(JSPDD.TEXT.FIELD_DETAIL + ': ' + label.slice(-1).join(''));
            } else {
                r.label.slice(0, -1).length && r.desc.push('' + r.datakey.slice(0, -1).join('.'));
                r.desc.push('' + JSPDD.TEXT.DELETE + dateItemUnit + ': ' + r.datakey.slice(-1).join(''));
            }
            r.desc.push(JSPDD.TEXT.DATA_TYPE + ': ' + Object.prototype.toString.call(r._val));
            r.desc.push(dateItemUnit + '\u503C: ' + this.getDataLiteral(r._val));

            this.itemCommonAction(r, dict, item);

            //console.log( 'when deleting' );
            //console.log( item );

            return r;
        }
    }, {
        key: 'procEdit',
        value: function procEdit(item) {
            var r = this.descDataItem(item),
                dict = this.getDictData(item),
                dateItemUnit = this.getDataItemUnit(item);
            r.action = 'edit';

            if (dict && dict.fulllabel && dict.fulllabel.length) {
                r.label = dict.fulllabel;
            }

            r.desc.push(JSPDD.TEXT.DATA_PATH + ': ' + r.datakey.join('.'));

            if (r.label.length) {
                r.indict = 1;

                r.label.slice(0, -1).length && r.desc.push('' + r.label.slice(0, -1).join(', '));

                r.desc.push('' + JSPDD.TEXT.EDIT + dateItemUnit + ': ' + r.datakey.slice(-1).join(''));
                r.desc.push(JSPDD.TEXT.FIELD_DETAIL + ': ' + r.label.slice(-1).join(''));
            } else {
                r.label.slice(0, -1).length && r.desc.push('' + r.datakey.slice(0, -1).join('.'));
                r.desc.push('' + JSPDD.TEXT.EDIT + dateItemUnit + ': ' + r.datakey.slice(-1).join(''));
            }
            r.desc.push(JSPDD.TEXT.DATA_TYPE + ': ' + Object.prototype.toString.call(r.val));
            r.desc.push('' + dateItemUnit + JSPDD.TEXT.NEW_VAL + ': ' + this.getDataLiteral(r.val));
            r.desc.push('' + dateItemUnit + JSPDD.TEXT.OLD_VAL + ': ' + this.getDataLiteral(r._val));

            this.itemCommonAction(r, dict, item);

            return r;
        }
    }, {
        key: 'getDataItemUnit',
        value: function getDataItemUnit(item) {
            var r = '' + JSPDD.TEXT.FIELD;

            if (item.path && item.path.length && typeof item.path[item.path.length - 1] == 'number') {
                r = '' + JSPDD.TEXT.INDEX;
            }

            return r;
        }
    }, {
        key: 'procArrayDel',
        value: function procArrayDel(item) {
            var r = this.descDataItem(item, 1),
                dict = this.getDictData(item),
                dateItemUnit = this.getDataItemUnit(item);
            r.action = 'delete';
            r.actiontype = 'array';

            if (dict && dict.fulllabel && dict.fulllabel.length) {
                r.label = dict.fulllabel;
            }

            r.desc.push(JSPDD.TEXT.DATA_PATH + ': ' + r.datakey.join('.'));

            if (r.label.length) {
                r.indict = 1;

                r.label.slice(0, -1).length && r.desc.push('' + r.label.slice(0, -1).join(', '));

                r.desc.push('' + JSPDD.TEXT.DELETE + dateItemUnit + ': ' + r.datakey.slice(-1).join(''));
                r.desc.push(JSPDD.TEXT.FIELD_DETAIL + ': ' + r.label.slice(-1).join(''));
            } else {
                r.label.slice(0, -1).length && r.desc.push('' + r.datakey.slice(0, -1).join('.'));
                r.desc.push('' + JSPDD.TEXT.DELETE + dateItemUnit + ': ' + r.datakey.slice(-1).join(''));
            }
            r.desc.push(JSPDD.TEXT.DATA_TYPE + ': ' + Object.prototype.toString.call(r._val));
            r.desc.push(dateItemUnit + '\u503C: ' + this.getDataLiteral(r._val));

            this.itemCommonAction(r, dict, item);

            return r;
        }
    }, {
        key: 'procArrayEdit',
        value: function procArrayEdit(item) {
            var r = this.descDataItem(item, 1),
                dict = this.getDictData(item),
                dateItemUnit = this.getDataItemUnit(item);
            r.action = 'edit';
            r.actiontype = 'array';

            if (dict && dict.fulllabel && dict.fulllabel.length) {
                r.label = dict.fulllabel;
            }

            r.desc.push(JSPDD.TEXT.DATA_PATH + ': ' + r.datakey.join('.'));

            if (r.label.length) {
                r.indict = 1;

                r.label.slice(0, -1).length && r.desc.push('' + r.label.slice(0, -1).join(', '));

                r.desc.push('' + JSPDD.TEXT.EDIT + dateItemUnit + ': ' + r.datakey.slice(-1).join(''));
                r.desc.push(JSPDD.TEXT.FIELD_DETAIL + ': ' + r.label.slice(-1).join(''));
            } else {
                r.label.slice(0, -1).length && r.desc.push('' + r.datakey.slice(0, -1).join('.'));
                r.desc.push('' + JSPDD.TEXT.EDIT + dateItemUnit + ': ' + r.datakey.slice(-1).join(''));
            }
            r.desc.push(JSPDD.TEXT.DATA_TYPE + ': ' + Object.prototype.toString.call(r.val));
            r.desc.push('' + dateItemUnit + JSPDD.TEXT.NEW_VAL + ': ' + this.getDataLiteral(r.val));
            r.desc.push('' + dateItemUnit + JSPDD.TEXT.OLD_VAL + ': ' + this.getDataLiteral(r._val));

            this.itemCommonAction(r, dict, item);

            return r;
        }
    }, {
        key: 'itemCommonAction',
        value: function itemCommonAction(r, dict, item) {
            this.RESULT_ALL.push(r);
            r.indict && this.RESULT_INDICT.push(r);
            !r.indict && this.RESULT_OUTDICT.push(r);

            r.finallabel = {};
            dict && dict.item && (r.finallabel = dict.item);
        }
    }, {
        key: 'getDataLiteral',
        value: function getDataLiteral(item) {
            if ((typeof item === 'undefined' ? 'undefined' : _typeof(item)) == 'object' || typeof item == 'array') {
                return JSON.stringify(item);
            }
            return item;
        }
    }, {
        key: 'reset',
        value: function reset() {
            this.N = [];
            this.D = [];
            this.E = [];
            this.A = [];
            this.MAP = {};
            this.ALL_MAP = {};
            this.DICT = {};

            this.RESULT_ALL = [];
            this.RESULT_INDICT = [];
            this.RESULT_OUTDICT = [];

            this.diffData = null;
        }
    }, {
        key: 'makeDict',
        value: function makeDict(data) {
            var _this3 = this;

            var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
            var label = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

            switch (data.constructor) {
                case Object:
                    {
                        Object.keys(data).map(function (k) {
                            var item = data[k],
                                spath = path.slice(),
                                slabel = label.slice();
                            spath.push(k);

                            var fullpath = spath.join('.');

                            _this3.DICT[fullpath] = {
                                item: item
                            };

                            if (item.label) {
                                slabel.push(item.label);
                                _this3.DICT[fullpath].parentlabel = label;
                                _this3.DICT[fullpath].fulllabel = slabel;
                            } else {
                                if (typeof item == 'string') {
                                    slabel.push(item);
                                    _this3.DICT[fullpath].parentlabel = label;
                                    _this3.DICT[fullpath].fulllabel = slabel;
                                } else {
                                    _this3.DICT[fullpath].parentlabel = label;
                                    _this3.DICT[fullpath].fulllabel = slabel;
                                }
                            }

                            _this3.makeDict(item, spath, slabel);
                        });
                        break;
                    }
                case Array:
                    {
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }
    }, {
        key: 'makeMapData',
        value: function makeMapData(item) {
            item.fullpath && (this.MAP[item.fullpath] = item);

            item.fullpath && (this.ALL_MAP[item.fullpath] = item);
        }
    }, {
        key: 'resolvePath',
        value: function resolvePath(item) {

            var path = item.path.slice();

            if (item.kind == _jspddKind2.default['array']) {
                path.push(item.index);
            }

            item.fullpath = path.join('.');
        }
    }, {
        key: 'debugData',
        value: function debugData() {
            return {
                DESC: {
                    'new': this.N,
                    'delete': this.D,
                    'edit': this.E,
                    'arrayedit': this.A,
                    'RESULT_ALL': this.RESULT_ALL,
                    'RESULT_INDICT': this.RESULT_INDICT,
                    'RESULT_OUTDICT': this.RESULT_OUTDICT
                },
                SRC: {
                    srcData: this.srcData,
                    newData: this.newData,
                    descData: this.descData,
                    diffData: this.diffData,
                    map: this.MAP,
                    allmap: this.ALL_MAP,
                    dictData: this.DICT
                },
                INFO: {}
            };
        }
    }, {
        key: 'result',
        value: function result() {
            /*
            let r = { data: {} };
            this.N 
                && this.N.length
                && ( r.data['add'] = this.N )
                ;
             this.E 
                && this.N.length
                && ( r.data['edit'] = this.E )
                ;
             this.D 
                && this.N.length
                && ( r.data['delete'] = this.D )
                ;
            */

            var r = {};
            r.data = this.alldata ? this.RESULT_ALL : this.RESULT_INDICT;
            r.alldata = this.alldata;
            r.ts = Date.now();
            r.date = (0, _moment2.default)(r.ts).format('YYYY-MM-DD HH:mm:ss');

            this.userName && (r["userName"] = this.userName);

            this.userId && (r["userId"] = this.userId);

            return r;
        }
    }]);

    return JSPDD;
}(_jspddBasedata2.default);

exports.default = JSPDD;


JSPDD.TEXT = {
    "NEW": "新增",
    "EDIT": "编辑",
    "DELETE": "删除",
    "NEW_VAL": "新值",
    "OLD_VAL": "旧值",
    "FIELD_DETAIL": "字段描述",
    "DATA_TYPE": "数据类型",
    "DATA_PATH": "数据路径",
    "FIELD": "字段",
    "INDEX": "索引",
    "VAL": "值",

    "DEFAULT_DICT_TEXT": "文字描述 "
};

JSPDD.generatorDict = function () {
    var sdata = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var ndata = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var ddata = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var datalabelFormat = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

    var r = void 0,
        combData = $.extend(true, sdata, ndata);
    var prefix = JSPDD.TEXT.DEFAULT_DICT_TEXT;

    //console.log( 'ddddddddddd datalabelFormat:', datalabelFormat );

    var cb = function cb(item, key, pnt, datapath) {

        var label = '' + prefix + key;

        if (datalabelFormat) {
            label = datalabelFormat;
            label = label.replace(/{key}/gi, key);
            if (datapath && datapath.length) {
                label = label.replace(/{path}/gi, datapath.join('.'));
            }
            console.log(datapath);
        }

        switch (Object.prototype.toString.call(item)) {
            case '[object Array]':
                {
                    var tmp = item;
                    if (item.length && Object.prototype.toString.call(item[0]) == '[object Object]') {
                        var _tmp2 = JSON.parse(JSON.stringify(item[0]));
                        (0, _jsonTraverser2.default)(_tmp2, cb);
                        pnt[key] = { _array: _tmp2, "label": label };
                    } else {
                        pnt[key] = {
                            _array: {
                                "label": label
                            },
                            "label": label
                        };
                    }

                    break;
                }
            case '[object Object]':
                {
                    //console.log( key, item );
                    item.label = label;
                    break;
                }
            default:
                {
                    if (key == 'label') return;
                    pnt[key] = {
                        "label": label
                    };
                    break;
                }
        }
    };

    (0, _jsonTraverser2.default)(combData, cb);

    r = Object.assign(combData, ddata);

    return r;
};