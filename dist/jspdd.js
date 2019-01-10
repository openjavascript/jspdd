'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _jsonUtilsx = require('json-utilsx');

var _jsonUtilsx2 = _interopRequireDefault(_jsonUtilsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

        _this.fixArray = 1;
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

            this.srcDataOrigin = this.clone(this.srcData);
            this.newDataOrigin = this.clone(this.newData);

            this.srcData = this.clone(this.srcData);
            this.newData = this.clone(this.newData);

            //console.log( 'source', diff( this.clone( this.srcData ), this.clone( this.newData ) ) );
            //console.log( 'source 1', this.clone( this.srcData ), this.clone( this.newData ) );
            //this.resolveArray();
            //console.log( 'source 2', this.clone( this.srcData ), this.clone( this.newData ) );
            //console.log( 1111111111, Utils );

            //console.log( 'descDAta', this.descData );
            this.makeDict(this.descData);

            this.diffData = (0, _deepDiff2.default)(this.srcData, this.newData);

            console.log('src diff', Date.now());
            console.log(this.diffData);
            console.log(this.DICT);

            this.filterIgnore(this.diffData, this.DICT);

            !(this.diffData && this.diffData.length) && (this.diffData = []);

            this.diffData = this.clone(this.diffData);

            this.diffData.map(function (v, k) {
                //console.log( 'diffData v', v, v.path );

                v.srcParent = _this2.getParentData(v, _this2.srcData);
                v.newParent = _this2.getParentData(v, _this2.newData);

                v.parentDict = _this2.getParentDict(v);

                _this2.resolvePath(v);
                _this2.makeMapData(v);

                _this2.procPort(v);
            });

            return this.result();
        }
    }, {
        key: 'filterIgnore',
        value: function filterIgnore(data, dict) {
            data = data || [];
            dict = dict || {};

            var _loop = function _loop(i) {
                var item = data[i];
                if (!(item && item.path && item.path.length)) return 'continue';
                var tmp = [],
                    isIgnore = void 0;
                item.path.map(function (sitem) {
                    tmp.push(sitem);
                    var tmpKey = tmp.join('.') + '.is_ignore_field';
                    if (dict[tmpKey] && dict[tmpKey].item === true) {
                        isIgnore = true;
                        return false;
                    }
                });
                if (isIgnore) {
                    data.splice(i, 1);
                    return 'continue';
                }
            };

            for (var i = data.length - 1; i >= 0; i--) {
                var _ret = _loop(i);

                if (_ret === 'continue') continue;
            }
        }
    }, {
        key: 'getParentDict',
        value: function getParentDict(item) {
            var r = this.DICT;

            if (item.path && item.path.length) {
                var path = item.path.slice(0, item.path.length - 1);
                if (path.length) {
                    path.map(function (val, key) {
                        if (typeof val == 'number') {
                            path[key] = '_array';
                        }
                    });
                    r = this.DICT[path.join('.')];
                }
            }
            return r;
        }
    }, {
        key: 'getParentData',
        value: function getParentData(item, data) {
            var r = data;
            if (item.path && item.path.length) {
                var path = item.path.slice(0, item.path.length - 1);
                if (path.length) {
                    r = _jsonUtilsx2.default.jsonGetData(data, path);
                }
            }
            return r;
        }
    }, {
        key: 'resolveArray',
        value: function resolveArray() {
            var _this3 = this;

            if (!this.fixArray) return;

            var cb = function cb(item, key, pnt, datapath) {
                switch (Object.prototype.toString.call(item)) {
                    case '[object Array]':
                        {
                            /*
                            console.log( 'resolveArray', datapath.join('.') ); 
                            console.log( Object.prototype.toString.call( item ), item );
                            */
                            _this3.cleanArray(_jsonUtilsx2.default.jsonGetData(_this3.srcData, datapath), _jsonUtilsx2.default.jsonGetData(_this3.newData, datapath));

                            break;
                        }
                }
            };
            (0, _jsonTraverser2.default)(this.clone(this.srcData), cb);
        }
    }, {
        key: 'cleanArray',
        value: function cleanArray(src, target) {
            if (!(src && target)) return;
            if (_jsonUtilsx2.default.jsonEqual(src, target)) return;
            //console.log( 'need clean~111', src, target );
            for (var i = src.length - 1; i >= 0; i--) {
                var item = src[i],
                    targetItem = void 0;

                for (var j = target.length - 1; j >= 0; j--) {
                    targetItem = target[j];

                    if (_jsonUtilsx2.default.jsonEqual(item, targetItem)) {
                        target.splice(j, 1);
                        src.splice(i, 1);
                        break;
                    }
                }
            }
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
            this.setAdditionData(r, dict, item);

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
            r.desc.push(dateItemUnit + '\u503C: ' + this.getDescribableVal(r.val, r, dict, item));

            this.itemCommonAction(r, dict, item);

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
            this.setAdditionData(r, dict, item);

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
            r.desc.push(dateItemUnit + '\u503C: ' + this.getDescribableVal(r._val, r, dict, item));

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
            this.setAdditionData(r, dict, item);

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
            r.desc.push('' + dateItemUnit + JSPDD.TEXT.NEW_VAL + ': ' + this.getDescribableVal(r.val, r, dict, item));
            r.desc.push('' + dateItemUnit + JSPDD.TEXT.OLD_VAL + ': ' + this.getDescribableVal(r._val, r, dict, item));

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
            this.setAdditionData(r, dict, item);

            r.desc.push(JSPDD.TEXT.DATA_PATH + ': ' + r.datakey.join('.'));

            //console.log( Date.now(), 1111111111111 );

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
            r.desc.push('' + dateItemUnit + JSPDD.TEXT.VAL + ': ' + this.getDescribableVal(r.val, r, dict, item));

            this.itemCommonAction(r, dict, item);

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
            this.setAdditionData(r, dict, item);

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
            r.desc.push(dateItemUnit + '\u503C: ' + this.getDescribableVal(r._val, r, dict, item));

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
            this.setAdditionData(r, dict, item);

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
            r.desc.push('' + dateItemUnit + JSPDD.TEXT.NEW_VAL + ': ' + this.getDescribableVal(r.val, r, dict, item));
            r.desc.push('' + dateItemUnit + JSPDD.TEXT.OLD_VAL + ': ' + this.getDescribableVal(r._val, r, dict, item));

            this.itemCommonAction(r, dict, item);

            return r;
        }
    }, {
        key: 'setAdditionData',
        value: function setAdditionData(r, dict, item) {
            r.finallabel = {};
            dict && dict.item && (r.finallabel = dict.item);
        }
    }, {
        key: 'itemCommonAction',
        value: function itemCommonAction(r, dict, item) {
            this.RESULT_ALL.push(r);
            r.indict && this.RESULT_INDICT.push(r);
            !r.indict && this.RESULT_OUTDICT.push(r);

            r.DICT = dict;
            r.DATA_ITEM = item;
        }
    }, {
        key: 'getDictData',
        value: function getDictData(item) {
            var r = this.DICT[item.fullpath] || null;

            if (!r && /[0-9]/.test(item.fullpath)) {
                var _tmp = [];
                item.path.map(function (v) {
                    typeof v == 'string' && _tmp.push(v);
                    typeof v == 'number' && _tmp.push('_array');
                });
                /*
                if( 'index' in item && typeof item.index == 'number' ) {
                    tmp.push( '_array' );
                }
                */
                _tmp.length && (item.abspath = _tmp.join('.'));

                item.abspath && (r = this.DICT[item.abspath]);
            }

            if (!(r && r.fulllabel && r.fulllabel.length) && item.fullpath) {
                var _tmp2 = this.DICT[item.fullpath + '._array'];
                if (_tmp2 && _tmp2.fulllabel && _tmp2.fulllabel.length) {
                    r = _tmp2;
                }
            }

            r = r || {};

            return r;
        }
    }, {
        key: 'makeSubDictItem',
        value: function makeSubDictItem() {
            var _r$path;

            var dataItem = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var key = arguments[1];

            var r = {};

            r.abspath = [];
            r.fullpath = [];
            r.path = [];

            dataItem.abspath && r.abspath.push(dataItem.abspath);
            r.abspath.push(key);
            r.abspath = r.abspath.join('.');

            dataItem.fullpath && r.fullpath.push(dataItem.fullpath);
            r.fullpath.push(key);
            r.fullpath = r.fullpath.join('.');

            dataItem.path && (_r$path = r.path).push.apply(_r$path, _toConsumableArray(dataItem.path));
            r.path.push(key);

            return r;
        }
    }, {
        key: 'getDataLiteral',
        value: function getDataLiteral(val, item, dict, dataItem, ingoreEncode) {
            var _this4 = this;

            var r = void 0;
            switch (Object.prototype.toString.call(val)) {
                case '[object Object]':
                    {

                        var _tmp3 = {};

                        Object.keys(val).map(function (key, ix) {
                            var subItem = _this4.makeSubDictItem(dataItem, key);
                            var subDict = _this4.getDictData(subItem) || { item: {} };
                            subDict.finallabel = subDict.item;
                            //console.log( key, ix,  Object.keys( val ), subItem, subDict );
                            _tmp3[subDict.item ? subDict.item.label : key] = _this4.getDescribableVal(val[key], subDict, subDict, subItem, 1);
                        });

                        r = '\n' + JSON.stringify(_tmp3, null, 4);
                        ingoreEncode && (r = _tmp3);

                        return r;
                    }
                case '[object Array]':
                    {
                        r = '' + JSON.stringify(val, null, 4);
                        ingoreEncode && (r = val);
                        return r;
                    }
            }
            return val;
        }
    }, {
        key: 'getDescribableVal',
        value: function getDescribableVal(val, item, dict, dataItem, ingoreEncode) {
            val = this.getDataLiteral(val, item, dict, dataItem, ingoreEncode);
            var tmp = void 0;

            //console.log( val, item );


            //if( common.jsonInData( item, 'finallabel.unit' ) ){
            if (item.finallabel && 'unit' in item.finallabel) {
                val += item.finallabel.unit;
            }
            //if( common.jsonInData( item, 'finallabel.enum' ) ){
            if (item.finallabel && 'enum' in item.finallabel) {
                tmp = item.finallabel.enum || {};

                if (val in tmp) {
                    val = '' + tmp[val];
                }
            }
            //console.log( val );

            return val;
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
            var _this5 = this;

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

                            _this5.DICT[fullpath] = {
                                item: item
                            };

                            if (item.label) {
                                slabel.push(item.label);
                                _this5.DICT[fullpath].parentlabel = label;
                                _this5.DICT[fullpath].fulllabel = slabel;
                            } else {
                                if (typeof item == 'string') {
                                    slabel.push(item);
                                    _this5.DICT[fullpath].parentlabel = label;
                                    _this5.DICT[fullpath].fulllabel = slabel;
                                } else {
                                    _this5.DICT[fullpath].parentlabel = label;
                                    _this5.DICT[fullpath].fulllabel = slabel;
                                }
                            }

                            _this5.makeDict(item, spath, slabel);
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
                    srcData: this.srcDataOrigin,
                    newData: this.newDataOrigin,
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
            //console.log( datapath );
        }

        switch (Object.prototype.toString.call(item)) {
            case '[object Array]':
                {
                    var _tmp4 = item;
                    if (item.length && Object.prototype.toString.call(item[0]) == '[object Object]') {
                        var _tmp5 = JSON.parse(JSON.stringify(item[0]));
                        (0, _jsonTraverser2.default)(_tmp5, cb);
                        pnt[key] = { _array: _tmp5, "label": label };
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

    //TODO: replace to lodash.merge
    r = Object.assign(combData, ddata);

    return r;
};