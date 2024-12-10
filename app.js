const getVideosApiUrl = "https://prod-29.northcentralus.logic.azure.com:443/workflows/6915e0be1ea642ca80119b5c1381945f/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=WOdvf1MPlUD7Bzl3935RmCg-CmrQ3D6ehZ1vw_3FjrI";
const postVideoApiUrl = "https://prod-13.northcentralus.logic.azure.com:443/workflows/98d6f8e935614cf9a863c2c2830481a9/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=Bt9pbNB3u1gdL5oeEzhBvK0WZWmSIqDvXKuG4Bk6SJU";
const deleteVideoApiUrl = "https://prod-17.northcentralus.logic.azure.com/workflows/1b7b2aac4b8c45108a002b9f50a51278/triggers/When_a_HTTP_request_is_received/paths/invoke/videos/%7Bid%7D?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=zbZuDscdTxoTQNObSdcNHph-mI12AZf6DRD_YwesXBk";
const getSpecificVideoApiUrl = "https://prod-20.northcentralus.logic.azure.com/workflows/3ec4777aaa3240fa961cdd5189befb58/triggers/When_a_HTTP_request_is_received/paths/invoke/videos/%7Bid%7D?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=l5BDGpCCUlQX06nD_ApvtecvJog0PM0JZixjLXcKMp8";

document.addEventListener("DOMContentLoaded", () => {
  const videoGallery = document.querySelector(".video-list");
  const videoPlayer = document.getElementById("video-player");
  const videoSource = document.getElementById("video-source");
  const uploadForm = document.getElementById("upload-form");

  // Fetch and display videos
  function fetchVideos() {
    videoGallery.innerHTML = "Loading videos...";
    fetch(getVideosApiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.Table1 && data.Table1.length > 0) {
          videoGallery.innerHTML = "";
          data.Table1.forEach((video) => {
            const videoCard = document.createElement("div");
            videoCard.className = "video-card";
            videoCard.innerHTML = `
              <h3>${video.Title}</h3>
              <p>Genre: ${video.Genre}</p>
              <p>Producer: ${video.Producer}</p>
              <p>Age Rating: ${video.AgeRating}</p>
              <button onclick="playVideo('${video.VideoUrl}')">Play</button>
              <button onclick="deleteVideo(${video.VideoID})">Delete</button>
            `;
            videoGallery.appendChild(videoCard);
          });
        } else {
          videoGallery.innerHTML = "<p>No videos available</p>";
        }
      })
      .catch((error) => {
        console.error("Error fetching videos:", error);
        videoGallery.innerHTML = "<p>Error loading videos</p>";
      });
  }

  // Play video
  window.playVideo = (videoUrl) => {
    videoSource.src = videoUrl;
    videoPlayer.load();
    videoPlayer.play();
  };

  window.deleteVideo = (videoId) => {
    const deleteUrl = deleteVideoApiUrl.replace("%7Bid%7D", videoId); // Replace the placeholder with the actual videoId
  
    fetch(deleteUrl, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          alert("Video deleted successfully.");
          fetchVideos(); // Refresh the video list
        } else {
          alert("Error deleting video.");
          console.error("Failed response:", response.statusText);
        }
      })
      .catch((error) => {
        console.error("Error deleting video:", error);
        alert("Error deleting video.");
      });
  };
  

  // Upload video
  uploadForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const videoData = {
      title: document.getElementById("title").value,
      genre: document.getElementById("genre").value,
      producer: document.getElementById("producer").value,
      ageRating: document.getElementById("age-rating").value,
      videoUrl: document.getElementById("videoUrl").value
    };

    fetch(postVideoApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(videoData),
    })
      .then((response) => {
        if (response.ok) {
          alert("Video uploaded successfully.");
          fetchVideos();
        } else {
          alert("Error uploading video.");
        }
      })
      .catch((error) => {
        console.error("Error uploading video:", error);
        alert("Error uploading video.");
      });
  });

  // Play video function
  function playVideo(videoUrl) {
    videoSource.src = videoUrl;
    videoPlayer.load();
    videoPlayer.play();
  }

  // Search video by ID
  function searchVideo(videoId) {
    const searchUrl = getSpecificVideoApiUrl.replace("%7Bid%7D", videoId);

    fetch(searchUrl, {
      method: "GET",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then((data) => {
            document.getElementById("search-result").innerHTML =
              `<p style="color: red;">Error: ${data.error.message}</p>`;
          });
        }
      })
      .then((data) => {
        if (data && data.Title) {
          document.getElementById("search-result").innerHTML = `
            <div class="video-card">
              <h3>${data.Title}</h3>
              <p><strong>Genre:</strong> ${data.Genre}</p>
              <p><strong>Producer:</strong> ${data.Producer}</p>
              <p><strong>Age Rating:</strong> ${data.AgeRating}</p>
              <button id="play-searched-video">Play Video</button>
            </div>
          `;

          // Add event listener to play button for the searched video
          document
            .getElementById("play-searched-video")
            .addEventListener("click", () => {
              if (data.VideoUrl) {
                playVideo(data.VideoUrl);
              } else {
                alert("Video URL is not available.");
              }
            });
        } else {
          document.getElementById("search-result").innerHTML =
            "<p>No video found with the provided ID.</p>";
        }
      })
      .catch((error) => {
        document.getElementById("search-result").innerHTML =
          "<p style='color: red;'>An error occurred while searching for the video.</p>";
      });
  }

  // Attach search form handler
  document
    .getElementById("search-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const videoId = document.getElementById("search-id").value.trim();
      if (videoId) {
        searchVideo(videoId);
      } else {
        document.getElementById("search-result").innerHTML =
          "<p style='color: red;'>Please enter a valid Video ID.</p>";
      }
    });
  

  // Initial load
  fetchVideos();
});
