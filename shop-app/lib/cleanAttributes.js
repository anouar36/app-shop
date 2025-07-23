// Remove BitDefender and other security extensions attributes
// Add this script to your _app.js or in a useEffect in your layout component

export function cleanSecurityExtensionAttributes() {
  if (typeof window !== 'undefined') {
    // Only run on the client side
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const element = mutation.target;
          if (element.hasAttribute('bis_skin_checked')) {
            element.removeAttribute('bis_skin_checked');
          }
        }
      });
    });

    // Start observing the document
    observer.observe(document.body, { 
      attributes: true, 
      subtree: true, 
      attributeFilter: ['bis_skin_checked'] 
    });

    return () => {
      // Clean up when component unmounts
      observer.disconnect();
    };
  }
}
