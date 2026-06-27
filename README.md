# AI-Powered Banking Intelligence Platform

BankIQ is a complete full-stack banking analytics application that predicts customer churn, scores risk, explains model decisions, segments customers, recommends retention actions, performs batch predictions, and generates downloadable reports.

The project is designed as a professional, resume-ready example of turning a machine-learning model into an understandable business product.

## Live Deployment

- **Live application:** https://banking-intelligence-platform.vercel.app
- **Backend API:** https://banking-intelligence-api.onrender.com
- **Interactive API docs:** https://banking-intelligence-api.onrender.com/docs
- **Source code:** https://github.com/harshalwaghe91/banking-intelligence-platform
- **IEEE research paper:** [Download DOCX](paper/AI_Powered_Banking_Intelligence_IEEE_Paper_Harshal_Waghe_Final.docx)

> The Render free instance can take up to a minute to wake after a period of inactivity.

## Features

- Customer churn prediction and probability scoring
- Searchable customer master with verified profiles and masked account details
- Customer-linked assessments with persistent audit IDs
- Low, medium, and high risk categories
- Explainable AI using SHAP when available, with feature-contribution fallback
- K-Means customer segmentation
- Personalized retention recommendation engine
- Batch CSV scoring and downloadable enriched CSV
- Portfolio analytics with interactive Recharts visualizations
- Filterable customer prediction records in SQLite
- Customer-level PDF report generation
- Responsive fintech SaaS interface
- Vercel frontend and Render backend deployment configuration
- Automatic generation of 5,000 synthetic records when no dataset exists

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Recharts, Axios, Lucide Icons |
| Backend | FastAPI, Pydantic, Uvicorn |
| Machine Learning | scikit-learn, Pandas, NumPy, Joblib, optional XGBoost and SHAP |
| Data | SQLite, CSV |
| Reporting | ReportLab |
| Deployment | Vercel and Render |

## Folder Structure

```text
banking-intelligence-platform/
├── backend/
│   ├── main.py
│   ├── train_model.py
│   ├── database.py
│   ├── schemas.py
│   ├── prediction.py
│   ├── recommendation.py
│   ├── report_generator.py
│   ├── requirements.txt
│   ├── render.yaml
│   ├── data/customer_churn.csv
│   ├── models/
│   └── reports/
├── frontend/
│   ├── src/components/
│   ├── src/pages/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── .env.example
├── README.md
└── .gitignore
```

## Screenshots

Add deployed screenshots here:

- `screenshots/home.png`
- `screenshots/prediction.png`
- `screenshots/dashboard.png`
- `screenshots/segments.png`

## Local Setup

### Backend

Python 3.11 or newer is recommended.

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python train_model.py
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive documentation is at `http://localhost:8000/docs`.

The training script:

1. Loads `data/customer_churn.csv`.
2. Generates 5,000 deterministic synthetic records if the file is missing.
3. Trains Logistic Regression and Random Forest.
4. Also trains XGBoost when it is installed.
5. Compares accuracy, precision, recall, and F1.
6. Selects the best model by F1 score.
7. Saves preprocessing, churn, and K-Means artifacts in `models/`.

Optional packages:

```bash
pip install xgboost shap
python train_model.py
```

### Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

On macOS/Linux, use `cp .env.example .env`.

The frontend runs at `http://localhost:5173`. Set the API address in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## CSV Format

Batch files must contain these columns:

```text
CreditScore,Geography,Gender,Age,Tenure,Balance,NumOfProducts,HasCrCard,IsActiveMember,EstimatedSalary
```

The training dataset additionally includes `Exited`.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/` | API welcome and health message |
| GET | `/health` | Deployment health check |
| POST | `/predict` | Predict churn, risk, segment, explanations, and recommendations |
| GET | `/customer-directory` | Search operational customer profiles |
| GET | `/customer-directory/{customer_id}` | Retrieve one verified customer profile |
| POST | `/customer-directory/{customer_id}/assess` | Assess and persist an existing customer's churn risk |
| POST | `/batch-predict` | Upload and score a CSV file |
| GET | `/analytics` | Portfolio-level churn analytics |
| GET | `/customers` | Filter and search saved prediction records |
| GET | `/segments` | Customer segment analysis |
| POST | `/generate-report` | Create a customer PDF report |
| GET | `/reports` | List generated PDF reports |
| GET | `/download-report/{filename}` | Download a generated report |

### Example Prediction Request

```json
{
  "CreditScore": 610,
  "Geography": "Germany",
  "Gender": "Female",
  "Age": 48,
  "Tenure": 2,
  "Balance": 155000,
  "NumOfProducts": 1,
  "HasCrCard": 0,
  "IsActiveMember": 0,
  "EstimatedSalary": 92000
}
```

## Deploy the Backend on Render

1. Push the repository to GitHub.
2. Create a new Render Blueprint or Web Service.
3. Use the repository's `backend/render.yaml`, or configure:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt && python train_model.py`
   - Start command: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Health check: `/health`
4. Deploy and copy the Render service URL.

Note: SQLite and generated reports use the service filesystem. For durable production storage, migrate records to managed PostgreSQL and reports to object storage.

## Deploy the Frontend on Vercel

1. Import the GitHub repository into Vercel.
2. Set the root directory to `frontend`.
3. Vercel will use:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add an environment variable:

```env
VITE_API_BASE_URL=https://banking-intelligence-api.onrender.com
```

5. Redeploy after setting the variable.

## Model and Product Notes

- Risk thresholds are: 0–40% low, above 40–70% medium, and above 70% high.
- SHAP is attempted at runtime when installed and compatible with the selected model.
- A model coefficient or feature-importance explanation is used as a portable fallback.
- Recommendations are transparent business rules based on activity, balance, tenure, age, products, card ownership, credit score, and predicted risk.
- This application is a decision-support demo. Real banking use requires governance, bias testing, monitoring, security, consent, and human review.

## Future Scope

- Authentication and analyst/admin roles
- PostgreSQL and cloud object storage
- CRM and core-banking integrations
- Real-time event-stream scoring
- Model drift and performance monitoring
- Fairness and adverse-impact dashboards
- Campaign outcome feedback and uplift modeling
- Configurable risk policies and recommendation rules
- CI/CD, automated tests, and container images

## Resume Bullet Points

- Developed a full-stack AI-powered banking intelligence platform using React, FastAPI, and Machine Learning.
- Built churn prediction, risk scoring, explainable AI, customer segmentation, and retention recommendation modules.
- Designed analytics dashboard with interactive charts and deployed frontend on Vercel and backend on Render.

## License

This project is suitable for educational and portfolio use. Review security, compliance, and model-risk requirements before adapting it for real customer decisions.
