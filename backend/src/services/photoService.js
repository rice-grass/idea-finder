import sharp from 'sharp';

class PhotoService {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.maxDimension = 1024; // 최대 가로/세로 크기
    this.allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  }

  /**
   * 업로드된 사진 처리
   * @param {Buffer} fileBuffer - 파일 버퍼
   * @param {string} mimetype - MIME 타입
   * @returns {Promise<Object>} 처리 결과
   */
  async processUpload(fileBuffer, mimetype) {
    try {
      // 1. MIME 타입 검증
      if (!this.allowedMimeTypes.includes(mimetype)) {
        throw new Error('지원하지 않는 파일 형식입니다. JPG, PNG, WEBP만 가능합니다.');
      }

      // 2. 파일 크기 검증
      if (fileBuffer.length > this.maxFileSize) {
        throw new Error('파일 크기가 10MB를 초과합니다.');
      }

      // 3. 이미지 메타데이터 추출
      const metadata = await sharp(fileBuffer).metadata();

      // 4. 이미지 리사이즈 (너무 크면)
      let processedBuffer = fileBuffer;
      if (metadata.width > this.maxDimension || metadata.height > this.maxDimension) {
        processedBuffer = await sharp(fileBuffer)
          .resize(this.maxDimension, this.maxDimension, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 85 })
          .toBuffer();
      }

      return {
        success: true,
        buffer: processedBuffer,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: processedBuffer.length
        }
      };
    } catch (error) {
      console.error('Error processing photo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 이미지를 Base64로 변환
   * @param {Buffer} buffer - 이미지 버퍼
   * @returns {string} Base64 인코딩된 문자열
   */
  convertToBase64(buffer) {
    return buffer.toString('base64');
  }

  /**
   * EXIF 메타데이터 추출
   * @param {Buffer} buffer - 이미지 버퍼
   * @returns {Promise<Object>} EXIF 데이터
   */
  async extractMetadata(buffer) {
    try {
      const metadata = await sharp(buffer).metadata();

      return {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation,
        // EXIF 데이터는 sharp에서 기본적으로 제공하지 않음
        // 필요시 exif-parser 등의 라이브러리 추가 필요
      };
    } catch (error) {
      console.error('Error extracting metadata:', error);
      return {};
    }
  }

  /**
   * 이미지 최적화 (화질 및 용량 조절)
   * @param {Buffer} buffer - 원본 이미지 버퍼
   * @param {number} quality - 품질 (0-100)
   * @returns {Promise<Buffer>} 최적화된 이미지 버퍼
   */
  async optimizeImage(buffer, quality = 80) {
    try {
      return await sharp(buffer)
        .jpeg({ quality, progressive: true })
        .toBuffer();
    } catch (error) {
      console.error('Error optimizing image:', error);
      return buffer;
    }
  }

  /**
   * 썸네일 생성
   * @param {Buffer} buffer - 원본 이미지 버퍼
   * @param {number} size - 썸네일 크기 (정사각형)
   * @returns {Promise<Buffer>} 썸네일 버퍼
   */
  async createThumbnail(buffer, size = 300) {
    try {
      return await sharp(buffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 70 })
        .toBuffer();
    } catch (error) {
      console.error('Error creating thumbnail:', error);
      return buffer;
    }
  }

  /**
   * 파일 검증
   * @param {Object} file - Multer 파일 객체
   * @returns {Object} 검증 결과
   */
  validateFile(file) {
    const errors = [];

    if (!file) {
      errors.push('파일이 업로드되지 않았습니다.');
      return { valid: false, errors };
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      errors.push('지원하지 않는 파일 형식입니다. JPG, PNG, WEBP만 가능합니다.');
    }

    if (file.size > this.maxFileSize) {
      errors.push('파일 크기가 10MB를 초과합니다.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 이미지에서 주요 색상 추출 (간단 버전)
   * @param {Buffer} buffer - 이미지 버퍼
   * @returns {Promise<Object>} 색상 정보
   */
  async extractDominantColors(buffer) {
    try {
      const { dominant } = await sharp(buffer)
        .resize(100, 100, { fit: 'cover' })
        .toBuffer({ resolveWithObject: true })
        .then(({ data, info }) => {
          // 간단한 색상 추출 (중앙 픽셀)
          const centerPixel = Math.floor(data.length / 2);
          return {
            dominant: {
              r: data[centerPixel],
              g: data[centerPixel + 1],
              b: data[centerPixel + 2]
            }
          };
        });

      return dominant;
    } catch (error) {
      console.error('Error extracting colors:', error);
      return { r: 128, g: 128, b: 128 }; // 기본 회색
    }
  }
}

// Singleton pattern
let photoServiceInstance = null;

export const getPhotoService = () => {
  if (!photoServiceInstance) {
    photoServiceInstance = new PhotoService();
  }
  return photoServiceInstance;
};

export default getPhotoService;
