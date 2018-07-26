import moment from 'moment';
import diff from 'deep-diff';

import KIND from 'jspdd-kind';
import BaseData from 'jspdd-basedata';
import jsonTraverser from 'json-traverser';

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

export default class JSPDD extends BaseData {
    constructor( srcData, newData, descData ) {
        super();
        /*
        console.log( 'JSPDD', Date.now() );

        console.log( 'srcData:', srcData );
        console.log( 'newData:', newData );
        console.log( 'descData:', descData  );
        */
        this.reset();

        this.srcData    = srcData;
        this.newData    = newData;
        this.descData   = descData;
    }

    clone( data ) {
        return JSON.parse( JSON.stringify( data ) );
    }

    proc() {

        this.reset();

        //console.log( 'descDAta', this.descData );
        this.makeDict( this.descData );
        
        this.diffData = diff( this.srcData, this.newData );


        !( this.diffData && this.diffData.length ) && ( this.diffData = [] );

        this.diffData = this.clone( this.diffData );

        this.diffData.map( ( v, k ) => {
            this.resolvePath( v );
            this.makeMapData( v );

            this.procPort( v );

        });

        return this.result();
    }

    procPort( item ){
        switch( item.kind ){
            case KIND['new']: {
                this.N.push( this.procNew( item ) );
                break;
            }
            case KIND['delete']: {
                this.D.push( this.procDel( item ) );
                break;
            }
            case KIND['edit']: {
                this.E.push( this.procEdit( item ) );
                break;
            }
            case KIND['array']: {
                if( 'index' in item && typeof item.index == 'number' && item.index != item.path[ item.path.legnth - 1] ){
                    item.path.push( item.index );
                }

                switch( item.item.kind ){
                    case KIND['new']: {
                        this.N.push( this.procArrayNew( item ) );
                        break;
                    }
                    case KIND['delete']: {
                        this.D.push( this.procArrayDel( item ) );
                        break;
                    }
                    case KIND['edit']: {
                        this.E.push( this.procArrayEdit( item ) );
                        break;
                    }
                }

                break;
            }
        }
    }


    procArrayNew( item ){
        let r = this.descDataItem( item, 1 )
            , dict = this.getDictData( item )
            , dateItemUnit = this.getDataItemUnit( item )
            ;
        r.action = 'add';
        r.actiontype = 'array';

        if( dict && dict.fulllabel && dict.fulllabel.length ){
            r.label = dict.fulllabel;
        }
        this.setAdditionData( r, dict, item );

        r.desc.push( `${JSPDD.TEXT.DATA_PATH}: ${r.datakey.join('.')}` );

        if( r.label.length ){
            r.indict = 1;

            r.label.slice( 0, -1 ).length && 
                r.desc.push( `${r.label.slice( 0, -1 ).join(', ')}` );

            r.desc.push( `${JSPDD.TEXT.NEW}${dateItemUnit}: ${r.datakey.slice( -1 ).join('')}` );
            r.desc.push( `${JSPDD.TEXT.FIELD_DETAIL}: ${r.label.slice( -1 ).join('')}` );
        }else{
            r.label.slice( 0, -1 ).length && 
                r.desc.push( `${r.datakey.slice( 0, -1 ).join('.')}` );
            r.desc.push( `${JSPDD.TEXT.NEW}${dateItemUnit}: ${r.datakey.slice( -1 ).join('')}` );
        }
        r.desc.push( `${JSPDD.TEXT.DATA_TYPE}: ${Object.prototype.toString.call( r.val )}` );
        r.desc.push( `${dateItemUnit}${JSPDD.TEXT.VAL}: ${this.getDescribableVal(r.val, r)}` );

        this.itemCommonAction( r, dict, item );

        return r;
    }

    descDataItem( item, isArray ){
        let valField = item;
            isArray && ( valField = item.item );
        let ts = Date.now()
            , r = {
                "label": []
                , "datakey": (item||[]).path.slice()
                , "desc": []
                , "val": valField.rhs
                , "_val": valField.lhs
                , "indict": 0
            }
            ;

        r.datakey 
            && this.datakey_prefix 
            && r.datakey.unshift( this.datakey_prefix );

        return r;
    }

    procNew( item ){
        let r = this.descDataItem( item )
            , dict = this.getDictData( item )
            , dateItemUnit = this.getDataItemUnit( item )
            ;
        r.action = 'add';

        if( dict && dict.fulllabel && dict.fulllabel.length ){
            r.label = dict.fulllabel;
        }
        this.setAdditionData( r, dict, item );

        r.desc.push( `${JSPDD.TEXT.DATA_PATH}: ${r.datakey.join('.')}` );

        if( r.label.length ){
            r.indict = 1;

            r.label.slice( 0, -1 ).length && 
                r.desc.push( `${r.label.slice( 0, -1 ).join(', ')}` );

            r.desc.push( `${JSPDD.TEXT.NEW}${dateItemUnit}: ${r.datakey.slice( -1 ).join('')}` );
            r.desc.push( `${JSPDD.TEXT.FIELD_DETAIL}: ${r.label.slice( -1 ).join('')}` );
        }else{
            r.label.slice( 0, -1 ).length && 
                r.desc.push( `${r.datakey.slice( 0, -1 ).join('.')}` );
            r.desc.push( `${JSPDD.TEXT.NEW}${dateItemUnit}: ${r.datakey.slice( -1 ).join('')}` );
        }
        r.desc.push( `${JSPDD.TEXT.DATA_TYPE}: ${Object.prototype.toString.call( r.val )}` );
        r.desc.push( `${dateItemUnit}值: ${this.getDescribableVal(r.val, r)}` );

        this.itemCommonAction( r, dict, item );

        return r;
    }

    getDictData( item ) {
        let r = this.DICT[item.fullpath]

        if( !r && /[0-9]/.test( item.fullpath ) ){
            let tmp = [];
            item.path.map( (v)=>{
                typeof v == 'string' && tmp.push( v );
                typeof v == 'number' && tmp.push( '_array' );
            });
            /*
            if( 'index' in item && typeof item.index == 'number' ) {
                tmp.push( '_array' );
            }
            */
            tmp.length && ( item.abspath = tmp.join('.') );

            item.abspath && ( r = this.DICT[ item.abspath ] );
        }

        if( !( r && r.fulllabel && r.fulllabel.length ) && item.fullpath ){
            let tmp = this.DICT[ item.fullpath + '._array' ];
            if( tmp && tmp.fulllabel && tmp.fulllabel.length ){
                r = tmp;
            }
        }

        return r;
    }

    procDel( item ){
         let r = this.descDataItem( item )
            , dict = this.getDictData( item )
            , dateItemUnit = this.getDataItemUnit( item )
            ;
        r.action = 'delete';

        if( dict && dict.fulllabel && dict.fulllabel.length ){
            r.label = dict.fulllabel;
        }
        this.setAdditionData( r, dict, item );

        r.desc.push( `${JSPDD.TEXT.DATA_PATH}: ${r.datakey.join('.')}` );

        let label = r.label;

        //console.log( label, item, dict );

        if( label.length ){
            r.indict = 1;

            label.slice( 0, -1 ).length && 
                r.desc.push( `${label.slice( 0, -1 ).join(', ')}` );

            r.desc.push( `${JSPDD.TEXT.DELETE}${dateItemUnit}: ${r.datakey.slice( -1 ).join('')}` );
            r.desc.push( `${JSPDD.TEXT.FIELD_DETAIL}: ${label.slice( -1 ).join('')}` );
        }else{
            r.label.slice( 0, -1 ).length && 
                r.desc.push( `${r.datakey.slice( 0, -1 ).join('.')}` );
            r.desc.push( `${JSPDD.TEXT.DELETE}${dateItemUnit}: ${r.datakey.slice( -1 ).join('')}` );
        }
        r.desc.push( `${JSPDD.TEXT.DATA_TYPE}: ${Object.prototype.toString.call( r._val )}` );
        r.desc.push( `${dateItemUnit}值: ${this.getDescribableVal(r._val, r)}` );

        this.itemCommonAction( r, dict, item );

        //console.log( 'when deleting' );
        //console.log( item );

        return r;
    }

    procEdit( item ){
        let r = this.descDataItem( item )
            , dict = this.getDictData( item )
            , dateItemUnit = this.getDataItemUnit( item )
            ;
        r.action = 'edit';

        if( dict && dict.fulllabel && dict.fulllabel.length ){
            r.label = dict.fulllabel;
        }
        this.setAdditionData( r, dict, item );

        r.desc.push( `${JSPDD.TEXT.DATA_PATH}: ${r.datakey.join('.')}` );


        if( r.label.length ){
            r.indict = 1;

            r.label.slice( 0, -1 ).length && 
                r.desc.push( `${r.label.slice( 0, -1 ).join(', ')}` );

            r.desc.push( `${JSPDD.TEXT.EDIT}${dateItemUnit}: ${r.datakey.slice( -1 ).join('')}` );
            r.desc.push( `${JSPDD.TEXT.FIELD_DETAIL}: ${r.label.slice( -1 ).join('')}` );
        }else{
            r.label.slice( 0, -1 ).length && 
                r.desc.push( `${r.datakey.slice( 0, -1 ).join('.')}` );
            r.desc.push( `${JSPDD.TEXT.EDIT}${dateItemUnit}: ${r.datakey.slice( -1 ).join('')}` );
        }
        r.desc.push( `${JSPDD.TEXT.DATA_TYPE}: ${Object.prototype.toString.call( r.val )}` );
        r.desc.push( `${dateItemUnit}${JSPDD.TEXT.NEW_VAL}: ${this.getDescribableVal(r.val, r)}` );
        r.desc.push( `${dateItemUnit}${JSPDD.TEXT.OLD_VAL}: ${this.getDescribableVal(r._val, r)}` );

        this.itemCommonAction( r, dict, item );

        return r;
    }

    getDataItemUnit( item ) {
        let r = `${JSPDD.TEXT.FIELD}`;

        if( 
            item.path 
            && item.path.length 
            && typeof item.path[ item.path.length - 1 ] == 'number' 
        ){
            r = `${JSPDD.TEXT.INDEX}`;
        }

        return r;
    }


    procArrayDel( item ){
        let r = this.descDataItem( item, 1 )
            , dict = this.getDictData( item )
            , dateItemUnit = this.getDataItemUnit( item )
            ;
        r.action = 'delete';
        r.actiontype = 'array';

        if( dict && dict.fulllabel && dict.fulllabel.length ){
            r.label = dict.fulllabel;
        }
        this.setAdditionData( r, dict, item );

        r.desc.push( `${JSPDD.TEXT.DATA_PATH}: ${r.datakey.join('.')}` );

        if( r.label.length ){
            r.indict = 1;

            r.label.slice( 0, -1 ).length && 
                r.desc.push( `${r.label.slice( 0, -1 ).join(', ')}` );

            r.desc.push( `${JSPDD.TEXT.DELETE}${dateItemUnit}: ${r.datakey.slice( -1 ).join('')}` );
            r.desc.push( `${JSPDD.TEXT.FIELD_DETAIL}: ${r.label.slice( -1 ).join('')}` );
        }else{
            r.label.slice( 0, -1 ).length && 
                r.desc.push( `${r.datakey.slice( 0, -1 ).join('.')}` );
            r.desc.push( `${JSPDD.TEXT.DELETE}${dateItemUnit}: ${r.datakey.slice( -1 ).join('')}` );
        }
        r.desc.push( `${JSPDD.TEXT.DATA_TYPE}: ${Object.prototype.toString.call( r._val )}` );
        r.desc.push( `${dateItemUnit}值: ${this.getDescribableVal(r._val, r)}` );

        this.itemCommonAction( r, dict, item );

        return r;
    }

    procArrayEdit( item ){
        let r = this.descDataItem( item, 1 )
            , dict = this.getDictData( item )
            , dateItemUnit = this.getDataItemUnit( item )
            ;
        r.action = 'edit';
        r.actiontype = 'array';

        if( dict && dict.fulllabel && dict.fulllabel.length ){
            r.label = dict.fulllabel;
        }
        this.setAdditionData( r, dict, item );

        r.desc.push( `${JSPDD.TEXT.DATA_PATH}: ${r.datakey.join('.')}` );

        if( r.label.length ){
            r.indict = 1;

            r.label.slice( 0, -1 ).length && 
                r.desc.push( `${r.label.slice( 0, -1 ).join(', ')}` );

            r.desc.push( `${JSPDD.TEXT.EDIT}${dateItemUnit}: ${r.datakey.slice( -1 ).join('')}` );
            r.desc.push( `${JSPDD.TEXT.FIELD_DETAIL}: ${r.label.slice( -1 ).join('')}` );
        }else{
            r.label.slice( 0, -1 ).length && 
                r.desc.push( `${r.datakey.slice( 0, -1 ).join('.')}` );
            r.desc.push( `${JSPDD.TEXT.EDIT}${dateItemUnit}: ${r.datakey.slice( -1 ).join('')}` );
        }

        r.desc.push( `${JSPDD.TEXT.DATA_TYPE}: ${Object.prototype.toString.call( r.val )}` );
        r.desc.push( `${dateItemUnit}${JSPDD.TEXT.NEW_VAL}: ${this.getDescribableVal(r.val, r)}` );
        r.desc.push( `${dateItemUnit}${JSPDD.TEXT.OLD_VAL}: ${this.getDescribableVal(r._val, r)}` );

        this.itemCommonAction( r, dict, item );

        return r;
    }

    setAdditionData( r, dict, item ) {
        r.finallabel = {};
        dict && dict.item && ( r.finallabel = dict.item ); 
    }

    itemCommonAction( r, dict, item ) {
        this.RESULT_ALL.push( r );
        r.indict && this.RESULT_INDICT.push( r );
        !r.indict && this.RESULT_OUTDICT.push( r );
    }

    getDataLiteral( item, dict ) {
        if( typeof item == 'object' || typeof item == 'array' ){
            return JSON.stringify( item );
        }
        return item;
    }

    getDescribableVal( val, item ){
        val = this.getDataLiteral( val );
        let tmp;

        //console.log( val, item );


        //if( common.jsonInData( item, 'finallabel.unit' ) ){
        if( item.finallabel && 'unit' in item.finallabel ){
            val += item.finallabel.unit;
        }
        //if( common.jsonInData( item, 'finallabel.enum' ) ){
        if( item.finallabel && 'enum' in item.finallabel ){
            tmp = item.finallabel.enum || {};

            if( val in tmp ){
                val = `${tmp[val]}(${val})`;
            }
        }

        return val;
    }

    reset() {
        this.N              = [];
        this.D              = [];
        this.E              = [];
        this.A              = [];
        this.MAP            = {};
        this.ALL_MAP        = {};
        this.DICT           = {};

        this.RESULT_ALL     = [];
        this.RESULT_INDICT  = [];
        this.RESULT_OUTDICT = [];

        this.diffData       = null;
    }

    makeDict( data, path = [], label = []) {
        switch( data.constructor ){
            case Object: {
                Object.keys( data ).map( ( k ) => {
                    let item = data[ k ]
                        , spath = path.slice()
                        , slabel = label.slice()
                        ;
                        spath.push( k );

                    let fullpath =  spath.join( '.' );

                    this.DICT[ fullpath ] = {
                        item: item
                    };

                    if( item.label ){
                        slabel.push( item.label );
                        this.DICT[ fullpath ].parentlabel= label;
                        this.DICT[ fullpath ].fulllabel = slabel;
                    }else{
                        if( typeof item == 'string' ){
                            slabel.push( item );
                            this.DICT[ fullpath ].parentlabel= label;
                            this.DICT[ fullpath ].fulllabel = slabel;
                        }else{
                            this.DICT[ fullpath ].parentlabel= label;
                            this.DICT[ fullpath ].fulllabel = slabel;
                        }
                    }

                    this.makeDict( item, spath, slabel );
                });
                break;
            }
            case Array: {
                break;
            }
            default: {
                break;
            }
        }
    }

    makeMapData( item ) {
        item.fullpath   && ( this.MAP[ item.fullpath ] = item );

        item.fullpath   && ( this.ALL_MAP[ item.fullpath ] = item );
    }

    resolvePath( item ) {

        let path = item.path.slice();

        if( item.kind == KIND['array']){
            path.push( item.index );
        }

        item.fullpath = path.join( '.' );
    }

    debugData() {
        return {
            DESC: {
                'new'               : this.N
                , 'delete'          : this.D
                , 'edit'            : this.E
                , 'arrayedit'       : this.A
                , 'RESULT_ALL'      : this.RESULT_ALL
                , 'RESULT_INDICT'   : this.RESULT_INDICT
                , 'RESULT_OUTDICT'  : this.RESULT_OUTDICT
            }
            , SRC: {
                srcData             : this.srcData
                , newData           : this.newData
                , descData          : this.descData
                , diffData          : this.diffData
                , map               : this.MAP
                , allmap            : this.ALL_MAP
                , dictData          : this.DICT
            }
            , INFO: {
            }
        }
    }

    result() {
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

        let r = {};
        r.data = this.alldata ? this.RESULT_ALL : this.RESULT_INDICT;
        r.alldata = this.alldata;
        r.ts = Date.now();
        r.date = moment( r.ts ).format( 'YYYY-MM-DD HH:mm:ss' );

        this.userName && 
            ( r[ "userName" ] = this.userName );

        this.userId && 
            ( r[ "userId" ] = this.userId );


        return r;
    }
}

JSPDD.TEXT = {
    "NEW"                   : "新增"
    , "EDIT"                : "编辑"
    , "DELETE"              : "删除"
    , "NEW_VAL"             : "新值"
    , "OLD_VAL"             : "旧值"
    , "FIELD_DETAIL"        : "字段描述"
    , "DATA_TYPE"           : "数据类型"
    , "DATA_PATH"           : "数据路径"
    , "FIELD"               : "字段"
    , "INDEX"               : "索引"
    , "VAL"                 : "值"

    , "DEFAULT_DICT_TEXT"   : "文字描述 "
};


JSPDD.generatorDict = function ( sdata = {}, ndata = {}, ddata = {}, datalabelFormat = '' ) {
    let r, combData = $.extend( true, sdata, ndata );
    let prefix = JSPDD.TEXT.DEFAULT_DICT_TEXT;

    //console.log( 'ddddddddddd datalabelFormat:', datalabelFormat );

    let cb = ( item, key, pnt, datapath ) => {

        let label = `${prefix}${key}`;

        if( datalabelFormat ){
            label = datalabelFormat;
            label = label.replace( /{key}/gi, key );
            if( datapath && datapath.length ){
                label = label.replace( /{path}/gi, datapath.join('.') );
            }
            //console.log( datapath );
        }

        switch( Object.prototype.toString.call( item ) ){
            case '[object Array]': {
                let tmp = item;
                if( item.length && Object.prototype.toString.call( item[0] ) == '[object Object]' ){
                    let tmp = JSON.parse( JSON.stringify( item[0] ) );
                    jsonTraverser( tmp, cb );
                    pnt[key] = { _array: tmp, "label": label };
                }else{
                    pnt[key] = {
                        _array: {
                            "label": label
                       }
                       , "label": label
                    };
                }

                break;
            }
            case '[object Object]': {
                //console.log( key, item );
                item.label = label;
                break;
            }
            default: {
                if( key == 'label' ) return;
                pnt[ key ] = {
                    "label": label
                };
                break;
            }
        }

    };

    jsonTraverser( combData, cb );

    r = Object.assign( combData, ddata );

    return r;
};

