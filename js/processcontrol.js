import { GetWeatherFromAPI } from "./api.js"; 

//ここでは湘南台についたとき、SFCについたときそれぞれの処理がまとめて管理されます
export async function TestFlow(){
    console.log("これはテスト用");
    try {
        const weatherToday = await GetWeatherFromAPI();
        console.log(weatherToday); 
    } catch (error) {
        console.error("天気の取得に失敗しました", error);
    }
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