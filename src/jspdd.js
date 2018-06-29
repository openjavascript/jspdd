
import diff from 'deep-diff';
import KIND from './module/kind.js';

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

    procNew( item ){
        let r = {};
        return r;
    }

    procDel( item ){
        let r = {};
        return r;
    }

    procEdit( item ){
        let r = {};
        return r;
    }

    procArray( item ){
        let r = {};
        return r;
    }

    procArrayNew( item ){
        let r = {};
        return r;
    }

    procArrayDel( item ){
        let r = {};
        return r;
    }

    procArrayEdit( item ){
        let r = {};
        return r;
    }


    reset() {
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
                        this.DICT[ fullpath ].fulllabel = slabel;
                    }else{
                        if( typeof item == 'string' ){
                            slabel.push( item );
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
        item.abspath    && ( this.ALL_MAP[ item.abspath ] = item );
    }

    resolvePath( item ) {

        let path = item.path.slice();

        if( item.kind == KIND['array']){
            path.push( item.index );
        }

        item.fullpath = path.join( '.' );
        item.abspath = item.fullpath;

        /*
        if( /[0-9]/.test( item.abspath ) ){
            let tmp = path.slice();
            for( let i = tmp.length -1; i >= 0; i-- ){
                if( typeof tmp[i] == 'number' ) {
                    tmp.splice( i, 1 );
                }
            }
            item.abspath = tmp.join( '.' );
        }
        */
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
        let r = {};

        this.N 
            && this.N.length
            && ( r['add'] = this.N )
            ;

        this.E 
            && this.N.length
            && ( r['edit'] = this.E )
            ;

        this.D 
            && this.N.length
            && ( r['delete'] = this.D )
            ;

        return r;
    }

}


