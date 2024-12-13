import main from "main";
import { App, TFile, TFolder } from "obsidian";
import { ModalEnterPassword } from "./modalEnterPassword";

export class FolderLock {
	app: App;
	plugin: main;

	constructor(app: App, plugin: main) {
		this.app = app;
		this.plugin = plugin;
	}

	openModal() {
		new ModalEnterPassword(
			this.app,
			this.plugin,
			true,
			() => {},
			() => {
				const activeLeaf = this.app.workspace.activeLeaf;
				if (activeLeaf) activeLeaf.detach();
			}
		).open();
	}

	async lock() {
		const settings = this.plugin.settings;

		this.app.workspace.on("file-open", (file: TFile) => {
			const condition =
				!!file &&
				file.path.startsWith(`${settings.folder}/`) &&
				settings.folder;

			if (condition && settings.isLocked) this.openModal();
		});
	}

	closeOnLocked() {
		const file = this.app.workspace.getActiveFile();
		const condition =
			!!file && file.path.startsWith(`${this.plugin.settings.folder}/`);
		this.plugin.settings.isLocked = true;
		if (condition) this.openModal();
	}
}
