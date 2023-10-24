const axios = require('axios');
const markdownpdf = require('markdown-pdf');
const PDFMerger = require('pdf-merger-js');
const fs = require('fs');
const path = require('path');

// var md = "foo===\n* bar\n* baz\n\nLorem ipsum dolor sit"
//   , outputPath = "doc.pdf"

// markdownpdf().from.string(md).to.buffer(function (erro, stream) {
//   console.log("Created", stream)
// })

// Replace with your GitHub username, repo name, and personal access token
const username = 'snabbdom';
const repoName = 'snabbdom';
const token = '';

// Function to fetch all Markdown files recursively
async function fetchMarkdownFiles(directoryPath = '') {
  const apiUrl = `https://api.github.com/repos/${username}/${repoName}/contents/${directoryPath}`;
  const response = await axios.get(apiUrl, {
    headers: { Authorization: `token ${token}` },
  });

  if (response.status === 200) {
    const content = response.data;
    const markdownBuffers = [];

    for (const item of content) {
      if (item.type === 'file' && item.name.endsWith('.md')) {
        const fileUrl = item.download_url;
        const response = await axios.get(fileUrl);

        if (response.status === 200) {
          // Convert Markdown content to a buffer
          const markdownBuffer = Buffer.from(response.data, 'utf-8');
          markdownBuffers.push(markdownBuffer);
        }
      } else if (item.type === 'dir') {
        // Recursively call the function for subdirectories
        const subDirectoryPath = path.join(directoryPath, item.name);
        const subMarkdownBuffers = await fetchMarkdownFiles(subDirectoryPath);
        markdownBuffers.push(...subMarkdownBuffers);
      }
    }

    return markdownBuffers;
  }
}


// Function to merge Markdown buffers into a single Markdown buffer
function mergeMarkdownBuffers(markdownBuffers) {
  return Buffer.concat(markdownBuffers);
}

// Function to convert Markdown buffers to a PDF buffer
async function convertMarkdownToPDF(markdownBuffers) {
  return new Promise((resolve) => {
    const pdfMerger = new PDFMerger();

    async function convertAndMerge(index) {
      if (index < markdownBuffers.length) {
        const markdownText = markdownBuffers[index].toString('utf-8');
        const pdfBuffer = await new Promise((resolve) => {
          markdownpdf()
            .from.string(markdownText)
            .to.buffer((_err, pdfBuffer) => {
              resolve(pdfBuffer);
            });
        });

        if (pdfBuffer) {
          pdfMerger.add(pdfBuffer);
        }

        convertAndMerge(index + 1);
      } else {
        pdfMerger.saveAsBuffer().then(mergedPDFBuffer => {
          resolve(mergedPDFBuffer);
        });
      }
    }

    convertAndMerge(0);
  });
}

// Start fetching Markdown files from the root directory
fetchMarkdownFiles().then((markdownBuffers) => {
//   convertMarkdownToPDF(markdownBuffers).then((mergedPDFBuffer) => {
//     // Save the merged PDF to a file or do something else with it
//     console.log("***", mergedPDFBuffer);
//     fs.writeFileSync('merged.pdf', mergedPDFBuffer);
//     console.log('All Markdown files have been converted to a single PDF.');
//   });
const mergedMarkdown = mergeMarkdownBuffers(markdownBuffers);

  // Save the merged Markdown to a file or do something else with it
  fs.writeFileSync('merged.md', mergedMarkdown);
  console.log('All Markdown files have been merged into a single Markdown file.');
});
