
import diff from 'deep-diff';
import KIND from './module/kind.js';

import moment from 'moment';

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

export default class JSPDD {
    constructor( srcData, newData, descData ) {
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

        console.log( 'descDAta', this.descData );
        this.makeDict( this.descData );
        
        this.diffData = diff( this.srcData, this.newData );

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
                //this.A.push( this.procArray( item ) );

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

    getDictData( item ) {
        let r = this.DICT[item.fullpath]

        if( !r && /[0-9]/.test( item.fullpath ) ){
            let tmp = [];
            item.path.map( (v)=>{
                typeof v == 'string' && tmp.push( v );
                typeof v == 'number' && tmp.push( '_array' );
            });
            tmp.length && ( item.abspath = tmp.join('.') );

            item.abspath && ( r = this.DICT[ item.abspath ] );
        }

        return r;
    }

    procNew( item ){
        let r = this.descDataItem( item )
            , dict = this.getDictData( item )
            ;
        r.action = 'add';

        if( dict ){
            r.label = dict.fulllabel;
        }


        if( r.label.length ){
            r.indict = 1;

            r.label.slice( 0, -1 ).length && 
                r.desc.push( `${r.label.slice( 0, -1 ).join(', ')}` );

            r.desc.push( `新增字段: ${r.datakey.slice( -1 ).join('')}` );
            r.desc.push( `字段描述: ${r.label.slice( -1 ).join('')}` );
        }else{
            r.label.slice( 0, -1 ).length && 
                r.desc.push( `${r.datakey.slice( 0, -1 ).join('.')}` );
            r.desc.push( `新增字段: ${r.datakey.slice( -1 ).join('')}` );
        }
        r.desc.push( `数据类型: ${Object.prototype.toString.call( r.val )}` );
        r.desc.push( `字段值: ${this.getDataLiteral(r.val)}` );

        return r;
    }

    procDel( item ){
        let r = {};
        r.action = 'delete';
        return r;
    }

    procEdit( item ){
        let r = this.descDataItem( item )
            , dict = this.getDictData( item )
            ;
        r.action = 'edit';

        if( dict && dict.fulllabel && dict.fulllabel.length ){
            r.label = dict.fulllabel;
        }


        if( r.label.length ){
            r.indict = 1;

            r.label.slice( 0, -1 ).length && 
                r.desc.push( `${r.label.slice( 0, -1 ).join(', ')}` );

            r.desc.push( `编辑字段: ${r.datakey.slice( -1 ).join('')}` );
            r.desc.push( `字段描述: ${r.label.slice( -1 ).join('')}` );
        }else{
            r.label.slice( 0, -1 ).length && 
                r.desc.push( `${r.datakey.slice( 0, -1 ).join('.')}` );
            r.desc.push( `编辑字段: ${r.datakey.slice( -1 ).join('')}` );
        }
        r.desc.push( `数据类型: ${Object.prototype.toString.call( r.val )}` );
        r.desc.push( `字段新值: ${this.getDataLiteral(r.val)}` );
        r.desc.push( `字段旧值: ${this.getDataLiteral(r._val)}` );

        return r;
    }

    procArray( item ){
        let r = {};
        return r;
    }

    procArrayNew( item ){
        let r = {};
        r.action = 'add';
        return r;
    }

    procArrayDel( item ){
        let r = {};
        r.action = 'delete';
        return r;
    }

    procArrayEdit( item ){
        let r = {};
        r.action = 'edit';
        return r;
    }

    getDataLiteral( item ) {
        if( typeof item == 'object' || typeof item == 'array' ){
            return JSON.stringify( item );
        }
        return item;
    }

    descDataItem( item ){
        let ts = Date.now()
            , r = {
                "label": []
                , "datakey": item.path
                , "desc": []
                , "val": item.rhs
                , "_val": item.lhs
                , "indict": 0
            }
            ;

        return r;
    }

    reset() {
        this.userName;
        this.userId;

        this.N              = [];
        this.D              = [];
        this.E              = [];
        this.A              = [];
        this.MAP            = {};
        this.ALL_MAP        = {};
        this.DICT           = {};
        this.RESULT         = {};

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
                'new':            this.N
                , 'delete':       this.D
                , 'edit':         this.E
                , 'arrayedit':    this.A
            }
            , SRC: {
                srcData:    this.srcData
                , newData:  this.newData
                , descData: this.descData
                , diffData: this.diffData
                , map:      this.MAP
                , allmap:   this.ALL_MAP
                , dictData: this.DICT
            }
            , INFO: {
            }
        }
    }

    result() {
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

        this.userName && 
            ( r[ "userName" ] = this.userName );

        this.userId && 
            ( r[ "userId" ] = this.userId );

        r.ts = Date.now();
        r.date = moment( r.ts ).format( 'YYYY-MM-DD HH:mm:ss' );

        return r;
    }

}


