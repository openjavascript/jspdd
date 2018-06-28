
import Example from './module/example.js';

let demo = new Example( [ 
    "./data/case1/srcdata.json"
    , "./data/case1/newdata.json"
    , "./data/case1/descdata.json"
]);

demo.run( ( data )=>{
    console.log( 'done', Date.now() );
    console.dir( data );
    console.log( data.SRC.allmap );
});
