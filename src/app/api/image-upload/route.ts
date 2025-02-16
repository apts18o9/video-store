import { v2 as cloudinary, UploadApiErrorResponse } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import {auth} from "@clerk/nextjs/server"
import { resolve } from 'path';

require('dotenv').config(); 


// Configuration
cloudinary.config({ 
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


interface CloudinaryUploadResult{
    public_id: string;
    [key: string]: any
}


export async function POST(request: NextRequest){
    const {userId} = auth();

    if(!userId){
        return NextResponse.json({error: "unauthorized"}, {status: 401});
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if(!file){
            return NextResponse.json({error: "file not found"}, {status: 400});
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {folder: "next-cloudinary-uploads"},
                    (error, result) => {
                        if(error) reject(error)
                        else resolve(result as CloudinaryUploadResult)
                    }
                )
                uploadStream.end(buffer)
            }
        )

        return NextResponse.json({publicId: result.public_id}, {status: 200})


    } catch (error) {
        return NextResponse.json({error: "upload image failed"}, {status: 500})
    }
}