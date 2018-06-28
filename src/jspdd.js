
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
        this.N = [];
        this.D = [];
        this.E = [];
        this.A = [];

        this.diffData = null;
    }

    proc() {

        this.reset();
        
        this.diffData = diff( this.srcData, this.newData );

        this.clone( this.diffData ).map( ( v, k ) => {
            switch( v.kind ){
                case KIND.newData: {
                    this.N.push( v.kind );
                    break;
                }
                case KIND.deleteData: {
                    break;
                }
                case KIND.modifyData: {
                    break;
                }
                case KIND.arrayModifyData: {
                    break;
                }
            }
        });

        return this.result();
    }

    result() {
        return {
            DESC: {
                newData:            this.N
                , deleteData:       this.D
                , modifyData:       this.E
                , arrayModifyData:  this.A
            }
            , SRC: {
                srcData:    this.srcData
                , newData:  this.newData
                , descData: this.descData
                , diffData: this.diffData
            }
            , INFO: {
            }
        }
    }

}


