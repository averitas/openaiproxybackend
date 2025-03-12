import { Descendant, Element as SlateElement, Text } from 'slate';
import {
  LinkElement,
  CodeBlockElement,
} from './custom-types.d';

/**
 * Deserialize HTML string to Slate Descendant[] structure
 */
export const deserializeHTML = (html: string): Descendant[] => {
  // Create a temporary DOM element to parse the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Start with an empty array of nodes
  const nodes: Descendant[] = [];
  
  // Process each child of the body element
  Array.from(doc.body.childNodes).forEach(node => {
    const slateNode = deserializeNode(node);
    if (slateNode) {
      nodes.push(slateNode);
    }
  });
  
  // If no nodes were created, return a single paragraph with empty text
  if (nodes.length === 0) {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }
  
  return nodes;
};

/**
 * Helper function to deserialize a DOM node to a Slate node
 */
const deserializeNode = (node: Node): Descendant | null => {
  if (node.nodeType === Node.TEXT_NODE) {
    return { text: node.textContent || '' };
  }
  
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }
  
  const el = node as HTMLElement;
  const children: Descendant[] = Array.from(el.childNodes)
    .map(child => deserializeNode(child))
    .filter(Boolean) as Descendant[];
  
  // Default if no children
  if (children.length === 0) {
    children.push({ text: '' });
  }
  
  switch (el.nodeName.toLowerCase()) {
    case 'p':
      return { type: 'paragraph', children };
    case 'h1':
      return { type: 'heading-one', children };
    case 'h2':
      return { type: 'heading-two', children };
    case 'h3':
      return { type: 'heading-three', children };
    case 'blockquote':
      return { type: 'block-quote', children };
    case 'ul':
      return { type: 'bulleted-list', children };
    case 'li':
      return { type: 'list-item', children };
    case 'a':
      return { 
        type: 'link', 
        url: el.getAttribute('href') || '', 
        children 
      };
    case 'pre':
      return { 
        type: 'code-block', 
        language: el.getAttribute('data-language') || 'text', 
        children 
      };
    case 'strong':
    case 'b':
      // Create a paragraph with formatted text instead of returning an array
      return { 
        type: 'paragraph', 
        children: children.map(child => 
          Text.isText(child) ? { ...child, bold: true } : child
        ) 
      };
    case 'em':
    case 'i':
      return { 
        type: 'paragraph',
        children: children.map(child => 
          Text.isText(child) ? { ...child, italic: true } : child
        )
      };
    case 'u':
      return { 
        type: 'paragraph',
        children: children.map(child => 
          Text.isText(child) ? { ...child, underline: true } : child
        )
      };
    case 'code':
      return { 
        type: 'paragraph',
        children: children.map(child => 
          Text.isText(child) ? { ...child, code: true } : child
        )
      };
    case 'br':
      return { text: '\n' };
    case 'div':
    case 'span':
      // Divs and spans just return their children
      return {
        type: 'paragraph',
        children,
      };
    default:
      // For any other element, just return its children as paragraphs
      return { type: 'paragraph', children };
  }
};

/**
 * Serialize Slate Descendant[] to HTML string
 */
export const serializeHTML = (nodes: Descendant[]): string => {
  return nodes.map(node => serializeNode(node)).join('');
};

/**
 * Helper function to serialize a Slate node to HTML
 */
const serializeNode = (node: Descendant): string => {
  // Handle text nodes
  if (Text.isText(node)) {
    let text = node.text;
    
    // Apply formatting
    if (node.bold) {
      text = `<strong>${text}</strong>`;
    }
    if (node.italic) {
      text = `<em>${text}</em>`;
    }
    if (node.underline || node.underlined) {
      text = `<u>${text}</u>`;
    }
    if (node.code) {
      text = `<code>${text}</code>`;
    }
    if (node.strikethrough) {
      text = `<s>${text}</s>`;
    }
    
    return text;
  }
  
  // Handle element nodes
  if (SlateElement.isElement(node)) {
    const children = (node.children as Descendant[])
      .map(n => serializeNode(n))
      .join('');
    
    switch (node.type) {
      case 'paragraph':
        return `<p>${children}</p>`;
      case 'heading-one':
        return `<h1>${children}</h1>`;
      case 'heading-two':
        return `<h2>${children}</h2>`;
      case 'heading-three':
        return `<h3>${children}</h3>`;
      case 'heading-four':
        return `<h4>${children}</h4>`;
      case 'heading-five':
        return `<h5>${children}</h5>`;
      case 'heading-six':
        return `<h6>${children}</h6>`;
      case 'block-quote':
        return `<blockquote>${children}</blockquote>`;
      case 'bulleted-list':
        return `<ul>${children}</ul>`;
      case 'list-item':
        return `<li>${children}</li>`;
      case 'numbered-list':
        return `<ol>${children}</ol>`;
      case 'link':
        return `<a href="${(node as LinkElement).url}">${children}</a>`;
      case 'code-block': {
        const codeBlock = node as CodeBlockElement;
        return `<pre data-language="${codeBlock.language}">${children}</pre>`;
      }
      default:
        return children;
    }
  }
  
  return '';
};

/**
 * Convert HTML string to Markdown format
 * (This is a stub - you would need a proper HTML-to-Markdown converter)
 */
export const convertHTMLToMarkdown = (html: string): string => {
  // Basic implementation, would need a more robust converter in practice
  const slateNodes = deserializeHTML(html);
  // Convert Slate nodes to markdown - simplified implementation
  return slateNodes.map(node => {
    if (Text.isText(node)) {
      return node.text;
    }
    return '';
  }).join('\n');
};

/**
 * Convert Markdown to HTML string
 * (This is a stub - you would need a proper Markdown-to-HTML converter)
 */
export const convertMarkdownToHTML = (markdown: string): string => {
  // Simplified implementation - would need a proper markdown parser
  return markdown;
};

/**
 * Convert Slate nodes to a Markdown string
 */
export const slateToMarkdown = (nodes: Descendant[]): string => {
  return nodes.map(node => nodeToMarkdown(node)).join('\n');
};

/**
 * Convert a Slate node to Markdown
 */
const nodeToMarkdown = (node: Descendant): string => {
  if (Text.isText(node)) {
    let text = node.text;
    
    // Apply Markdown formatting
    if (node.bold) {
      text = `**${text}**`;
    }
    if (node.italic) {
      text = `_${text}_`;
    }
    if (node.code) {
      text = `\`${text}\``;
    }
    if (node.strikethrough) {
      text = `~~${text}~~`;
    }
    
    return text;
  }
  
  if (SlateElement.isElement(node)) {
    const children = (node.children as Descendant[])
      .map(child => nodeToMarkdown(child))
      .join('');
    
    switch (node.type) {
      case 'paragraph':
        return `${children}\n`;
      case 'heading-one':
        return `# ${children}\n`;
      case 'heading-two':
        return `## ${children}\n`;
      case 'heading-three':
        return `### ${children}\n`;
      case 'heading-four':
        return `#### ${children}\n`;
      case 'heading-five':
        return `##### ${children}\n`;
      case 'heading-six':
        return `###### ${children}\n`;
      case 'block-quote':
        return `> ${children}\n`;
      case 'bulleted-list':
        return children; // The list items will add their own markers
      case 'list-item':
        return `- ${children}\n`;
      case 'numbered-list':
        return children; // The list items will add their own numbers
      case 'link':
        return `[${children}](${(node as LinkElement).url})`;
      case 'code-block': {
        const codeBlock = node as CodeBlockElement;
        return `\`\`\`${codeBlock.language}\n${children}\n\`\`\`\n`;
      }
      default:
        return children;
    }
  }
  
  return '';
};

/**
 * Convert Markdown string to Slate nodes
 * This is a simplified version - a full implementation would use a proper Markdown parser
 */
export const markdownToSlate = (markdown: string): Descendant[] => {
  if (!markdown) {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }
  
  // Split into lines and process
  const lines = markdown.split('\n');
  const nodes: Descendant[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line.trim()) {
      nodes.push({ type: 'paragraph', children: [{ text: '' }] });
      continue;
    }
    
    // Handle headings
    if (line.startsWith('# ')) {
      nodes.push({ type: 'heading-one', children: [{ text: line.slice(2) }] });
    }
    else if (line.startsWith('## ')) {
      nodes.push({ type: 'heading-two', children: [{ text: line.slice(3) }] });
    }
    else if (line.startsWith('### ')) {
      nodes.push({ type: 'heading-three', children: [{ text: line.slice(4) }] });
    }
    else if (line.startsWith('#### ')) {
      nodes.push({ type: 'heading-four', children: [{ text: line.slice(5) }] });
    }
    else if (line.startsWith('##### ')) {
      nodes.push({ type: 'heading-five', children: [{ text: line.slice(6) }] });
    }
    else if (line.startsWith('###### ')) {
      nodes.push({ type: 'heading-six', children: [{ text: line.slice(7) }] });
    }
    // Handle block quotes
    else if (line.startsWith('> ')) {
      nodes.push({ type: 'block-quote', children: [{ text: line.slice(2) }] });
    }
    // Handle bullet lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      const textContent = line.slice(2);
      
      // Check if we need to start a new list or add to existing
      const lastNode = nodes[nodes.length - 1];
      if (lastNode && SlateElement.isElement(lastNode) && lastNode.type === 'bulleted-list') {
        (lastNode.children as Descendant[]).push({ 
          type: 'list-item', 
          children: [{ text: textContent }] 
        });
      } else {
        nodes.push({
          type: 'bulleted-list',
          children: [{ 
            type: 'list-item', 
            children: [{ text: textContent }] 
          }]
        });
      }
    }
    // Basic paragraph handling (simplified - doesn't handle inline formatting)
    else {
      nodes.push({ type: 'paragraph', children: [{ text: line }] });
    }
  }
  
  // If no nodes were created, return a default paragraph
  if (nodes.length === 0) {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }
  
  return nodes;
};
