import { createClient } from '@supabase/supabase-js';
// sharp & file-type are dynamic imports — they are External in esbuild
// (not bundled) and must not be imported at module level or Lambda crashes

// Validate required environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required for document storage');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'tax-documents';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
  'image/heif'
];

export class StorageService {
  /**
   * Extract file path from Supabase Storage URL
   */
  private static extractFilePath(fileUrl: string): string {
    const urlParts = fileUrl.split(`/${BUCKET_NAME}/`);
    if (urlParts.length < 2) {
      throw new Error('Invalid file URL');
    }
    return urlParts[1];
  }

  /**
   * Upload file to Supabase Storage with compression
   * Cost optimization: Compress images 50-70%
   */
  static async uploadDocument(
    file: Express.Multer.File,
    clientId: string,
    year: number,
    docType: string
  ): Promise<{ url: string; fileSize: number; mimeType: string }> {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Validate file type (dynamic import — not bundled)
    const { fromBuffer: fileTypeFromBuffer } = await import('file-type');
    const fileType = await fileTypeFromBuffer(file.buffer);
    if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType.mime)) {
      throw new Error(`Invalid file type. Allowed: PDF, JPG, PNG, HEIC`);
    }

    let buffer = file.buffer;
    let mimeType = fileType.mime;

    // COST OPTIMIZATION: Compress images (dynamic import — not bundled)
    if (fileType.mime.startsWith('image/')) {
      const sharp = (await import('sharp')).default;
      buffer = await sharp(file.buffer)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      mimeType = 'image/jpeg';
    }

    // Generate unique file path: clients/{clientId}/{year}/{docType}-{timestamp}.ext
    const timestamp = Date.now();
    const ext = mimeType === 'application/pdf' ? 'pdf' : 'jpg';
    const filePath = `clients/${clientId}/${year}/${docType}-${timestamp}.${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      fileSize: buffer.length,
      mimeType
    };
  }

  /**
   * Create a signed upload URL so the client can upload directly to Supabase
   * (bypasses API Gateway — no binary/multipart issues)
   */
  static async createSignedUploadUrl(
    clientId: string,
    year: number,
    docType: string,
    mimeType: string
  ): Promise<{ signedUrl: string; filePath: string }> {
    const timestamp = Date.now();
    const ext = mimeType === 'application/pdf' ? 'pdf' : 'jpg';
    const filePath = `clients/${clientId}/${year}/${docType}-${timestamp}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      throw new Error(`Failed to create upload URL: ${error?.message}`);
    }

    return { signedUrl: data.signedUrl, filePath };
  }

  /**
   * Get public URL for a file path
   */
  static getPublicUrl(filePath: string): string {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return data.publicUrl;
  }

  /**
   * Delete file from Supabase Storage
   */
  static async deleteDocument(fileUrl: string): Promise<void> {
    const filePath = this.extractFilePath(fileUrl);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Get signed download URL (expires in 1 hour)
   */
  static async getDownloadUrl(fileUrl: string): Promise<string> {
    const filePath = this.extractFilePath(fileUrl);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600); // 1 hour

    if (error) {
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }

    return data.signedUrl;
  }
}
