
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

    reset() {
        this.N              = [];
        this.D              = [];
        this.E              = [];
        this.A              = [];
        this.MAP            = {};
        this.ALL_MAP        = {};

        this.diffData       = null;
    }

    proc() {

        this.reset();
        
        this.diffData = diff( this.srcData, this.newData );

        this.clone( this.diffData ).map( ( v, k ) => {

            this.resolvePath( v );
            this.makeMapData( v );

            switch( v.kind ){
                case KIND.newData: {
                    this.N.push( v );
                    break;
                }
                case KIND.deleteData: {
                    this.D.push( v );
                    break;
                }
                case KIND.editData: {
                    this.E.push( v );
                    break;
                }
                case KIND.arrayeditData: {
                    this.A.push( v );
                    break;
                }
            }
        });

        return this.result();
    }

    makeMapData( item ) {
        item.fullpath   && ( this.MAP[ item.fullpath ] = item );

        item.fullpath   && ( this.ALL_MAP[ item.fullpath ] = item );
        item.abspath    && ( this.ALL_MAP[ item.abspath ] = item );
    }

    resolvePath( item ) {

        item.fullpath = item.path.join( '.' );
        item.abspath = item.fullpath;
        if( /[0-9]/.test( item.abspath ) ){
            let tmp = item.path.slice();
            for( let i = tmp.length -1; i >= 0; i-- ){
                if( typeof tmp[i] == 'number' ) {
                    tmp.splice( i, 1 );
                }
            }
            item.abspath = tmp.join( '.' );
        }
    }

    result() {
        return {
            DESC: {
                newData:            this.N
                , deleteData:       this.D
                , editData:         this.E
                , arrayeditData:    this.A
            }
            , SRC: {
                srcData:    this.srcData
                , newData:  this.newData
                , descData: this.descData
                , diffData: this.diffData
                , map:      this.MAP
                , allmap:   this.ALL_MAP
            }
            , INFO: {
            }
        }
    }

}


