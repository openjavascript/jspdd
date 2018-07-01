

import Example from './example.js';
import $ from './jquery.js';

export default class DemoBase {
    constructor() {
        this.demo = new Example();
    }

    init() {
        if( window.DATA_API ) {
            this.demo.updateAPI( window.DATA_API );
        }

        if( window.USERNAME ) {
            this.demo.userName = window.USERNAME;
        }

        if( window.USERID ) {
            this.demo.userId = window.USERID;
        }

        if( window.ALLDATA ) {
            this.demo.alldata = window.ALLDATA;
        }

        let demo = this.demo;

        /*
        console.log( demo.api );
        console.log( demo.userName );
        console.log( demo.userId );
        console.log( demo.alldata );
        */

        let srcData = $( '#srcData' )
            , newData = $( '#newData' )
            , descData = $( '#descData' )
            , outputData = $( '#outputData' )
            , procBtn = $( '#procBtn' )
            , alldata = $( '#alldata' )
            , userName = $( '#userName' )
            , userId = $( '#userId' )
            , outputText = $( '#outputText' )
            ;

        userName.val( demo.userName );
        userId.val( demo.userId );
        alldata.prop( 'checked', !!demo.alldata );

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
            outputText.html( demo.outputHtml( data ) );
        });


        procBtn.on( 'click', function(){
            let tmpSrc = JSON.parse( srcData.val() )
                , tmpNew = JSON.parse( newData.val() )
                , tmpDesc  = JSON.parse( descData.val() )
                ;

            console.clear();

            console.log( tmpSrc, tmpNew, tmpDesc,  alldata.prop( 'checked' ));

            outputData.val( '' );
            outputText.html( '' );

            demo.update( tmpSrc, tmpNew, tmpDesc );

            demo.alldata = alldata.prop( 'checked' ) ? 1 : 0;
            demo.userName = userName.val().trim();
            demo.userid = userId.val().trim();

            demo.run( ( data, pdd )=>{
                setTimeout( ()=>{

                    let debugData = pdd.debugData();
                    console.log( 'debugData', debugData );
                    console.log( 'diffData', debugData.SRC.diffData );
                    console.log( 'dictData', debugData.SRC.dictData );

                    console.log( 'data', data );

                    outputData.val( JSON.stringify( data, null, 4 ) );
                    outputText.html( demo.outputHtml( data ) );

                }, 500 );
            });

        });


    }
}
