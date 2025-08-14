import html2canvas from 'html2canvas';

export const exportUtils = {
  async downloadSignalCard(elementId: string, symbol: string, isDarkMode: boolean): Promise<void> {
    const signalElement = document.getElementById(elementId);
    if (!signalElement) {
      throw new Error('Signal element not found');
    }

    // Create a temporary container for export
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '800px';
    tempContainer.style.backgroundColor = isDarkMode ? '#0f1525' : '#f9f9f9';
    tempContainer.style.fontFamily = 'monospace';
    tempContainer.style.padding = '20px';
    tempContainer.style.boxSizing = 'border-box';
    tempContainer.style.color = isDarkMode ? '#e0e0e0' : '#333';
    tempContainer.style.borderRadius = '12px';
    tempContainer.style.border = `2px solid ${isDarkMode ? '#00a86b' : '#005ce6'}`;

    // Clone the signal card content
    const clonedContent = signalElement.cloneNode(true) as HTMLElement;
    
    // Apply inline styles for better rendering
    this.applyInlineStyles(clonedContent, isDarkMode);
    
    tempContainer.appendChild(clonedContent);
    document.body.appendChild(tempContainer);

    try {
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: isDarkMode ? '#0f1525' : '#f9f9f9',
        scale: 2,
        useCORS: true,
        logging: false,
        width: 800,
        height: tempContainer.scrollHeight,
        windowWidth: 800,
        windowHeight: tempContainer.scrollHeight
      });

      // Create download link
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `SmartSignal_${symbol.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.png`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    } finally {
      // Clean up temporary container
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
    }
  },

  applyInlineStyles(element: HTMLElement, isDarkMode: boolean): void {
    const bgColor = isDarkMode ? '#0f1525' : '#f9f9f9';
    const textColor = isDarkMode ? '#e0e0e0' : '#333';
    const accentColor = isDarkMode ? '#00a86b' : '#005ce6';
    
    // Apply styles recursively to all elements
    const applyStyles = (el: HTMLElement) => {
      el.style.fontFamily = 'monospace';
      el.style.color = textColor;
      
      // Apply specific styles based on classes
      if (el.classList.contains('signal-title') || el.querySelector('.signal-title')) {
        el.style.color = accentColor;
        el.style.fontWeight = 'bold';
        el.style.fontSize = '1.3em';
        el.style.marginBottom = '10px';
      }
      
      if (el.classList.contains('section-header')) {
        el.style.color = isDarkMode ? '#64b5f6' : '#003366';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '1.1em';
        el.style.margin = '12px 0 6px 0';
      }
      
      if (el.classList.contains('confluence-item')) {
        el.style.color = isDarkMode ? '#4db6ac' : '#006600';
        el.style.margin = '4px 0';
        el.style.fontWeight = '500';
      }
      
      // Recursively apply to children
      Array.from(el.children).forEach(child => {
        if (child instanceof HTMLElement) {
          applyStyles(child);
        }
      });
    };
    
    applyStyles(element);
  },

  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
};