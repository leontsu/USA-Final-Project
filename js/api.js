//亀井の担当　open Weather APIなど
function GetWeatherFromAPI() {
    console.log("天気を検索中");
    const apiKey = 'c470e678f1dab928aa51dbb7e8a9d6d2';

    // 藤沢市の緯度と経度
    const lat = 35.3377;
    const lon = 139.4511;

    // APIリクエストURL
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;

    // 天気情報を取得して表示する
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                // サーバーからのエラー応答の場合、エラーを投げる
                throw new Error('APIからの応答が正しくありません');
            }
            return response.json();
        })
        .then(data => {
            console.log(data)
            return data.weather[0].main;
        });
}