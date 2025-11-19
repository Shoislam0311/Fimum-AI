# Fimum AI Platform - Requirements Specification

**Document Version**: 1.0.0  
**Last Updated**: November 19, 2025  
**Status**: Production Ready  
**Classification**: Internal - Engineering

---

## 1. Executive Summary

Fimum AI is a production-grade, multi-model AI integration platform that orchestrates 13+ specialized language models and a **self-hosted, completely free image generation system** through OpenRouter API, delivering a ChatGPT-level experience with proprietary implementations of web search, image generation/editing, and OTP authentication—**zero external API dependencies beyond OpenRouter**.

---

## 2. Functional Requirements

### 2.1 Multi-Model AI Integration

#### 2.1.1 Coding Assistant (Agentic Workflow)
- **FR-CODE-001**: Implement orchestration of 5 coding models with dynamic routing and fallback mechanisms:
  - `kwaipilot/kat-coder-pro:free` (primary, weight: 1.3, priority: 1)
  - `qwen/qwen3-coder:free` (specialized, weight: 1.1, priority: 2)
  - `moonshotai/kimi-k2:free` (vision-capable, weight: 1.2, priority: 1)
  - `agentica-org/deepcoder-14b-preview:free` (agentic, weight: 1.5, priority: 0)
  - `z-ai/glm-4.5-air:free` (multilingual, weight: 0.9, priority: 2)

- **FR-CODE-002**: Enable autonomous agentic workflow that detects requirements and automatically calls:
  - Text generation models for documentation/comments
  - **Image generation system** for logos, diagrams, UI mockups (when `include_logo: true` or image context detected)
  - Research models for API documentation and best practices

- **FR-CODE-003**: Support 50+ programming languages with syntax highlighting and execution

- **FR-CODE-004**: Provide sandboxed code execution via Docker containers with security isolation

#### 2.1.2 General Chat & Reasoning
- **FR-CHAT-001**: Integrate 3 vision-capable models for multimodal conversations with document/image understanding

#### 2.1.3 Deep Research System
- **FR-RES-001**: Orchestrate 4 research models in parallel for comprehensive knowledge synthesis

### 2.2 Image Generation & Editing (Free & Self-Hosted)

#### 2.2.1 Free Alternative: Stable Diffusion XL Implementation
- **FR-IMG-001**: Deploy **Stability AI's Stable Diffusion XL 1.0 Base + Refiner** as the free, open-source alternative:
  - **Base Model**: `stabilityai/stable-diffusion-xl-base-1.0` (3.5B parameters)
  - **Refiner Model**: `stabilityai/stable-diffusion-xl-refiner-1.0` (6.6B parameters)
  - **License**: CreativeML Open RAIL++-M License (commercial-friendly)
  - **Source**: Download from Hugging Face Hub during setup

- **FR-IMG-002**: Implement using **Diffusers library** for state-of-the-art pipeline:
  - Text-to-image pipeline with custom scheduler (DPMSolverMultistep for speed)
  - Image-to-image editing with strength control
  - Inpainting pipeline with mask support
  - Outpainting capability via tiled diffusion
  - Upscaling with Stable Diffusion Upscaler (`stabilityai/stable-diffusion-x4-upscaler`)

- **FR-IMG-003**: Support resolutions from 512x512 to **4096x4096 (4K) ** with ** memory-efficient attention **:
  - Use `torch.compile()` for 2x speedup
  - Implement symmetric tiling for large images
  - Enable CPU offloading for low-VRAM GPUs
  - Support batch processing (1-8 images) with dynamic batching

#### 2.2.2 Generation Features
- ** FR-IMG-004 **: Provide ** text-to-image ** with advanced parameters:
  - Prompt: Positive text description (max 1000 chars)
  - Negative prompt: Exclusion terms (blurry, low quality, watermark, text, distortion)
  - Width/Height: 512-4096 pixels (in 64-pixel increments)
  - Steps: 20-100 (default 50 for quality/speed balance)
  - Guidance Scale: 1.0-15.0 (default 7.5)
  - Scheduler: DPMSolverMultistep, Euler, LMS (user selectable)
  - Seed: Integer for reproducibility
  - Style presets: photorealistic, anime, artistic, technical-diagram, logo, sketch, cinematic

- **FR-IMG-005**: Implement **image-to-image editing**:
  - Accept base64-encoded input image (PNG/JPEG, max 10MB)
  - Strength parameter: 0.0-1.0 (how much to change original)
  - Preserve original metadata when requested

- **FR-IMG-006**: Enable **inpainting/outpainting**:
  - Accept mask base64 (black/white PNG where white = edit region)
  - Support outpainting by extending canvas with content-aware fill
  - Provide brush tool in UI for mask creation

#### 2.2.3 API Endpoints
- **FR-IMG-007**: Create RESTful endpoints:
  ```http
  POST /api/v1/image/generate
  Content-Type: application/json
  
  {
    "prompt": "A futuristic cyberpunk city at sunset, neon lights, flying cars, 4k, photorealistic",
    "negative_prompt": "blurry, low quality, watermark, text, distortion",
    "width": 1024,
    "height": 1024,
    "steps": 50,
    "guidance_scale": 7.5,
    "scheduler": "DPMSolverMultistep",
    "seed": 42,
    "style_preset": "photorealistic"
  }
  ```

  ```http
  POST /api/v1/image/edit
  Content-Type: multipart/form-data
  
  image_base64: <base64_encoded_image>
  mask_base64: <base64_encoded_mask>
  prompt: "Change the sky to a starry night"
  strength: 0.8
  preserve_original: true
  ```

- **FR-IMG-008**: Return response with:
  - Generated image base64
  - Metadata: seed, generation time, model version, VRAM used
  - Thumbnail preview (256x256)

#### 2.2.4 Optimization & Hardware
- **FR-IMG-009**: Ensure **GPU acceleration** requirements:
  - Minimum: NVIDIA GPU with 8GB VRAM (RTX 3060)
  - Recommended: 12GB+ VRAM for 1024x1024 (RTX 3070/4060)
  - Optimal: 24GB VRAM for 4K generation (RTX 4090, A10G)
  - CPU fallback: Generate 512x512 in < 5 minutes (not recommended for production)

- **FR-IMG-010**: Implement **memory optimizations**:
  - Gradient checkpointing to reduce VRAM usage by 30%
  - FP16 precision for 2x speedup and 50% memory reduction
  - Model weight offloading to RAM when VRAM exhausted
  - Sequential CPU offload for systems with < 8GB VRAM

#### 2.2.5 File Management & Caching
- **FR-IMG-011**: Store generated images in **local file system** with structure:
  ```
  /app/data/images/{user_id}/{year}/{month}/
  ├── {uuid}_original.png (full resolution)
  ├── {uuid}_thumbnail.jpg (256x256)
  └── metadata.json (prompt, seed, parameters, timestamp)
  ```

- **FR-IMG-012**: Cache generated images in **Redis** with TTL: 86400 seconds (24 hours)

- **FR-IMG-013**: Implement **duplicate detection** using perceptual hashing (pHash) to avoid regenerating identical images

#### 2.2.6 Security & Safety
- **FR-IMG-014**: Integrate **NSFW content filtering** using safety checker from Diffusers:
  - Block generation of explicit/adult content
  - Return 400 Bad Request with clear error message
  - Log attempts for audit (without storing prompt)

- **FR-IMG-015**: Validate file uploads:
  - Max size: 10MB per image
  - Allowed types: image/png, image/jpeg, image/webp
  - Scan for embedded malicious code

- **FR-IMG-016**: Apply **rate limiting**: 5 images/day (Free), 100 images/day (Pro), Unlimited (Enterprise)

### 2.3 Web Search Engine (Proprietary Implementation)
- **FR-SEA-001**: Build real-time web crawler using Scrapy with 1000 pages/minute capacity

- **FR-SEA-002**: Implement semantic search using Whoosh + Sentence-Transformers

- **FR-SEA-003**: Provide advanced filtering: date range, domain, file type, language (50+ languages)

- **FR-SEA-004**: Generate source citations with credibility scoring

### 2.4 User Interface & Experience

#### 2.4.1 Core UI Components
- **FR-UI-001**: Build ChatGPT-style interface with message bubbles, timestamps, and model attribution

- **FR-UI-002**: Implement responsive design with WCAG 2.1 AA accessibility compliance

- **FR-UI-003**: Use professional color scheme: `#0066CC` primary, `#F8F9FA` background

#### 2.4.2 Image Generation UI
- **FR-UI-004**: Create dedicated image generation panel with:
  - Prompt builder with template suggestions
  - Negative prompt assistant
  - Real-time parameter sliders (steps, guidance, strength)
  - Style preset gallery with previews
  - Seed randomization/locking toggle
  - Batch generation queue (up to 8 images)
  - Gallery view with infinite scroll
  - One-click regenerate with same parameters
  - Download buttons (PNG/WebP format)
  - Share to conversation button

- **FR-UI-005**: Implement **image editor** with:
  - Canvas for inpainting mask drawing
  - Brush size slider and eraser tool
  - Zoom and pan controls
  - Before/after comparison slider
  - Undo/redo history (10 steps)

#### 2.4.3 Rich Text Editor
- **FR-UI-006**: Support markdown with live preview and syntax highlighting

- **FR-UI-007**: Enable drag-and-drop file upload (documents/images up to 10MB)

- **FR-UI-008**: Provide voice input capability with keyboard shortcuts

### 2.5 Authentication & User Management

#### 2.5.1 OTP-Based Authentication
- **FR-AUTH-001**: Generate 6-digit OTPs with 10-minute expiry using PyOTP

- **FR-AUTH-002**: Send OTP via email (SMTP) and SMS (SMPP/GSM modem)

- **FR-AUTH-003**: Rate limit OTP requests to 3 per 15 minutes per user

#### 2.5.2 JWT Security
- **FR-AUTH-004**: Issue access tokens (JWT) with 60-minute expiry and refresh tokens with 7-day expiry

- **FR-AUTH-005**: Implement token revocation list in Redis

#### 2.5.3 Subscription Tiers
- **FR-AUTH-006**: Manage three tiers:
  - **Free**: 100 requests/min, **5 images/day**, 10 research/day
  - **Pro**: 1000 requests/min, **100 images/day**, unlimited research
  - **Enterprise**: Unlimited requests, **unlimited images**, unlimited research + SAML SSO

---

## 3. Non-Functional Requirements

### 3.1 Performance Requirements

| Metric | Target | Measurement Condition | Status |
|--------|--------|----------------------|--------|
| Image Gen (512x512) | < 15s | GPU RTX 3060 (12GB) | ✅ Critical |
| Image Gen (1024x1024) | < 45s | GPU RTX 3060 (12GB) | ✅ Critical |
| 4K Image Generation | < 120s | GPU RTX 4090 (24GB) | ⚠️ Acceptable |
| Batch Generation (4x) | < 2x single time | GPU RTX 4090 | ✅ Important |
| Image Thumbnail Gen | < 2s | CPU | ✅ Important |
| NSFW Check Latency | < 500ms | CPU | ✅ Important |
| API Uptime | 99.9% | Monthly SLA | ✅ Critical |
| Cache Hit Rate | > 80% | Production | ✅ Important |

### 3.2 Scalability Requirements
- **NF-SCL-001**: Support horizontal scaling of image workers to 20+ GPU nodes

- **NF-SCL-002**: Implement queue-based architecture using Celery + Redis for image tasks

- **NF-SCL-003**: Enable multi-GPU inference on single node (model parallelism)

### 3.3 Security Requirements
- **NF-SEC-001**: Implement OWASP Top 10 protection:
  - Input validation on all endpoints (Pydantic)
  - XSS prevention via React auto-escaping
  - Rate limiting on image endpoints (5/day Free, 100/day Pro)

- **NF-SEC-002**: Store secrets in environment variables or Vault; never in code

- **NF-SEC-003**: Encrypt data at rest (AES-256) and in transit (TLS 1.3)

---

## 4. Technical Requirements

### 4.1 Image Generation Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Diffusers | 0.30+ | Stable Diffusion pipelines |
| ML Framework | PyTorch | 2.3+ | Model inference |
| GPU Acceleration | CUDA | 12.1+ | NVIDIA GPU support |
| Memory Opt | xFormers | 0.0.23+ | Efficient attention |
| Scheduler | DPMSolverMultistep | Built-in | Fast high-quality sampling |
| Safety | Safety Checker | Built-in | NSFW content filtering |
| Storage | Local FS + Redis | - | Image caching |
| Queue | Celery | 5.3+ | Async task processing |

### 4.2 API Design Standards
- **FR-BE-001**: Implement RESTful API with resource-based endpoints

- **FR-BE-002**: Support WebSocket connections for real-time generation progress

- **FR-BE-003**: Use Pydantic v2 for request/response validation with file size limits

- **FR-BE-004**: Apply rate limiting via middleware (redis-rate-limiter)

---

## 5. Configuration Requirements

### 5.1 Image Model Configuration (`config/models.yaml`)

```yaml
image_generation:
  model:
    base_path: "./models/stable-diffusion-xl-base-1.0"
    refiner_path: "./models/stable-diffusion-xl-refiner-1.0"
    upscaler_path: "./models/stable-diffusion-x4-upscaler"
    safety_checker: true
    
  generation:
    default_scheduler: "DPMSolverMultistep"
    default_steps: 50
    default_guidance_scale: 7.5
    max_resolution: 4096
    batch_size: 4
    precision: "fp16"
    enable_torch_compile: true
    
  hardware:
    device: "cuda"  # or "cpu" for fallback
    offload_to_cpu: true
    sequential_cpu_offload: false  # Enable for < 8GB VRAM
    enable_vae_slicing: true
    enable_vae_tiling: true
    
  caching:
    enabled: true
    redis_ttl: 86400  # 24 hours
    filesystem_ttl: 604800  # 7 days
    
  safety:
    nsfw_filter: true
    block_threshold: 0.23  # Safety checker threshold
    
  rate_limits:
    free: 5
    pro: 100
    enterprise: -1  # Unlimited
```

### 5.2 Environment Variables

```bash
# Image Generation
IMAGE_MODEL_BASE_PATH=./models/stable-diffusion-xl-base-1.0
IMAGE_MODEL_REFINER_PATH=./models/stable-diffusion-xl-refiner-1.0
IMAGE_ENABLE_SAFETY_CHECKER=true
IMAGE_DEVICE=cuda
IMAGE_PRECISION=fp16
IMAGE_MAX_BATCH_SIZE=4
IMAGE_CPU_OFFLOAD=true
```

---

## 6. Testing Requirements

### 6.1 Image Generation Test Suite
- **FR-TEST-001**: Unit test pipeline loading and parameter validation

- **FR-TEST-002**: Integration test full generation flow (prompt → image)

- **FR-TEST-003**: Performance benchmark with different resolutions and GPUs

- **FR-TEST-004**: NSFW filter accuracy test (precision > 95%, recall > 90%)

- **FR-TEST-005**: Memory usage test: ensure < 12GB VRAM for 1024x1024 generation

### 6.2 E2E Test Scenarios
- **FR-TEST-006**: User generates logo from code request
- **FR-TEST-007**: User uploads image → draws mask → inpaints
- **FR-TEST-008**: Batch generation of 8 images with progress updates

---

## 7. Deployment Requirements

### 7.1 Docker Configuration
```dockerfile
# infra/docker/Dockerfile.worker-gpu
FROM nvidia/cuda:12.1.0-devel-ubuntu22.04

WORKDIR /app

# Install Python dependencies
RUN apt-get update && apt-get install -y \
    python3.12 \
    python3.12-venv \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-image.txt .
RUN pip install --no-cache-dir -r requirements-image.txt

# Download models on build
RUN python scripts/download_models.py --type=diffusion

COPY src/ ./src/
COPY config/ ./config/

CMD ["celery", "-A", "src.fimum_ai.workers.task_queue", "worker", "--pool=prefork", "--concurrency=1", "--loglevel=info"]
```

### 7.2 Kubernetes GPU Support
```yaml
# infra/kubernetes/worker-deployment-gpu.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fimum-image-worker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: image-worker
  template:
    metadata:
      labels:
        app: image-worker
    spec:
      containers:
      - name: worker
        image: fimum-ai/worker-gpu:latest
        resources:
          limits:
            nvidia.com/gpu: 1
          requests:
            memory: "16Gi"
            cpu: "4"
        env:
        - name: IMAGE_DEVICE
          value: "cuda"
```

---

## 8. Acceptance Criteria for Image Features

### 8.1 MVP Criteria
- [ ] Stable Diffusion XL base + refiner models downloaded and loaded successfully
- [ ] Text-to-image generation works with 512x512 resolution in < 15s
- [ ] Image-to-image editing functional with strength parameter
- [ ] Inpainting UI with brush tool implemented
- [ ] NSFW filter blocks > 95% of inappropriate content
- [ ] Gallery view displays generated images with metadata
- [ ] Rate limiting enforced (5/day Free, 100/day Pro)
- [ ] VRAM usage stays under 12GB for 1024x1024 generation
- [ ] E2E test for image generation from chat passes

### 8.2 Production Readiness
- [ ] 4K generation tested and working on RTX 4090
- [ ] Batch generation queue processes 8 images reliably
- [ ] Redis caching reduces duplicate generation by > 50%
- [ ] Safety checker maintained with > 90% accuracy
- [ ] Image storage cleanup job removes old files > 7 days
- [ ] Grafana dashboard tracks generation metrics
- [ ] Alerting configured for GPU overheating/failure
- [ ] User guide video for image features published

---

## 9. Support & Documentation

### 9.1 User Documentation
- **FR-DOC-001**: Create "Image Generation Guide" with:
  - Prompt engineering best practices
  - Style preset examples gallery
  - Troubleshooting common issues (CUDA out of memory, etc.)
  - Video tutorial (10 minutes)

### 9.2 API Documentation
- **FR-DOC-002**: Document image endpoints in Swagger with:
  - Interactive examples
  - Parameter descriptions and ranges
  - Base64 encoding guidelines
  - Error code explanations

---

## 10. Legal & Compliance

- **FR-LEGAL-001**: Display Stable Diffusion license in About page
- **FR-LEGAL-002**: Add CreativeML Open RAIL++-M License to `LICENSES/` directory
- **FR-LEGAL-003**: Clarify commercial usage rights in Terms of Service
- **FR-GDPR-004**: Ensure image generation prompts are not stored long-term

---

**Document Approved By**: Fimum AI Engineering Team  
**Next Review Date**: February 19, 2025  
**Change Log**: See `CHANGELOG.md` for version history
