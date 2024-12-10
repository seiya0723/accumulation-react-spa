import { useState, useMemo } from "react";

import Chart from 'chart.js/auto';
import { Line } from 'react-chartjs-2';


import InputField from "./components/InputField";

// コンポーネント内のStateが変化するたび、再レンダリングされる。
const App = () => {

    const [ principal, setPrincipal ]               = useState(100000);
    const [ rate, setRate ]                         = useState(10);
    const [ number, setNumber ]                     = useState(12);
    const [ time, setTime ]                         = useState(20);

    // 年ごとの積立計算結果をメモリにキャッシュする。
    const futureValueList = useMemo(() => {
        const adjustedRate          = rate / 100 
        const tempFutureValueList   = [];

        // 年ごとの全体利益、元手、利息分を計算する。
        for (let year=1; year<=time ; year++ ){

            // FV = P × [(1 + r/n)^(nt) - 1] / (r/n)

            const fv        = (principal * ( ( 1 + adjustedRate/number) ** ( number*year) -1) / (adjustedRate/number));
            const pr        = principal*year*number;
            const ga        = (fv-principal*year*number);

            tempFutureValueList.push({ fv, pr, ga });
        }
        return tempFutureValueList;

    }, [principal, rate, number, time]);

    // TIPS: このようにsetTime などを与えれば、一元化できる。
    // TIPS: onChangeにevent引数を指定しないので、カリー化(currying)して渡す。(通常引数+イベント引数)
    const handleChange      =  (setter) => (event) => {

        // 極端に大きな値を入れられた時、拒否する。
        const value = Number(event.currentTarget.value) 

        const max   = Number(event.currentTarget.max)
        const min   = Number(event.currentTarget.min)

        if ( value > max || min > value){
            console.log("入力値が不正です。");
            return false;
        }


        setter(value); 
    }


    // TODO: ここの処理が複雑でわかりにくいので調整
    const renderGraph       = () => {
        // chart.js 用のdatasets とlabelを作る
        const fvObj = {};

        for (let fv of futureValueList) {
            for (let [key,value] of Object.entries(fv) ){
                if (!fvObj[key]) {
                    fvObj[key] = []; 
                }       
                fvObj[key].push(value);
            }
        }
        const data = {};

        if (!fvObj["fv"] || fvObj["fv"].length <= 0) {
            return false;
        }

        data.labels = fvObj["fv"].map((f, index) => `${index+1}年目`);

        data.datasets = [];
        data.datasets.push( {
            label: "全体利益",
            data : fvObj["fv"].map( (f) => parseFloat(f) ),
            fill : true,
        });
        data.datasets.push( {
            label: "元手",
            data : fvObj["pr"].map( (f) => parseFloat(f) ),
            fill : true,
        });



        return (
            <div style={{ position:"relative", width:"100%" }}>
                <Line data={data} />
            </div>
        );
    }

    // 小数第2位まで表示し、カンマ区切りの文字列を作る
    const fixed = (data) => {
        return humanize(data.toFixed(2))
    }

    // 小数を除外、整数部で3桁カンマ区切りの文字列を返す。
    const humanize = (data) => {
        const parts = String(data).split(".");
        parts[0]    = Number(parts[0]).toLocaleString()

        return parts.join(".")
    }


    return (
        <>
            <h1 className="header">積立運用シミュレーター</h1>

            <main className="main_area">
                
                <h2>入力欄</h2>

                <InputField label="年利(%)" value={rate.toString()} onChange={handleChange(setRate)} min="0" max="100" placeholder="年利" />
                <InputField label="積立金額(円)" value={principal.toString()} onChange={handleChange(setPrincipal)} min="0" max="100000000" placeholder="積立金額(円)" />
                <InputField label="年あたりの積立回数(回)" value={number.toString()} onChange={handleChange(setNumber)} min="1" max="1000" placeholder="年あたりの積立回数(回)" />
                <InputField label="積立期間(年)" value={time.toString()} onChange={handleChange(setTime)} min="1" max="100" placeholder="積立期間(年)" />

                <p className="annotate">※毎月積立する場合は「年あたりの積立回数(回)」に12を、毎日積立する場合は365を入力してください。</p>

                <hr />

                <h2>積立結果</h2>
                
                <div>年利{rate}%で、{principal}円を1年に{number}回積立し、{time}年間継続した場合</div>

                { (() => {
                    if (futureValueList.length === 0){
                        return <div>ここに計算結果が表示されます。</div>;
                    }
                    const lastFutureValue   = futureValueList[futureValueList.length-1];
                    return (
                        <>
                            <div>全体利益: <span className="result">{ fixed(lastFutureValue.fv) } 円</span></div>
                            <div>元手: <span className="result">{ humanize(lastFutureValue.pr) } 円</span> 利息分: <span className="result">{ fixed(lastFutureValue.ga) } 円</span></div>
                        </>
                    )
                }) () }


                <hr />

                <h2>グラフ</h2>

                {renderGraph()}

                
                <hr />

                <h2>詳細データ</h2>

                <div className="table_wrap">
                    <table>
                        <thead>
                            <tr>
                                <th className="text-center">年目</th>
                                <th className="text-center">元手</th>
                                <th className="text-center">利息</th>
                                <th className="text-center">全体利益</th>
                            </tr>
                        </thead>
                        <tbody>
                            { 
                                futureValueList.map( (fv, index) => (
                                    <tr key={index}>
                                        <td className="text-center">{index+1}年目</td>
                                        <td className="text-end">{humanize(fv.pr)}円</td>
                                        <td className="text-end">{fixed(fv.ga)}円</td>
                                        <td className="text-end">{fixed(fv.fv)}円</td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>

            </main>
        </>
    );
}

export default App
