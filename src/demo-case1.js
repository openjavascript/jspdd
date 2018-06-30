
import Example from './module/example.js';
import $ from './module/jquery.js';

let srcData = $( '#srcData' )
    , newData = $( '#newData' )
    , descData = $( '#descData' )
    , outputData = $( '#outputData' )
    , procBtn = $( '#procBtn' )
    , alldata = $( '#alldata' )
    ;

let demo = new Example( [ 
    "./data/case1/srcdata.json"
    , "./data/case1/newdata.json"
    , "./data/case1/descdata.json"
]);
demo.userName = 'testUser';
demo.userId = '111';
demo.alldata = 1;

demo.run( ( data, pdd )=>{
    let debugData = pdd.debugData();
    console.log( 'debugData', debugData );
    console.log( 'diffData', debugData.SRC.diffData );
    console.log( 'dictData', debugData.SRC.dictData );

    console.log( 'data', data );

    srcData.val( JSON.stringify( debugData.SRC.srcData, null, 4 ) );
    newData.val( JSON.stringify( debugData.SRC.newData, null, 4 ) );
    descData.val( JSON.stringify( debugData.SRC.descData, null, 4 ) );

    alldata.prop( 'checked', !!demo.alldata );

    outputData.val( JSON.stringify( data, null, 4 ) );
});


procBtn.on( 'click', function(){
    let tmpSrc = JSON.parse( srcData.val() )
        , tmpNew = JSON.parse( newData.val() )
        , tmpDesc  = JSON.parse( descData.val() )
        ;

    console.clear();

    console.log( tmpSrc, tmpNew, tmpDesc,  alldata.prop( 'checked' ));
    outputData.val( '' );
    demo.update( tmpSrc, tmpNew, tmpDesc );
    demo.alldata = alldata.prop( 'checked' ) ? 1 : 0;
    demo.run( ( data, pdd )=>{
        setTimeout( ()=>{

            let debugData = pdd.debugData();
            console.log( 'debugData', debugData );
            console.log( 'diffData', debugData.SRC.diffData );
            console.log( 'dictData', debugData.SRC.dictData );

            console.log( 'data', data );

            outputData.val( JSON.stringify( data, null, 4 ) );

        }, 500 );
    });

});
