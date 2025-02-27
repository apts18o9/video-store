import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDNINARY_API_KEY,
    api_secret: process.env.CLOUDNINARY_API_SECRET
});

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Video ID not provided" }, { status: 400 });
        }

        // Fetch video details from database
        const video = await prisma.video.findUnique({ where: { id } });

        if (!video) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        // Delete video from Cloudinary
        await cloudinary.uploader.destroy(video.publicId);

        // Delete video from database
        await prisma.video.delete({ where: { id } });

        return NextResponse.json({ message: "Video deleted successfully" });
    } catch (error) {
        console.error("Error deleting video:", error);
        return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
