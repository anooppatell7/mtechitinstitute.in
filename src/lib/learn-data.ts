
import type { LearningModule } from "./types";

export const learningModules: LearningModule[] = [
    {
        slug: 'html',
        title: 'HTML Foundations',
        order: 1,
        description: 'Learn the structure of the web. Build and structure websites from scratch.',
        difficulty: 'Beginner',
        icon: '📄',
        chapters: [
            {
                slug: 'introduction',
                title: 'Chapter 1: Introduction to HTML',
                order: 1,
                lessons: [
                    { 
                        slug: 'what-is-html', 
                        title: 'What is HTML?', 
                        order: 1,
                        theory: '<h2>What is HTML?</h2><p>HTML stands for <strong>HyperText Markup Language</strong>. It is the standard markup language for creating Web pages.</p><ul><li>HTML describes the structure of a Web page.</li><li>HTML consists of a series of elements.</li><li>HTML elements tell the browser how to display the content.</li><li>HTML elements label pieces of content such as "this is a heading", "this is a paragraph", "this is a link", etc.</li></ul>' 
                    },
                    { 
                        slug: 'html-document-structure', 
                        title: 'HTML Document Structure', 
                        order: 2,
                        theory: '<h2>A Simple HTML Document</h2><p>All HTML documents must start with a document type declaration: <code>&lt;!DOCTYPE html&gt;</code>.</p><p>The HTML document itself begins with <code>&lt;html&gt;</code> and ends with <code>&lt;/html&gt;</code>.</p><p>The visible part of the HTML document is between <code>&lt;body&gt;</code> and <code>&lt;/body&gt;</code>.</p><h3>Example:</h3><pre><code class="language-html">&lt;!DOCTYPE html&gt;\n&lt;html&gt;\n&lt;head&gt;\n  &lt;title&gt;Page Title&lt;/title&gt;\n&lt;/head&gt;\n&lt;body&gt;\n\n  &lt;h1&gt;My First Heading&lt;/h1&gt;\n  &lt;p&gt;My first paragraph.&lt;/p&gt;\n\n&lt;/body&gt;\n&lt;/html&gt;</code></pre><p>The <code>&lt;head&gt;</code> element contains meta-information about the document, like its title, character set, styles, links, scripts, and other meta information.</p>' 
                    },
                ]
            },
            {
                slug: 'basic-elements',
                title: 'Chapter 2: Basic HTML Elements',
                order: 2,
                lessons: [
                    { 
                        slug: 'headings', 
                        title: 'Headings', 
                        order: 1,
                        theory: '<h2>HTML Headings</h2><p>HTML headings are defined with the <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code> tags.</p><p><code>&lt;h1&gt;</code> defines the most important heading. <code>&lt;h6&gt;</code> defines the least important heading.</p><pre><code class="language-html">&lt;h1&gt;Heading 1&lt;/h1&gt;\n&lt;h2&gt;Heading 2&lt;/h2&gt;\n&lt;h3&gt;Heading 3&lt;/h3&gt;</code></pre>'
                    },
                    { 
                        slug: 'paragraphs', 
                        title: 'Paragraphs', 
                        order: 2,
                        theory: '<h2>HTML Paragraphs</h2><p>HTML paragraphs are defined with the <code>&lt;p&gt;</code> tag.</p><pre><code class="language-html">&lt;p&gt;This is a paragraph.&lt;/p&gt;\n&lt;p&gt;This is another paragraph.&lt;/p&gt;</code></pre>'
                    },
                    { 
                        slug: 'links', 
                        title: 'Links', 
                        order: 3,
                        theory: '<h2>HTML Links (Anchors)</h2><p>HTML links are defined with the <code>&lt;a&gt;</code> tag. The link\'s destination is specified in the <code>href</code> attribute.</p><pre><code class="language-html">&lt;a href="https://www.mtechitinstitute.in"&gt;Visit MTech IT Institute&lt;/a&gt;</code></pre>'
                    },
                    { 
                        slug: 'images', 
                        title: 'Images', 
                        order: 4,
                        theory: '<h2>HTML Images</h2><p>HTML images are defined with the <code>&lt;img&gt;</code> tag. The source file (<code>src</code>) and alternative text (<code>alt</code>) are provided as attributes.</p><pre><code class="language-html">&lt;img src="image.jpg" alt="A descriptive text for the image" width="100" height="100"&gt;</code></pre><p>The `alt` attribute is crucial for accessibility.</p>'
                    },
                ]
            },
             {
                slug: 'text-formatting',
                title: 'Chapter 3: Text Formatting',
                order: 3,
                lessons: [
                    { 
                        slug: 'bold-italic', 
                        title: 'Bold and Italic Text', 
                        order: 1,
                        theory: '<h2>Formatting Elements</h2><p>HTML contains several elements for defining text with a special meaning.</p><ul><li><code>&lt;b&gt;</code> - Bold text</li><li><code>&lt;strong&gt;</code> - Important text (usually displayed as bold)</li><li><code>&lt;i&gt;</code> - Italic text</li><li><code>&lt;em&gt;</code> - Emphasized text (usually displayed as italic)</li><li><code>&lt;mark&gt;</code> - Marked text</li><li><code>&lt;small&gt;</code> - Smaller text</li><li><code>&lt;del&gt;</code> - Deleted text</li><li><code>&lt;ins&gt;</code> - Inserted text</li></ul><p>Using <code>&lt;strong&gt;</code> and <code>&lt;em&gt;</code> is semantically more correct than <code>&lt;b&gt;</code> and <code>&lt;i&gt;</code>.</p>'
                    },
                    { 
                        slug: 'sub-sup', 
                        title: 'Subscript & Superscript', 
                        order: 2,
                        theory: '<h2>Subscript and Superscript</h2><p>The <code>&lt;sub&gt;</code> tag defines subscript text, which appears half a character below the normal line. It is often used for chemical formulas like H<sub>2</sub>O.</p><p>The <code>&lt;sup&gt;</code> tag defines superscript text, which appears half a character above the normal line. It is often used for footnotes or mathematical expressions like X<sup>2</sup>.</p><pre><code class="language-html">&lt;p&gt;This is &lt;sub&gt;subscripted&lt;/sub&gt; text.&lt;/p&gt;\n&lt;p&gt;This is &lt;sup&gt;superscripted&lt;/sup&gt; text.&lt;/p&gt;</code></pre>'
                    },
                ]
            },
            {
                slug: 'lists',
                title: 'Chapter 4: Lists',
                order: 4,
                lessons: [
                    {
                        slug: 'unordered-lists',
                        title: 'Unordered Lists',
                        order: 1,
                        theory: '<h2>Unordered HTML List</h2><p>An unordered list starts with the <code>&lt;ul&gt;</code> tag. Each list item starts with the <code>&lt;li&gt;</code> tag.</p><p>The list items will be marked with bullets (small black circles) by default.</p><pre><code class="language-html">&lt;ul&gt;\n  &lt;li&gt;Coffee&lt;/li&gt;\n  &lt;li&gt;Tea&lt;/li&gt;\n  &lt;li&gt;Milk&lt;/li&gt;\n&lt;/ul&gt;</code></pre>'
                    },
                    {
                        slug: 'ordered-lists',
                        title: 'Ordered Lists',
                        order: 2,
                        theory: '<h2>Ordered HTML List</h2><p>An ordered list starts with the <code>&lt;ol&gt;</code> tag. Each list item starts with the <code>&lt;li&gt;</code> tag.</p><p>The list items will be marked with numbers by default.</p><pre><code class="language-html">&lt;ol&gt;\n  &lt;li&gt;First step&lt;/li&gt;\n  &lt;li&gt;Second step&lt;/li&gt;\n  &lt;li&gt;Third step&lt;/li&gt;\n&lt;/ol&gt;</code></pre>'
                    }
                ]
            }
        ]
    },
    {
        slug: 'css',
        title: 'CSS Styling',
        order: 2,
        description: 'Style your websites and bring your designs to life with modern CSS.',
        difficulty: 'Beginner',
        icon: '🎨',
        chapters: [
            {
                slug: 'introduction',
                title: 'Chapter 1: Introduction to CSS',
                order: 1,
                lessons: [
                    { 
                        slug: 'what-is-css', 
                        title: 'What is CSS?', 
                        order: 1,
                        theory: '<h2>What is CSS?</h2><p>CSS stands for <strong>Cascading Style Sheets</strong>. It is the language we use to style an HTML document.</p><p>CSS describes how HTML elements should be displayed.</p><ul><li>CSS saves a lot of work. It can control the layout of multiple web pages all at once.</li><li>External stylesheets are stored in CSS files.</li></ul>' 
                    },
                    { 
                        slug: 'css-syntax', 
                        title: 'CSS Syntax', 
                        order: 2,
                        theory: '<h2>CSS Syntax</h2><p>A CSS rule-set consists of a selector and a declaration block.</p><p>The <strong>selector</strong> points to the HTML element you want to style.</p><p>The <strong>declaration block</strong> contains one or more declarations separated by semicolons. Each declaration includes a CSS property name and a value, separated by a colon.</p><pre><code class="language-css">p {\n  color: red;\n  text-align: center;\n}</code></pre><p>In this example, all <code>&lt;p&gt;</code> elements will be center-aligned, with a red text color.</p>' },
                ]
            },
            {
                slug: 'selectors-and-colors',
                title: 'Chapter 2: Selectors and Colors',
                order: 2,
                lessons: [
                     { 
                        slug: 'css-selectors', 
                        title: 'Selectors', 
                        order: 1,
                        theory: '<h2>CSS Selectors</h2><p>CSS selectors are used to "find" (or select) the HTML elements you want to style.</p><p>Some common selectors include:</p><ul><li><strong>Element Selector:</strong> Selects elements based on the element name (e.g., <code>p</code>).</li><li><strong>ID Selector:</strong> Uses the id attribute of an HTML element to select a specific element (e.g., <code>#firstname</code>). An ID should be unique within a page.</li><li><strong>Class Selector:</strong> Selects elements with a specific class attribute (e.g., <code>.intro</code>).</li></ul>'
                    },
                     { 
                        slug: 'css-colors', 
                        title: 'Colors',
                        order: 2, 
                        theory: '<h2>CSS Colors</h2><p>Colors in CSS can be specified in several ways:</p><ul><li><strong>By name:</strong> <code>red</code>, <code>blue</code>, <code>lightgray</code></li><li><strong>By HEX value:</strong> <code>#ff0000</code>, <code>#0000ff</code></li><li><strong>By RGB value:</strong> <code>rgb(255, 0, 0)</code></li></ul><pre><code class="language-css">body {\n  background-color: lightblue;\n}\nh1 {\n  color: white;\n  text-align: center;\n}</code></pre>'
                    },
                ]
            }
        ]
    },
    {
        slug: 'javascript',
        title: 'JavaScript Essentials',
        order: 3,
        description: 'Make your websites interactive and dynamic with the web\'s most popular language.',
        difficulty: 'Intermediate',
        icon: '⚡',
        chapters: []
    },
    {
        slug: 'python',
        title: 'Python for Beginners',
        order: 4,
        description: 'Start your journey into programming with the versatile and powerful Python.',
        difficulty: 'Beginner',
        icon: '🐍',
        chapters: []
    },
    {
        slug: 'sql',
        title: 'SQL Database Basics',
        order: 5,
        description: 'Learn to manage and query data from databases, a fundamental skill for any developer.',
        difficulty: 'Beginner',
        icon: '🗃️',
        chapters: []
    }
]
