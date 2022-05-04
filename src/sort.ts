const DbClient = require('ali-mysql-client');

const db = new DbClient({
  host     : '127.0.0.1',
  port: 8889,
  user     : 'defi_user',
  password : 'Ilvedefi090',
  database : 'defi'
});

export{}

async function main() {
    // const myObj = { you: 100, me: 75, foo: 116, bar: 15 };
    // const result = Object
    //  .entries(myObj)
    //  .sort((a, b) => a[1] - b[1])
    //  .reduce((_sortedObj, [k,v]) => ({
    //    ..._sortedObj, 
    //    [k]: v
    //  }), {})
    // console.log(result);
    // var dictionaryOfScores: {[id: string]: number } = {
    //     Fred: 11,
    //     George: 22,
    //     Toby: 18,
    //     Shannon: 15,
    //   }
      
    //   var sortableArray = Object.entries(dictionaryOfScores);
    //   var sortedArray = sortableArray.sort(([, a], [, b]) => a - b);
    //   var sortedObject = Object.fromEntries(sortedArray);
    //   console.log(sortedObject)

    //   for (let item of sortedArray) {
    //     console.log(item);
    // }
    // 查询单个值，比如下面例子返回的是数字51，满足条件的数据条数
    const result = await db
      .select("max(DATE) as max_date")
      .from("uni_pool_day_data")
      .queryRow();

    console.log(result);
      
}


main();