"use client"
import React, {useState, useEffect, useCallback, useRef} from 'react'
import axios from 'axios'
import VideoCard from '../../../../components/VideoCard'
import { Video } from '../../../../types'


function Home() {
    const [videos, setVideos] = useState<Video[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoTitle, setVideoTitle] = React.useState("My Video");

    const fetchVideos = useCallback(async () => {
        try {
            const response = await axios.get("/api/videos")
            if(Array.isArray(response.data)) {
                setVideos(response.data)
            } else {
                throw new Error(" Unexpected response format");

            }
        } catch (error) {
            console.log(error);
            setError("Failed to fetch videos")

        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchVideos()
    }, [fetchVideos])

    const handleDownload = useCallback((url: string, title: string) => {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const fileUrl = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = `${title}.mp4`;
            link.target = "_self"; // This might not prevent new tab opening
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(fileUrl);
        })
        .catch(error => {
            console.error("Error fetching the file:", error);
        });
}, []);

  
  


    const handleDeleteVideo = useCallback(async (videoId: string) => {
      try {
        const deltedVideo = videos.find(video => video.id === videoId)
        if(deltedVideo){
          const response = await fetch("/api/video-delete", {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: videoId })
          });

          if (!response.ok) {
              throw new Error("Failed to delete video");
          }

          const data = await response.json();
          alert(`Video ${deltedVideo.title} deleted successfully`)
          setVideos(videos.filter(video => video.id !== videoId));
        }else{
          console.log("video not found");
          
        }
          
          
      } catch (error) {
          console.error("Error deleting video:", error);
      }
    }, [videos]);





    if(loading){
        return <div>Loading...</div>
    }

    return (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Videos</h1>
          {videos.length === 0 ? (
            <div className="text-center text-lg text-gray-500">
              No videos available
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {
                videos.map((video) => (
                    <VideoCard
                        key={video.id}
                        video={video}
                        onDownload={handleDownload}
                        onDelete={handleDeleteVideo}
                    />
                ))
                
              }
            </div>
          )}

        </div>

          
      );
}

export default Home