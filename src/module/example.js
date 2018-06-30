
import 'whatwg-fetch';
import JSPDD from '../jspdd.js';


export default class Example {
    constructor( api ) {
        this.DATA = [];
        this.api = api;
        this.pdd;

        this.userName;
        this.userId;
        this.alldata = 1;
    }
    run( doneCb ){
        if( !this.api.length ) {
            let result = this.proc();
            doneCb && doneCb( result, this.pdd );
            return;
        }
        let item = this.api.shift();

        fetch( item, { rnd: Date.now() } )
        .then(function(response) {
            return response.json()
        }).then( ( json ) => {
            //this.DATA[ item.type ] = json;
            this.DATA.push( json );
            this.run( doneCb );
        })
    }

    update( srcData, newData, descData ) {
        this.DATA = [ srcData, newData, descData ];
    }

    proc() {
        //console.log( 'api data:', this.DATA );
        this.pdd = new JSPDD( ...this.DATA );

        this.pdd.userName   = this.userName;
        this.pdd.userId     = this.userId;
        this.pdd.alldata    = this.alldata;

        return this.pdd.proc();
    }

    outputHtml( data ) {
        let r = [];

        let log_type = '';
        if( data.alldata ){
            log_type = '记录所有数据字段';
        }else{
            log_type = '仅记录存在于数据字典的字段';
        }

        r.push( `<div class="outputtext-box">` );

        r.push( `<div class="font-weight-bold">记录时间: ${data.date}, 记录类型: ${log_type}, 数据总数: ${data.data.length}条</div>` );
        r.push( `<div class="font-weight-bold py-1">用户名: ${data.userName}, 用户ID: ${data.userId}</div>` );

        r.push( `<div class="list-color-desc">
            <label class="font-weight-bold">颜色说明:</label>&nbsp;
            <span class="action-add">绿色文字代表新增(add)</span>&nbsp; 
            <span class="action-edit">蓝色文字代表编辑(edit)</span>&nbsp; 
            <span class="action-delete">红色文字代表删除(delete)</span>&nbsp; 
            <span class="actiontype-array">灰色背景代表修改的数据为数组字段(array)</span>
        </div>` );

        r.push( `<div class="list-box"><ul>` );
        data.data.map( ( v ) => {
            let actiontype = '';
            v.actiontype && ( actiontype = `actiontype-${v.actiontype}`  );
            r.push( `<li class="action-${v.action} ${actiontype}">
                <div class="font-weight-bold">数据路径: ${v.datakey.join('.')}</div>
                <div>${v.desc.join('<br/>')}</div>
            </li>` );
        });
        r.push( `</ul></div>` );
        r.push( `</div>` );

        return r.join('');
    }
}

