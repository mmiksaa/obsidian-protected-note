import main from "main";
import { App } from "obsidian";
import { ModalEnterPassword } from "./modalEnterPassword";

export class AutoLock {
	app: App;
	plugin: main;
	userActive: boolean;
	idleTimeout: NodeJS.Timeout;
	isAlreadyOpen: boolean;
	minutes: string;

	constructor(app: App, plugin: main, minutes: string) {
		this.app = app;
		this.plugin = plugin;
		this.userActive = true;
		this.isAlreadyOpen = false;
		this.minutes = minutes;
	}

	async startTimer() {
		document.addEventListener(
			"mousemove",
			this.handleUserActivity.bind(this)
		);

		document.addEventListener(
			"keydown",
			this.handleUserActivity.bind(this)
		);

		this.handleUserActivity();
	}

	handleUserActivity() {
		clearTimeout(this.idleTimeout);

		if (!this.isAlreadyOpen && this.minutes !== "0") {
			this.idleTimeout = setTimeout(() => {
				new ModalEnterPassword(this.app, this.plugin, false, () => {
					this.isAlreadyOpen = false;
				}).open();

				this.isAlreadyOpen = true;
			}, Number(this.minutes) * 60000);
		}
	}
}
