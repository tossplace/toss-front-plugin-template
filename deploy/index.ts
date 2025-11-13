import * as fs from "node:fs";
import * as path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: "ap-northeast-2",
});
const BUCKET_NAME = process.env.TOSSPLACE_BUCKET!;

export async function deploy() {
  const root = path.join(__dirname, "..");
  const files = fs.readdirSync(root, { withFileTypes: true });
  const metadata: any = {};
  for (const file of files) {
    if (file.isFile() && file.name.endsWith(".zip")) {
      const filePath = path.join(root, file.name);
      const timestamp = Date.now();
      const fileName = `versions/${timestamp}-${file.name}`;
      await uploadZip(filePath, fileName);
      metadata[file.name] = `/front-plugins/${fileName}`;
      console.log(`${fileName} 파일 업로드 완료`)
    }
  }
  await uploadMetadata(metadata);
}

async function uploadMetadata(metadata: any) {
  const jsonBody = JSON.stringify(metadata, null, 2);
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `front-plugins/template-metadata.json`,
    Body: jsonBody,
    ContentType: "application/json",
  });
  await s3.send(command);
}

async function uploadZip(filePath: string, fileName: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `front-plugins/${fileName}`,
    Body: fs.createReadStream(filePath),
    ContentType: "application/zip",
  });
  await s3.send(command);
}

deploy();
