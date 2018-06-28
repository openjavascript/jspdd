
import diff from 'deep-diff';


export default class JSPDD {
    constructor( srcData, newData, descData ) {

        console.log( 'JSPDD', Date.now() );
        console.log( 'srcData:', srcData );
        console.log( 'newData:', newData );
        console.log( 'descData:', descData  );

        let diffdata = diff( srcData, newData );

        console.log( 'diffdata:', diffdata );
    }
}


