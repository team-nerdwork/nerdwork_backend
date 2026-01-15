import { Router, Request, Response, NextFunction } from "express";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { authenticate } from "../middleware/common/auth";

const router = Router();

const S3_REGION = "us-east-1";
const S3_BUCKET = "encryptedcomics-for-reactnative-frontend-12-01-2026-10-30";

const s3Client = new S3Client({
  region: S3_REGION,
});

function buildS3Key(params: { creatorId: string; fileName: string }): string {
  return ["creators", params.creatorId, params.fileName].join("/");
}

/**
 * @swagger
 * /mobile/comics/{creatorId}/{fileName}:
 *   get:
 *     summary: Stream an encrypted comic file for mobile clients
 *     description: >
 *       Streams an encrypted comic asset from the encrypted S3 bucket to the mobile client.
 *       The response body is the raw ciphertext. Decryption happens only on the client,
 *       using the metadata headers and the client's master key.
 *     tags:
 *       - Mobile Comics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: creatorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Creator identifier (matches the creators/ folder in S3)
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         description: File name of the encrypted comic asset (e.g. 1759833097900-wvcwx.jpg)
 *     responses:
 *       200:
 *         description: Encrypted comic stream
 *         headers:
 *           x-nerdwork-encryption:
 *             description: Encryption algorithm identifier (e.g. AES-256-GCM)
 *             schema:
 *               type: string
 *           x-nerdwork-iv:
 *             description: Base64-encoded IV used for AES-GCM
 *             schema:
 *               type: string
 *           x-nerdwork-auth-tag:
 *             description: Base64-encoded authentication tag for AES-GCM
 *             schema:
 *               type: string
 *           x-nerdwork-wrapped-key:
 *             description: Base64-encoded wrapped content key (derivable only with MASTER_KEY)
 *             schema:
 *               type: string
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Encrypted comic not found
 *       500:
 *         description: Failed to stream encrypted comic
 */
router.get(
  "/comics/:creatorId/:fileName",
  authenticate,
  async (req: Request, res: Response, _next: NextFunction) => {
    const { creatorId, fileName } = req.params;

    const s3Key = buildS3Key({ creatorId, fileName });

    try {
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
      });

      const s3Response = await s3Client.send(command);

      if (!s3Response.Body) {
        res.status(404).json({
          success: false,
          error: "Encrypted comic not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const contentType = s3Response.ContentType || "application/octet-stream";
      const contentLength = s3Response.ContentLength;

      res.setHeader("Content-Type", contentType);
      if (typeof contentLength === "number") {
        res.setHeader("Content-Length", contentLength.toString());
      }

      const metadata = s3Response.Metadata || {};

      if (metadata["encryption"]) {
        res.setHeader("x-nerdwork-encryption", metadata["encryption"]);
      }
      if (metadata["iv"]) {
        res.setHeader("x-nerdwork-iv", metadata["iv"]);
      }
      if (metadata["auth_tag"]) {
        res.setHeader("x-nerdwork-auth-tag", metadata["auth_tag"]);
      }
      if (metadata["wrapped_key"]) {
        res.setHeader("x-nerdwork-wrapped-key", metadata["wrapped_key"]);
      }

      console.info(
        JSON.stringify({
          scope: "mobileComicStream",
          bucket: S3_BUCKET,
          key: s3Key,
          status: "streaming",
        })
      );

      const bodyStream = s3Response.Body as NodeJS.ReadableStream;
      res.status(200);

      bodyStream.on("error", (err) => {
        console.error(
          JSON.stringify({
            scope: "mobileComicStream",
            bucket: S3_BUCKET,
            key: s3Key,
            status: "error",
            message: (err as Error).message,
          })
        );

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: "Failed to stream encrypted comic",
            timestamp: new Date().toISOString(),
          });
        } else {
          res.destroy(err as Error);
        }
      });

      bodyStream.pipe(res);
    } catch (err: any) {
      const name = err?.name;
      const httpStatus = err?.$metadata?.httpStatusCode;

      if (name === "NoSuchKey" || httpStatus === 404) {
        console.warn(
          JSON.stringify({
            scope: "mobileComicStream",
            bucket: S3_BUCKET,
            key: s3Key,
            status: "not_found",
          })
        );

        res.status(404).json({
          success: false,
          error: "Encrypted comic not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      console.error(
        JSON.stringify({
          scope: "mobileComicStream",
          bucket: S3_BUCKET,
          key: s3Key,
          status: "error",
          message: err?.message,
        })
      );

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: "Failed to stream encrypted comic",
          timestamp: new Date().toISOString(),
        });
      } else {
        res.end();
      }
    }
  }
);

export default router;

