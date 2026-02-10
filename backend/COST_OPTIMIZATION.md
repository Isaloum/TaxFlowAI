# Cost Optimization Strategy

## Storage: Supabase Storage (FREE)
- **Plan**: Free tier = 1GB storage
- **Strategy**: 
  - Compress images before upload (50-70% size reduction)
  - Delete documents after 3 years (configurable retention)
  - Image optimization: convert HEIC → JPG, resize large PDFs

## OCR: Tesseract First, Google Vision Fallback
- **Primary**: Tesseract OCR (FREE, runs on server)
- **Fallback**: Google Cloud Vision API only if Tesseract confidence < 0.70
- **Cost**: $1.50 per 1,000 images (Vision API) - but most will use free Tesseract

## AI: GPT-4o-mini for Classification
- **Model**: `gpt-4o-mini` ($0.15 per 1M tokens vs $5 for GPT-4)
- **Strategy**:
  - Cache document classifications (same employer T4s look similar)
  - Batch processing (process 10 docs in one API call)
  - Estimated cost: ~$0.02 per 100 documents

## Database: Supabase Free Tier
- **Plan**: Free tier = 500MB database, 2GB bandwidth/month
- **Strategy**:
  - Store only extracted data (not raw images) in JSON
  - Paginate queries
  - Archive old tax years to separate cold storage table

## Total Estimated Monthly Cost (100 clients)
- Storage: $0 (within 1GB free tier)
- OCR: ~$5 (assuming 30% need Vision API fallback)
- AI Classification: ~$2
- Database: $0 (within free tier)
- **TOTAL: ~$7/month** (scales to $25/month at 500 clients)
