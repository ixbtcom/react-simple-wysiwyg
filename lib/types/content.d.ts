export type TextContent = {
    type: 'text';
    value: string;
};
export type PhrasionaryContent = {
    type: 'phrasionary';
    id: string;
    value: string;
};
export type NgdeContent = {
    type: 'ngde';
    entityId: string;
    substanceId?: string;
};
export type InlineContent = {
    type: 'inline';
    content: Array<TextContent | PhrasionaryContent | NgdeContent>;
};
export type ListItem = {
    type: 'list-item';
    content: InlineContent;
    children?: Array<UnorderedListContent | OrderedListContent>;
};
export type UnorderedListContent = {
    type: 'unordered-list';
    items: ListItem[];
};
export type OrderedListContent = {
    type: 'ordered-list';
    items: ListItem[];
};
/**
 * A block of content, which can be text, lists, or inline content.
 * Avoid using TextContent directly; use InlineContent for content.
 */
export type ContentBlock = UnorderedListContent | OrderedListContent | InlineContent;
export type ContentRoot = {
    type: 'root';
    children: Array<ContentBlock>;
};
