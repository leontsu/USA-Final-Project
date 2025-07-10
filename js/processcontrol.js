import { GetWeatherFromAPI } from "./api.js";
import { GetCurrentTime } from "./time.js"
import { gptResponse } from "./gpt.js";


//ここでは湘南台についたとき、SFCについたときそれぞれの処理がまとめて管理されます
export async function TestFlow(username, classPeriod) {
    console.log("これはテスト用");

    //api.jsによる天気検索
    let weatherToday;
    try {
        weatherToday = await GetWeatherFromAPI();
        console.log(weatherToday);
    } catch (error) {
        console.error("天気の取得に失敗しました", error);
        return;
    }

    //time.jsによる時刻と曜日取得
    let timeNow;
    try {
        timeNow = await GetCurrentTime();
        console.log(timeNow);
    } catch (error) {
        console.error("時間の取得に失敗しました", error);
        return;
    }


    const payload = {
        "weather": weatherToday,
        "period": classPeriod,
        "userTime": timeNow,
    }
    console.log(payload);

    // 最終的のOpenAI APIからのResponse
    // paramter in gptResponse() --> { weather, period, userTime }
    console.log("GPTが考え中！")
    const raw = await gptResponse(payload); // Promiseを解決
    const gptResult = raw;
    console.log(gptResult);

    const allresult = {
        "weather": weatherToday,
        "gptResult": gptResult,
    }
    return allresult;
}




export async function ShonandaiFlow(username, classPeriod) {
    console.log("main.htmlから、位置情報が湘南台だったので、ShonandaiFlowが呼び出されました");

    //api.jsを呼ぶ
    //weatherTodayが今日の天気です。
    console.log("これはテスト用");

    //api.jsによる天気検索
    let weatherToday;
    try {
        weatherToday = await GetWeatherFromAPI();
        console.log(weatherToday);
    } catch (error) {
        console.error("天気の取得に失敗しました", error);
        return;
    }

    //time.jsによる時刻と曜日取得
    let timeNow;
    try {
        timeNow = await GetCurrentTime();
        console.log(timeNow);
    } catch (error) {
        console.error("時間の取得に失敗しました", error);
        return;
    }


    const payload = {
        "weather": weatherToday,
        "period": classPeriod,
        "userTime": timeNow,
    }
    console.log(payload);

    // 最終的のOpenAI APIからのResponse
    // paramter in gptResponse() --> { weather, period, userTime }
    console.log("GPTが考え中！")
    const raw = await gptResponse(payload); // Promiseを解決
    const gptResult = raw;
    console.log(gptResult);

    const allresult = {
        "weather": weatherToday,
        "gptResult": gptResult,
    }
    return allresult;

    /*
    note:weatherTodayは藤沢市の天気を、以下の要領で出力します
    Clear 快晴
    Clouds曇り
    Rain雨
    Drizzle霧雨
    Snow雪
    Thunderstorm雷雨
    Atmosphere霧、もやなどの大気現象
    */


    //database.jsを呼ぶ


    //gpt.jsを呼ぶ
}

export async function SFCFlow(username, classPeriod) {
    console.log("main.htmlから、位置情報がSFCだったので、SFCFlowが呼び出されました");
    //api.jsを呼ぶ
    console.log("これはテスト用");

    //api.jsによる天気検索
    let weatherToday;
    try {
        weatherToday = await GetWeatherFromAPI();
        console.log(weatherToday);
    } catch (error) {
        console.error("天気の取得に失敗しました", error);
        return;
    }

    //time.jsによる時刻と曜日取得
    let timeNow;
    try {
        timeNow = await GetCurrentTime();
        console.log(timeNow);
    } catch (error) {
        console.error("時間の取得に失敗しました", error);
        return;
    }


    const payload = {
        "weather": weatherToday,
        "period": classPeriod,
        "userTime": timeNow,
    }
    console.log(payload);

    // 最終的のOpenAI APIからのResponse
    // paramter in gptResponse() --> { weather, period, userTime }
    console.log("GPTが考え中！")
    const raw = await gptResponse(payload); // Promiseを解決
    const gptResult = raw;
    console.log(gptResult);

    const allresult = {
        "weather": weatherToday,
        "gptResult": gptResult,
    }
    return allresult;
    //database.jsを呼ぶ
    //gpt.jsを呼ぶ
}