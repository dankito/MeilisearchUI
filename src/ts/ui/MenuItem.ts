export class MenuItem {

  constructor(
    readonly label: string,
    readonly onClick: () => void,
    readonly icon: string | undefined = undefined,
  ) { }

}