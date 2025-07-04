"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary";
import { Download, Clock, FileDown, FileUp, Delete } from "lucide-react";
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime"
import { filesize } from "filesize"
import { Video } from '../types';

dayjs.extend(relativeTime)

interface VideoCardProps {
    video: Video;
    onDownload: (url: string, title: string) => void;
    onDelete: (videoId: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false)
    const [previewError, setPreviewError] = useState(false)
    const [isVideoLoading, setIsVideoLoading] = useState(false); // New state for video loading

    const getThumbnailUrl = useCallback((publicId: string) => {
        return getCldImageUrl({
            src: publicId,
            width: 400,
            height: 225,
            crop: "fill",
            gravity: "auto",
            format: "jpg",
            quality: "auto",
            assetType: "video"
        })
    }, [])

    const getFullVideoUrl = useCallback((publicId: string) => {
        return getCldVideoUrl({
            src: publicId,
            width: 1920,
            height: 1080,
        })
    }, [])

    const getPreviewVideoUrl = useCallback((publicId: string) => {
        return getCldVideoUrl({
            src: publicId,
            width: 400,
            height: 225,
            rawTransformations: ["e_preview:duration_15:max_seg_9:min_seg_dur_1", "f_mp4", "q_auto"]
        })
    }, [])

    const formatSize = useCallback((size: number) => {
        return filesize(size)
    }, [])

    const formatDuration = useCallback((seconds: number) => {
        if (isNaN(seconds) || seconds < 0) return "Unknown";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }, []);

    const compressionPercentage = Math.round(
        (1 - Number(video.compressedSize) / Number(video.originalSize)) * 100
    );

    useEffect(() => {
        if (!isHovered) {
            setPreviewError(false);
            setIsVideoLoading(false);
        } else {
            setIsVideoLoading(true);
        }
    }, [isHovered]);

    const handlePreviewLoad = () => {
        setIsVideoLoading(false);
    };

    const handlePreviewError = () => {
        setPreviewError(true);
        setIsVideoLoading(false);
    };

    const handleDownloadClick = () => {
        try {
            onDownload(getFullVideoUrl(video.publicId), video.title);
        } catch (error) {
            console.error("Error initiating download:", error);
        }
    };

    const handleDeleteClick = () => {
        try {
            onDelete(video.id);
        } catch (error) {
            console.error("Error initiating delete:", error);
        }
    };

    return (
        <div
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <figure className="aspect-video relative w-full bg-gray-900 flex items-center justify-center">
                {isHovered ? (
                    previewError ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                            <p className="text-red-500">Preview not available</p>
                        </div>
                    ) : (
                        <>
                            {isVideoLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-70 text-white">
                                    Loading preview...
                                </div>
                            )}
                            <video
                                src={getPreviewVideoUrl(video.publicId)}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoLoading ? 'opacity-0' : 'opacity-100'}`}
                                onLoadedData={handlePreviewLoad}
                                onError={handlePreviewError}
                            />
                        </>
                    )
                ) : (
                    <img
                        src={getThumbnailUrl(video.publicId)}
                        alt={video.title}
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute bottom-2 right-2 bg-base-100 bg-opacity-70 px-2 py-1 rounded-lg text-sm flex items-center">
                    <Clock size={16} className="mr-1" />
                    {formatDuration(video.duration)}
                </div>
            </figure>
            <div className="card-body p-4">
                <h2 className="card-title text-lg font-bold">{video.title}</h2>
                <p className="text-sm text-base-content opacity-70 mb-4 line-clamp-2">
                    {video.description}
                </p>
                <p className="text-sm text-base-content opacity-70 mb-4">
                    Uploaded {dayjs(video.createdAt).fromNow()}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                        <FileUp size={18} className="mr-2 text-primary" />
                        <div>
                            <div className="font-semibold">Original</div>
                            <div>{formatSize(Number(video.originalSize))}</div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <FileDown size={18} className="mr-2 text-secondary" />
                        <div>
                            <div className="font-semibold">Compressed</div>
                            <div>{formatSize(Number(video.compressedSize))}</div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm font-semibold mr-10">
                        Compression:{" "}
                        <span className="text-accent">{compressionPercentage}%</span>
                    </div>
                   
                    <div className="flex items-center "> 
                        <button
                            className="btn btn-primary btn-sm mr-10"
                            onClick={handleDownloadClick}
                        >
                            <Download size={16} />
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleDeleteClick}
                        >
                            <Delete size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VideoCard;