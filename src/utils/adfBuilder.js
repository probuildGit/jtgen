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

// Check if text contains URLs
const isUrl = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/;
  return urlRegex.test(text);
};

const getLinkAwareSectionTitle = (text, defaultTitle) => {
  if (isJamLink(text)) return 'JAM:';
  if (isUrl(text)) return 'URL:';
  return defaultTitle;
};

// Build description content from ticket data
export const buildDescriptionContent = (ticketData) => {
  // Description should include module and summary only (no platform)
  // Ensure we have valid values, use fallbacks if needed
  const module = ticketData.module || 'General';
  const summary = ticketData.summary || 'No summary provided';
  const description = `${module} - ${summary}`;
  
  const descriptionContent = [
    createStrongParagraph('Description:'),
    createParagraph(description),
    createEmptyParagraph()
  ];

  // Add Steps to Reproduce section
  if (ticketData.stepsToReproduce && ticketData.stepsToReproduce.trim()) {
    const sectionTitle = getLinkAwareSectionTitle(ticketData.stepsToReproduce, 'Steps to Reproduce:');
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
    const sectionTitle = getLinkAwareSectionTitle(ticketData.actualBehavior, 'Actual Behavior:');
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
    const noteTitle = isUrl(ticketData.note) ? 'URL:' : 'Note:';
    descriptionContent.push(
      createStrongParagraph(noteTitle),
      {
        type: 'paragraph',
        content: createTextWithLinks(ticketData.note)
      },
      createEmptyParagraph()
    );
  }

  // Add application URL if available (from JAM extraction)
  if (ticketData.applicationUrl && ticketData.applicationUrl.trim()) {
    descriptionContent.push(
      createStrongParagraph('URL:'),
      {
        type: 'paragraph',
        content: createTextWithLinks(ticketData.applicationUrl)
      },
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

const VIDEO_FILENAME_PATTERN = /\.(mov|mp4)$/i;

/** Jira attachment metadata after upload (REST) */
export const isVideoAttachmentFilename = (filename) =>
  typeof filename === 'string' && VIDEO_FILENAME_PATTERN.test(filename);

export const isVideoAttachment = (attachmentData) => {
  const name = attachmentData?.filename || attachmentData?.name || '';
  const mime = typeof attachmentData?.mimeType === 'string' ? attachmentData.mimeType : '';
  return isVideoAttachmentFilename(name) || mime.startsWith('video/');
};

/**
 * Browser URL for an attachment (download / open in new tab).
 * Filename is encoded for spaces and special characters.
 */
export const buildJiraAttachmentUrl = (attachmentData) => {
  const id = attachmentData?.id;
  const rawName = attachmentData?.filename || attachmentData?.name || 'file';
  if (id == null) return '';
  return `https://probuild.atlassian.net/secure/attachment/${id}/${encodeURIComponent(rawName)}`;
};

const createScreenRecordingTitleNode = () => createStrongParagraph('Screen recording:');

const createVideoAttachmentMediaNode = (attachmentData) => {
  const mediaId = attachmentData?.mediaId;
  const alt = attachmentData?.originalFilename || attachmentData?.filename || attachmentData?.name || 'Screen recording';

  if (!mediaId) {
    return null;
  }

  return {
    type: 'mediaSingle',
    attrs: {
      width: 1229,
      widthType: 'pixel',
      layout: 'align-start'
    },
    content: [
      {
        type: 'media',
        attrs: {
          type: 'file',
          id: mediaId,
          alt,
          collection: '',
          height: 1080,
          width: 1920
        }
      }
    ]
  };
};

const createVideoAttachmentLinkNode = (attachmentData) => {
  const name = attachmentData?.originalFilename || attachmentData?.filename || attachmentData?.name || 'Screen recording';
  const url = buildJiraAttachmentUrl(attachmentData) || attachmentData?.content || '';

  return {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'Screen recording: ',
        marks: [{ type: 'strong' }]
      },
      {
        type: 'text',
        text: name,
        marks: url ? [{ type: 'link', attrs: { href: url } }] : undefined
      }
    ]
  };
};

// Embedded image media in issue description. Videos use Jira-style file media nodes.
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
          url: buildJiraAttachmentUrl(attachmentData)
        }
      }
    ]
  };
};

export const createVideoAttachmentDescriptionNodes = (attachmentData) => {
  const videoNode = createVideoAttachmentMediaNode(attachmentData);
  if (!videoNode) {
    return [createVideoAttachmentLinkNode(attachmentData)];
  }

  return [
    createScreenRecordingTitleNode(),
    videoNode
  ];
};

export const createVideoAttachmentLinkNodes = (attachmentData) => [
  createVideoAttachmentLinkNode(attachmentData)
];

/** After upload: embed images and Jira-style video media in the issue description. */
export const createAttachmentDescriptionNodes = (attachmentData) => {
  if (!isVideoAttachment(attachmentData)) {
    return [createEmbeddedImageNode(attachmentData)];
  }

  return createVideoAttachmentDescriptionNodes(attachmentData);
};

export const createAttachmentDescriptionNode = (attachmentData) =>
  createAttachmentDescriptionNodes(attachmentData)[0];

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
  
  // Add embedded images / video media for each attachment
  for (const attachmentData of uploadedAttachments) {
    const nodes = createAttachmentDescriptionNodes(attachmentData);
    newContent.push(...nodes);
    newContent.push(createEmptyParagraph());
  }
  
  return newContent;
};

// Main function to build complete ADF content from ticket data
export const buildAdfContent = (ticketData) => {
  // Build the main description content
  let descriptionContent = buildDescriptionContent(ticketData);
  
  // Add attachments if they exist
  if (ticketData.attachments && ticketData.attachments.length > 0) {
    descriptionContent = addAttachmentsSection(descriptionContent, ticketData.attachments);
  }
  
  // Return the complete ADF document structure
  return {
    version: 1,
    type: 'doc',
    content: descriptionContent
  };
};
