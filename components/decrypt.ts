import main from "main";
import { App, Notice, TFile } from "obsidian";
import * as CryptoJS from "crypto-js";
import { GetMDFiles } from "./getMDFiles";
import { ENC_MARKER } from "./constants";

export class Decrypt {
	app: App;
	plugin: main;
	counter: number;

	constructor(app: App, plugin: main) {
		this.app = app;
		this.plugin = plugin;
		this.counter = 0;
	}

	async decryptFilesInDirectory(
		onProgress?: (done: number, total: number) => void
	) {
		const files = new GetMDFiles(this.app, this.plugin).getFiles();
		if (!files) return;

		const failed: string[] = [];
		const total = files.length;
		let done = 0;

		for (const file of files) {
			const content = await this.app.vault.read(file);

			if (content.startsWith(ENC_MARKER)) {
				const decryptedContent = this.decryptContent(content);

				if (decryptedContent.length > 0) {
					await this.app.vault.modify(file, decryptedContent);
				} else {
					failed.push(file.path);
				}
			}

			done++;
			if (onProgress) onProgress(done, total);
		}

		this.plugin.settings.fileEncrypt.isAlreadyEncrypted = false;
		await this.plugin.saveSettings();

		if (failed.length > 0) {
			new Notice(
				`⚠ Failed to decrypt ${failed.length} file(s):\n${failed.join(
					"\n"
				)}`
			);
		}
	}

	private decryptContent(content: string): string {
		const key = this.plugin.settings.password;
		const raw = content.slice(ENC_MARKER.length);

		try {
			return CryptoJS.AES.decrypt(raw, key).toString(CryptoJS.enc.Utf8);
		} catch (e) {
			return "";
		}
	}
}
