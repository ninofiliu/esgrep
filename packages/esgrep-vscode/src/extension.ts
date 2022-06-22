import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("esgrep-vscode.helloWorld", () => {
      vscode.window.showInformationMessage("Hello World from esgrep-vscode!");
    })
  );
}

export function deactivate() {}
