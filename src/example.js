
import 'whatwg-fetch';
import JSPDD from './jspdd.js';


export default class Example {
    constructor( api ) {
        this.DATA = [];
        this.api = api;
        this.pdd;

        this.run();
    }
    run(){
        if( !this.api.length ) {
            this.proc();
            return;
        }
        let item = this.api.shift();

        fetch( item, { rnd: Date.now() } )
        .then(function(response) {
            return response.json()
        }).then( ( json ) => {
            //this.DATA[ item.type ] = json;
            this.DATA.push( json );
            this.run();
        })
    }

    proc() {
        //console.log( 'api data:', this.DATA );
        this.pdd = new JSPDD( ...this.DATA );
    }
}

