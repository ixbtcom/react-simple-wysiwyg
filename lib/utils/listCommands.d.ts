/**
 * List manipulation commands for handling nested lists
 */
/**
 * Get the depth of a list item (0 = top level, 1 = first nested, 2 = second nested)
 */
export declare function getListItemDepth(listItem: HTMLLIElement): number;
/**
 * Find the list item containing the current selection
 */
export declare function getCurrentListItem(): HTMLLIElement | null;
/**
 * Check if the current list item can be indented
 */
export declare function canIndent(listItem: HTMLLIElement): boolean;
/**
 * Check if the current list item can be outdented
 */
export declare function canOutdent(listItem: HTMLLIElement): boolean;
/**
 * Indent a list item (nest it under the previous sibling)
 */
export declare function indentListItem(listItem: HTMLLIElement): boolean;
/**
 * Outdent a list item (move it up one level)
 */
export declare function outdentListItem(listItem: HTMLLIElement): boolean;
/**
 * Save and restore selection after DOM manipulation
 */
export declare function saveSelection(): {
    node: Node;
    offset: number;
} | null;
export declare function restoreSelection(saved: {
    node: Node;
    offset: number;
} | null): void;
/**
 * Execute an action with selection preservation
 * Useful for DOM manipulations that need to maintain cursor position
 */
export declare function withPreservedSelection(action: () => boolean, onSuccess: () => void): boolean;
