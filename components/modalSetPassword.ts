import { App, Modal, Notice, Setting } from "obsidian";
import main from "../main";
import { hash } from "./hash";

export class ModalSetPassword extends Modal {
	plugin: main;
	value: string;
	value_pass: string;
	value_repass: string;
	onSubmit?: () => void;

	constructor(app: App, plugin: main, onSubmit?: () => void) {
		super(app);
		this.plugin = plugin;
		this.value_pass = "";
		this.value_repass = "";
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { modalEl, contentEl } = this; //take modal and modal_content (as HTML elements)

		modalEl.classList.add("password_modal");

		contentEl.createEl("h1", { text: "Create the Password" });

		const div_input = contentEl.createDiv({ cls: "password_modal__box" });
		// div_input.classList.add("");

		//create the inputs and put it inside the div
		const input_pass = div_input.createEl("input", {
			type: "password",
			value: "",
			placeholder: "Enter your local password",
		});

		//give them events
		input_pass.addEventListener("input", (event: MouseEvent) => {
			const text = event.target as HTMLInputElement;
			this.value_pass = text.value;
		});

		const input_repass = div_input.createEl("input", {
			type: "password",
			value: "",
			placeholder: "Re-enter your password",
		});

		input_repass.addEventListener("input", (event: MouseEvent) => {
			const text = event.target as HTMLInputElement;
			this.value_repass = text.value;
		});

		new Setting(this.contentEl)
			.setClass("password_modal__btns")
			.addButton((btn) => {
				btn.onClick(() => {
					this.close();
				}).setButtonText("Cancel");
			})
			.addButton((btn) =>
				btn
					.setButtonText("CREATE")
					.setCta()
					.onClick(() => {
						this.comparePassword();
					})
			);

		input_repass.addEventListener("keypress", (event) => {
			if (event.key === "Enter") {
				this.comparePassword();
			}
		});
	}

	async comparePassword() {
		if (
			this.value_pass === this.value_repass &&
			this.value_pass.length >= 1
		) {
			this.plugin.settings.password = hash(this.value_pass);
			await this.plugin.saveSettings();

			//set the flag to true if our requirements are met.
			this.plugin.toggleFlag = true;

			new Notice("you successfully created the password 🔑");
			this.close();
		} else {
			//set a message to desc if the inputs arnt the same
			const desc = document.querySelector(
				".password_modal__btns .setting-item-info .setting-item-name"
			);

			if (desc) {
				desc.textContent = "Passwords are diffrent";
				desc.classList.add("password_modal__warning");
			}
		}
	}

	onClose() {
		//callback function
		if (this.onSubmit) {
			this.onSubmit();
		}
	}
}
