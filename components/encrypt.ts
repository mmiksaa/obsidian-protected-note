import main from "main";
import { App, TFile, TFolder } from "obsidian";
import * as CryptoJS from "crypto-js";
import { GetMDFiles } from "./getMDFiles";
import { ENC_MARKER } from "./constants";

export class Encrypt {
	app: App;
	plugin: main;

	constructor(app: App, plugin: main) {
		this.app = app;
		this.plugin = plugin;
	}

	async encryptFilesInDirectory(
		onProgress?: (done: number, total: number) => void
	) {
		const files = new GetMDFiles(this.app, this.plugin).getFiles();
		if (!files) return;

		const total = files.length;
		let done = 0;

		for (const file of files) {
			const content = await this.app.vault.read(file);

			if (content.length > 0 && !content.startsWith(ENC_MARKER)) {
				const encryptedContent = this.encryptContent(content);
				await this.app.vault.modify(file, encryptedContent);
			}

			done++;
			if (onProgress) onProgress(done, total);
		}

		// Устанавливаем флаг и сохраняем настройки
		this.plugin.settings.fileEncrypt.isAlreadyEncrypted = true;
		await this.plugin.saveSettings();
	}

	private encryptContent(content: string): string {
		const key = this.plugin.settings.password;

		const encrypted = CryptoJS.AES.encrypt(content, key).toString();
		return ENC_MARKER + encrypted;
	}
}
