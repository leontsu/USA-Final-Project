import { GetWeatherFromAPI } from "./api.js";
import { gptResponse } from "./gpt.js";


//ここでは湘南台についたとき、SFCについたときそれぞれの処理がまとめて管理されます
export async function TestFlow() {
    console.log("これはテスト用");
    let weatherToday;

    try {
        weatherToday = await GetWeatherFromAPI();
        console.log(weatherToday);
    } catch (error) {
        console.error("天気の取得に失敗しました", error);
        return;
    }

    // Sample Data（将来的にはここを編集）
    const payload = {
        "weather": weatherToday,
        "period": "2",
        "userTime": "08:10"
    }

    // 最終的のOpenAI APIからのResponse
    // paramter in gptResponse() --> { weather, period, userTime }
    console.log("GPTが考え中！")
    const gptResult = await gptResponse(payload);
    console.log(gptResult);
}

export async function ShonandaiFlow() {
    console.log("main.htmlから、位置情報が湘南台だったので、ShonandaiFlowが呼び出されました");

    //api.jsを呼ぶ
    //weatherTodayが今日の天気です。
    try {
        const weatherToday = await GetWeatherFromAPI();
        console.log(weatherToday);
    } catch (error) {
        console.error("天気の取得に失敗しました", error);
    }

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

export async function SFCFlow() {
    console.log("main.htmlから、位置情報がSFCだったので、SFCFlowが呼び出されました");
    //api.jsを呼ぶ
    try {
        const weatherToday = await GetWeatherFromAPI();
        console.log(weatherToday);
    } catch (error) {
        console.error("天気の取得に失敗しました", error);
    }

    //database.jsを呼ぶ
    //gpt.jsを呼ぶ
}