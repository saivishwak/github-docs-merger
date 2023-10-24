const axios = require('axios');
const fs = require('fs');
const path = require('path');

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
    for (const item of content) {
      if (item.type === 'file' && item.name.endsWith('.md')) {
        const fileUrl = item.download_url;
        const response = await axios.get(fileUrl, { responseType: 'stream' });

        if (response.status === 200) {
          // Create the directory path if it doesn't exist
          const filePath = path.join(__dirname, repoName, directoryPath, item.name);
          const directory = path.dirname(filePath);
          if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
          }

          const fileStream = fs.createWriteStream(filePath);
          response.data.pipe(fileStream);
          console.log(`Fetched: ${filePath}`);
        }
      } else if (item.type === 'dir') {
        // Recursively call the function for subdirectories
        await fetchMarkdownFiles(path.join(directoryPath, item.name));
      }
    }
  }
}

// Start fetching Markdown files from the root directory
fetchMarkdownFiles();

console.log('Fetching Markdown files...');