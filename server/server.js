const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
require('dotenv').config();

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

// Define an array of exclusion keywords
const excludeKeywords = ["changelog", "excludeme"];

// Function to fetch all Markdown files recursively
async function fetchMarkdownFiles(username, repoName, directoryPath = "") {
  const apiUrl = `https://api.github.com/repos/${username}/${repoName}/contents/${directoryPath}`;
  const response = await axios.get(apiUrl, {
    headers: { Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}` },
  });

  if (response.status === 200) {
    const content = response.data;
    const markdownBuffers = [];

    for (const item of content) {
      const itemNameLowerCase = item.name.toLowerCase();
      const itemPathLowerCase = item.path.toLowerCase();
      const shouldExclude = excludeKeywords.some((keyword) => {
        return (
          itemNameLowerCase.includes(keyword) ||
          itemPathLowerCase.includes(keyword)
        );
      });

      if (item.type === "file" && item.name.endsWith(".md") && !shouldExclude) {
        const fileUrl = item.download_url;
        const response = await axios.get(fileUrl);

        if (response.status === 200) {
          // Collect the Markdown content as buffers
          markdownBuffers.push(Buffer.from(response.data, "utf-8"));
        }
      } else if (item.type === "dir") {
        // Recursively call the function for subdirectories
        const subDirectoryPath = path.join(directoryPath, item.name);
        const subMarkdownBuffers = await fetchMarkdownFiles(
          username,
          repoName,
          subDirectoryPath
        );
        markdownBuffers.push(...subMarkdownBuffers);
      }
    }

    return markdownBuffers;
  }
}

// Function to parse GitHub repo URL and extract username and repo name
function parseGitHubRepoUrl(repoUrl) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match && match.length === 3) {
    const username = match[1];
    const repoName = match[2];
    return [username, repoName];
  }
  return [null, null];
}

// Function to parse GitHub repo URL and extract username and repo name
function parseGitHubRepoUrl(repoUrl) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match && match.length === 3) {
    const username = match[1];
    const repoName = match[2];
    return [username, repoName];
  }
  return [null, null];
}

app.post("/merge-markdown", async (req, res) => {
  try {
    const { repoUrl } = req.body;
    console.log("Request received");
    const [username, repoName] = parseGitHubRepoUrl(repoUrl);
    if (!username || !repoName) {
      res.status(404).send("Malformed Github URL");
      return;
    }

    console.log("Username and Repo", username, repoName);

    const markdownBuffers = await fetchMarkdownFiles(username, repoName);

    // Function to merge Markdown buffers into a single Markdown buffer
    function mergeMarkdownBuffers(markdownBuffers) {
      return Buffer.concat(markdownBuffers);
    }

    const mergedMarkdownBuffer = mergeMarkdownBuffers(markdownBuffers);

    // Respond with the merged Markdown buffer
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", "attachment; filename=merged.md");
    res.send(mergedMarkdownBuffer);
  } catch (error) {
    res
      .status(500)
      .send({
        error: `An error occurred while merging Markdown files. ${error}`,
      });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
