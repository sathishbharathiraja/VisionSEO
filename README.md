# VisionSEO

VisionSEO is a modern web application that leverages Google's Gemini Vision AI to analyze images and automatically generate SEO-optimized content, including titles, metas, keywords, article content, and social media snippets. It also features one-click publishing directly to WordPress.

## Features
- **AI Image Analysis:** Uses Gemini 2.5 Flash to analyze uploaded images to generate SEO-optimized text.
- **Content Generation:** Creates Titles, SEO descriptions, keywords, and full draft content.
- **Customizable Tone & Audience:** Fine-tune the generated content to perfectly match your target demographic.
- **Social Media Assets:** Generates ready-to-use snippets for Twitter/X and LinkedIn based on the image context.
- **Content Editor:** Re-write generated content with specific actions (expand, condense, make more professional, make viral).
- **WordPress Integration:** Push drafts directly to your WordPress site with the image attached as media.

## Project Structure
- `frontend/`: React application built with Vite and TailwindCSS for a highly aesthetic, animated UI.
- `backend/`: Fast and efficient Python API built with FastAPI.

## Prerequisites
- Node.js (for frontend)
- Python 3.8+ (for backend)
- Google Gemini API Key
- (Optional) WordPress Site with Application Passwords enabled for direct publishing.

## Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd VisionSEO
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd backend
```

Create a virtual environment (recommended):
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

Install the required dependencies:
```bash
pip install fastapi uvicorn python-dotenv google-generativeai requests python-multipart pydantic
```

Create a `.env` file in the `backend` directory and add your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key_here
WP_URL=https://yourwordpresssite.com
WP_USERNAME=your_wp_username
WP_APP_PASSWORD=your_wp_application_password
```

Run the backend server:
```bash
python main.py
```
> The API will be available at `http://localhost:8000`.

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```
> The frontend will be available at `http://localhost:5173`.

## Usage
1. Open the frontend URL in your browser.
2. Drag and drop an image into the futuristic upload zone or click to select a file.
3. Select your desired Tone and Target Audience.
4. The AI will instantly analyze the image, generate SEO metadata, and draft an article.
5. Review the Social Media snippets for instant sharing.
6. Use the Omniscient Editor to tweak any generated text.
7. Click "Publish to WordPress" to send the content as a draft to your site.
