import * as fs from "node:fs";
import * as path from "node:path";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {RemoteCloudFront} from "./cloud-front";

const BUCKET_NAME = process.env.TOSSPLACE_BUCKET!;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;
const s3 = new S3Client({
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
    region: "ap-northeast-2",
});
const cloudFront = new RemoteCloudFront({
    bucket: BUCKET_NAME,
    region: "ap-northeast-2",
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});

export async function deploy() {
    const root = path.join(__dirname, "..");
    const files = fs.readdirSync(root, {withFileTypes: true});
    const metadata: any = {};
    const paths = [];
    for (const file of files) {
        if (file.isFile() && file.name.endsWith(".zip")) {
            const filePath = path.join(root, file.name);
            const timestamp = Date.now();
            const key = `front-plugins/versions/${timestamp}-${file.name}`
            await uploadZip(filePath, key);
            metadata[file.name.replace(".zip", "")] = key;
            console.log(`${JSON.stringify(metadata)} 파일 업로드 완료`)
            paths.push(key)
        }
    }
    const key = await uploadMetadata(metadata);
    paths.push(key)
    await cloudFront.invalidation(paths)
}

async function uploadMetadata(metadata: any) {
    const jsonBody = JSON.stringify(metadata, null, 2);
    const key = `front-plugins/template-metadata.json`;
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: jsonBody,
        ContentType: "application/json",
    });
    await s3.send(command);
    return key
}

async function uploadZip(filePath: string, key: string) {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fs.createReadStream(filePath),
        ContentType: "application/zip",
    });
    await s3.send(command);
}

deploy();
