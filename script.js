

document.addEventListener('DOMContentLoaded', () => {

        // これから操作するHTML要素を、idを元に探し出して変数に格納しておく。
        const userForm = document.getElementById('user-form');
        const predictButton = document.getElementById('predict-button');
        const resultsSection = document.getElementById('results-section');
    
        // HTML上で結果を表示するための各要素
        const displayLocation = document.getElementById('display-location');
        const displayWeather = document.getElementById('display-weather');
        const predictedTime = document.getElementById('predicted-time');
        const riskDisplay = document.getElementById('risk-display');
        const commentText = document.getElementById('comment-text');


        userForm.addEventListener('submit', async (event) => {

            // formのデフォルトの送信機能を無効にする（ページがリロード防止）
            event.preventDefault();
    
            // 1. まずは結果セクションを表示
            resultsSection.style.display = 'block'; // style属性のdisplayを'none'から'block'に変える
    
            // 2. ユーザーの入力値を取得
            const username = document.getElementById('username').value;
            const classPeriod = document.getElementById('class-period').value;
            console.log(`ユーザー名: ${username}, 講義: ${classPeriod}限`); // コンソールに表示して確認
    
            // 3. APIからの応答を待っている間、一時的なメッセージを表示する
            displayLocation.textContent = '湘南台';
            displayWeather.textContent = '取得中...';
            predictedTime.textContent = '計算中...';
            riskDisplay.textContent = '...';
            commentText.textContent = 'GPTが最善のルートを考えています...';
    
            // 4. (シミュレーション) APIからのデータ取得に時間がかかることを想定し、
            //    2秒後に結果を表示するタイマーを設定する。
            //    ※ 今後はここにAPIなどの処理を追加
            setTimeout(() => {
                // ここで、取得したデータでHTMLを書き換える
                displayWeather.textContent = '晴れ';
                predictedTime.textContent = '9:15';
                riskDisplay.textContent = '安';
                riskDisplay.style.color = 'green'; // スタイル（文字色）も変更
                commentText.textContent = '今日は快晴です。快適なバス通学になるでしょう。';
            }, 2000); // 2000ミリ秒 = 2秒後
        });

});