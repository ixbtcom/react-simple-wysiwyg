'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function autoconfigureTextDirection(el) {
    if (el) {
        var text = el.textContent;
        var rtlPattern = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
        el.style.direction = text && rtlPattern.test(text[0]) ? 'rtl' : 'ltr';
    }
}
function cls() {
    var classNames = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        classNames[_i] = arguments[_i];
    }
    return classNames.filter(Boolean).join(' ');
}
function getSelectedNode() {
    if (document.selection) {
        return document.selection.createRange().parentElement();
    }
    var selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        return selection.getRangeAt(0).startContainer.parentNode || undefined;
    }
    return undefined;
}
function normalizeHtml(str) {
    return typeof str === 'string'
        ? str.replace(/&nbsp;|\u202F|\u00A0/g, ' ').replace(/<br \/>/g, '<br>')
        : String(str);
}
function replaceCaret(el) {
    // Place the caret at the end of the element
    var target = document.createTextNode('');
    el.appendChild(target);
    // do not move caret if element was not focused
    var isTargetFocused = document.activeElement === el;
    if (target !== null && target.nodeValue !== null && isTargetFocused) {
        var sel = window.getSelection();
        if (sel !== null) {
            var range = document.createRange();
            range.setStart(target, target.nodeValue.length);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        if (el instanceof HTMLElement)
            el.focus();
    }
}
function setForwardRef(el, ref) {
    if (typeof ref === 'function') {
        ref(el);
    }
    else if (typeof ref === 'object' && ref) {
        // eslint-disable-next-line no-param-reassign
        ref.current = el;
    }
}

var PRESERVE_INLINE = new Set(['b', 'i', 'sub', 'sup']);
/**
 * Convert HTML string into ContentRoot according to the provided schema.
 * - Top-level blocks: InlineContent | UnorderedListContent | OrderedListContent
 * - InlineContent.content = Array<TextContent | PhrasionaryContent>
 */
function htmlToContent(html, opts) {
    var _a;
    if (opts === void 0) { opts = {}; }
    if (!html || typeof html !== 'string') {
        return { type: 'root', children: [] };
    }
    var parse = (_a = opts.parser) !== null && _a !== void 0 ? _a : (function (s) { return new DOMParser().parseFromString(s, 'text/html'); });
    var doc = parse(html);
    var rootBlocks = [];
    var inlineNodes = [];
    var flushInline = function () {
        if (inlineNodes.length > 0) {
            var inline = buildInlineFromNodes(inlineNodes);
            if (inline.content.length > 0) {
                rootBlocks.push(inline);
            }
            inlineNodes.length = 0;
        }
    };
    for (var _i = 0, _b = Array.from(doc.body.childNodes); _i < _b.length; _i++) {
        var node = _b[_i];
        if (isElement(node)) {
            var tag = node.tagName.toLowerCase();
            if (tag === 'ul') {
                flushInline();
                var list = buildList(node, false);
                if (list.items.length)
                    rootBlocks.push(list);
                continue;
            }
            if (tag === 'ol') {
                flushInline();
                var list = buildList(node, true);
                if (list.items.length)
                    rootBlocks.push(list);
                continue;
            }
            if (tag === 'div' || tag === 'p') {
                flushInline();
                // Process div/p children to extract lists and inline content
                var blocks = processContainerElement(node);
                rootBlocks.push.apply(rootBlocks, blocks);
                continue;
            }
            // Any other element at root -> collect for inline processing
            inlineNodes.push(node);
        }
        else {
            // Collect text nodes and other non-element nodes for inline processing
            inlineNodes.push(node);
        }
    }
    flushInline();
    return { type: 'root', children: rootBlocks };
}
/* -------------------- builders -------------------- */
/**
 * Process a container element (div/p) to extract lists and inline content
 * as separate blocks, preserving their structure.
 */
function processContainerElement(container) {
    var blocks = [];
    var inlineNodes = [];
    var flushInline = function () {
        if (inlineNodes.length > 0) {
            var inline = buildInlineFromNodes(inlineNodes);
            if (inline.content.length > 0) {
                blocks.push(inline);
            }
            inlineNodes.length = 0;
        }
    };
    for (var _i = 0, _a = Array.from(container.childNodes); _i < _a.length; _i++) {
        var child = _a[_i];
        if (isElement(child)) {
            var tag = child.tagName.toLowerCase();
            if (tag === 'ul') {
                flushInline();
                var list = buildList(child, false);
                if (list.items.length)
                    blocks.push(list);
                continue;
            }
            if (tag === 'ol') {
                flushInline();
                var list = buildList(child, true);
                if (list.items.length)
                    blocks.push(list);
                continue;
            }
        }
        // Collect inline content
        inlineNodes.push(child);
    }
    flushInline();
    return blocks;
}
function buildList(el, ordered) {
    var items = [];
    var liChildren = Array.from(el.children).filter(function (c) { return c.tagName.toLowerCase() === 'li'; });
    for (var _i = 0, liChildren_1 = liChildren; _i < liChildren_1.length; _i++) {
        var li = liChildren_1[_i];
        var _a = buildListItem(li), inline = _a.inline, nested = _a.nested;
        items.push(__assign({ type: 'list-item', content: inline }, (nested.length ? { children: nested } : {})));
    }
    return ordered
        ? { type: 'ordered-list', items: items }
        : { type: 'unordered-list', items: items };
}
/**
 * Build a single list item:
 * - content: InlineContent from all non-list children / text
 * - children: nested unordered/ordered lists directly under this <li>
 */
function buildListItem(li) {
    var inlineNodes = [];
    var nested = [];
    for (var _i = 0, _a = Array.from(li.childNodes); _i < _a.length; _i++) {
        var child = _a[_i];
        if (isElement(child)) {
            var tag = child.tagName.toLowerCase();
            if (tag === 'ul') {
                var sub = buildList(child, false);
                if (sub.items.length)
                    nested.push(sub);
                continue;
            }
            if (tag === 'ol') {
                var sub = buildList(child, true);
                if (sub.items.length)
                    nested.push(sub);
                continue;
            }
        }
        // Everything else contributes to inline text (including <br>, spans, b/i/sub/sup)
        inlineNodes.push(child);
    }
    var inline = buildInlineFromNodes(inlineNodes, { allowEmpty: true });
    return { inline: inline, nested: nested };
}
/**
 * Turn a sequence of nodes into a single InlineContent array,
 * mixing TextContent with PhrasionaryContent and NgdeContent. Consecutive text
 * fragments are merged into one TextContent to match tests.
 */
function buildInlineFromNodes(nodes, opts) {
    var _a;
    if (opts === void 0) { opts = {}; }
    var out = [];
    var textBuf = '';
    var flushText = function () {
        if (textBuf !== '') {
            // Do NOT trim—tests expect original whitespace/newlines preserved
            out.push({ type: 'text', value: textBuf });
            textBuf = '';
        }
    };
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node = nodes_1[_i];
        if (isText(node)) {
            textBuf += (_a = node.nodeValue) !== null && _a !== void 0 ? _a : '';
            continue;
        }
        if (!isElement(node))
            continue;
        var tag = node.tagName.toLowerCase();
        if (tag === 'br') {
            textBuf += '\n';
            continue;
        }
        // Phrasionary: <span data-content-type="phrasionary" data-content-id="...">...</span>
        if (tag === 'span' &&
            node.dataset &&
            node.dataset.contentType === 'phrasionary' &&
            node.dataset.contentId) {
            // close any pending text BEFORE inserting a structured token
            flushText();
            var id = node.dataset.contentId;
            // Preserve allowed inline formatting (b, i, sub, sup)
            var value = Array.from(node.childNodes)
                .map(serializeAllowedInline)
                .join('');
            out.push({ type: 'phrasionary', id: id, value: value });
            continue;
        }
        // NGDE (Dosage Entity): <span data-type="dosageEntity" data-dosage-entity-id="...">...</span>
        if (tag === 'span' &&
            node.dataset &&
            node.dataset.type === 'dosageEntity' &&
            node.dataset.dosageEntityId) {
            // close any pending text BEFORE inserting a structured token
            flushText();
            var entityId = node.dataset.dosageEntityId;
            var substanceId = node.dataset.substanceId;
            // Dosage entities are inline badges, no text value extracted
            out.push(__assign({ type: 'ngde', entityId: entityId }, (substanceId ? { substanceId: substanceId } : {})));
            continue;
        }
        // Check if this element contains phrasionary spans recursively
        var phrasionarySpans = findPhrasionarySpans(node);
        if (phrasionarySpans.length > 0) {
            // If we found phrasionary content, we need to carefully parse this element
            flushText();
            parseElementWithPhrasionary(node, out);
        }
        else {
            // For everything else inside an inline run, serialize to text with allowed tags preserved
            textBuf += serializeAllowedInline(node);
        }
    }
    flushText();
    if (!opts.allowEmpty && out.length === 0) {
        // collapse to empty to avoid creating empty top-level inline blocks
        return { type: 'inline', content: [] };
    }
    // Merge adjacent TextContent nodes (safety in case serializeAllowedInline returned empty nodes)
    var merged = [];
    for (var _b = 0, out_1 = out; _b < out_1.length; _b++) {
        var item = out_1[_b];
        var last = merged[merged.length - 1];
        if (item.type === 'text' && last && last.type === 'text') {
            last.value += item.value;
        }
        else {
            merged.push(item);
        }
    }
    return { type: 'inline', content: merged };
}
/**
 * Recursively find all phrasionary and NGDE spans within an element
 */
function findPhrasionarySpans(element) {
    var _a, _b, _c, _d;
    var spans = [];
    // Check if this element itself is a phrasionary span
    if (element.tagName.toLowerCase() === 'span' &&
        ((_a = element.dataset) === null || _a === void 0 ? void 0 : _a.contentType) === 'phrasionary' &&
        ((_b = element.dataset) === null || _b === void 0 ? void 0 : _b.contentId)) {
        spans.push(element);
        return spans;
    }
    // Check if this element itself is an NGDE (dosage entity) span
    if (element.tagName.toLowerCase() === 'span' &&
        ((_c = element.dataset) === null || _c === void 0 ? void 0 : _c.type) === 'dosageEntity' &&
        ((_d = element.dataset) === null || _d === void 0 ? void 0 : _d.dosageEntityId)) {
        spans.push(element);
        return spans;
    }
    // Recursively search children
    for (var _i = 0, _e = Array.from(element.children); _i < _e.length; _i++) {
        var child = _e[_i];
        spans.push.apply(spans, findPhrasionarySpans(child));
    }
    return spans;
}
/**
 * Parse an element that contains phrasionary or NGDE spans, carefully extracting
 * text content and phrasionary/NGDE content in order
 */
function parseElementWithPhrasionary(element, out) {
    var _a, _b, _c, _d, _e;
    var textBuf = '';
    var flushText = function () {
        if (textBuf !== '') {
            out.push({ type: 'text', value: textBuf });
            textBuf = '';
        }
    };
    // Walk through all child nodes
    for (var _i = 0, _f = Array.from(element.childNodes); _i < _f.length; _i++) {
        var node = _f[_i];
        if (isText(node)) {
            textBuf += (_a = node.nodeValue) !== null && _a !== void 0 ? _a : '';
            continue;
        }
        if (!isElement(node))
            continue;
        var tag = node.tagName.toLowerCase();
        if (tag === 'br') {
            textBuf += '\n';
            continue;
        }
        // Check if this is a phrasionary span
        if (tag === 'span' &&
            ((_b = node.dataset) === null || _b === void 0 ? void 0 : _b.contentType) === 'phrasionary' &&
            ((_c = node.dataset) === null || _c === void 0 ? void 0 : _c.contentId)) {
            // Flush any pending text
            flushText();
            var id = node.dataset.contentId;
            // Preserve allowed inline formatting (b, i, sub, sup)
            var value = Array.from(node.childNodes)
                .map(serializeAllowedInline)
                .join('');
            out.push({ type: 'phrasionary', id: id, value: value });
            continue;
        }
        // Check if this is an NGDE (dosage entity) span
        if (tag === 'span' &&
            ((_d = node.dataset) === null || _d === void 0 ? void 0 : _d.type) === 'dosageEntity' &&
            ((_e = node.dataset) === null || _e === void 0 ? void 0 : _e.dosageEntityId)) {
            // Flush any pending text
            flushText();
            var entityId = node.dataset.dosageEntityId;
            var substanceId = node.dataset.substanceId;
            // Dosage entities are inline badges, no text value extracted
            out.push(__assign({ type: 'ngde', entityId: entityId }, (substanceId ? { substanceId: substanceId } : {})));
            continue;
        }
        // Check if this element contains phrasionary or NGDE spans
        var phrasionarySpans = findPhrasionarySpans(node);
        if (phrasionarySpans.length > 0) {
            // Recursively parse this element
            parseElementWithPhrasionary(node, out);
        }
        else {
            // No phrasionary content, serialize normally
            textBuf += serializeAllowedInline(node);
        }
    }
    flushText();
}
/* -------------------- serialization helpers -------------------- */
/**
 * Serialize node to a string while preserving only the whitelisted inline tags
 * (<b>, <i>, <sub>, <sup>) and text content, including whitespace and entities.
 */
function serializeAllowedInline(node) {
    var _a;
    if (isText(node)) {
        return (_a = node.nodeValue) !== null && _a !== void 0 ? _a : '';
    }
    if (!isElement(node))
        return '';
    var tag = node.tagName.toLowerCase();
    // If this is a preserved inline tag, wrap its serialized children
    if (PRESERVE_INLINE.has(tag)) {
        var inner = Array.from(node.childNodes)
            .map(serializeAllowedInline)
            .join('');
        return "<".concat(tag, ">").concat(inner, "</").concat(tag, ">");
    }
    // For any other element, drop the tag but keep the serialized children
    return Array.from(node.childNodes).map(serializeAllowedInline).join('');
}
/* -------------------- tiny guards -------------------- */
function isText(n) {
    return n.nodeType === Node.TEXT_NODE;
}
function isElement(n) {
    return n.nodeType === Node.ELEMENT_NODE;
}

/**
 * List manipulation commands for handling nested lists
 */
/**
 * Get the depth of a list item (0 = top level, 1 = first nested, 2 = second nested)
 */
function getListItemDepth(listItem) {
    var depth = 0;
    var parent = listItem.parentElement;
    while (parent && depth < 3) {
        if (parent.tagName === 'UL' || parent.tagName === 'OL') {
            var grandParent = parent.parentElement;
            if (grandParent && grandParent.tagName === 'LI') {
                depth++;
                parent = grandParent.parentElement;
            }
            else {
                break;
            }
        }
        else {
            parent = parent.parentElement;
        }
    }
    return depth;
}
/**
 * Find the list item containing the current selection
 */
function getCurrentListItem() {
    var selection = window.getSelection();
    if (!selection || !selection.anchorNode)
        return null;
    var node = selection.anchorNode;
    // Walk up the DOM tree to find the LI element
    while (node) {
        if (node.nodeType === Node.ELEMENT_NODE &&
            node.tagName === 'LI') {
            return node;
        }
        node = node.parentNode;
    }
    return null;
}
/**
 * Check if the current list item can be indented
 */
function canIndent(listItem) {
    // Check if we're at max depth (2 levels of nesting)
    var depth = getListItemDepth(listItem);
    if (depth >= 1)
        return false;
    // Check if there's a previous sibling to nest under
    var prevSibling = listItem.previousElementSibling;
    return prevSibling !== null && prevSibling.tagName === 'LI';
}
/**
 * Check if the current list item can be outdented
 */
function canOutdent(listItem) {
    // Can only outdent if we're nested (depth > 0)
    return getListItemDepth(listItem) > 0;
}
/**
 * Indent a list item (nest it under the previous sibling)
 */
function indentListItem(listItem) {
    if (!canIndent(listItem))
        return false;
    var prevSibling = listItem.previousElementSibling;
    var parentList = listItem.parentElement;
    var listType = parentList.tagName;
    // Check if previous sibling already has a nested list
    var nestedList = prevSibling.querySelector(':scope > ul, :scope > ol');
    if (!nestedList) {
        // Create a new nested list
        nestedList = document.createElement(listType.toLowerCase());
        prevSibling.appendChild(nestedList);
    }
    var nextSibling = listItem.nextElementSibling;
    while (nextSibling && nextSibling.tagName === 'LI') {
        nextSibling = nextSibling.nextElementSibling;
    }
    // Move only the current item
    nestedList.appendChild(listItem);
    return true;
}
/**
 * Outdent a list item (move it up one level)
 */
function outdentListItem(listItem) {
    if (!canOutdent(listItem))
        return false;
    var parentList = listItem.parentElement;
    var grandParentLI = parentList.parentElement;
    var greatGrandParentList = grandParentLI.parentElement;
    // Move the item after its grand-parent LI
    greatGrandParentList.insertBefore(listItem, grandParentLI.nextSibling);
    // If the parent list is now empty, remove it
    if (parentList.children.length === 0) {
        parentList.remove();
    }
    return true;
}
/**
 * Save and restore selection after DOM manipulation
 */
function saveSelection() {
    var selection = window.getSelection();
    if (!selection || !selection.anchorNode)
        return null;
    return {
        node: selection.anchorNode,
        offset: selection.anchorOffset,
    };
}
function restoreSelection(saved) {
    if (!saved)
        return;
    var selection = window.getSelection();
    if (!selection)
        return;
    var range = document.createRange();
    try {
        range.setStart(saved.node, saved.offset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    catch (e) {
        // Node might have been removed or changed, ignore
    }
}
/**
 * Execute an action with selection preservation
 * Useful for DOM manipulations that need to maintain cursor position
 */
function withPreservedSelection(action, onSuccess) {
    var selection = saveSelection();
    if (action()) {
        onSuccess();
        setTimeout(function () { return restoreSelection(selection); }, 0);
        return true;
    }
    return false;
}

/**
 * Based on https://github.com/lovasoa/react-contenteditable
 * A simple component for a html element with editable contents.
 */
var ContentEditable = React.memo(React.forwardRef(function ContentEditable(_a, ref) {
    var 
    // Some properties are used here only as useMemo dependencies
    className = _a.className, disabled = _a.disabled, tagName = _a.tagName, _b = _a.value, value = _b === void 0 ? '' : _b, placeholder = _a.placeholder, rest = __rest(_a, ["className", "disabled", "tagName", "value", "placeholder"]);
    var elRef = React.useRef(null);
    var htmlRef = React.useRef(value);
    var restRef = React.useRef(rest);
    React.useEffect(function () {
        restRef.current = rest;
        var el = elRef.current;
        var normalizedValue = normalizeHtml(value);
        if (el && normalizeHtml(htmlRef.current) !== normalizedValue) {
            htmlRef.current = normalizedValue;
            el.innerHTML = normalizedValue;
            replaceCaret(el);
        }
    });
    return React.useMemo(function () {
        function onSetRef($el) {
            elRef.current = $el;
            autoconfigureTextDirection($el);
            setForwardRef($el, ref);
        }
        function onChange(event) {
            var _a, _b;
            var el = elRef.current;
            if (!el) {
                return;
            }
            var elementHtml = el.innerHTML;
            if (elementHtml !== htmlRef.current) {
                (_b = (_a = restRef.current).onChange) === null || _b === void 0 ? void 0 : _b.call(_a, __assign(__assign({}, event), { target: {
                        value: elementHtml,
                        name: rest.name,
                        structured: htmlToContent(elementHtml),
                    } }));
            }
            autoconfigureTextDirection(el);
            htmlRef.current = elementHtml;
        }
        function handleKeyDown(e) {
            var _a, _b;
            // Handle Tab/Shift+Tab for list indentation
            if (e.key === 'Tab') {
                var listItem_1 = getCurrentListItem();
                if (listItem_1) {
                    e.preventDefault();
                    withPreservedSelection(function () {
                        return e.shiftKey
                            ? outdentListItem(listItem_1)
                            : indentListItem(listItem_1);
                    }, function () { return onChange(e); });
                    return;
                }
            }
            // Handle Enter on empty list item
            if (e.key === 'Enter') {
                var listItem_2 = getCurrentListItem();
                if (listItem_2 && ((_a = listItem_2.textContent) === null || _a === void 0 ? void 0 : _a.trim()) === '') {
                    var parent_1 = listItem_2.parentElement;
                    if (parent_1 &&
                        (parent_1.tagName === 'UL' || parent_1.tagName === 'OL')) {
                        e.preventDefault();
                        // Check if this is a nested list
                        var grandParent = parent_1.parentElement;
                        var isNested = grandParent && grandParent.tagName === 'LI';
                        if (isNested) {
                            // For nested lists, outdent the empty item
                            if (withPreservedSelection(function () { return outdentListItem(listItem_2); }, function () {
                                onChange(e);
                                // Set cursor to the end of the outdented item
                                setTimeout(function () {
                                    var selection = window.getSelection();
                                    if (selection && listItem_2.parentNode) {
                                        var range = document.createRange();
                                        range.selectNodeContents(listItem_2);
                                        range.collapse(false);
                                        selection.removeAllRanges();
                                        selection.addRange(range);
                                    }
                                }, 0);
                            })) {
                                return;
                            }
                        }
                        else {
                            // For top-level lists, exit the list by creating a new line after it
                            var editorRoot = elRef.current; // your contentEditable host
                            var listEl = parent_1; // UL/OL
                            var maybeWrapper = listEl.parentElement;
                            var newDiv = document.createElement('div');
                            newDiv.innerHTML = '<br>';
                            var isWrapperBlock = !!maybeWrapper &&
                                (maybeWrapper.tagName === 'DIV' ||
                                    maybeWrapper.tagName === 'P') &&
                                maybeWrapper.parentElement === editorRoot;
                            if (isWrapperBlock) {
                                // <editorRoot> <div>[...<ul/ol>...]</div>  → insert after the wrapper
                                maybeWrapper.insertAdjacentElement('afterend', newDiv);
                            }
                            else if (editorRoot.contains(listEl)) {
                                // <editorRoot> <ul/ol>…  → insert after the list itself (sibling)
                                listEl.insertAdjacentElement('afterend', newDiv);
                            }
                            else {
                                // very defensive fallback: append to editor
                                editorRoot.appendChild(newDiv);
                            }
                            listItem_2.remove();
                            if (parent_1.children.length === 0) {
                                parent_1.remove();
                            }
                            // Place cursor in the new div
                            var range = document.createRange();
                            var selection = window.getSelection();
                            if (selection) {
                                range.selectNodeContents(newDiv);
                                range.collapse(false);
                                selection.removeAllRanges();
                                selection.addRange(range);
                            }
                            // Trigger onChange
                            onChange(e);
                            return;
                        }
                    }
                }
            }
            // Handle Backspace on empty list item for outdenting
            if (e.key === 'Backspace') {
                var listItem_3 = getCurrentListItem();
                var selection = window.getSelection();
                if (listItem_3 &&
                    (selection === null || selection === void 0 ? void 0 : selection.anchorOffset) === 0 &&
                    (selection === null || selection === void 0 ? void 0 : selection.focusOffset) === 0 &&
                    ((_b = listItem_3.textContent) === null || _b === void 0 ? void 0 : _b.trim()) !== '') {
                    if (withPreservedSelection(function () { return outdentListItem(listItem_3); }, function () {
                        e.preventDefault();
                        onChange(e);
                    })) {
                        return;
                    }
                }
            }
            // Call original handler or onChange
            (restRef.current.onKeyDown || onChange)(e);
        }
        var cssClass = cls('rsw-ce', className);
        return React.createElement(tagName || 'div', __assign(__assign({}, rest), { className: cssClass, contentEditable: !disabled, dangerouslySetInnerHTML: { __html: value }, onBlur: function (e) {
                return (restRef.current.onBlur || onChange)(e);
            }, onInput: onChange, onKeyDown: handleKeyDown, onKeyUp: function (e) {
                return (restRef.current.onKeyUp || onChange)(e);
            }, placeholder: placeholder, ref: onSetRef }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [className, disabled, placeholder, tagName]);
}));

var EditorContext = React.createContext(undefined);
function EditorProvider(_a) {
    var children = _a.children;
    var _b = React.useState({
        htmlMode: false,
        update: update,
    }), state = _b[0], setState = _b[1];
    function update(attrs) {
        setState(function (prevState) {
            return __assign(__assign({}, prevState), attrs);
        });
    }
    return (React.createElement(EditorContext.Provider, { value: state }, children));
}
function useEditorState() {
    var context = React.useContext(EditorContext);
    if (!context) {
        throw new Error('You should wrap your component by EditorProvider');
    }
    return context;
}

var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=true===r.prepend?"prepend":"append",d=true===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

var css = ".rsw-editor{border:1px solid #ddd;border-radius:.375rem;display:flex;flex-direction:column;min-height:100px;overflow:hidden}.rsw-ce{flex:1 1 auto;overflow:auto;padding:.5rem}.rsw-ce:focus{outline:1px solid #668}.rsw-ce sub,.rsw-ce sup{font-size:.75em;line-height:0}.rsw-ce[contentEditable=true]:empty:not(:focus):before{color:grey;content:attr(placeholder);pointer-events:none}.rsw-ce ol,.rsw-ce ul{margin:.5em 0;padding-left:2em}.rsw-ce>div>ol,.rsw-ce>div>ul,.rsw-ce>ol,.rsw-ce>ul{padding-left:2em}.rsw-ce li>ol,.rsw-ce li>ul{margin:.25em 0;padding-left:2em}.rsw-ce li{margin:.25em 0}.rsw-ce ul{list-style-type:disc}.rsw-ce ul ul{list-style-type:circle}.rsw-ce ul ul ul{list-style-type:square}.rsw-ce ol{list-style-type:decimal}.rsw-ce ol ol{list-style-type:lower-alpha}.rsw-ce ol ol ol{list-style-type:lower-roman}.rsw-ce .dosage-entity,.rsw-ce .phrasionary-entity{color:#2c5aa0;cursor:help;text-decoration:underline}.rsw-ce .dosage-entity{font-size:.8em;vertical-align:baseline}.rsw-html{background:transparent;border:none;font-family:monospace,Courier New}.rsw-separator{align-self:stretch;border-right:1px solid #ddd;display:flex;margin:0 3px}.rsw-dd{box-sizing:border-box;outline:none}.rsw-btn{background:transparent;border:0;color:#222;cursor:pointer;font-size:1em;height:2em;outline:none;padding:0;width:2em}.rsw-btn:hover{background:#eaeaea}.rsw-btn[data-active=true]{background:#e0e0e0}.rsw-toolbar{align-items:center;background-color:#f5f5f5;border-bottom:1px solid #ddd;display:flex}.rsw-click-disabler{background:rgba(0,0,0,.3);inset:0;position:fixed;z-index:999}.rsw-modal{background:#fff;border:1px solid #ccc;border-radius:8px;left:50%;max-width:min(80vw,400px);padding:20px;position:fixed;top:50%;transform:translate(-50%,-50%);z-index:1000;header{display:flex;justify-content:space-between;margin-bottom:15px;h3{color:#2c5aa0;margin:0}}main{display:grid;gap:5px;grid-template-columns:repeat(auto-fit,minmax(28px,1fr));max-width:80dvw}}";
n(css,{});

var Editor = React.forwardRef(function Editor(_a, ref) {
    var autoFocus = _a.autoFocus, children = _a.children, containerProps = _a.containerProps, onSelect = _a.onSelect, rest = __rest(_a, ["autoFocus", "children", "containerProps", "onSelect"]);
    var editorState = useEditorState();
    React.useEffect(function () {
        document.addEventListener('click', onClickOutside);
        return function () { return document.removeEventListener('click', onClickOutside); };
    });
    function onClickOutside(event) {
        var _a;
        if (event.target === editorState.$el) {
            return;
        }
        if ((_a = editorState.$el) === null || _a === void 0 ? void 0 : _a.contains(event.target)) {
            return;
        }
        editorState.update({ $selection: undefined });
    }
    function onTextSelect(event) {
        onSelect === null || onSelect === void 0 ? void 0 : onSelect(event);
        editorState.update({ $selection: getSelectedNode() });
    }
    function setContentEditableRef($el) {
        editorState.update({ $el: $el });
        setForwardRef($el, ref);
        if (autoFocus && $el && editorState.$el === undefined) {
            $el.focus();
        }
    }
    var cssClass = cls('rsw-editor', containerProps === null || containerProps === void 0 ? void 0 : containerProps.className);
    if (editorState.htmlMode) {
        return (React.createElement("div", __assign({}, containerProps, { className: cssClass }),
            children,
            React.createElement("textarea", __assign({}, rest, { className: "rsw-ce rsw-html" }))));
    }
    return (React.createElement("div", __assign({}, containerProps, { className: cssClass }),
        children,
        React.createElement(ContentEditable, __assign({}, rest, { ref: setContentEditableRef, onSelect: onTextSelect }))));
});

function OrderedListIcon() {
    return (React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", style: { verticalAlign: 'text-top' } },
        React.createElement("path", { fill: "currentColor", d: "M6.99938 12.998v-2H20.9994v2H6.99938zm0 6.0001v-2H20.9994v2H6.99938zm0-12.00001v-2H20.9994v2H6.99938zm-4 1v-3h-1v-1h2v4h-1zm-1 9.00001v-1h3v4h-3v-1h2v-.5h-1v-1h1v-.5h-2zM4.25 10c.41421 0 .75.3358.75.75 0 .2024-.08017.3861-.2105.521L3.11983 13H5v1H2v-.9218L4 11H2v-1h2.25z" })));
}

function UnorderedListIcon() {
    return (React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", style: { verticalAlign: 'text-top' } },
        React.createElement("path", { fill: "currentColor", d: "M7 5h14v2H7V5zm0 8v-2h14v2H7zM4 4.50001c.83 0 1.5.66992 1.5 1.5 0 .83007-.67 1.5-1.5 1.5s-1.5-.66993-1.5-1.5c0-.83008.67-1.5 1.5-1.5zM4 10.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM7 19v-2h14v2H7zm-3-2.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z" })));
}

var PHRASE_SEL = '[data-content-type="phrasionary"]';
var NGDE_SEL = '[data-type="dosageEntity"]';
function asElement(n) {
    var _a;
    return n instanceof Element ? n : ((_a = n === null || n === void 0 ? void 0 : n.parentElement) !== null && _a !== void 0 ? _a : null);
}
function unwrap(el) {
    var parent = el.parentNode;
    while (el.firstChild)
        parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
}
function rangeIntersectsNode(range, el) {
    var r = document.createRange();
    r.selectNodeContents(el);
    return !(r.compareBoundaryPoints(Range.END_TO_START, range) <= 0 ||
        r.compareBoundaryPoints(Range.START_TO_END, range) >= 0);
}
function phrasionarySpansInRange(root, range) {
    var out = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
        acceptNode: function (node) {
            var _a, _b;
            if (!((_b = (_a = node).matches) === null || _b === void 0 ? void 0 : _b.call(_a, PHRASE_SEL)))
                return NodeFilter.FILTER_SKIP;
            return rangeIntersectsNode(range, node)
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_REJECT;
        },
    });
    var n;
    while ((n = walker.nextNode()))
        out.push(n);
    return out;
}
function ngdeSpansInRange(root, range) {
    var out = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
        acceptNode: function (node) {
            var _a, _b;
            if (!((_b = (_a = node).matches) === null || _b === void 0 ? void 0 : _b.call(_a, NGDE_SEL)))
                return NodeFilter.FILTER_SKIP;
            return rangeIntersectsNode(range, node)
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_REJECT;
        },
    });
    var n;
    while ((n = walker.nextNode()))
        out.push(n);
    return out;
}
function createButton(title, content, command, isActive) {
    Button.displayName = title.replace(/\s/g, '');
    return Button;
    function Button(props) {
        var editorState = useEditorState();
        var $el = editorState.$el;
        var isElFocused = function () { return Boolean($el === null || $el === void 0 ? void 0 : $el.contains(document.activeElement)); };
        // force re-render on selection changes so active state stays fresh
        var _a = React.useState(0), bump = _a[1];
        React.useEffect(function () {
            var onSel = function () { return bump(function (n) { return n + 1; }); };
            document.addEventListener('selectionchange', onSel);
            return function () { return document.removeEventListener('selectionchange', onSel); };
        }, []);
        var active = false;
        if (typeof command === 'string') {
            active = isElFocused() && document.queryCommandState(command);
        }
        else if (isActive) {
            active = isElFocused() && isActive(editorState);
        }
        function onAction(e) {
            e.preventDefault();
            if (!isElFocused())
                $el === null || $el === void 0 ? void 0 : $el.focus();
            if (typeof command === 'function')
                command(editorState);
            else
                document.execCommand(command);
        }
        if (editorState.htmlMode)
            return null;
        return (React.createElement("button", __assign({ className: "rsw-btn", "data-active": active, onMouseDown: onAction, tabIndex: -1, title: title, type: "button" }, props), content));
    }
}
var BtnBold = createButton('Bold', '𝐁', 'bold');
var BtnItalic = createButton('Italic', '𝑰', 'italic');
var BtnUnderline = createButton('Underline', React.createElement("span", { style: { textDecoration: 'underline' } }, "\uD835\uDC14"), 'underline');
var BtnStrikeThrough = createButton('Strike through', React.createElement("s", null, "ab"), 'strikeThrough');
var BtnNumberedList = createButton('Numbered list', React.createElement(OrderedListIcon, null), 'insertOrderedList');
var BtnBulletList = createButton('Bullet list', React.createElement(UnorderedListIcon, null), 'insertUnorderedList');
var BtnUndo = createButton('Undo', '↶', 'undo');
var BtnRedo = createButton('Redo', '↷', 'redo');
var BtnClearFormatting = createButton('Clear formatting', 'T̲ₓ', 'removeFormat');
var BtnSuperscript = createButton('Superscript', React.createElement("span", null,
    "a",
    React.createElement("sup", null, "\uD835\uDC99")), 'superscript');
var BtnSubscript = createButton('Subscript', React.createElement("span", null,
    "a",
    React.createElement("sub", null, "\uD835\uDC99")), 'subscript');
var BtnLink = createButton('Link', '🔗', function (_a) {
    var $selection = _a.$selection;
    if (($selection === null || $selection === void 0 ? void 0 : $selection.nodeName) === 'A')
        document.execCommand('unlink');
    else
        document.execCommand('createLink', false, prompt('URL', '') || undefined);
}, 
// active when caret inside <a>
function (_a) {
    var _b;
    var $selection = _a.$selection;
    return !!((_b = asElement($selection)) === null || _b === void 0 ? void 0 : _b.closest('a'));
});
var BtnPhrasionary = createButton('Phrasionary', '📖', function (_a) {
    var _b;
    var $el = _a.$el, $selection = _a.$selection;
    if (!$el)
        return;
    // 1) caret inside an existing phrasionary → unwrap (toggle off)
    var selEl = asElement($selection);
    var host = selEl === null || selEl === void 0 ? void 0 : selEl.closest(PHRASE_SEL);
    if (host && $el.contains(host)) {
        unwrap(host);
        $el.focus();
        return;
    }
    var sel = document.getSelection();
    if (!sel || sel.rangeCount === 0)
        return;
    var range = sel.getRangeAt(0);
    // 2) if selection intersects any phrasionary spans → unwrap them
    var hits = phrasionarySpansInRange($el, range);
    if (hits.length) {
        hits.sort(function (a, b) { return (a.contains(b) ? 1 : b.contains(a) ? -1 : 0); });
        hits.forEach(unwrap);
        $el.focus();
        return;
    }
    // 3) if selection spans multiple blocks → do nothing
    if (!range.collapsed) {
        var ancestor = range.commonAncestorContainer;
        if (ancestor && ((_b = asElement(ancestor)) === null || _b === void 0 ? void 0 : _b.querySelector('li,p,div'))) {
            alert('Phrasionary entries cannot span multiple blocks.');
            return;
        }
    }
    // 4) single-block selection → inline wrap
    var text = range.toString();
    if (!text.trim())
        return alert('Please select some text first');
    var id = prompt('Phrasionary ID', '');
    if (!id)
        return;
    var span = document.createElement('span');
    span.setAttribute('data-content-type', 'phrasionary');
    span.setAttribute('data-content-id', id);
    span.setAttribute('class', 'phrasionary-entity');
    span.setAttribute('title', "Phrasionary: ".concat(id));
    span.textContent = text;
    range.deleteContents();
    range.insertNode(span);
    sel.removeAllRanges();
    $el.focus();
}, function (_a) {
    var _b;
    var $selection = _a.$selection;
    return !!((_b = asElement($selection)) === null || _b === void 0 ? void 0 : _b.closest(PHRASE_SEL));
});
var BtnNgde = createButton('Dosage', '💊', function (_a) {
    var $el = _a.$el, $selection = _a.$selection;
    if (!$el)
        return;
    // 1) caret inside an existing dosage entity → remove it
    var selEl = asElement($selection);
    var host = selEl === null || selEl === void 0 ? void 0 : selEl.closest(NGDE_SEL);
    if (host && $el.contains(host)) {
        host.remove();
        $el.focus();
        return;
    }
    var sel = document.getSelection();
    if (!sel || sel.rangeCount === 0)
        return;
    var range = sel.getRangeAt(0);
    // 2) if selection intersects any dosage entity spans → remove them
    var hits = ngdeSpansInRange($el, range);
    if (hits.length) {
        hits.sort(function (a, b) { return (a.contains(b) ? 1 : b.contains(a) ? -1 : 0); });
        hits.forEach(function (el) { return el.remove(); });
        $el.focus();
        return;
    }
    // 3) Insert dosage entity inline at caret position
    var entityId = prompt('Dosage Entity ID', '');
    if (!entityId)
        return;
    var substanceId = prompt('Substance ID (optional)', '');
    var span = document.createElement('span');
    span.setAttribute('data-type', 'dosageEntity');
    span.setAttribute('data-dosage-entity-id', entityId);
    span.setAttribute('contenteditable', 'false');
    span.setAttribute('class', 'dosage-entity');
    if (substanceId) {
        span.setAttribute('data-substance-id', substanceId);
        span.setAttribute('title', "Dosage Entity: ".concat(entityId, " (Substance: ").concat(substanceId, ")"));
    }
    else {
        span.setAttribute('title', "Dosage Entity: ".concat(entityId));
    }
    span.textContent = "\uD83D\uDC8A";
    range.deleteContents();
    range.insertNode(span);
    sel.removeAllRanges();
    $el.focus();
}, function (_a) {
    var _b;
    var $selection = _a.$selection;
    return !!((_b = asElement($selection)) === null || _b === void 0 ? void 0 : _b.closest(NGDE_SEL));
});

var BtnStyles = createDropdown('Styles', [
    ['Normal', 'formatBlock', 'DIV'],
    ['𝗛𝗲𝗮𝗱𝗲𝗿 𝟭', 'formatBlock', 'H1'],
    ['Header 2', 'formatBlock', 'H2'],
    ['𝙲𝚘𝚍𝚎', 'formatBlock', 'PRE'],
]);
function createDropdown(title, items) {
    DropdownFactory.displayName = title;
    return DropdownFactory;
    function DropdownFactory(props) {
        var editorState = useEditorState();
        var $el = editorState.$el, $selection = editorState.$selection, htmlMode = editorState.htmlMode;
        if (htmlMode) {
            return null;
        }
        var activeIndex = items.findIndex(function (item) { return item[1] === 'formatBlock' && ($selection === null || $selection === void 0 ? void 0 : $selection.nodeName) === item[2]; });
        return (React.createElement(Dropdown, __assign({}, props, { items: items, onChange: onChange, selected: activeIndex, tabIndex: -1, title: title })));
        function onChange(e) {
            var target = e.target;
            var selectedValue = target.value;
            var selectedIndex = parseInt(selectedValue, 10);
            var _a = items[selectedIndex] || [], command = _a[1], commandArgument = _a[2];
            e.preventDefault();
            if (document.activeElement !== $el) {
                $el === null || $el === void 0 ? void 0 : $el.focus();
            }
            if (typeof command === 'function') {
                command(editorState);
            }
            else if (command) {
                document.execCommand(command, false, commandArgument);
            }
            setTimeout(function () { return (target.value = selectedValue); }, 10);
        }
    }
}
function Dropdown(_a) {
    var items = _a.items, selected = _a.selected, inputProps = __rest(_a, ["items", "selected"]);
    return (React.createElement("select", __assign({ className: "rsw-dd" }, inputProps, { value: selected }),
        React.createElement("option", { hidden: true }, inputProps.title),
        items.map(function (item, index) { return (React.createElement("option", { key: item[2], value: index }, item[0])); })));
}

function HtmlButton(_a) {
    var rest = __rest(_a, []);
    var editorState = useEditorState();
    function onClick() {
        editorState.update({
            htmlMode: !editorState.htmlMode,
        });
    }
    return (React.createElement("button", __assign({ className: "rsw-btn", "data-active": editorState.htmlMode, onClick: onClick, tabIndex: -1, title: "HTML mode", type: "button" }, rest), "</>"));
}

function Separator(props) {
    var editorState = useEditorState();
    if (editorState.htmlMode) {
        return null;
    }
    return React.createElement("div", __assign({ className: "rsw-separator" }, props));
}

var CHARS = [
    '↑',
    '↓',
    '←',
    '→',
    '↔',
    '∞',
    '×',
    '÷',
    '±',
    '≤',
    '≥',
    '≠',
    'α',
    'β',
    'γ',
    'δ',
    'ε',
    'π',
    'λ',
    'μ',
    'σ',
    'τ',
    'φ',
    'ω',
    'Α',
    'Β',
    'Γ',
    'Δ',
    'Ε',
    'Π',
    'Λ',
    'Μ',
    'Σ',
    'Τ',
    'Φ',
    'Ω',
];

function BtnSpecialCharacters(props) {
    var _a = React.useState(false), isOpen = _a[0], setIsOpen = _a[1];
    var editorState = useEditorState();
    var _b = props.title, title = _b === void 0 ? 'Special characters' : _b;
    var insertChar = function (char) {
        document.execCommand('insertText', false, char);
        setIsOpen(false);
    };
    var ButtonComponent = React.useMemo(function () {
        return createButton(title, React.createElement("span", null, "\u03A9"), function () { return setIsOpen(true); });
    }, [title]);
    if (editorState.htmlMode)
        return null;
    return (React.createElement(React.Fragment, null,
        React.createElement(ButtonComponent, __assign({}, props)),
        isOpen && (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "rsw-click-disabler", onClick: function () { return setIsOpen(false); } }),
            React.createElement("div", { className: "rsw-modal" },
                React.createElement("header", null,
                    React.createElement("h3", null, title),
                    React.createElement("button", { "aria-label": "Close", onClick: function () { return setIsOpen(false); }, className: "rsw-btn" }, "\u00D7")),
                React.createElement("main", null, CHARS.map(function (char, i) { return (React.createElement("button", { "aria-label": "Insert ".concat(char), key: i, onClick: function () { return insertChar(char); }, className: "rsw-btn", title: "Insert ".concat(char) }, char)); })))))));
}

function Toolbar(props) {
    return React.createElement("div", __assign({ className: "rsw-toolbar" }, props));
}

var DefaultEditor = React.forwardRef(function DefaultEditor(props, ref) {
    return (React.createElement(EditorProvider, null,
        React.createElement(Editor, __assign({}, props, { ref: ref }), props.children || (React.createElement(Toolbar, null,
            React.createElement(BtnUndo, null),
            React.createElement(BtnRedo, null),
            React.createElement(Separator, null),
            React.createElement(BtnBold, null),
            React.createElement(BtnItalic, null),
            React.createElement(BtnUnderline, null),
            React.createElement(BtnStrikeThrough, null),
            React.createElement(Separator, null),
            React.createElement(BtnSuperscript, null),
            React.createElement(BtnSubscript, null),
            React.createElement(Separator, null),
            React.createElement(BtnNumberedList, null),
            React.createElement(BtnBulletList, null),
            React.createElement(Separator, null),
            React.createElement(BtnLink, null),
            React.createElement(BtnPhrasionary, null),
            React.createElement(BtnNgde, null),
            React.createElement(BtnClearFormatting, null),
            React.createElement(BtnSpecialCharacters, null),
            React.createElement(HtmlButton, null),
            React.createElement(Separator, null),
            React.createElement(BtnStyles, null))))));
});

// Helper function to convert a ContentBlock to HTML (without wrapping div)
function contentBlockToHtml(block) {
    switch (block.type) {
        case 'inline':
            return renderInlineContent(block);
        case 'unordered-list':
            if (!block.items || block.items.length === 0) {
                return '';
            }
            var ulItems = block.items
                .map(function (item) { return renderListItem(item); })
                .join('');
            return "<ul>".concat(ulItems, "</ul>");
        case 'ordered-list':
            if (!block.items || block.items.length === 0) {
                return '';
            }
            var olItems = block.items
                .map(function (item) { return renderListItem(item); })
                .join('');
            return "<ol>".concat(olItems, "</ol>");
        default:
            return '';
    }
}
// Helper function to render inline content
function renderInlineContent(inline) {
    var html = '';
    for (var _i = 0, _a = inline.content; _i < _a.length; _i++) {
        var content = _a[_i];
        if (content.type === 'text') {
            html += content.value;
        }
        else if (content.type === 'phrasionary') {
            // Render phrasionary entries as spans
            html += "<span data-content-type=\"phrasionary\" data-content-id=\"".concat(content.id, "\" class=\"phrasionary-entity\" title=\"Phrasionary: ").concat(content.id, "\">").concat(content.value, "</span>");
        }
        else if (content.type === 'ngde') {
            // Render dosage entity as inline badge with emoji icon
            var substanceAttr = content.substanceId
                ? " data-substance-id=\"".concat(content.substanceId, "\"")
                : '';
            var title = content.substanceId
                ? "Dosage Entity: ".concat(content.entityId, " (Substance: ").concat(content.substanceId, ")")
                : "Dosage Entity: ".concat(content.entityId);
            html += "<span data-type=\"dosageEntity\" data-dosage-entity-id=\"".concat(content.entityId, "\"").concat(substanceAttr, " contenteditable=\"false\" class=\"dosage-entity\" title=\"").concat(title, "\">\uD83D\uDC8A</span>");
        }
    }
    return html;
}
// Helper function to render a list item with potential nested content
function renderListItem(item) {
    var html = "<li>";
    html += renderInlineContent(item.content);
    // Add any nested lists
    if (item.children && item.children.length > 0) {
        for (var _i = 0, _a = item.children; _i < _a.length; _i++) {
            var child = _a[_i];
            html += contentBlockToHtml(child);
        }
    }
    html += '</li>';
    return html;
}
function contentToHtml(content) {
    if (!content || content.type !== 'root' || !Array.isArray(content.children)) {
        return '';
    }
    var blocks = content.children
        .map(function (block) {
        var blockHtml = contentBlockToHtml(block);
        return "<div>".concat(blockHtml, "</div>");
    })
        .filter(function (html) { return html !== ''; });
    return blocks.join('');
}
function isEmptyContent(content) {
    if (!content || content.type !== 'root' || !Array.isArray(content.children)) {
        return true;
    }
    return content.children.every(function (block) {
        var html = contentBlockToHtml(block);
        return html === '' || html.trim() === '';
    });
}

exports.BtnBold = BtnBold;
exports.BtnBulletList = BtnBulletList;
exports.BtnClearFormatting = BtnClearFormatting;
exports.BtnItalic = BtnItalic;
exports.BtnLink = BtnLink;
exports.BtnNgde = BtnNgde;
exports.BtnNumberedList = BtnNumberedList;
exports.BtnPhrasionary = BtnPhrasionary;
exports.BtnRedo = BtnRedo;
exports.BtnSpecialCharacters = BtnSpecialCharacters;
exports.BtnStrikeThrough = BtnStrikeThrough;
exports.BtnStyles = BtnStyles;
exports.BtnSubscript = BtnSubscript;
exports.BtnSuperscript = BtnSuperscript;
exports.BtnUnderline = BtnUnderline;
exports.BtnUndo = BtnUndo;
exports.ContentEditable = ContentEditable;
exports.DefaultEditor = DefaultEditor;
exports.Dropdown = Dropdown;
exports.Editor = Editor;
exports.EditorContext = EditorContext;
exports.EditorProvider = EditorProvider;
exports.HtmlButton = HtmlButton;
exports.Separator = Separator;
exports.Toolbar = Toolbar;
exports.contentToHtml = contentToHtml;
exports.createButton = createButton;
exports.createDropdown = createDropdown;
exports.default = DefaultEditor;
exports.htmlToContent = htmlToContent;
exports.isEmptyContent = isEmptyContent;
exports.useEditorState = useEditorState;
//# sourceMappingURL=index.cjs.js.map
