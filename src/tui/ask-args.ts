import blessed from "blessed";

export function askArgs(
  screen: blessed.Widgets.Screen,
  script: string,
  argNames: string[],
): Promise<string[]> {
  return new Promise((resolve) => {
    if (argNames.length === 0) {
      return resolve([]);
    }

    const form = blessed.form({
      parent: screen,
      border: "line",
      width: "70%",
      height: argNames.length + 4,
      top: "center",
      left: "center",
      keys: true,
      vi: false,
      label: ` Args for ${script} `,
    });

    const inputs: blessed.Widgets.TextboxElement[] = [];

    argNames.forEach((arg, i) => {
      blessed.text({
        parent: form,
        top: i,
        left: 1,
        content: arg + ":",
      });

      const input = blessed.textbox({
        parent: form,
        name: arg,
        top: i,
        left: arg.length + 3,
        height: 1,
        inputOnFocus: true,
        keys: true,
        vi: true,
        style: { bg: "black", fg: "white" },
      });

      input.key("enter", () => {
        form.submit();
      });

      input.key("escape", () => {
        form.cancel();
      });

      inputs.push(input);
    });

    form.focusNext();

    form.on("submit", () => {
      const values: string[] = inputs.map((input) => input.getValue());

      form.destroy();
      screen.render();
      resolve(values);
    });

    form.on("cancel", () => {
      form.destroy();
      screen.render();
      resolve([]);
    });

    screen.render();
  });
}
