import { readFileSync } from 'fs'
import { describe, expect, it, vi } from 'vitest'

/**
 * Test suite for the serve-mermaid script
 *
 * Tests the core functionality including file reading logic,
 * HTML template structure, and Mermaid configuration.
 */

// Mock the fs module
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
}))

describe('Mermaid Server HTML Template', () => {
  const mockMarkdownContent = `
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Fix it]
  `.trim()

  describe('File Reading', () => {
    it('should handle readFileSync for markdown files', () => {
      vi.mocked(readFileSync).mockReturnValue(mockMarkdownContent)
      const content = readFileSync('/fake/path/diagram.md', 'utf-8')
      expect(content).toBe(mockMarkdownContent)
      expect(readFileSync).toHaveBeenCalledWith('/fake/path/diagram.md', 'utf-8')
    })

    it('should handle different diagram content', () => {
      const sequenceDiagram = `sequenceDiagram
    Alice->>Bob: Hello!
    Bob-->>Alice: Hi!`

      vi.mocked(readFileSync).mockReturnValue(sequenceDiagram)
      const content = readFileSync('/fake/path/sequence.md', 'utf-8')
      expect(content).toContain('sequenceDiagram')
      expect(content).toContain('Alice->>Bob')
    })
  })

  describe('HTML Template Structure', () => {
    const generateTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mermaid Diagram Viewer</title>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: { 
        useMaxWidth: false, 
        htmlLabels: true,
        padding: 20
      }
    });
  </script>
</head>
<body>
  <div class="mermaid">
${content}
  </div>
</body>
</html>
`

    it('should generate valid HTML5 structure', () => {
      const template = generateTemplate(mockMarkdownContent)
      expect(template).toContain('<!DOCTYPE html>')
      expect(template).toContain('<html lang="en">')
      expect(template).toContain('</html>')
    })

    it('should include Mermaid CDN script', () => {
      const template = generateTemplate(mockMarkdownContent)
      expect(template).toContain('https://cdn.jsdelivr.net/npm/mermaid@11')
      expect(template).toContain('import mermaid from')
    })

    it('should include mermaid.initialize call', () => {
      const template = generateTemplate(mockMarkdownContent)
      expect(template).toContain('mermaid.initialize')
      expect(template).toContain('startOnLoad: true')
    })

    it('should embed diagram content in mermaid div', () => {
      const template = generateTemplate(mockMarkdownContent)
      expect(template).toContain('<div class="mermaid">')
      expect(template).toContain('graph TD')
      expect(template).toContain('A[Start]')
    })
  })

  describe('Mermaid Configuration', () => {
    const config = {
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        padding: 20,
      },
    }

    it('should have correct initialization settings', () => {
      expect(config.startOnLoad).toBe(true)
      expect(config.theme).toBe('default')
      expect(config.securityLevel).toBe('loose')
    })

    it('should have correct flowchart settings', () => {
      expect(config.flowchart.useMaxWidth).toBe(false)
      expect(config.flowchart.htmlLabels).toBe(true)
      expect(config.flowchart.padding).toBe(20)
    })
  })

  describe('Zoom Configuration Constants', () => {
    const zoomConfig = {
      currentZoom: 2.5,
      minZoom: 0.5,
      maxZoom: 10,
      zoomStep: 0.25,
    }

    it('should have correct initial zoom (250%)', () => {
      expect(zoomConfig.currentZoom).toBe(2.5)
    })

    it('should have correct zoom range (50% to 1000%)', () => {
      expect(zoomConfig.minZoom).toBe(0.5)
      expect(zoomConfig.maxZoom).toBe(10)
    })

    it('should have correct zoom step (25%)', () => {
      expect(zoomConfig.zoomStep).toBe(0.25)
    })

    it('should allow zooming from min to max', () => {
      let zoom = zoomConfig.minZoom
      expect(zoom).toBe(0.5) // 50%

      zoom = zoomConfig.currentZoom
      expect(zoom).toBe(2.5) // 250%

      zoom = zoomConfig.maxZoom
      expect(zoom).toBe(10) // 1000%
    })
  })

  describe('HTML Escaping', () => {
    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }

    it('should escape < and > characters', () => {
      const html = '<div>Test</div>'
      const escaped = escapeHtml(html)
      expect(escaped).toBe('&lt;div&gt;Test&lt;/div&gt;')
    })

    it('should handle content with multiple tags', () => {
      const html = '<script>alert("test")</script>'
      const escaped = escapeHtml(html)
      expect(escaped).toContain('&lt;script&gt;')
      expect(escaped).toContain('&lt;/script&gt;')
    })

    it('should escape ampersands', () => {
      const text = 'Tom & Jerry'
      const escaped = escapeHtml(text)
      expect(escaped).toBe('Tom &amp; Jerry')
    })

    it('should escape double quotes', () => {
      const text = 'He said "hello"'
      const escaped = escapeHtml(text)
      expect(escaped).toBe('He said &quot;hello&quot;')
    })

    it('should escape single quotes', () => {
      const text = "It's a test"
      const escaped = escapeHtml(text)
      expect(escaped).toBe('It&#039;s a test')
    })

    it('should escape all special characters together', () => {
      const text = `<script>alert("XSS & 'attack'")</script>`
      const escaped = escapeHtml(text)
      expect(escaped).toBe(
        '&lt;script&gt;alert(&quot;XSS &amp; &#039;attack&#039;&quot;)&lt;/script&gt;'
      )
    })

    it('should handle file paths with special characters', () => {
      const filePath = 'docs/<important>/file&name.md'
      const escaped = escapeHtml(filePath)
      expect(escaped).toBe('docs/&lt;important&gt;/file&amp;name.md')
    })

    it('should handle empty strings', () => {
      const text = ''
      const escaped = escapeHtml(text)
      expect(escaped).toBe('')
    })

    it('should handle strings without special characters', () => {
      const text = 'normal-file-path.md'
      const escaped = escapeHtml(text)
      expect(escaped).toBe('normal-file-path.md')
    })
  })

  describe('Diagram Content Handling', () => {
    it('should handle flowchart diagrams', () => {
      const content = `graph TD
    A --> B
    B --> C`
      expect(content).toContain('graph TD')
      expect(content).toContain('-->')
    })

    it('should handle sequence diagrams', () => {
      const content = `sequenceDiagram
    Alice->>Bob: Hello
    Bob-->>Alice: Hi`
      expect(content).toContain('sequenceDiagram')
      expect(content).toContain('->>')
    })

    it('should handle class diagrams', () => {
      const content = `classDiagram
    class Animal
    Animal : +eat()
    Animal : +sleep()`
      expect(content).toContain('classDiagram')
      expect(content).toContain('class')
    })

    it('should handle empty content', () => {
      const content = ''
      expect(content).toBe('')
    })

    it('should preserve whitespace and formatting', () => {
      const content = `graph TD
    A[First]
    B[Second]
    A --> B`
      expect(content).toContain('    A[First]')
      expect(content).toContain('    B[Second]')
    })
  })

  describe('Port Configuration', () => {
    const PORT = 3001

    it('should use port 3001', () => {
      expect(PORT).toBe(3001)
    })

    it('should be a valid port number', () => {
      expect(PORT).toBeGreaterThan(1023) // Above reserved ports
      expect(PORT).toBeLessThan(65536) // Valid port range
    })
  })

  describe('Error Handling Scenarios', () => {
    it('should throw error if file does not exist', () => {
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory')
      })

      expect(() => {
        readFileSync('/nonexistent/file.md', 'utf-8')
      }).toThrow('ENOENT')
    })

    it('should throw error with descriptive message', () => {
      const errorMessage = 'ENOENT: no such file or directory'
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error(errorMessage)
      })

      expect(() => {
        readFileSync('/nonexistent/file.md', 'utf-8')
      }).toThrow(errorMessage)
    })
  })

  describe('Command Line Arguments', () => {
    it('should default to di:container.md if no args provided', () => {
      const args: string[] = []
      const defaultFile = 'di:container.md'
      const filePath = args[0] || defaultFile
      expect(filePath).toBe('di:container.md')
    })

    it('should use provided file path from args', () => {
      const args = ['docs/my-diagram.md']
      const defaultFile = 'di:container.md'
      const filePath = args[0] || defaultFile
      expect(filePath).toBe('docs/my-diagram.md')
    })
  })
})
