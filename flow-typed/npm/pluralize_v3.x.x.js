// flow-typed signature: b82b864b59a733240246cae3a98a27ad
// flow-typed version: 4a8895fe34/pluralize_v3.x.x/flow_>=v0.13.x

declare module 'pluralize' {
  declare var exports: {
    (word: string, count?: number, inclusive?: boolean): string,

    addIrregularRule(single: string, plural: string): void,
    addPluralRule(rule: string | RegExp, replacemant: string): void,
    addSingularRule(rule: string | RegExp, replacemant: string): void,
    addUncountableRule(ord: string | RegExp): void,
    plural(word: string): string,
    singular(word: string): string,
  }
}
