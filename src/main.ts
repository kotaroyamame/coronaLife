import { City } from "./City";
import { Human } from './Human'


import { ChartOptions, Chart } from "chart.js";
window.CITY_SIZE = 600;//√セル数
window.HUMAN_SIZE = 500;//人の数
window.HUMAN_SPEED = 100;
window.RANDOM_COEFF = 50;//乱数定数
window.CITY_BLOCK_SIZE = 8;
class CanvasController {
	is_down = false;
	startX = 0;
	startY = 0;
	endX = 0;
	endY = 0;
	x = 0;
	y = 0;
	zoomMax = 2;
	zoomMin = 0.1;
	zoom: number = 1;
	endZoom: number = 1;
	mousedown(e: MouseEvent) {
		console.log(e);

		this.startX = e.offsetX;
		this.startY = e.offsetY;
		this.is_down = true;
	}
	mouseup(e: MouseEvent) {
		console.log(e);
		this.is_down = false;
		this.endX = this.x;
		this.endY = this.y;
		this.endZoom = this.zoom;
	}
	mousemove(e: MouseEvent) {

		if (this.is_down) {
			if (e.altKey) {
				if (this.zoom > this.zoomMax && (e.offsetY - this.startY) < 0) {
					this.zoom += (e.offsetY - this.startY) * 0.0001;
				} else if (this.zoom < this.zoomMin && (e.offsetY - this.startY) > 0) {
					this.zoom += (e.offsetY - this.startY) * 0.0001;
				} else if (this.zoom < this.zoomMax && this.zoom > this.zoomMin) {
					this.zoom += (e.offsetY - this.startY) * 0.0001;
				}
			} else {
				this.x = e.offsetX - this.startX + this.endX;
				this.y = e.offsetY - this.startY + this.endY;
			}

		}
	}
}
class Main {
	static city: City;
	static canvas = <HTMLCanvasElement>document.getElementById('js-city');
	static stageW: number = 0;
	static stageH: number = 0;
	static canvasContext: CanvasRenderingContext2D | null = null;
	static drawCount = 0;
	static humanChart: Chart | null = null;
	static canvasController = new CanvasController();
	//描画するサイズ
	static fieldWidth: number = 0;
	static fieldHeight: number = 0;
	static widthCoeff: number = 1;
	static ChartData: any = {
		deaths: [],
		cases: [],
		setHuman: (humanList: Array<Human>) => {
			// Main.ChartData.deaths.push(0);
			Main.ChartData.cases.push(0);
			humanList.forEach((human) => {
				if (human.isInfected) {
					Main.ChartData.cases[Main.ChartData.cases.length - 1]++;
				}
			});
			console.log(Main.ChartData.cases);
		}
	}
	static data: any = {
		datasets: [
			{
				borderColor: 'rgba(192,75,75,1)',
				backgroundColor: 'rgba(250,75,75,0.4)',
				label: "感染者数",
				data: []
			}
			// {
			// 	label: "deaths",
			// 	data: this.ChartData.deaths
			// }
		],
		labels: []
	};
	static tickId: number | null = null;
	constructor() {

	}
	static resetGraff() {
		this.ChartData.cases = [];
		this.data.labels = [...Array(this.ChartData.cases.length).keys()].map(o => String(o));
		if (this.humanChart != null) {
			this.humanChart.update();
		}
	}
	static stop() {
		if (Main.tickId !== null) {
			cancelAnimationFrame(Main.tickId);
		}

	}

	static tick() {
		Main.tickId = requestAnimationFrame(Main.tick);
		Main.draw();
	}
	static draw() {
		this.drawCount++;
		if (this.drawCount % 100 == 1) {
			this.ChartData.setHuman(Main.city.HumanList);
			//チャート
			const canvas = <HTMLCanvasElement>document.getElementById("humanChart");
			this.data.datasets[0].data = this.ChartData.cases;
			this.data.labels = [...Array(this.ChartData.cases.length).keys()].map(o => String(o));
			// this.data = {
			// 	datasets: [
			// 		{
			// 			label: "cases",
			// 			data: this.ChartData.cases
			// 		},
			// 		// {
			// 		// 	label: "deaths",
			// 		// 	data: this.ChartData.deaths
			// 		// }
			// 	],
			// 	labels: [...Array(this.ChartData.cases.length).keys()].map(o => String(o))
			// }
			if (canvas) {
				if (this.humanChart == null) {
					this.humanChart = new Chart(canvas, {
						type: 'line',
						data: this.data,
						options: {
							scales: {
								yAxes: [
									{
										ticks: {
											beginAtZero: true,
											min: 0,
											max: window.HUMAN_SIZE
										}
									}
								]
							}
						}
					});
				} else {
					this.humanChart.update();
				}
			}

		}
		if (Main.canvasContext == null) {
			return;
		}
		// 画面をリセット
		Main.canvasContext.clearRect(0, 0, Main.stageW, Main.stageH);
		Main.canvasContext.lineWidth = 10;

		Main.canvasContext.strokeStyle = `#fff`;
		this.fieldWidth = Math.min(Main.stageW, Main.stageH);
		this.widthCoeff = this.fieldWidth / window.CITY_SIZE;
		const segmentNum = 30;　// 分割数
		const amplitude = Main.stageH / 3; // 振幅
		const time = Date.now() / 1000; // 媒介変数(時間)
		this.city.getHumanPos().forEach((human) => {
			if (Main.canvasContext == null) {
				return;
			}
			Main.canvasContext.beginPath();
			Main.canvasContext.lineWidth = 0;
			Main.canvasContext.fillStyle = human.color;
			// Main.canvasContext.lineWidth = human.size * Main.canvasController.zoom;
			const xy = human.position[0];
			let [x, y] = [Math.floor(xy[0] * Main.widthCoeff + Main.canvasController.x), Math.floor(xy[1] * Main.widthCoeff + Main.canvasController.y)];
			x = (Main.fieldWidth / 2) + ((x - (Main.fieldWidth / 2)) * Main.canvasController.zoom);
			y = (Main.fieldWidth / 2) + ((y - (Main.fieldWidth / 2)) * Main.canvasController.zoom);
			Main.canvasContext.arc(x, y, human.size * Main.canvasController.zoom, 0, 360);
			Main.canvasContext.fill();
			Main.canvasContext.lineWidth = 0;
			// human.position.forEach((xy, i) => {
			// 	let [x, y] = [Math.floor(xy[0] * Main.widthCoeff + Main.canvasController.x), Math.floor(xy[1] * Main.widthCoeff + Main.canvasController.y)];
			// 	x = (Main.fieldWidth / 2) + ((x - (Main.fieldWidth / 2)) * Main.canvasController.zoom);
			// 	y = (Main.fieldWidth / 2) + ((y - (Main.fieldWidth / 2)) * Main.canvasController.zoom);
			// 	// 線を描く
			// 	if (Main.canvasContext == null) {
			// 		return;
			// 	}
			// 	if (i === 0) {
			// 		Main.canvasContext.moveTo(x, y);
			// 	} else {
			// 		Main.canvasContext.lineTo(x, y);
			// 	}
			// });
			// Main.canvasContext.stroke();
		});
		for (const coldBlockIndex of this.city.coldBlockSet.values()) {
			let [[x1, y1], [x2, y2]] = this.city.blockList[coldBlockIndex];
			[x1, y1] = [Math.floor(x1 * Main.widthCoeff + Main.canvasController.x), Math.floor(y1 * Main.widthCoeff + Main.canvasController.y)];
			[x2, y2] = [Math.floor(x2 * Main.widthCoeff + Main.canvasController.x), Math.floor(y2 * Main.widthCoeff + Main.canvasController.y)];

			Main.canvasContext.beginPath();
			Main.canvasContext.rect(x1 * Main.canvasController.zoom, y1 * Main.canvasController.zoom, (x2 - x1) * Main.canvasController.zoom, (y2 - y1) * Main.canvasController.zoom);
			Main.canvasContext.fillStyle = "rgba(255,255,255,0.5)";
			Main.canvasContext.fill();
		}
	}
	/****
	 * Main
	 */
	static main() {
		const humanList: Array<Human> = [];
		this.city = new City(window.CITY_SIZE, humanList,window.CITY_BLOCK_SIZE);
		for (let i = 0; i < window.HUMAN_SIZE; i++) {
			const human = new Human(window.CITY_SIZE, this.city, [Math.floor(Math.random() * window.CITY_SIZE), Math.floor(Math.random() * window.CITY_SIZE)]);
			human.speed = Math.max(window.HUMAN_SPEED + (Math.random() * window.RANDOM_COEFF - window.RANDOM_COEFF/2), 0);
			humanList.push(human);
		}
		const human = new Human(window.CITY_SIZE, this.city, [window.CITY_SIZE / 2, window.CITY_SIZE / 2]);
		human.Infect();
		human.speed = window.HUMAN_SPEED;
		humanList.push(human);
		// this.city = new City(CITY_SIZE, humanList);
		const js_city = document.getElementById('js-city');
		if (js_city) {
			Main.stageW = js_city.clientWidth * devicePixelRatio;
			Main.stageH = js_city.clientHeight * devicePixelRatio;
		}
		// canvas要素の参照を取得
		this.canvas = <HTMLCanvasElement>document.getElementById('js-city');
		// 2Dの描画命令群を取得
		if (Main.canvas) {
			this.canvasContext = Main.canvas.getContext('2d');
			Main.resize();

			Main.tick();
			window.addEventListener('resize', Main.resize);
		}

	}
	static resize() {
		Main.stageW = Main.canvas.clientWidth * devicePixelRatio;
		Main.stageH = Main.canvas.clientHeight * devicePixelRatio;

		Main.canvas.width = Main.stageW;
		Main.canvas.height = Main.stageH;
	}

}

window.onload = () => {
	const elementCitySize: HTMLInputElement = <HTMLInputElement>document.getElementById("CITY_SIZE");
	elementCitySize.value = window.CITY_SIZE;//√セル数
	const elementHumanSize: HTMLInputElement = <HTMLInputElement>document.getElementById("HUMAN_SIZE");
	elementHumanSize.value = window.HUMAN_SIZE;//人の数
	const elementHumanSpeed: HTMLInputElement = <HTMLInputElement>document.getElementById("HUMAN_SPEED");
	elementHumanSpeed.value = window.HUMAN_SPEED;
	const elementHumanSpeedRandomCoeff: HTMLInputElement = <HTMLInputElement>document.getElementById("RANDOM_COEFF");
	elementHumanSpeedRandomCoeff.value = window.RANDOM_COEFF;//乱数定数;
	const elementCityBlockSize: HTMLInputElement = <HTMLInputElement>document.getElementById("CITY_BLOCK_SIZE");
	elementCityBlockSize.value = window.CITY_BLOCK_SIZE;
	Main.main();
}
window.start = () => {
	Main.stop();
	const elementCitySize: HTMLInputElement = <HTMLInputElement>document.getElementById("CITY_SIZE");
	window.CITY_SIZE = Number(elementCitySize.value);//√セル数
	const elementHumanSize: HTMLInputElement = <HTMLInputElement>document.getElementById("HUMAN_SIZE");
	window.HUMAN_SIZE = Number(elementHumanSize.value);//人の数
	const elementHumanSpeed: HTMLInputElement = <HTMLInputElement>document.getElementById("HUMAN_SPEED");
	window.HUMAN_SPEED = Number(elementHumanSpeed.value);
	const elementHumanSpeedRandomCoeff: HTMLInputElement = <HTMLInputElement>document.getElementById("RANDOM_COEFF");
	window.RANDOM_COEFF = Number(elementHumanSpeedRandomCoeff.value);//乱数定数;
	const elementCityBlockSize: HTMLInputElement = <HTMLInputElement>document.getElementById("CITY_BLOCK_SIZE");
	window.CITY_BLOCK_SIZE = Number(elementCityBlockSize.value);
	Main.main();
}
window.reset = () => {
	Main.resetGraff();
}
declare var window: any;
window.canvasClick = (e: MouseEvent) => {
	console.log("click");
}
window.canvasMousedown = (e: MouseEvent) => {
	Main.canvasController.mousedown(e);
}
window.canvasMouseleave = (e: MouseEvent) => {
	Main.canvasController.mouseup(e);
}
window.canvasMouseup = (e: MouseEvent) => {
	Main.canvasController.mouseup(e);
}
window.canvasMousemove = (e: MouseEvent) => {

	Main.canvasController.mousemove(e);
}



