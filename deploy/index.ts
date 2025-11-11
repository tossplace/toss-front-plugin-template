import * as fs from "node:fs";
import * as path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export async function deploy() {
  const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    region: "ap-northeast-2",
  });
  const root = path.join(__dirname, "..");
  const files = fs.readdirSync(root, { withFileTypes: true });

  for (const file of files) {
    if (file.isFile() && file.name.endsWith(".zip")) {
      const filePath = path.join(root, file.name);
      const command = new PutObjectCommand({
        Bucket: process.env.TOSSPLACE_BUCKET!,
        Key: `front-plugins/${file.name}`,
        Body: fs.createReadStream(filePath),
        ContentType: "application/zip",
      });
      await s3.send(command);
    }
  }
}

deploy();
