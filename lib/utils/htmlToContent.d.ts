import { ContentRoot } from '../types/content';
type Options = {
    parser?: (html: string) => Document;
};
/**
 * Convert HTML string into ContentRoot according to the provided schema.
 * - Top-level blocks: InlineContent | UnorderedListContent | OrderedListContent
 * - InlineContent.content = Array<TextContent | PhrasionaryContent>
 */
export declare function htmlToContent(html: string | undefined, opts?: Options): ContentRoot;
export {};
