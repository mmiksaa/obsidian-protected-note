import { App, Modal, Setting } from "obsidian";
import main from "../main";

interface ConsentPoint {
	icon: string;
	title: string;
	desc: string;
}

const POINTS: ConsentPoint[] = [
	{
		icon: "💾",
		title: "Back up your vault first.",
		desc: "If anything goes wrong (interrupted encryption, a sync conflict, a damaged file), affected notes may be impossible to recover.",
	},
	{
		icon: "🔑",
		title: "Your password is the only key.",
		desc: "There is no recovery and no reset. If you forget it, every encrypted note is lost permanently.",
	},
	{
		icon: "📄",
		title: "Only .md notes are encrypted.",
		desc: "Attachments like images, PDFs, .canvas and other files stay readable and unprotected.",
	},
	{
		icon: "⚖️",
		title: "This is not official or audited encryption.",
		desc: "It's a community-made feature, not a professionally reviewed security product. By enabling it, you take full responsibility for your data.",
	},
];

export class ModalEncryptConsent extends Modal {
	plugin: main;
	onConfirm: () => void;
	onCancel: () => void;
	confirmed: boolean;

	constructor(
		app: App,
		plugin: main,
		onConfirm: () => void,
		onCancel: () => void,
	) {
		super(app);
		this.plugin = plugin;
		this.onConfirm = onConfirm;
		this.onCancel = onCancel;
		this.confirmed = false;
	}

	onOpen() {
		const { modalEl, contentEl } = this;
		modalEl.classList.add("encrypt_consent_modal");

		const title = contentEl.createEl("h1", {
			text: "🛆 Before you enable encryption",
		});

		contentEl.createEl("p", {
			text: "Please read and agree before turning on file encryption:",
			cls: "encrypt_consent__intro",
		});

		const list = contentEl.createDiv({ cls: "encrypt_consent__list" });
		POINTS.forEach((point) => {
			const item = list.createDiv({ cls: "encrypt_consent__item" });
			item.createSpan({
				text: point.icon,
				cls: "encrypt_consent__item-icon",
			});
			const body = item.createDiv({ cls: "encrypt_consent__item-body" });
			body.createEl("strong", { text: point.title });
			body.createEl("div", {
				text: point.desc,
				cls: "encrypt_consent__item-desc",
			});
		});

		contentEl.createEl("p", {
			text: "You use this feature at your own risk. The author is not liable for any data loss.",
			cls: "encrypt_consent__disclaimer",
		});

		new Setting(contentEl)
			.setClass("encrypt_consent__btns")
			.addButton((btn) =>
				btn.setButtonText("Cancel").onClick(() => this.close()),
			)
			.addButton((btn) =>
				btn
					.setButtonText("I understand, enable")
					.setWarning()
					.onClick(() => {
						this.confirmed = true;
						this.close();
					}),
			);
	}

	onClose() {
		this.contentEl.empty();
		if (this.confirmed) {
			this.onConfirm();
		} else {
			this.onCancel();
		}
	}
}
