
import { Human } from './Human';
import { combination } from 'js-combinatorics';
export class City {
	droplet: Array<Array<any>>;
	coldSize: number = 6;
	infectionRate = 0.5;
	blockSize: number = 8;
	qCoeff:number = 0.08;
	blockList: Array<[[number, number], [number, number]]> = [];
	coldBlockSet: Set<number> = new Set();
	constructor(private citySize: number, private humanList: Array<Human>) {
		this.droplet = [...Array(citySize)].map(o => [...Array(citySize)].map(p => []));
		const blockLength = Math.floor(citySize / this.blockSize);
		for (let i = 0; i < this.blockSize; i++) {
			for (let j = 0; j < this.blockSize; j++) {
				this.blockList.push([[i * blockLength, j * blockLength], [(i + 1) * blockLength, (j + 1) * blockLength]]);
			}
		}
		// this.coldBlockSet.add(0);
	}
	isCold(x: number, y: number): boolean {
		const blockNumber = this.getBlockNumber(x, y);
		return this.coldBlockSet.has(blockNumber);
	}
	getBlockNumber(x: number, y: number) {
		for (let i = 0; i < this.blockList.length; i++) {
			const [[x1, y1], [x2, y2]] = this.blockList[i];
			if (x > x1 && x <= x2 && y > y1 && y <= y2) {
				return i;
			}
		}
		return -1;
	}
	resetShadow() {
		for (let i = 0; i < this.droplet.length; i++) {
			for (let j = 0; j < this.droplet[i].length; j++) {
				this.droplet[i][j] = [];
			}
		}
	}
	get HumanList() {
		return this.humanList;
	}
	getHumanPos(): Array<{ position: [number, number][], color: string, size: number }> {

		//感染
		for (let i = this.humanList.length - 1; i >= 0; i--) {
			const i_position = this.humanList[i].getNowPosition();
			//インデックスを落とす
			if (!i_position) {
				continue;
			}
			if (this.humanList[i].isBlock) {
				continue;
			}
			for (let j = 0; j < this.humanList[i].dropletSize; j++) {
				if (this.droplet[i_position[0] + j] && this.droplet[i_position[0] + j][i_position[1]]) {
					this.droplet[i_position[0] + j][i_position[1]].push(i);
				}
				if (this.droplet[i_position[0]] && this.droplet[i_position[0]][i_position[1] + j]) {
					this.droplet[i_position[0]][i_position[1] + j].push(i);
				}
				if (this.droplet[i_position[0] - j] && this.droplet[i_position[0] - j][i_position[1]]) {
					this.droplet[i_position[0] - j][i_position[1]].push(i);
				}
				if (this.droplet[i_position[0]] && this.droplet[i_position[0]][i_position[1] - j]) {
					this.droplet[i_position[0]][i_position[1] - j].push(i);
				}
			}

		}
		for (let i = 0; i < this.droplet.length; i++) {
			for (let j = 0; j < this.droplet[i].length; j++) {
				if (this.droplet[i][j].length > 1) {
					//影が被っている人同士を比較
					const _shadowList = this.droplet[i][j];
					if (_shadowList.length > 1) {
						const cmb = combination(_shadowList, 2);
						let c: any;
						while (c = cmb.next()) {
							const [humanA, humanB] = [this.humanList[c[0]], this.humanList[c[1]]];
							if (humanA && humanB && (humanA.isInfected || humanB.isInfected)) {
								if (this.infectionRate >= Math.random() * 100) {
									humanA.Infect();
									humanB.Infect();
								}
							} else {
								// console.log(this.humanList[c[0]])
							}
						}

					}
				}
			}
		}
		const blockMap: Map<number, number> = new Map();
		for (let i = this.humanList.length - 1; i >= 0; i--) {
			const [x, y] = this.humanList[i].Position;
			if (this.humanList[i].isInfected) {
				const blockNumber = this.getBlockNumber(x, y);
				if (blockNumber == -1) {
					continue;
				}
				//
				if (!blockMap.has(blockNumber)) {
					blockMap.set(blockNumber, 0);
				}
				let blockSize = blockMap.get(blockNumber) || 0;
				blockSize++;
				blockMap.set(blockNumber, blockSize);
				//
				// if (blockSize >= this.coldSize) {
				if (Math.random() * 100 <= this.qCoeff * (1 + blockSize * 0.2)) {
					this.coldBlockSet.add(blockNumber);
				}


				// }
			}

			if (this.isCold(x, y)) {
				this.humanList[i].isBlock = true;
			}
		}
		this.resetShadow();
		return this.humanList.map((o, i, ar) => {
			return {
				"position": o.getPosition(),
				"color": o.getColor(),
				"size": o.getSize()
			}
		})
	}
}
