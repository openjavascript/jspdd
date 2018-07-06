# jspdd
基于JSON数据的变更自动产生操作日志，并可自定义日志说明文字。

操作日志精确到 JSON 数据的具体字段.

可记录所有字段的 增/删/改 操作。

## install
    npm install jspdd --save

## importing

    import JSPDD from 'jspdd';
    
## example
    import JSPDD from 'jspdd'; //导入 jspdd

        //定义测试的原始数据
    let srcData = { a: 1 }      
        //定义测试的变更数据
        , newData = { b: 2 }
        ;

    let jspdd = new JSPDD( srcData, newData );

    //从原始数据和变更数据，生成数据字典
    jspdd.descData = JSPDD.generatorDict( JSON.parse( JSON.stringify( srcData ) ), newData );

    jspdd.userName   = 'test username';   //设置用户名(可选)
    jspdd.userId     = 'test userid';     //设置用户ID(可选) 
    jspdd.alldata    = 1;                 //结果是否包含所有数据( 0:仅出现在字典的数据， 1:所有数据 )，默认1

    //执行处理操作，并返回处理结果
    let result = jspdd.proc();

    //打印相关内容到控制台
    console.log( 'jspdd:', jspdd );     
    console.log( 'result:', result );
    
## API

### 构造函数 JSPDD( srcData, newData, descData );
srcData:    原始数据

newData:    修改后的数据

descData:   描述数据

### alldata: int
    输出结果是否包含所有数据， 1 = 包含所有数据， 0 = 只包含字典里的数据
    
    默认值 = 1

### userName: String  
设置用户名，可选值

### userId: String 
设置用户ID，可选值

### datakey_prefix：String
定义 datakey 的前缀文字

### srcData: Object
用于生成数据对比的原始数据

### newData: Object
用于生成数据对比的变更数据

### descData: Object
用于生成数据说明文字的字典数据

### proc(): Object
执行分析处理, 并返回处理结果

    {
        "data": [
            ...{
                "label": [...],             //array , 所有字段的文字描述 label
                "datakey": [...],           //array , 所有字段的属性名
                "desc": [...],              //array , 已经由jspdd处理过的数据文字描述
                "val": null,                //*     , 字段新值  , 编辑的时候会有这个值
                "_val": null,               //*     , 字段原始值, 新增，删除，编辑的时值会有这个值
                "indict": 1,                //(0|1) , 字段数据是否出现在字典里
                "action": "delete"          //string, 字段的变更类型, (add = 新增, delete = 删除, edit = 编辑)
            }
        ],
        "alldata": 1,                       //(0|1) , 输出结果是否包含所有数据， 1 = 包含所有数据， 0 = 只包含字典里的数据   
        "userName": "testUser",             //string, 操作数据时的用户名
        "userId": "222",                    //string, 操作数据时的用户ID
        "date": "2018-07-03 17:23:57",      //string, 操作数据时的标准日期时间
        "ts": 1530609837718                 //string, 操作数据时的时间戳
    }
    
### debugData(): Object
输出调试数据，用于调试用，通常在执行 jspdd.proc后调用。

    {
        DESC: {
            'new'               : this.N
            , 'delete'          : this.D
            , 'edit'            : this.E
            , 'arrayedit'       : this.A
            , 'RESULT_ALL'      : this.RESULT_ALL
            , 'RESULT_INDICT'   : this.RESULT_INDICT
            , 'RESULT_OUTDICT'  : this.RESULT_OUTDICT
        }
        , SRC: {
            srcData             : this.srcData
            , newData           : this.newData
            , descData          : this.descData
            , diffData          : this.diffData
            , map               : this.MAP
            , allmap            : this.ALL_MAP
            , dictData          : this.DICT
        }
        , INFO: {
        }
    }

### 静态方法 JSPDD.generatorDict( sdata = {}, ndata = {}, ddata = {} ): Object
从sdata, ndata 生成字典描述数据ddata

sdata:    原始数据

ndata:    修改后的数据

ddata:   描述数据

### 静态属性 JSPDD.TEXT 
定义描述文字内容 

    JSPDD.TEXT = {
        "NEW"                   : "新增"
        , "EDIT"                : "编辑"
        , "DELETE"              : "删除"
        , "NEW_VAL"             : "新值"
        , "OLD_VAL"             : "旧值"
        , "FIELD_DETAIL"        : "字段描述"
        , "DATA_TYPE"           : "数据类型"
        , "DATA_PATH"           : "数据路径"
        , "FIELD"               : "字段"
        , "INDEX"               : "索引"
        , "VAL"                 : "值"

        , "DEFAULT_DICT_TEXT"   : "文字描述 "
    };

## 相关演示

  1. 自动生成字典数据 - 注入自定义方法
  
     [https://openjavascript.github.io/jspdd-demo/web/tools-dict-generator-for-method.html](https://openjavascript.github.io/jspdd-demo/web/tools-dict-generator-for-method.html)

  1. 自动生成字典数据

      [https://openjavascript.github.io/jspdd-demo/web/tools-dict-generator.html](https://openjavascript.github.io/jspdd-demo/web/tools-dict-generator.html)
  1. 手动设置字典数据

      [https://openjavascript.github.io/jspdd-demo/web/demo-case1.html](https://openjavascript.github.io/jspdd-demo/web/demo-case1.html)

  1. 更多演示请查看 [jspdd-demo](https://github.com/openjavascript/jspdd-demo) 项目
