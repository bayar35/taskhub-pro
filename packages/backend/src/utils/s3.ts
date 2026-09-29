import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
import crypto from 'crypto';

const s3 = new S3Client({
  region: env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimetype: string,
  organizationId: string
): Promise<{ url: string; filename: string }> {
  const ext = originalName.split('.').pop();
  const filename = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
  const key = `organizations/${organizationId}/files/${filename}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ACL: 'private',
    })
  );

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: env.AWS_S3_BUCKET!, Key: key }),
    { expiresIn: 3600 } // 1 цаг
  );

  return { url, filename };
}

export async function deleteFile(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET!,
      Key: key,
    })
  );
}