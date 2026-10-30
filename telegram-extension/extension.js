
const vscode = require('vscode');
const path = require('path');

/**
 * Удаляет общий отступ у всех строк.
 * @param {string} text - Исходный код, который будем отправлять.
 * @returns {string} Код, возвращаемый функцией с убранными лишними пробелами.
 */
function dedent(text){
	let l = text.split('\n');
	let i = 0, cnt = Infinity;
	for (let j = 0; j < l.length; j++){
		i = 0;
		if (l[j].trim() === ""){
			continue;
		}
		while (l[j][i] === ' ' || l[j][i] === '\t'){
			i++;
		}
		if (cnt >= i){
			cnt = i;
		}
	}
	const result = [];
	for (let j = 0; j < l.length; j++){
		result.push(l[j].slice(cnt));
	}
	return result.join("\n");
}

/**
 * Отправляет код из редактора в телеграм.
 * Параметров никаких для запуска, однако для отправки нужно выделить в vscode какой-либо фрагмент кода.
 * Сам алгоритм:
 * 
 * 0. Проверяем, что пользователь что-то выделил.
 * 1. Копируем выделенный пользователем текст кода c помощью библиотеки vscode.
 * 2. Заменяем \r\n на \n и убираем лишний отступ.
 * 3. С помощью библиотеки vscode получаем язык файла и его имя.
 * 4. Собираем сообщение с форматированием.
 * 5. Собираем адрес telegram.
 * 6. Открываем telegram, в котором вставлено наше сообщение.
 * @returns {void}
 */
function SendCode(){
	const editor = vscode.window.activeTextEditor;
	if (editor == undefined){
		vscode.window.showErrorMessage("Nothing is opened");
		return;
	}
	if (editor.selection.isEmpty || editor.document.getText(editor.selection).trim() === ""){
		vscode.window.showErrorMessage("Nothing is selected");
		return;
	}
	let text = dedent(editor.document.getText(editor.selection).replace(/\r\n/g, "\n"));
	const lang = editor.document.languageId; 
	const FileName = path.basename(editor.document.fileName);
	const message = `${FileName}\n` + "```" + lang + '\n' + text + "\n```" 
	const encoded_text = encodeURIComponent(message);
	const link = `tg://msg_url?url=${encodeURIComponent(" ")}&text=${encoded_text}`;
	vscode.env.openExternal(/** @type {any} */ (link));
	
}
/**
 * 	Активируем расширение при запуске.
 * 	Запускаем само расширение и сообщаем об этом.
 * 	Запускаем команду.
 * 
 * @param {vscode.ExtensionContext} context - объект библиотеки vscode, контекст расширения, который VS Code передаёт при активации,
 * в context.subscriptions кладём команду, чтобы она удалилась при выгрузке расширения.
 * @returns {void}
 */
function activate(context) {
	console.log('your extension "telegram-extension" is now active');
	const disposable = vscode.commands.registerCommand('telegram-extension.SendCode', function () {
		SendCode();
	});
	context.subscriptions.push(disposable);
}

/**
 * Вызывается VS Code при выгрузке расширения.
 * Освобождать вручную нечего: команда освобождается через `context.subscriptions`.
 *
 * @returns {void}
 */
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
