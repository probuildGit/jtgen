// Atlassian Document Format (ADF) Builder Utility

// Helper function to create text with clickable links
const createTextWithLinks = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  const content = [];
  
  parts.forEach((part, index) => {
    if (urlRegex.test(part)) {
      // This is a URL, make it clickable
      content.push({
        type: 'text',
        text: part,
        marks: [{ type: 'link', attrs: { href: part } }]
      });
    } else if (part.trim()) {
      // This is regular text
      content.push({
        type: 'text',
        text: part
      });
    }
  });
  
  return content.length > 0 ? content : [{ type: 'text', text: text }];
};

// Create a paragraph node
const createParagraph = (content, marks = []) => ({
  type: 'paragraph',
  content: [{
    type: 'text',
    text: content,
    marks: marks.length > 0 ? marks : undefined
  }]
});

// Create a strong paragraph node
const createStrongParagraph = (content) => createParagraph(content, [{ type: 'strong' }]);

// Create an empty paragraph node
const createEmptyParagraph = () => ({ type: 'paragraph' });

// Check if text contains Jam links
const isJamLink = (text) => {
  return text.includes('jam.ai') || text.includes('jam.com') || text.includes('jam.dev');
};

// Build description content from ticket data
export const buildDescriptionContent = (ticketData) => {
  const summary = `${ticketData.platform} - ${ticketData.module} - ${ticketData.summary}`;
  
  const descriptionContent = [
    createStrongParagraph('Description:'),
    createParagraph(summary),
    createEmptyParagraph()
  ];

  // Add Steps to Reproduce section
  if (ticketData.stepsToReproduce && ticketData.stepsToReproduce.trim()) {
    const sectionTitle = isJamLink(ticketData.stepsToReproduce) ? 'JAM:' : 'Steps to Reproduce:';
    descriptionContent.push(
      createStrongParagraph(sectionTitle),
      {
        type: 'paragraph',
        content: createTextWithLinks(ticketData.stepsToReproduce)
      },
      createEmptyParagraph()
    );
  }

  // Add Expected Behavior section
  if (ticketData.expectedBehavior && ticketData.expectedBehavior.trim()) {
    descriptionContent.push(
      createStrongParagraph('Expected Behavior:'),
      createParagraph(ticketData.expectedBehavior),
      createEmptyParagraph()
    );
  }

  // Add Actual Behavior section
  if (ticketData.actualBehavior && ticketData.actualBehavior.trim()) {
    const sectionTitle = isJamLink(ticketData.actualBehavior) ? 'JAM:' : 'Actual Behavior:';
    descriptionContent.push(
      createStrongParagraph(sectionTitle),
      {
        type: 'paragraph',
        content: createTextWithLinks(ticketData.actualBehavior)
      },
      createEmptyParagraph()
    );
  }

  // Add Note section
  if (ticketData.note && ticketData.note.trim()) {
    descriptionContent.push(
      createStrongParagraph('Note:'),
      createParagraph(ticketData.note),
      createEmptyParagraph()
    );
  }

  // Add date
  descriptionContent.push(
    createStrongParagraph('Date:'),
    createParagraph(new Date().toLocaleDateString('en-GB'))
  );

  return descriptionContent;
};

// Create embedded image node for ADF
export const createEmbeddedImageNode = (attachmentData) => {
  return {
    type: 'mediaSingle',
    attrs: {
      layout: 'center'
    },
    content: [
      {
        type: 'media',
        attrs: {
          type: 'external',
          url: `https://probuild.atlassian.net/secure/attachment/${attachmentData.id}/${attachmentData.filename}`
        }
      }
    ]
  };
};

// Add attachments section to description content
export const addAttachmentsSection = (descriptionContent, uploadedAttachments) => {
  const newContent = [...descriptionContent];
  
  // Check if attachments section already exists
  let hasAttachmentsSection = false;
  for (const node of newContent) {
    if (node.type === 'paragraph' && 
        node.content && 
        node.content[0] && 
        node.content[0].text === 'Attachments:') {
      hasAttachmentsSection = true;
      break;
    }
  }
  
  if (!hasAttachmentsSection) {
    // Add attachments section header
    newContent.push(
      createEmptyParagraph(),
      createStrongParagraph('Attachments:')
    );
  }
  
  // Add embedded images for each attachment
  for (const attachmentData of uploadedAttachments) {
    const embeddedImageNode = createEmbeddedImageNode(attachmentData);
    newContent.push(embeddedImageNode);
    newContent.push(createEmptyParagraph());
  }
  
  return newContent;
};
