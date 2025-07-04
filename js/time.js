export function GetCurrentTime() {
    const date = new Date();
    

    //時分
    let hour = date.getHours();			// 時の取り出し
    let min = date.getMinutes();		// 分の取り出し

    const hourmin=hour+"時"+min+"分"
    console.log(hourmin);

    //曜日
    const dayIndex = date.getDay();  // 0:日曜, 1:月曜, ..., 6:土曜
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const todaysDate=days[dayIndex];

    console.log(todaysDate);

    const timeObject={
        "hourmin": hourmin,
        "todaysDate": todaysDate
    }

    return timeObject;
}