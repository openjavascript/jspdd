
import Example from './module/example.js';
import $ from './module/jquery.js';

let srcData = $( '#srcData' )
    , newData = $( '#newData' )
    , descData = $( '#descData' )
    , outputData = $( '#outputData' )
    , procBtn = $( '#procBtn' )
    ;

let demo = new Example( [ 
    "./data/case1/srcdata.json"
    , "./data/case1/newdata.json"
    , "./data/case1/descdata.json"
]);
demo.userName = 'testUser';
demo.userId = '111';

demo.run( ( data, pdd )=>{
    let debugData = pdd.debugData();
    console.log( 'debugData', debugData );
    console.log( 'diffData', debugData.SRC.diffData );
    console.log( 'dictData', debugData.SRC.dictData );

    console.log( 'data', data );

    srcData.val( JSON.stringify( debugData.SRC.srcData, null, 4 ) );
    newData.val( JSON.stringify( debugData.SRC.newData, null, 4 ) );
    descData.val( JSON.stringify( debugData.SRC.descData, null, 4 ) );

    outputData.val( JSON.stringify( data, null, 4 ) );
});


procBtn.on( 'click', function(){
    let tmpSrc = JSON.parse( srcData.val() )
        , tmpNew = JSON.parse( newData.val() )
        , tmpDesc  = JSON.parse( descData.val() )
        ;

    //console.log( tmpSrc, tmpNew, tmpDesc );
    outputData.val( '' );
    demo.update( tmpSrc, tmpNew, tmpDesc );
    demo.run( ( data, pdd )=>{
        setTimeout( ()=>{
            outputData.val( JSON.stringify( data, null, 4 ) );
        }, 500 );
    });

});
