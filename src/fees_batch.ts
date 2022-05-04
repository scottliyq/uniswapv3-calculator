import {
    // getPoolFromPair,
    // getPoolTicks,
    // getTokenList,
    // getVolumn24H,
    // Pool,
    updateSubgraphEndpoint,
    // V3Token,
    queryUniswap,
  } from "./repos/uniswap";
  import bn from "bignumber.js";

  import { NETWORKS } from "./common/types";
import { table } from "console";
import { exit } from "process";
  const DbClient = require('ali-mysql-client');

  // bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });
  
  // const Q96 = new bn(2).pow(2);
  // const mulDiv = (a: bn, b: bn, multiplier: bn) => {
  //   return a.multipliedBy(b).div(multiplier);
  // };

const db = new DbClient({
  host     : '127.0.0.1',
  port: 8889,
  user     : 'defi_user',
  password : 'Ilvedefi090',
  database : 'defi'
});  
const storePoolDayData = (poolData: any, poolDayData: any) => {


};

 
async function main() {

  // matic endpoint
  updateSubgraphEndpoint(NETWORKS[0].subgraphEndpoint)

  const rstMaxDate = await db
    .select("max(DATE) as max_date")
    .from("uni_pool_day_data")
    .queryRow();
  let maxDate = 0;
  if(rstMaxDate !== undefined) {
    maxDate = rstMaxDate.max_date;
  }
  console.log("latest date " + maxDate);
  const poolDatas = await queryUniswap(`{
    pools( first:300, orderBy: totalValueLockedUSD orderDirection: desc) {
      id
      liquidity
      feeTier
      volumeUSD
      token0 {
          id
          symbol
      }
      token1 {
          id
          symbol
      }
      poolDayData(skip:1, first:100, orderBy: date, orderDirection: desc where:
        {
            date_gt: ${maxDate}
        }) {
        id
        date
        liquidity
        sqrtPrice
        token0Price
        token1Price
        tick
        feeGrowthGlobal0X128
        feeGrowthGlobal1X128
        tvlUSD
        volumeToken0
        volumeToken1
        volumeUSD
        feesUSD
        txCount
        open
        high
        low
        close
      }
    }
  }`);
  let dictResult: {[id: string]: number } = {};

  // let dictPoolResult: {[id: string]: Object } = {};
  if (poolDatas===undefined) {
    console.log("connection error");
    exit();
  }
  
  let pools = poolDatas["pools"];
  const trans = await db.useTransaction();
  try {
    for (const poolData of pools){  
      // 监差是否已有pool数据
      const result = await db
        .select("id")
        .from("uni_pool_data")
        .where("id", poolData.id) // id = 12
        .queryRow();
  
      if(result===undefined) {
        // console.log("store pool: " + poolData.id + " " + poolData.token0.symbol + " " + poolData.token1.symbol)
        // 保存pool数据，增加新的pool
        const tablePoolData = {
          "id":poolData.id,
          "token0_symbol":poolData.token0.symbol,
          "token1_symbol":poolData.token1.symbol,
          "token0_id":poolData.token0.id,
          "token1_id":poolData.token1.id,
          "feeTier":poolData.feeTier
        }
        // 保存数据库pool day data
        await db
          .insert("uni_pool_data", tablePoolData)
          .execute();
      } 
  
      if(poolData["poolDayData"].length>0) {
        if(poolData["poolDayData"][0]["feesUSD"] === undefined || poolData["poolDayData"][0]["feesUSD"].length == 0)
        {
          console.log(poolData["id"]);
          continue;
        }
        // console.log("store pool day data: " + poolData.id + " " + poolData.token0.symbol + " " + poolData.token1.symbol)

        // 保存数据库pool day data
        await db
          .insert("uni_pool_day_data", poolData.poolDayData)
          .execute();
        // commit一个pool的数据 
        await trans.commit();  

        let rate = Number(poolData["poolDayData"][0]["feesUSD"]) / Number(poolData["poolDayData"][0]["tvlUSD"]);
    
        dictResult[poolData["id"]] = Number(rate);
      }
  
    }

  } catch (e) {
    console.log(e);
    await trans.rollback();
  }
  console.log("all data stored");
  // 显示排序前列的pool
  // var sortableArray = Object.entries(dictResult);
  // var sortedArray = sortableArray.sort(([, a], [, b]) => b - a);
  // var slicedArray = sortedArray.slice(0,20);

  // for (let item of slicedArray){  
  //   let poolId = item[0];
  //   for (const poolData of pools){ 
  //     if(poolId == poolData["id"]) {
  //       console.log(poolData);

  //       break;
  //     }
  //   }

  // }

  // for (let item of sortedArray) {
  //   console.log(item);
  // }
}
  
  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});