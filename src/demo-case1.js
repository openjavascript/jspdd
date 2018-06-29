
import Example from './module/example.js';

let demo = new Example( [ 
    "./data/case1/srcdata.json"
    , "./data/case1/newdata.json"
    , "./data/case1/descdata.json"
]);
demo.userName = 'testUser';
demo.userId = '111';

demo.run( ( data, pdd )=>{
    let debugData = pdd.debugData();
    console.log( 'diffData', debugData.SRC.diffData );
    console.log( 'dictData', debugData.SRC.dictData );

    console.log( 'data', data );
});
