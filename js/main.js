import { TestFlow, ShonandaiFlow, SFCFlow } from "./processcontrol.js";

document.addEventListener('DOMContentLoaded', async () => {



    // これから操作するHTML要素を、idを元に探し出して変数に格納しておく。
    const userForm = document.getElementById('user-form');
    //const predictButton = document.getElementById('predict-button');（不要）
    const resultsSection = document.getElementById('result');

    // HTML上で結果を表示するための各要素
    const displayLocation = document.getElementById('display-location');

    //湘南台駅の緯度と経度
    const SHONANDAI_LAT = 35.3970; // 湘南台駅の緯度
    const SHONANDAI_LON = 139.4682; // 湘南台駅の経度

    //慶應大学の緯度と経度
    const SFC_LAT = 35.3883; // 慶應大学の緯度
    const SFC_LON = 139.4272; // 慶應大学の経度

    const MAX_DISTANCE_M = 500; // 湘南台・慶應大学とみなす半径

    let username;
    let classPeriod;






    const displayWeather = document.getElementById('display-weather');
    const predictedTime = document.getElementById('predicted-time');
    const riskDisplay = document.getElementById('risk-display');
    const commentText = document.getElementById('comment-text');




    userForm.addEventListener('submit', async (event) => {


        // formのデフォルトの送信機能を無効にする（ページがリロード防止）
        event.preventDefault();


        if ("geolocation" in navigator) {
            // 現在地を取得する
            // 第1引数：成功時の関数, 第2引数：失敗時の関数
            navigator.geolocation.getCurrentPosition(checkIfInShonandai, showError);
        } else {
            displayLocation.textContent = "お使いのブラウザは位置情報に対応していません。";
        }

        // 1. まずは結果セクションを表示
        resultsSection.style.display = 'block'; // style属性のdisplayを'none'から'block'に変える

        // 2. ユーザーの入力値を取得
        username = document.getElementById('username').value;
        classPeriod = document.getElementById('class').value;
        console.log(`ユーザー名: ${username}, 講義: ${classPeriod}限`); // コンソールに表示して確認

        // 3. APIからの応答を待っている間、一時的なメッセージを表示する
        //displayLocation.textContent = '湘南台';
        displayWeather.textContent = '取得中...';
        predictedTime.textContent = '計算中...';
        riskDisplay.textContent = '...';
        commentText.textContent = 'GPTが最善のルートを考えています...';

        // 4. (シミュレーション) APIからのデータ取得に時間がかかることを想定し、
        //    2秒後に結果を表示するタイマーを設定する。
        //    ※ 今後はここにAPIなどの処理を追加
        setTimeout(() => {
            // ここで、取得したデータでHTMLを書き換える

        }, 2000); // 2000ミリ秒 = 2秒後
    });


    /**
 * @param {GeolocationPosition} position ブラウザから取得した位置情報
 */
    async function checkIfInShonandai(position) {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        // 基準点と現在地の距離を計算（メートル単位）
        const distance_SHONANDAI = getDistance(userLat, userLon, SHONANDAI_LAT, SHONANDAI_LON);
        const distance_SFC = getDistance(userLat, userLon, SFC_LAT, SFC_LON);



        let allResult;

        // 4. 距離に基づいて判定し、結果を表示
        if (distance_SHONANDAI <= MAX_DISTANCE_M) {
            displayLocation.textContent = "現在地は湘南台です";
            displayLocation.style.color = "green";
            allResult = await ShonandaiFlow(username, classPeriod); //processcontrolに処理を引き継ぐ
        }
        else if (distance_SFC <= MAX_DISTANCE_M) {
            displayLocation.textContent = "現在地はSFCです";
            displayLocation.style.color = "green";
            allResult = await SFCFlow(username, classPeriod); //processcontrolに処理を引き継ぐ
        }
        else {
            displayLocation.textContent = "現在地は湘南台またはSFCではありません";
            displayLocation.style.color = "red";
            allResult = await TestFlow(username, classPeriod);
        }
        console.log(allResult);


        if (allResult && allResult.gptResult) { 
            displayWeather.textContent = allResult.weather || '取得失敗';
            predictedTime.textContent = allResult.gptResult.ETA || '計算失敗';
            riskDisplay.textContent = allResult.gptResult.risk || '不明';
            if (allResult.gptResult.comment) {
                // commentキーがあれば、その内容を displayText に設定
                commentText.textContent = allResult.gptResult.comment;
            } 
            else if (allResult.gptResult.error) {
                // commentキーがなくて、errorキーがあれば、その内容を displayText に設定
                commentText.textContent = allResult.gptResult.error;
            }
            else{
                commentText.textContent ='コメントはありません。';
            }

            // 遅刻危険度に応じて色を変えるなどの処理
            if (allResult.gptResult.risk === '危') {
                riskDisplay.style.color = 'red';
            } else {
                riskDisplay.style.color = 'green';
            }
        }
    }

    /**
     * 5. 位置情報の取得に失敗した場合の処理
     * @param {GeolocationPositionError} error 
     */
    function showError(error) {
        let errorMessage = "位置情報を取得できませんでした。";
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "位置情報の利用が許可されていません。";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = "位置情報が利用できません。";
                break;
            case error.TIMEOUT:
                errorMessage = "タイムアウトしました。";
                break;
        }
        displayLocation.textContent = errorMessage;
        displayLocation.style.color = "orange";
    }

    /**
     * 6. 2つの緯度経度間の距離を計算する関数（ヒュベニの公式）
     * @returns {number} 距離（メートル）
     */
    function getDistance(lat1, lon1, lat2, lon2) {
        function toRad(deg) {
            return deg * Math.PI / 180;
        }

        const R = 6371e3; // 地球の半径（メートル）
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // 距離（メートル）
    }

});