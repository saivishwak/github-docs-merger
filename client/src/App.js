import "./App.css";
import { useRef, useState } from "react";

function App() {
  const inputRef = useRef(null);
  const [downloadinProggress, setDownloadProgress] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleOnDownload = async (e) => {
    e.preventDefault();
    try {
      const repoUrl = inputRef.current.value;
      if (!repoUrl) {
        setAlertMessage("Input cannot be empty!");
        setShowAlert(true);
        return;
      }

      setDownloadProgress(true);

      // Make a POST request to the API with the repo URL
      const response = await fetch("http://localhost:5000/merge-markdown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
      });

      if (response.status === 200) {
        // Convert the response to a Blob
        const blob = await response.blob();

        // Create a Blob URL
        const blobUrl = window.URL.createObjectURL(blob);
        // Create a hidden anchor element
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = "merged-document.md";

        // Trigger a click event on the anchor to start the download
        link.click();

        // Clean up
        window.URL.revokeObjectURL(blobUrl);
      } else {
        console.error("Failed to merge Markdown files.");
      }
      setDownloadProgress(false);
    } catch (error) {
      console.error("An error occurred:", error);
      setDownloadProgress(false);
    }
  };

  return (
    <div className="bg-slate-900 h-screen w-screen flex flex-col justify-center items-center text-center">
      <div className="bg-gradient-to-b from-violet-600/[.15] via-transparent flex-grow w-full justify-center items-center text-center">
        <div className="flex flex-col max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8 items-center text-center justify-center">
          {showAlert ? (
            <div
              id="dismiss-alert"
              className="hs-removing:translate-x-5 hs-removing:opacity-0 transition duration-300 bg-red-50 border border-red-200 rounded-md p-4"
              role="alert"
            >
              <div class="flex">
                <div className="flex-shrink-0">
                  <svg
                    class="h-4 w-4 text-red-400 mt-0.5"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="text-sm text-red-800 font-medium">
                    {alertMessage}
                  </div>
                </div>
                <div className="pl-3 ml-auto">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                      data-hs-remove-element="#dismiss-alert"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowAlert(false);
                      }}
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg
                        className="h-3 w-3"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M0.92524 0.687069C1.126 0.486219 1.39823 0.373377 1.68209 0.373377C1.96597 0.373377 2.2382 0.486219 2.43894 0.687069L8.10514 6.35813L13.7714 0.687069C13.8701 0.584748 13.9882 0.503105 14.1188 0.446962C14.2494 0.39082 14.3899 0.361248 14.5321 0.360026C14.6742 0.358783 14.8151 0.38589 14.9468 0.439762C15.0782 0.493633 15.1977 0.573197 15.2983 0.673783C15.3987 0.774389 15.4784 0.894026 15.5321 1.02568C15.5859 1.15736 15.6131 1.29845 15.6118 1.44071C15.6105 1.58297 15.5809 1.72357 15.5248 1.85428C15.4688 1.98499 15.3872 2.10324 15.2851 2.20206L9.61883 7.87312L15.2851 13.5441C15.4801 13.7462 15.588 14.0168 15.5854 14.2977C15.5831 14.5787 15.4705 14.8474 15.272 15.046C15.0735 15.2449 14.805 15.3574 14.5244 15.3599C14.2437 15.3623 13.9733 15.2543 13.7714 15.0591L8.10514 9.38812L2.43894 15.0591C2.23704 15.2543 1.96663 15.3623 1.68594 15.3599C1.40526 15.3574 1.13677 15.2449 0.938279 15.046C0.739807 14.8474 0.627232 14.5787 0.624791 14.2977C0.62235 14.0168 0.730236 13.7462 0.92524 13.5441L6.59144 7.87312L0.92524 2.20206C0.724562 2.00115 0.611816 1.72867 0.611816 1.44457C0.611816 1.16047 0.724562 0.887983 0.92524 0.687069Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <div className="flex justify-center">
            <a
              className="group inline-block bg-white/[.05] hover:bg-white/[.1] border border-white/[.05] p-1 pl-4 rounded-full shadow-md"
              href="../figma.html"
            >
              <p className="mr-2 inline-block text-white text-sm">
                Github Document Merger
              </p>
            </a>
          </div>

          <div className="max-w-5xl text-center mx-auto">
            <h1 className="block font-medium text-gray-200 text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              Now it's easier than ever to analyze at Github Repo Docs
            </h1>
          </div>

          <div className="max-w-3xl text-center mx-auto">
            <p className="text-lg text-gray-400">
              Paste your Favorite Public Github Repo and click on download. Take
              the downloaded file to claude.ai for LLM based chat interface.
            </p>
          </div>

          <input
            type="text"
            className="py-3 px-4 bg-slate-50 block w-1/2 rounded-md text-sm border border-transparent outline-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
            placeholder="Enter Public Github Repo URL, ex. https://github.com/snabbdom/snabbdom"
            ref={inputRef}
          ></input>

          {downloadinProggress ? (
            <div
              className="max-w-xs bg-white border rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700"
              role="alert"
            >
              <div className="flex items-center p-4">
                <div
                  className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
                  role="status"
                  aria-label="loading"
                >
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="ml-3 text-sm text-gray-700 dark:text-gray-400">
                  Please wait a moment, we are preparing your download...
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <button
                className="inline-flex justify-center items-center gap-x-3 text-center bg-gradient-to-tl from-blue-600 to-violet-600 shadow-lg shadow-transparent hover:shadow-blue-700/50 border border-transparent text-white text-sm font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white py-3 px-6 dark:focus:ring-offset-gray-800"
                onClick={handleOnDownload}
              >
                Download
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
