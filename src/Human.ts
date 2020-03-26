import { City } from "./City";

export class Human {
	color = ["#fff", "#f00", "#00f"];
	positionStack: Array<[number, number]> = [];
	tailSize = 10;
	staightRunCoeff = 97;
	speed: number = 100;
	size: number = 10;
	dropletSize = 10;
	infectDate: number | null = null;
	isInfected: boolean = false;
	isDead: boolean = false;
	isBlock: boolean = false;
	constructor(protected citySize: number, protected city: City, protected firestPos?: [number, number]) {
		this.init();
	}
	init(): void {
		this.setPosition();
	};
	get Position() {
		return this.positionStack[this.positionStack.length - 1];
	}
	getColor(): string {
		if (this.isInfected) {
			return this.color[1];
		}
		return this.color[0];
	}
	getTailPosition() {
		return this.positionStack[0] || [50, 50];
	}
	getNowPosition() {
		return this.positionStack[this.positionStack.length - 1];
	}
	getSize() {
		return this.size;
	}
	Infect() {
		this.isInfected = true;
	}
	susumu(n: number): [number, number] {
		n = n % 4;
		switch (n) {
			case 0://上
				return [0, -1]
			case 1://右
				return [1, 0]
			case 2://した
				return [0, 1]
			case 3://左
				return [-1, 0]
		}
		return [0, 0];
	}
	getNByVec(vec: Array<number>): number {
		const stvec = String(vec);
		switch (stvec) {
			case "0,-1"://上
				return 0
			case "1,0"://右
				return 1
			case "0,1"://した
				return 2
			case "-1,0"://左
				return 3
		}
		return 0;
	}

	getNextPosition(prev: number): [number, number] {
		const a = Math.floor(Math.random() * 100) - this.staightRunCoeff;

		if (a <= 0) {
			const position = this.susumu(prev + 2);
			return position;
		} else {
			return this.susumu(prev + (Math.floor(Math.random() * 2) == 0 ? 3 : 1));
		}
	}
	setPosition() {
		const firstPos: [number, number] = this.firestPos == null ? [50, 50] : this.firestPos;//[Math.floor(Math.random()*this.citySize),Math.floor(Math.random()*this.citySize)];
		this.positionStack.push(firstPos);
		const tailSize = this.tailSize;
		for (let i = 0; i < tailSize; i++) {
			let nextPos: [number, number] | false;
			if (this.positionStack.length < 3) {
				nextPos = this.susumu(Math.floor(Math.random() * 4));
			} else {
				nextPos = this.getNextPosition(this.getNByVec([this.positionStack[this.positionStack.length - 2][0] - this.positionStack[this.positionStack.length - 1][0], this.positionStack[this.positionStack.length - 2][1] - this.positionStack[this.positionStack.length - 1][1]]));
			}
			if (nextPos) {
				this.positionStack.push([this.positionStack[this.positionStack.length - 1][0] + nextPos[0], this.positionStack[this.positionStack.length - 1][1] + nextPos[1]]);
			}
		}
	}
	citySide(n: number) {
		if (n < 0) {
			return -n;
		}
		if (n >= 100) {
			return n - 1;
		}
		return n;
	}
	isBlockArea(x: number, y: number) {
		const retAr = [false, false];
		const coldBlockSet = this.city.coldBlockSet;
		for (const coldBlockIndex of coldBlockSet.values()) {
			const [[x1, y1], [x2, y2]] = this.city.blockList[coldBlockIndex];
			if (x > x1 && x <= x2 && y > y1 && y <= y2) {
				retAr[0] = true;
				retAr[1] = true;
			}
		}
		return retAr;
	}
	getPosition() {
		if (this.isBlock) {
			//動かない
			return this.positionStack;
		}
		if (this.speed < Math.random() * 100) {
			//動かない
			return this.positionStack;
		}
		if (this.positionStack.length > this.tailSize) {
			this.positionStack.shift();
		}

		const next = this.getNextPosition(this.getNByVec([this.positionStack[this.positionStack.length - 2][0] - this.positionStack[this.positionStack.length - 1][0], this.positionStack[this.positionStack.length - 2][1] - this.positionStack[this.positionStack.length - 1][1]]));
		let [x, y] = [this.positionStack[this.positionStack.length - 1][0] + next[0], this.positionStack[this.positionStack.length - 1][1] + next[1]];
		const [isXBlockArea, isYBlockArea] = this.isBlockArea(x, y);
		// if (isXBlockArea && isYBlockArea) {
		// 	this.isBlock = true;
		// 	return this.positionStack;
		// }
		if (isXBlockArea && isYBlockArea) {
			x = this.positionStack[this.positionStack.length - 1][0] - next[0];
			y = this.positionStack[this.positionStack.length - 1][1] - next[1];
		} else {
			if (x < 0 || x > this.citySize) {
				x = this.positionStack[this.positionStack.length - 1][0] - next[0];
			}
			if (y < 0 || y > this.citySize) {
				y = this.positionStack[this.positionStack.length - 1][1] - next[1];
			}
		}

		this.positionStack.push([x, y]);
		return this.positionStack;
	}
}
