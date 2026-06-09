export class HitFields {

  constructor(
    readonly titleKey: string | undefined = undefined,
    readonly title: string | undefined = undefined,
    readonly idKey: string | undefined = undefined,
    readonly id: string | undefined = undefined,

    readonly imageUrl: string | undefined = undefined,

    readonly rankingScore: number | undefined = undefined,

    readonly displayedFieldsKeys: string[] = [],
  ) { }

}