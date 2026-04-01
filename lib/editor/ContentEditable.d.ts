import React from 'react';
import type { HTMLAttributes, SyntheticEvent } from 'react';
import { ContentRoot } from '../types/content';
/**
 * Based on https://github.com/lovasoa/react-contenteditable
 * A simple component for a html element with editable contents.
 */
export declare const ContentEditable: React.NamedExoticComponent<ContentEditableProps & React.RefAttributes<HTMLDivElement>>;
export type ContentEditableEvent = SyntheticEvent<any, Event> & {
    target: {
        name?: string;
        value: string;
        structured?: ContentRoot;
    };
};
export interface ContentEditableProps extends HTMLAttributes<HTMLElement> {
    disabled?: boolean;
    name?: string;
    onChange?: (event: ContentEditableEvent) => void;
    placeholder?: string;
    tagName?: string;
    value?: string;
}
