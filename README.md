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

    let pdd = new JSPDD( srcData, newData );

    //从原始数据和变更数据，生成数据字典
    pdd.descData = JSPDD.generatorDict( JSON.parse( JSON.stringify( srcData ) ), newData );

    pdd.userName   = 'test username';   //设置用户名(可选)
    pdd.userId     = 'test userid';     //设置用户ID(可选) 
    pdd.alldata    = 1;                 //结果是否包含所有数据( 0:仅出现在字典的数据， 1:所有数据 )，默认1

    //执行处理操作，并返回处理结果
    let result = pdd.proc();

    //打印相关内容到控制台
    console.log( 'pdd:', pdd );
    console.log( 'result:', result );

## 相关演示

  1. 自动生成字典数据

      [https://openjavascript.github.io/jspdd-demo/web/tools-dict-generator.html](https://openjavascript.github.io/jspdd-demo/web/tools-dict-generator.html)
  1. 手动设置字典数据

      [https://openjavascript.github.io/jspdd-demo/web/demo-case1.html](https://openjavascript.github.io/jspdd-demo/web/demo-case1.html)

  1. 更多演示请查看 [jspdd-demo](https://github.com/openjavascript/jspdd-demo) 项目
