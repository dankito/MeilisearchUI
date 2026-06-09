import type { Snippet } from "svelte"

export class MenuItem {

  constructor(
    readonly label: string,
    readonly onClick: () => void,
    readonly icon: Snippet | undefined = undefined,
  ) { }

}