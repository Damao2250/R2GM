declare module 'relationship.js' {
  interface RelationshipOptions {
    text: string
    [key: string]: unknown
  }

  export default function relationship(options: RelationshipOptions): string[]
}
