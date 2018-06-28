
import Example from './module/example.js';

let demo = new Example( [ 
    "./data/case1/srcdata.json"
    , "./data/case1/newdata.json"
    , "./data/case1/descdata.json"
]);

demo.run( ( data, pdd )=>{
    console.log( 'done', Date.now() );

    let debugData = pdd.debugData();
    console.log( 'debugData', debugData );
    console.log( 'allmap', debugData.SRC.allmap );
    console.log( 'dictData', debugData.SRC.dictData );


    console.log( 'data', data );
});
