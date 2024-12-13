import main from "main";
import { App, TFile, TFolder } from "obsidian";

export class GetMDFiles {
	app: App;
	plugin: main;

	constructor(app: App, plugin: main) {
		this.app = app;
		this.plugin = plugin;
	}

	getFiles() {
		const path = this.plugin.settings.folder;
		let files: TFile[] = [];

		if (path && path !== "/") {
			const folder = this.app.vault.getAbstractFileByPath(path);

			if (folder instanceof TFolder) {
				files = this.getMDFilesInFolder(folder);
			} else {
				return;
			}
		} else {
			files = this.app.vault.getMarkdownFiles();
		}

		return files;
	}

	getMDFilesInFolder(folder: TFolder): TFile[] {
		const files: TFile[] = [];

		folder.children.forEach((child) => {
			if (child instanceof TFile && child.extension === "md") {
				files.push(child);
			} else if (child instanceof TFolder) {
				files.push(...this.getMDFilesInFolder(child));
			}
		});

		return files;
	}
}
